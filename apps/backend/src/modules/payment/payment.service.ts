import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BookingPayment,
  PaymentStatus,
  PaymentType,
} from 'src/database/entity/booking-payment.entity';
import { Booking, BookingStatus } from 'src/database/entity/booking.entity';
import {
  BookingForPaymentDto,
  BookingSearchDto,
  CreatePaymentDto,
  OverduePaymentDto,
  PaymentFilterDto,
  PaymentListResponseDto,
  PaymentResponseDto,
  PaymentStatsDto,
  UpdatePaymentDto,
} from 'src/dto/payment.dto';
import { Repository } from 'typeorm';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(BookingPayment)
    private paymentRepository: Repository<BookingPayment>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private uploadService: UploadService,
  ) {}

  async searchBookingsForPayment(
    searchDto: BookingSearchDto,
    organizationId: string,
  ): Promise<{ data: BookingForPaymentDto[]; total: number }> {
    const { search, page = 1, limit = 10 } = searchDto;

    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.package', 'package')
      .where('booking.organizationId = :organizationId', { organizationId })
      .andWhere('booking.balanceAmount > 0')
      .andWhere('booking.status != :cancelledStatus', {
        cancelledStatus: BookingStatus.CANCELLED,
      });

    if (search) {
      query.andWhere(
        '(booking.bookingNumber ILIKE :search OR customer.name ILIKE :search OR package.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [bookings, total] = await query.getManyAndCount();

    const data = bookings.map((booking) => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      customer: {
        id: booking.customer.id,
        name: booking.customer.firstName + ' ' + booking.customer.lastName,
        email: booking.customer.email,
      },
      package: {
        id: booking.package.id,
        name: booking.package.name,
        destination: booking.package.destination,
      },
      totalAmount: booking.totalAmount,
      advancePaid: booking.advancePaid,
      balanceAmount: booking.balanceAmount,
    }));

    return { data, total };
  }

  async create(
    createPaymentDto: CreatePaymentDto,
    userId: string,
    organizationId: string,
  ): Promise<PaymentResponseDto> {
    // Validate booking exists and belongs to organization
    const booking = await this.bookingRepository.findOne({
      where: {
        id: createPaymentDto.bookingId,
        organizationId,
      },
      relations: ['customer', 'package', 'batch'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found or access denied');
    }

    // Validate payment amount doesn't exceed balance
    if (createPaymentDto.paymentType !== PaymentType.REFUND) {
      const maxAmount = booking.balanceAmount;
      if (createPaymentDto.amount > maxAmount) {
        throw new BadRequestException(
          `Payment amount cannot exceed balance amount of ${maxAmount}`,
        );
      }
    }

    // Generate unique payment number
    const paymentNumber = await this.generatePaymentNumber(organizationId);

    // Create payment with paymentType in dedicated column
    const payment = this.paymentRepository.create({
      paymentNumber,
      amount: createPaymentDto.amount,
      paymentType: createPaymentDto.paymentType,
      paymentMethod: createPaymentDto.paymentMethod,
      paymentReference: createPaymentDto.paymentReference,
      transactionId: createPaymentDto.transactionId,
      paymentDate: createPaymentDto.paymentDate,
      notes: createPaymentDto.notes,
      receiptFilePath: createPaymentDto.receiptFilePath,
      paymentDetails: createPaymentDto.paymentDetails,
      bookingId: createPaymentDto.bookingId,
      recordedById: userId,
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Update booking amounts if payment is completed
    if (
      savedPayment.status === PaymentStatus.COMPLETED &&
      createPaymentDto.paymentType !== PaymentType.REFUND
    ) {
      const newAdvancePaid = booking.advancePaid + createPaymentDto.amount;
      const newBalanceAmount = booking.totalAmount - newAdvancePaid;

      await this.bookingRepository.update(booking.id, {
        advancePaid: newAdvancePaid,
        balanceAmount: newBalanceAmount,
      });
    }

    return this.findOne(savedPayment.id, organizationId);
  }

  async findAll(
    filterDto: PaymentFilterDto,
    organizationId: string,
  ): Promise<PaymentListResponseDto> {
    const {
      search,
      status,
      paymentType,
      paymentMethod,
      fromDate,
      toDate,
      page = 1,
      limit = 20,
      sortBy = 'paymentDate',
      sortOrder = 'DESC',
    } = filterDto;

    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.package', 'package')
      .leftJoinAndSelect('booking.batch', 'batch')
      .leftJoinAndSelect('payment.recordedBy', 'recordedBy')
      .where('booking.organizationId = :organizationId', { organizationId });

    // Apply filters
    if (status) {
      query.andWhere('payment.status = :status', { status });
    }

    if (paymentType) {
      query.andWhere('payment.paymentType = :paymentType', { paymentType });
    }

    if (paymentMethod) {
      query.andWhere('payment.paymentMethod = :paymentMethod', {
        paymentMethod,
      });
    }

    if (fromDate && toDate) {
      query.andWhere('payment.paymentDate BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
    }

    if (search) {
      query.andWhere(
        '(customer.name ILIKE :search OR booking.bookingNumber ILIKE :search OR payment.paymentReference ILIKE :search OR payment.transactionId ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    const validSortFields = ['paymentDate', 'amount', 'status', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'paymentDate';
    query.orderBy(`payment.${sortField}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [payments, total] = await query.getManyAndCount();

    return {
      data: payments.map((payment) => this.transformToResponseDto(payment)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByManagerTeam(
    filterDto: PaymentFilterDto,
    organizationId: string,
    teamUserIds: string[],
  ): Promise<PaymentListResponseDto> {
    if (teamUserIds.length === 0) {
      return {
        data: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0,
        },
      };
    }

    const {
      search,
      status,
      paymentType,
      paymentMethod,
      fromDate,
      toDate,
      page = 1,
      limit = 20,
      sortBy = 'paymentDate',
      sortOrder = 'DESC',
    } = filterDto;

    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.package', 'package')
      .leftJoinAndSelect('booking.batch', 'batch')
      .leftJoinAndSelect('payment.recordedBy', 'recordedBy')
      .where('booking.organizationId = :organizationId', { organizationId })
      .andWhere('payment.recordedById IN (:...teamUserIds)', { teamUserIds });

    // Apply filters
    if (status) {
      query.andWhere('payment.status = :status', { status });
    }

    if (paymentType) {
      query.andWhere('payment.paymentType = :paymentType', { paymentType });
    }

    if (paymentMethod) {
      query.andWhere('payment.paymentMethod = :paymentMethod', {
        paymentMethod,
      });
    }

    if (fromDate && toDate) {
      query.andWhere('payment.paymentDate BETWEEN :fromDate AND :toDate', {
        fromDate,
        toDate,
      });
    }

    if (search) {
      query.andWhere(
        '(customer.name ILIKE :search OR booking.bookingNumber ILIKE :search OR payment.paymentReference ILIKE :search OR payment.transactionId ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Apply sorting
    const validSortFields = ['paymentDate', 'amount', 'status', 'createdAt'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'paymentDate';
    query.orderBy(`payment.${sortField}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [payments, total] = await query.getManyAndCount();

    return {
      data: payments.map((payment) => this.transformToResponseDto(payment)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(
    id: string,
    organizationId: string,
    includeReceipts: boolean = false,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: [
        'booking',
        'booking.customer',
        'booking.package',
        'booking.batch',
        'recordedBy',
      ],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    const paymentDto = this.transformToResponseDto(payment);

    // Include receipt files if requested
    if (includeReceipts && payment.receiptFilePath) {
      (paymentDto as any).receiptFiles = [payment.receiptFilePath];
    } else if (includeReceipts) {
      (paymentDto as any).receiptFiles = [];
    }

    return paymentDto;
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
    organizationId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    // Prevent editing completed/refunded payments for certain fields
    if (
      payment.status === PaymentStatus.COMPLETED ||
      payment.status === PaymentStatus.REFUNDED
    ) {
      const restrictedFields = ['amount', 'paymentMethod', 'paymentType'];
      const hasRestrictedChanges = restrictedFields.some(
        (field) =>
          field in updatePaymentDto && updatePaymentDto[field] !== undefined,
      );

      if (hasRestrictedChanges) {
        throw new BadRequestException(
          'Cannot modify amount, method, or type of completed/refunded payments',
        );
      }
    }

    await this.paymentRepository.update(id, updatePaymentDto);
    return this.findOne(id, organizationId);
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Cannot delete completed payments. Mark as refunded instead.',
      );
    }

    await this.paymentRepository.remove(payment);
  }

  async getStats(organizationId: string): Promise<PaymentStatsDto> {
    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.booking', 'booking')
      .where('booking.organizationId = :organizationId', { organizationId });

    const [
      totalResult,
      pendingResult,
      completedResult,
      failedResult,
      refundedResult,
      archivedResult,
    ] = await Promise.all([
      query
        .select('COUNT(*)', 'count')
        .addSelect('SUM(payment.amount)', 'sum')
        .getRawOne(),
      query
        .clone()
        .andWhere('payment.status = :status', { status: PaymentStatus.PENDING })
        .select('COUNT(*)', 'count')
        .addSelect('SUM(payment.amount)', 'sum')
        .getRawOne(),
      query
        .clone()
        .andWhere('payment.status = :status', {
          status: PaymentStatus.COMPLETED,
        })
        .select('COUNT(*)', 'count')
        .addSelect('SUM(payment.amount)', 'sum')
        .getRawOne(),
      query
        .clone()
        .andWhere('payment.status = :status', { status: PaymentStatus.FAILED })
        .select('COUNT(*)', 'count')
        .addSelect('SUM(payment.amount)', 'sum')
        .getRawOne(),
      query
        .clone()
        .andWhere('payment.status = :status', {
          status: PaymentStatus.REFUNDED,
        })
        .select('COUNT(*)', 'count')
        .addSelect('SUM(payment.amount)', 'sum')
        .getRawOne(),
      query
        .clone()
        .andWhere('payment.status = :status', {
          status: PaymentStatus.ARCHIVED,
        })
        .select('COUNT(*)', 'count')
        .addSelect('SUM(payment.amount)', 'sum')
        .getRawOne(),
    ]);

    return {
      totalPayments: parseInt(totalResult.count) || 0,
      totalAmount: parseFloat(totalResult.sum) || 0,
      pendingPayments: parseInt(pendingResult.count) || 0,
      pendingAmount: parseFloat(pendingResult.sum) || 0,
      completedPayments: parseInt(completedResult.count) || 0,
      completedAmount: parseFloat(completedResult.sum) || 0,
      failedPayments: parseInt(failedResult.count) || 0,
      failedAmount: parseFloat(failedResult.sum) || 0,
      refundedPayments: parseInt(refundedResult.count) || 0,
      refundedAmount: parseFloat(refundedResult.sum) || 0,
      archivedPayments: parseInt(archivedResult.count) || 0,
      archivedAmount: parseFloat(archivedResult.sum) || 0,
    };
  }

  async getOverduePayments(
    organizationId: string,
  ): Promise<OverduePaymentDto[]> {
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.package', 'package')
      .leftJoinAndSelect('booking.batch', 'batch')
      .where('booking.organizationId = :organizationId', { organizationId })
      .andWhere('booking.balanceAmount > 0')
      .andWhere('booking.status != :cancelledStatus', {
        cancelledStatus: BookingStatus.CANCELLED,
      })
      .andWhere('batch.startDate < :currentDate', { currentDate: new Date() })
      .getMany();

    return bookings
      .map((booking) => {
        const daysOverdue = Math.floor(
          (new Date().getTime() - booking.batch.startDate.getTime()) /
            (1000 * 3600 * 24),
        );

        return {
          bookingId: booking.id,
          bookingNumber: booking.bookingNumber,
          customerName:
            booking.customer.firstName + ' ' + booking.customer.lastName,
          customerEmail: booking.customer.email,
          packageName: booking.package.name,
          dueAmount: booking.balanceAmount,
          dueDate: booking.batch.startDate,
          daysOverdue,
        };
      })
      .filter((payment) => payment.daysOverdue > 0);
  }

  async markAsCompleted(
    id: string,
    organizationId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Only pending payments can be marked as completed',
      );
    }

    // Update booking amounts
    const booking = payment.booking;
    const newAdvancePaid =
      parseFloat(booking.advancePaid.toString()) +
      parseFloat(payment.amount.toString());
    const newBalanceAmount =
      parseFloat(booking.totalAmount.toString()) - newAdvancePaid;

    await Promise.all([
      this.paymentRepository.update(id, { status: PaymentStatus.COMPLETED }),
      this.bookingRepository.update(booking.id, {
        advancePaid: newAdvancePaid,
        balanceAmount: newBalanceAmount,
      }),
    ]);

    return this.findOne(id, organizationId);
  }

  async markAsFailed(
    id: string,
    organizationId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    await this.paymentRepository.update(id, { status: PaymentStatus.FAILED });
    return this.findOne(id, organizationId);
  }

  async markAsArchived(
    id: string,
    organizationId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    if (payment.status === PaymentStatus.PENDING) {
      throw new BadRequestException(
        'Cannot archive pending payments. Complete or fail them first.',
      );
    }

    await this.paymentRepository.update(id, { status: PaymentStatus.ARCHIVED });
    return this.findOne(id, organizationId);
  }

  /**
   * Upload receipt files for a payment using FileManager
   */
  async uploadReceiptFiles(
    paymentId: string,
    files: Express.Multer.File[],
    organizationId: string,
  ): Promise<string[]> {
    // Verify payment exists and user has access
    const payment = await this.findOne(paymentId, organizationId);
    if (!payment) {
      throw new NotFoundException('Payment not found or access denied');
    }

    // Validate file types for payment receipts
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'application/pdf',
    ];
    const maxFileSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          'Only images (JPEG, JPG, PNG) and PDF files are allowed for payment receipts',
        );
      }
      if (file.size > maxFileSize) {
        throw new BadRequestException('File size cannot exceed 5MB');
      }
    }

    // Use UploadService to upload files
    return this.uploadService.uploadMultiple(files, 'payment');
  }

  /**
   * Upload single receipt file for a payment (backward compatibility)
   */
  async uploadReceiptFile(
    paymentId: string,
    file: Express.Multer.File,
    organizationId: string,
  ): Promise<string> {
    const files = await this.uploadReceiptFiles(
      paymentId,
      [file],
      organizationId,
    );
    return files[0];
  }

  /**
   * Get all receipt files for a payment
   */
  async getPaymentReceiptFiles(paymentId: string, organizationId: string) {
    // Verify payment exists and user has access
    await this.findOne(paymentId, organizationId);

    // Return empty array since receipts are just stored as a single string field normally,
    // or return the payment.receiptFilePath if found.
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });
    return payment?.receiptFilePath ? [payment.receiptFilePath] : [];
  }

  /**
   * Delete a receipt file
   */
  async deleteReceiptFile(
    paymentId: string,
    fileId: string,
    organizationId: string,
  ): Promise<{ deleted: boolean }> {
    // Verify payment exists and user has access
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // As URLs strings, we just remove the string value from receiptFilePath
    payment.receiptFilePath = '';
    await this.paymentRepository.save(payment);
    return { deleted: true };
  }

  private transformToResponseDto(payment: BookingPayment): PaymentResponseDto {
    return {
      id: payment.id,
      paymentNumber: payment.paymentNumber,
      amount: payment.amount,
      paymentType: payment.paymentType,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      paymentReference: payment.paymentReference,
      transactionId: payment.transactionId,
      paymentDate: payment.paymentDate,
      notes: payment.notes,
      receiptFilePath: payment.receiptFilePath,
      paymentDetails: payment.paymentDetails,

      booking: {
        id: payment.booking.id,
        bookingNumber: payment.booking.bookingNumber,
        totalAmount: payment.booking.totalAmount,
        advancePaid: payment.booking.advancePaid,
        balanceAmount: payment.booking.balanceAmount,

        customer: {
          id: payment.booking.customer.id,
          name:
            payment.booking.customer.firstName +
            ' ' +
            payment.booking.customer.lastName,
          email: payment.booking.customer.email,
          phone: payment.booking.customer.phone,
        },

        package: {
          id: payment.booking.package.id,
          name: payment.booking.package.name,
          destination: payment.booking.package.destination,
          duration: payment.booking.package.duration,
        },

        batch: {
          id: payment.booking.batch.id,
          startDate: payment.booking.batch.startDate,
          endDate: payment.booking.batch.endDate,
        },
      },

      recordedBy: {
        id: payment.recordedBy.id,
        firstName: payment.recordedBy.name?.split(' ')[0] || '',
        lastName: payment.recordedBy.name?.split(' ')[1] || '',
        email: payment.recordedBy.email,
      },

      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  private async generatePaymentNumber(organizationId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    const count = await this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoin('payment.booking', 'booking')
      .where('booking.organizationId = :organizationId', { organizationId })
      .getCount();

    const sequence = (count + 1).toString().padStart(4, '0');
    return `PAY${year}${month}${sequence}`;
  }
}
