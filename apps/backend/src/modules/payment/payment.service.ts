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
import { BookingPaymentLog } from 'src/database/entity/booking-payment-log.entity';
import { BookingPaymentAllocation } from 'src/database/entity/booking-payment-allocation.entity';
import { BookingCustomer } from 'src/database/entity/booking-customer.entity';
import { Booking, BookingStatus } from 'src/database/entity/booking.entity';
import {
  BookingCustomerPaymentSummaryDto,
  BookingForPaymentDto,
  BookingSearchDto,
  CreatePaymentDto,
  OverduePaymentDto,
  PaymentAllocationResponseDto,
  PaymentFilterDto,
  PaymentListResponseDto,
  PaymentLogResponseDto,
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
    @InjectRepository(BookingPaymentLog)
    private paymentLogRepository: Repository<BookingPaymentLog>,
    @InjectRepository(BookingPaymentAllocation)
    private paymentAllocationRepository: Repository<BookingPaymentAllocation>,
    @InjectRepository(BookingCustomer)
    private bookingCustomerRepository: Repository<BookingCustomer>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private uploadService: UploadService,
  ) {}

  async logPaymentAction(
    paymentId: string,
    userId: string,
    action: string,
    previousData: any,
    newData: any,
  ): Promise<void> {
    try {
      const log = this.paymentLogRepository.create({
        paymentId,
        changedById: userId,
        action,
        previousData,
        newData,
      });
      await this.paymentLogRepository.save(log);
    } catch (err) {
      console.error('Failed to log payment action:', err);
    }
  }

  private calculatePassengerSummary(
    booking: Booking,
    allocationsByCustomer: Map<string, number>,
  ): BookingCustomerPaymentSummaryDto[] {
    if (!booking.bookingCustomers || booking.bookingCustomers.length === 0) {
      return [];
    }

    const count = booking.bookingCustomers.length;
    const bookingTotal = Number(booking.totalAmount || 0);

    const rawCosts = booking.bookingCustomers.map((bc) => {
      const tier = bc.packageTier;
      let cost = 0;
      if (tier) {
        const adultCost = Number(tier.adultCost || 0);
        if (bc.ageCategory === 'adult' || !bc.ageCategory) {
          cost = adultCost;
        } else if (bc.ageCategory === 'child') {
          cost =
            tier.childCostType === 'percentage'
              ? adultCost * (Number(tier.childCostValue || 0) / 100)
              : Number(tier.childCostValue || 0);
        } else if (bc.ageCategory === 'infant') {
          cost =
            tier.infantCostType === 'percentage'
              ? adultCost * (Number(tier.infantCostValue || 0) / 100)
              : Number(tier.infantCostValue || 0);
        }
      }
      return cost;
    });

    const totalRawCost = rawCosts.reduce((sum, c) => sum + c, 0);

    return booking.bookingCustomers.map((bc, index) => {
      let calculatedShare: number;
      if (totalRawCost > 0) {
        calculatedShare =
          Math.round(((rawCosts[index] / totalRawCost) * bookingTotal) * 100) /
          100;
      } else {
        calculatedShare = Math.round((bookingTotal / count) * 100) / 100;
      }

      const paidAmount = allocationsByCustomer.get(bc.id) || 0;
      const balanceAmount = Math.max(0, calculatedShare - paidAmount);
      let status: 'paid' | 'partial' | 'unpaid' = 'unpaid';
      if (paidAmount >= calculatedShare && calculatedShare > 0) {
        status = 'paid';
      } else if (paidAmount > 0) {
        status = 'partial';
      }

      const customerName = bc.customer
        ? `${bc.customer.firstName} ${bc.customer.lastName || ''}`.trim()
        : 'Passenger';

      return {
        id: bc.id,
        customerId: bc.customerId,
        name: customerName,
        email: bc.customer?.email || '',
        phone: bc.customer?.phone || '',
        ageCategory: bc.ageCategory || 'adult',
        tierName: bc.packageTier?.name || '',
        calculatedShare,
        paidAmount,
        balanceAmount,
        status,
      };
    });
  }

  async searchBookingsForPayment(
    searchDto: BookingSearchDto,
    organizationId: string,
  ): Promise<{ data: BookingForPaymentDto[]; total: number }> {
    const { search, page = 1, limit = 10 } = searchDto;

    const query = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.package', 'package')
      .leftJoinAndSelect('booking.packageTier', 'packageTier')
      .leftJoinAndSelect('booking.bookingCustomers', 'bookingCustomers')
      .leftJoinAndSelect('bookingCustomers.customer', 'passengerCustomer')
      .leftJoinAndSelect('bookingCustomers.packageTier', 'passengerTier')
      .leftJoinAndSelect('booking.payments', 'payments')
      .leftJoinAndSelect('payments.allocations', 'allocations')
      .where('booking.organizationId = :organizationId', { organizationId })
      .andWhere('booking.balanceAmount > 0')
      .andWhere('booking.status != :cancelledStatus', {
        cancelledStatus: BookingStatus.CANCELLED,
      });

    if (search) {
      query.andWhere(
        '(booking.bookingNumber ILIKE :search OR customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR package.name ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const skip = (page - 1) * limit;
    query.skip(skip).take(limit);

    const [bookings, total] = await query.getManyAndCount();

    const data = bookings.map((booking) => {
      const allocationsByCustomer = new Map<string, number>();
      if (booking.payments) {
        for (const p of booking.payments) {
          if (p.status === PaymentStatus.COMPLETED && p.allocations) {
            for (const alloc of p.allocations) {
              const current =
                allocationsByCustomer.get(alloc.bookingCustomerId) || 0;
              allocationsByCustomer.set(
                alloc.bookingCustomerId,
                current + Number(alloc.amount),
              );
            }
          }
        }
      }

      const customers = this.calculatePassengerSummary(
        booking,
        allocationsByCustomer,
      );

      return {
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        customer: {
          id: booking.customer.id,
          name: `${booking.customer.firstName} ${booking.customer.lastName || ''}`.trim(),
          email: booking.customer.email || '',
        },
        package: {
          id: booking.package.id,
          name: booking.package.name,
          destination: booking.package.destination,
        },
        totalAmount: Number(booking.totalAmount),
        advancePaid: Number(booking.advancePaid),
        balanceAmount: Number(booking.balanceAmount),
        discountAmount: Number(booking.discountAmount || 0),
        specialOfferDiscount: Number(booking.specialOfferDiscount || 0),
        adjustmentAmount: Number(booking.adjustmentAmount || 0),
        customers,
      };
    });

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
      relations: ['customer', 'package', 'batch', 'bookingCustomers'],
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

    const isPassengerSplit = !!createPaymentDto.isPassengerSplit;
    if (
      isPassengerSplit &&
      createPaymentDto.allocations &&
      createPaymentDto.allocations.length > 0
    ) {
      const bookingCustomerIds = new Set(
        booking.bookingCustomers?.map((bc) => bc.id) || [],
      );

      for (const alloc of createPaymentDto.allocations) {
        if (!bookingCustomerIds.has(alloc.bookingCustomerId)) {
          throw new BadRequestException(
            `Invalid passenger allocation: traveler not found in this booking`,
          );
        }
      }

      const totalAllocated = createPaymentDto.allocations.reduce(
        (sum, a) => sum + Number(a.amount || 0),
        0,
      );

      if (
        Math.abs(totalAllocated - Number(createPaymentDto.amount)) > 0.01
      ) {
        throw new BadRequestException(
          `Sum of passenger allocations (${totalAllocated}) must match payment amount (${createPaymentDto.amount})`,
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
      isPassengerSplit,
      payerName: createPaymentDto.payerName || null,
      payerCustomerId: createPaymentDto.payerCustomerId || null,
      bookingId: createPaymentDto.bookingId,
      recordedById: userId,
      status: PaymentStatus.PENDING,
    } as any) as unknown as BookingPayment;

    const savedPayment = await this.paymentRepository.save(payment);

    await this.logPaymentAction(savedPayment.id, userId, 'created', null, {
      paymentNumber: savedPayment.paymentNumber,
      amount: savedPayment.amount,
      status: savedPayment.status,
      paymentType: savedPayment.paymentType,
      paymentMethod: savedPayment.paymentMethod,
      paymentReference: savedPayment.paymentReference,
      transactionId: savedPayment.transactionId,
      payerName: savedPayment.payerName,
    });





    // Save allocations if present
    if (
      isPassengerSplit &&
      createPaymentDto.allocations &&
      createPaymentDto.allocations.length > 0
    ) {
      const allocations = createPaymentDto.allocations.map((alloc) =>
        this.paymentAllocationRepository.create({
          paymentId: savedPayment.id,
          bookingCustomerId: alloc.bookingCustomerId,
          amount: alloc.amount,
          notes: alloc.notes,
        }),
      );
      await this.paymentAllocationRepository.save(allocations);
    }

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
      .leftJoinAndSelect('payment.verifiedBy', 'verifiedBy')
      .leftJoinAndSelect('payment.allocations', 'allocations')
      .leftJoinAndSelect('allocations.bookingCustomer', 'allocBookingCustomer')
      .leftJoinAndSelect('allocBookingCustomer.customer', 'allocCustomer')
      .leftJoinAndSelect('payment.payerCustomer', 'payerCustomer')
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
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR booking.bookingNumber ILIKE :search OR payment.paymentReference ILIKE :search OR payment.transactionId ILIKE :search OR payment.payerName ILIKE :search)',
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
      .leftJoinAndSelect('payment.verifiedBy', 'verifiedBy')
      .leftJoinAndSelect('payment.allocations', 'allocations')
      .leftJoinAndSelect('allocations.bookingCustomer', 'allocBookingCustomer')
      .leftJoinAndSelect('allocBookingCustomer.customer', 'allocCustomer')
      .leftJoinAndSelect('payment.payerCustomer', 'payerCustomer')
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
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR booking.bookingNumber ILIKE :search OR payment.paymentReference ILIKE :search OR payment.transactionId ILIKE :search OR payment.payerName ILIKE :search)',
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
        'verifiedBy',
        'allocations',
        'allocations.bookingCustomer',
        'allocations.bookingCustomer.customer',
        'payerCustomer',
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
    userId?: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking', 'allocations'],
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

    const { allocations, ...paymentFields } = updatePaymentDto;

    if (Object.keys(paymentFields).length > 0) {
      await this.paymentRepository.update(id, paymentFields);
    }

    if (allocations !== undefined) {
      await this.paymentAllocationRepository.delete({ paymentId: id });
      if (allocations && allocations.length > 0) {
        const newAllocations = allocations.map((alloc) =>
          this.paymentAllocationRepository.create({
            paymentId: id,
            bookingCustomerId: alloc.bookingCustomerId,
            amount: alloc.amount,
            notes: alloc.notes,
          }),
        );
        await this.paymentAllocationRepository.save(newAllocations);
      }
    }

    if (userId) {
      await this.logPaymentAction(
        id,
        userId,
        'updated',
        null,
        updatePaymentDto,
      );
    }

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
      totalPayments: parseInt(totalResult?.count || '0'),
      totalAmount: parseFloat(totalResult?.sum || '0'),
      pendingPayments: parseInt(pendingResult?.count || '0'),
      pendingAmount: parseFloat(pendingResult?.sum || '0'),
      completedPayments: parseInt(completedResult?.count || '0'),
      completedAmount: parseFloat(completedResult?.sum || '0'),
      failedPayments: parseInt(failedResult?.count || '0'),
      failedAmount: parseFloat(failedResult?.sum || '0'),
      refundedPayments: parseInt(refundedResult?.count || '0'),
      refundedAmount: parseFloat(refundedResult?.sum || '0'),
      archivedPayments: parseInt(archivedResult?.count || '0'),
      archivedAmount: parseFloat(archivedResult?.sum || '0'),
    };
  }

  async getOverduePayments(
    organizationId: string,
  ): Promise<OverduePaymentDto[]> {
    const today = new Date();

    const query = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.package', 'package')
      .where('booking.organizationId = :organizationId', { organizationId })
      .andWhere('payment.status = :status', { status: PaymentStatus.PENDING })
      .andWhere('payment.paymentDate < :today', { today });

    const payments = await query.getMany();

    return payments.map((payment) => {
      const paymentDate = new Date(payment.paymentDate);
      const daysOverdue = Math.floor(
        (today.getTime() - paymentDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      return {
        bookingId: payment.booking.id,
        bookingNumber: payment.booking.bookingNumber,
        customerName:
          payment.booking.customer.firstName + ' ' + (payment.booking.customer.lastName || ''),
        customerEmail: payment.booking.customer.email || '',
        packageName: payment.booking.package.name,
        dueAmount: payment.amount,
        dueDate: payment.paymentDate,
        daysOverdue: Math.max(0, daysOverdue),
      };
    });
  }

  async markAsCompleted(
    id: string,
    organizationId: string,
    userId?: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment is already completed');
    }

    const previousStatus = payment.status;
    payment.status = PaymentStatus.COMPLETED;
    if (userId) {
      payment.verifiedById = userId;
    }
    payment.verifiedAt = new Date();
    await this.paymentRepository.save(payment);

    // Update booking balance and advance amounts
    if (payment.paymentType !== PaymentType.REFUND) {
      const booking = payment.booking;
      const newAdvancePaid = Number(booking.advancePaid) + Number(payment.amount);
      const newBalanceAmount = Number(booking.totalAmount) - newAdvancePaid;

      await this.bookingRepository.update(booking.id, {
        advancePaid: newAdvancePaid,
        balanceAmount: newBalanceAmount,
      });
    }

    if (userId) {
      await this.logPaymentAction(
        id,
        userId,
        'verified',
        { status: previousStatus },
        { status: PaymentStatus.COMPLETED },
      );
    }

    return this.findOne(id, organizationId);
  }

  async markAsFailed(
    id: string,
    organizationId: string,
    userId?: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    const previousStatus = payment.status;
    payment.status = PaymentStatus.FAILED;
    await this.paymentRepository.save(payment);

    if (userId) {
      await this.logPaymentAction(
        id,
        userId,
        'failed',
        { status: previousStatus },
        { status: PaymentStatus.FAILED },
      );
    }

    return this.findOne(id, organizationId);
  }

  async markAsRefunded(
    id: string,
    organizationId: string,
    userId?: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    const previousStatus = payment.status;
    payment.status = PaymentStatus.REFUNDED;
    await this.paymentRepository.save(payment);

    if (userId) {
      await this.logPaymentAction(
        id,
        userId,
        'refunded',
        { status: previousStatus },
        { status: PaymentStatus.REFUNDED },
      );
    }

    return this.findOne(id, organizationId);
  }

  async markAsArchived(
    id: string,
    organizationId: string,
    userId?: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking'],
    });

    if (!payment || payment.booking.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    const previousStatus = payment.status;
    payment.status = PaymentStatus.ARCHIVED;
    await this.paymentRepository.save(payment);

    if (userId) {
      await this.logPaymentAction(
        id,
        userId,
        'archived',
        { status: previousStatus },
        { status: PaymentStatus.ARCHIVED },
      );
    }

    return this.findOne(id, organizationId);
  }

  /**
   * Upload receipt files for a payment using FileManager
   */
  async uploadReceiptFiles(
    paymentId: string,
    files: Express.Multer.File[],
    organizationId: string,
    userId?: string,
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
    const result = await this.uploadService.uploadMultiple(files, 'payment');

    if (userId) {
      await this.logPaymentAction(
        paymentId,
        userId,
        'receipt_uploaded',
        null,
        {
          filesCount: files.length,
          fileNames: files.map((f) => f.originalname),
        },
      );
    }

    return result;
  }

  /**
   * Upload single receipt file for a payment (backward compatibility)
   */
  async uploadReceiptFile(
    paymentId: string,
    file: Express.Multer.File,
    organizationId: string,
    userId?: string,
  ): Promise<string> {
    const files = await this.uploadReceiptFiles(
      paymentId,
      [file],
      organizationId,
      userId,
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
    
    if (!payment?.receiptFilePath) return [];
    
    // Extract a filename from the path
    const urlParts = payment.receiptFilePath.split('/');
    const filename = urlParts[urlParts.length - 1] || 'receipt';
    
    return [
      {
        id: payment.id, // using payment id as file id since there's only one receipt
        filename,
        url: payment.receiptFilePath,
        createdAt: payment.createdAt,
      }
    ];
  }

  /**
   * Delete a receipt file
   */
  async deleteReceiptFile(
    paymentId: string,
    fileId: string,
    organizationId: string,
  ): Promise<{ deleted: boolean }> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.receiptFilePath = '';
    await this.paymentRepository.save(payment);
    return { deleted: true };
  }

  private transformToResponseDto(payment: BookingPayment): PaymentResponseDto {
    const allocations: PaymentAllocationResponseDto[] = payment.allocations
      ? payment.allocations.map((alloc) => {
          const cust = alloc.bookingCustomer?.customer;
          const customerName = cust
            ? `${cust.firstName} ${cust.lastName || ''}`.trim()
            : 'Passenger';
          return {
            id: alloc.id,
            bookingCustomerId: alloc.bookingCustomerId,
            customerId: cust?.id,
            customerName,
            customerEmail: cust?.email || '',
            amount: Number(alloc.amount),
            notes: alloc.notes,
          };
        })
      : [];

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
      isPassengerSplit: payment.isPassengerSplit || false,
      payerName:
        payment.payerName ||
        (payment.payerCustomer
          ? `${payment.payerCustomer.firstName} ${payment.payerCustomer.lastName || ''}`.trim()
          : undefined),
      payerCustomerId: payment.payerCustomerId,
      allocations,

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
            (payment.booking.customer.lastName || ''),
          email: payment.booking.customer.email || '',
          phone: payment.booking.customer.phone || '',
        },

        package: {
          id: payment.booking.package.id,
          name: payment.booking.package.name,
          destination: payment.booking.package.destination,
          days: payment.booking.package.days,
          nights: payment.booking.package.nights,
        },

        batch: {
          id: payment.booking.batch.id,
          startDate: payment.booking.batch.startDate,
          endDate: payment.booking.batch.endDate,
        },
      },

      recordedBy: {
        id: payment.recordedBy?.id || '',
        firstName: payment.recordedBy?.name?.split(' ')[0] || '',
        lastName:
          payment.recordedBy?.name?.split(' ').slice(1).join(' ') || '',
        email: payment.recordedBy?.email || '',
      },

      verifiedBy: payment.verifiedBy
        ? {
            id: payment.verifiedBy.id,
            firstName: payment.verifiedBy.name?.split(' ')[0] || '',
            lastName:
              payment.verifiedBy.name?.split(' ').slice(1).join(' ') || '',
            email: payment.verifiedBy.email || '',
          }
        : null,

      verifiedAt: payment.verifiedAt || null,

      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  async getLogs(
    paymentId: string,
    organizationId: string,
  ): Promise<PaymentLogResponseDto[]> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['booking', 'recordedBy', 'verifiedBy'],
    });

    if (!payment || payment.booking?.organizationId !== organizationId) {
      throw new NotFoundException('Payment not found or access denied');
    }

    const logs = await this.paymentLogRepository.find({
      where: { paymentId },
      relations: ['changedBy'],
      order: { createdAt: 'DESC' },
    });

    if (logs.length > 0) {
      return logs.map((log) => ({
        id: log.id,
        paymentId: log.paymentId,
        action: log.action,
        previousData: log.previousData,
        newData: log.newData,
        changedBy: log.changedBy
          ? {
              id: log.changedBy.id,
              name: log.changedBy.name,
              email: log.changedBy.email,
              profilePhoto: log.changedBy.profilePhoto,
            }
          : null,
        createdAt: log.createdAt,
      }));
    }

    // Baseline synthesized logs for existing/legacy payments without log entries
    const fallbackLogs: PaymentLogResponseDto[] = [];

    // If verified / completed, add verification entry first (since ordered DESC)
    if (
      payment.status === PaymentStatus.COMPLETED &&
      (payment.verifiedBy || payment.verifiedAt)
    ) {
      fallbackLogs.push({
        id: `synth-verified-${payment.id}`,
        paymentId: payment.id,
        action: 'verified',
        previousData: { status: PaymentStatus.PENDING },
        newData: { status: PaymentStatus.COMPLETED },
        changedBy: payment.verifiedBy
          ? {
              id: payment.verifiedBy.id,
              name: payment.verifiedBy.name,
              email: payment.verifiedBy.email,
              profilePhoto: payment.verifiedBy.profilePhoto,
            }
          : payment.recordedBy
          ? {
              id: payment.recordedBy.id,
              name: payment.recordedBy.name,
              email: payment.recordedBy.email,
              profilePhoto: payment.recordedBy.profilePhoto,
            }
          : null,
        createdAt: payment.verifiedAt || payment.updatedAt || payment.createdAt,
      });
    }

    // Add creation entry
    fallbackLogs.push({
      id: `synth-created-${payment.id}`,
      paymentId: payment.id,
      action: 'created',
      previousData: null,
      newData: {
        paymentNumber: payment.paymentNumber,
        amount: payment.amount,
        status: PaymentStatus.PENDING,
        paymentType: payment.paymentType,
        paymentMethod: payment.paymentMethod,
        payerName: payment.payerName,
      },
      changedBy: payment.recordedBy
        ? {
            id: payment.recordedBy.id,
            name: payment.recordedBy.name,
            email: payment.recordedBy.email,
            profilePhoto: payment.recordedBy.profilePhoto,
          }
        : null,
      createdAt: payment.createdAt,
    });

    return fallbackLogs;
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
