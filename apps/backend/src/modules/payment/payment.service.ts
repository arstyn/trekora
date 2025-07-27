import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingPayment, PaymentStatus, PaymentType } from 'src/database/entity/booking-payment.entity';
import { Booking, BookingStatus } from 'src/database/entity/booking.entity';
import { 
  CreatePaymentDto, 
  UpdatePaymentDto, 
  PaymentFilterDto, 
  PaymentStatsDto, 
  OverduePaymentDto, 
  PaymentResponseDto, 
  PaymentListResponseDto,
  BookingSearchDto,
  BookingForPaymentDto
} from 'src/dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(BookingPayment)
    private paymentRepository: Repository<BookingPayment>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
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
        cancelledStatus: BookingStatus.CANCELLED 
      });

    if (search) {
      query.andWhere(
        '(booking.bookingNumber ILIKE :search OR customer.name ILIKE :search OR package.name ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [bookings, total] = await query.getManyAndCount();

    const data = bookings.map(booking => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      customer: {
        id: booking.customer.id,
        name: booking.customer.name,
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
        organizationId 
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
        throw new BadRequestException(`Payment amount cannot exceed balance amount of ${maxAmount}`);
      }
    }

    // Create payment with paymentType in dedicated column
    const payment = this.paymentRepository.create({
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
    if (savedPayment.status === PaymentStatus.COMPLETED && createPaymentDto.paymentType !== PaymentType.REFUND) {
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
      query.andWhere('payment.paymentMethod = :paymentMethod', { paymentMethod });
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
        { search: `%${search}%` }
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
      data: payments.map(payment => this.transformToResponseDto(payment)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, organizationId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: [
        'booking',
        'booking.customer', 
        'booking.package', 
        'booking.batch',
        'recordedBy'
      ],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    return this.transformToResponseDto(payment);
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
    if (payment.status === PaymentStatus.COMPLETED || payment.status === PaymentStatus.REFUNDED) {
      const restrictedFields = ['amount', 'paymentMethod', 'paymentType'];
      const hasRestrictedChanges = restrictedFields.some(field => 
        field in updatePaymentDto && updatePaymentDto[field] !== undefined
      );
      
      if (hasRestrictedChanges) {
        throw new BadRequestException('Cannot modify amount, method, or type of completed/refunded payments');
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
      throw new BadRequestException('Cannot delete completed payments. Mark as refunded instead.');
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
      query.select('COUNT(*)', 'count').addSelect('SUM(payment.amount)', 'sum').getRawOne(),
      query.clone().andWhere('payment.status = :status', { status: PaymentStatus.PENDING })
           .select('COUNT(*)', 'count').addSelect('SUM(payment.amount)', 'sum').getRawOne(),
      query.clone().andWhere('payment.status = :status', { status: PaymentStatus.COMPLETED })
           .select('COUNT(*)', 'count').addSelect('SUM(payment.amount)', 'sum').getRawOne(),
      query.clone().andWhere('payment.status = :status', { status: PaymentStatus.FAILED })
           .select('COUNT(*)', 'count').addSelect('SUM(payment.amount)', 'sum').getRawOne(),
      query.clone().andWhere('payment.status = :status', { status: PaymentStatus.REFUNDED })
           .select('COUNT(*)', 'count').addSelect('SUM(payment.amount)', 'sum').getRawOne(),
      query.clone().andWhere('payment.status = :status', { status: PaymentStatus.ARCHIVED })
           .select('COUNT(*)', 'count').addSelect('SUM(payment.amount)', 'sum').getRawOne(),
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

  async getOverduePayments(organizationId: string): Promise<OverduePaymentDto[]> {
    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.package', 'package')
      .leftJoinAndSelect('booking.batch', 'batch')
      .where('booking.organizationId = :organizationId', { organizationId })
      .andWhere('booking.balanceAmount > 0')
      .andWhere('booking.status != :cancelledStatus', { cancelledStatus: BookingStatus.CANCELLED })
      .andWhere('batch.startDate < :currentDate', { currentDate: new Date() })
      .getMany();

    return bookings.map(booking => {
      const daysOverdue = Math.floor(
        (new Date().getTime() - booking.batch.startDate.getTime()) / (1000 * 3600 * 24)
      );

      return {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        customerName: booking.customer.name,
        customerEmail: booking.customer.email,
        packageName: booking.package.name,
        dueAmount: booking.balanceAmount,
        dueDate: booking.batch.startDate,
        daysOverdue,
      };
    }).filter(payment => payment.daysOverdue > 0);
  }

  async markAsCompleted(id: string, organizationId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      throw new BadRequestException('Only pending payments can be marked as completed');
    }

    // Update booking amounts
    const booking = payment.booking;
    const newAdvancePaid = booking.advancePaid + payment.amount;
    const newBalanceAmount = booking.totalAmount - newAdvancePaid;

    await Promise.all([
      this.paymentRepository.update(id, { status: PaymentStatus.COMPLETED }),
      this.bookingRepository.update(booking.id, {
        advancePaid: newAdvancePaid,
        balanceAmount: newBalanceAmount,
      }),
    ]);

    return this.findOne(id, organizationId);
  }

  async markAsFailed(id: string, organizationId: string): Promise<PaymentResponseDto> {
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

  async markAsArchived(id: string, organizationId: string): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    if (payment.status === PaymentStatus.PENDING) {
      throw new BadRequestException('Cannot archive pending payments. Complete or fail them first.');
    }

    await this.paymentRepository.update(id, { status: PaymentStatus.ARCHIVED });
    return this.findOne(id, organizationId);
  }

  private transformToResponseDto(payment: BookingPayment): PaymentResponseDto {
    return {
      id: payment.id,
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
          name: payment.booking.customer.name,
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
} 