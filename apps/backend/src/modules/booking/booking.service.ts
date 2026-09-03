import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BatchBlock, BatchBlockStatus } from 'src/database/entity/batch-block.entity';
import { BatchLog } from 'src/database/entity/batch-log.entity';
import { Batch } from 'src/database/entity/batch.entity';
import { BatchOffer } from 'src/database/entity/batch-offer.entity';
import { BookingCustomer } from 'src/database/entity/booking-customer.entity';
import { BookingDocument } from 'src/database/entity/booking-document.entity';
import { BookingLog } from 'src/database/entity/booking-log.entity';
import { BookingPaymentLog } from 'src/database/entity/booking-payment-log.entity';
import {
  BookingPayment,
  PaymentStatus,
} from 'src/database/entity/booking-payment.entity';
import { Agent, CommissionType } from 'src/database/entity/agent.entity';
import { Booking, BookingStatus, AgentPayoutStatus } from 'src/database/entity/booking.entity';
import { BookingPaymentAllocation } from 'src/database/entity/booking-payment-allocation.entity';
import { Customer } from 'src/database/entity/customer.entity';
import { Package } from 'src/database/entity/package-related/package.entity';
import {
  BookingCustomerResponseDto,
  BookingPaymentAllocationResponseDto,
  BookingResponseDto,
  BookingStatsDto,
  BookingSummaryDto,
  CreateBookingDto,
  CreatePaymentDto,
  UpdateBookingDto,
} from 'src/dto/booking.dto';
import { DataSource, In, Repository } from 'typeorm';
import { WorkflowType } from '../../database/entity/workflow/workflow.entity';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(BookingPayment)
    private paymentRepository: Repository<BookingPayment>,
    @InjectRepository(BookingPaymentAllocation)
    private paymentAllocationRepository: Repository<BookingPaymentAllocation>,
    @InjectRepository(BookingDocument)
    private documentRepository: Repository<BookingDocument>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    @InjectRepository(BookingLog)
    private logRepository: Repository<BookingLog>,
    @InjectRepository(BookingPaymentLog)
    private paymentLogRepository: Repository<BookingPaymentLog>,
    private workflowService: WorkflowService,
    private dataSource: DataSource,
  ) { }


  async getLogs(bookingId: string) {
    return this.logRepository.find({
      where: { bookingId },
      relations: ['changedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(
    createBookingDto: CreateBookingDto,
    userId: string,
    organizationId: string,
  ): Promise<BookingResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate customer exists
      const customer = await this.customerRepository.findOne({
        where: { id: createBookingDto.customerId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      // Validate package exists
      const packageEntity = await this.packageRepository.findOne({
        where: { id: createBookingDto.packageId },
        relations: ['preTripChecklist'],
      });
      if (!packageEntity) {
        throw new NotFoundException('Package not found');
      }

      // Validate batch exists and has available seats
      const batch = await this.batchRepository.findOne({
        where: { id: createBookingDto.batchId },
      });
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }

      let availableSeats = batch.totalSeats - batch.bookedSeats - batch.blockedSeats;
      if (createBookingDto.batchBlockId) {
        const block = await queryRunner.manager.findOne(BatchBlock, {
          where: {
            id: createBookingDto.batchBlockId,
            batchId: batch.id,
            status: BatchBlockStatus.ACTIVE,
          },
        });
        if (block) {
          availableSeats += block.slots;
        }
      }

      if (availableSeats < createBookingDto.customerIds.length && !createBookingDto.overrideCapacityLimit) {
        throw new BadRequestException(
          `Only ${availableSeats} seats available in this batch`,
        );
      }

      // Validate Batch Special Offer if applied
      let batchOfferId: string | null = null;
      let specialOfferDiscount = 0;
      if (createBookingDto.batchOfferId) {
        const offer = await queryRunner.manager.findOne(BatchOffer, {
          where: {
            id: createBookingDto.batchOfferId,
            batchId: batch.id,
            organizationId,
            isActive: true,
          },
        });
        if (!offer) {
          throw new BadRequestException('Selected batch special offer is invalid or inactive');
        }
        const now = new Date();
        if (offer.validFrom && new Date(offer.validFrom) > now) {
          throw new BadRequestException('Selected batch special offer is not active yet');
        }
        if (offer.validUntil && new Date(offer.validUntil) < now) {
          throw new BadRequestException('Selected batch special offer has expired');
        }
        if (createBookingDto.customerIds.length < offer.minTravelers) {
          throw new BadRequestException(
            `Special offer requires at least ${offer.minTravelers} travelers`,
          );
        }
        batchOfferId = offer.id;
        specialOfferDiscount = createBookingDto.specialOfferDiscount || 0;
      }

      // Generate unique booking number
      const bookingNumber = await this.generateBookingNumber(organizationId);

      // Calculate balance amount - initial payment starts as pending until finance verifies it
      const advancePaid = 0;
      const balanceAmount = createBookingDto.totalAmount;

      // Handle agent & commission calculation if agentId is provided
      let agentCommissionType = createBookingDto.agentCommissionType;
      let agentCommissionValue = createBookingDto.agentCommissionValue;
      let agentCommissionAmount = createBookingDto.agentCommissionAmount;

      if (createBookingDto.agentId) {
        const agent = await queryRunner.manager.findOne(Agent, {
          where: { id: createBookingDto.agentId, organizationId },
        });
        if (agent) {
          agentCommissionType = agentCommissionType || agent.commissionType;
          agentCommissionValue =
            agentCommissionValue !== undefined
              ? agentCommissionValue
              : Number(agent.commissionValue || 0);

          if (agentCommissionAmount === undefined || agentCommissionAmount === null) {
            if (agentCommissionType === CommissionType.PERCENTAGE) {
              agentCommissionAmount =
                (createBookingDto.totalAmount * agentCommissionValue) / 100;
            } else {
              agentCommissionAmount = agentCommissionValue;
            }
          }
        }
      }

      // Create booking
      const booking = queryRunner.manager.create(Booking, {
        bookingNumber,
        customerId: createBookingDto.customerId,
        packageId: createBookingDto.packageId,
        packageTierId: createBookingDto.packageTierId,
        batchId: createBookingDto.batchId,
        batchOfferId,
        numberOfCustomers: createBookingDto.customerIds.length,
        totalAmount: createBookingDto.totalAmount,
        discountAmount: createBookingDto.discountAmount || 0,
        specialOfferDiscount,
        adjustmentAmount: createBookingDto.adjustmentAmount || 0,
        advancePaid,
        balanceAmount,
        status: BookingStatus.PENDING,
        specialRequests: createBookingDto.specialRequests,
        additionalDetails: createBookingDto.additionalDetails,
        paymentStructureId: createBookingDto.paymentStructureId,
        isPaymentOverridden: createBookingDto.isPaymentOverridden || false,
        paymentOverrideReason: createBookingDto.paymentOverrideReason,
        agentId: createBookingDto.agentId,
        agentCommissionType,
        agentCommissionValue,
        agentCommissionAmount: agentCommissionAmount || 0,
        agentPayoutStatus: createBookingDto.agentPayoutStatus || AgentPayoutStatus.PENDING,
        createdById: userId,
        organizationId,
      });

      const savedBooking = await queryRunner.manager.save(booking);

      // Log creation
      await this.logAction(
        savedBooking.id,
        userId,
        'create',
        null,
        savedBooking,
        queryRunner.manager,
      );

      // Validate and associate customers
      const customers = await this.customerRepository.findBy({
        id: In(createBookingDto.customerIds),
      });

      if (customers.length !== createBookingDto.customerIds.length) {
        throw new BadRequestException('One or more customers not found');
      }

      // Associate customers with the booking using BookingCustomer
      const bookingCustomers = customers.map(customer => {
        let tierId = createBookingDto.packageTierId;
        let ageCategory: 'adult' | 'child' | 'infant' = 'adult';

        if (createBookingDto.customerSelections) {
          const selection = createBookingDto.customerSelections.find(s => s.customerId === customer.id);
          if (selection) {
            tierId = selection.tierId || tierId;
            ageCategory = selection.ageCategory || 'adult';
          }
        }

        return queryRunner.manager.create(BookingCustomer, {
          bookingId: savedBooking.id,
          customerId: customer.id,
          packageTierId: tierId,
          ageCategory,
        });
      });

      await queryRunner.manager.save(BookingCustomer, bookingCustomers);

      // Create workflow for the booking
      const workflow = await this.workflowService.createWorkflow(
        {
          name: `Booking ${bookingNumber} Flow`,
          type: WorkflowType.BOOKING,
          referenceId: savedBooking.id,
          organizationId,
        },
        userId,
      );

      // Add default verification steps
      await this.workflowService.addStep(
        workflow.id,
        {
          label: 'Documentation Verification',
          description: 'Verify all required documents are uploaded and valid',
          isMandatory: true,
          type: 'individual',
          config: {
            completions: customers.map((c) => ({
              customerId: c.id,
              customerName: `${c.firstName} ${c.lastName}`,
              completed: false,
            })),
          },
        },
        userId,
      );

      await this.workflowService.addStep(
        workflow.id,
        {
          label: 'Payment Verification',
          description: 'Ensure initial payment is received and verified',
          isMandatory: true,
        },
        userId,
      );

      // Add steps from package pre-trip checklist
      if (
        packageEntity.preTripChecklist &&
        packageEntity.preTripChecklist.length > 0
      ) {
        for (const item of packageEntity.preTripChecklist) {
          await this.workflowService.addStep(
            workflow.id,
            {
              label: item.task,
              description: item.description,
              isMandatory: true,
              type: item.type === 'individual' ? 'individual' : 'common',
              config:
                item.type === 'individual'
                  ? {
                    completions: customers.map((c) => ({
                      customerId: c.id,
                      customerName: `${c.firstName} ${c.lastName}`,
                      completed: false,
                    })),
                  }
                  : {},
            },
            userId,
          );
        }
      }

      // Create initial payment if provided
      const initialAmount = createBookingDto.initialPayment?.amount || 0;
      if (createBookingDto.initialPayment && initialAmount > 0) {
        const paymentNumber = await this.generatePaymentNumber(organizationId);
        const { allocations: initialAllocations, ...initialPaymentData } =
          createBookingDto.initialPayment;

        const payment = queryRunner.manager.create(BookingPayment, {
          ...initialPaymentData,
          paymentNumber,
          bookingId: savedBooking.id,
          recordedById: userId,
          status: PaymentStatus.PENDING,
          isPassengerSplit:
            createBookingDto.initialPayment.isPassengerSplit || false,
          payerName: createBookingDto.initialPayment.payerName,
          payerCustomerId: createBookingDto.initialPayment.payerCustomerId,
        });
        const savedPayment = await queryRunner.manager.save(payment);

        // Record payment creation log
        const initialPaymentLog = queryRunner.manager.create(BookingPaymentLog, {
          paymentId: savedPayment.id,
          changedById: userId,
          action: 'created',
          newData: {
            paymentNumber: savedPayment.paymentNumber,
            amount: savedPayment.amount,
            status: savedPayment.status,
            paymentType: savedPayment.paymentType,
            paymentMethod: savedPayment.paymentMethod,
            paymentReference: savedPayment.paymentReference,
            transactionId: savedPayment.transactionId,
            payerName: savedPayment.payerName,
            isInitialPayment: true,
          },
        });
        await queryRunner.manager.save(BookingPaymentLog, initialPaymentLog);

        if (
          createBookingDto.initialPayment.isPassengerSplit &&
          initialAllocations &&
          initialAllocations.length > 0
        ) {
          const bookingCustomers = await queryRunner.manager.find(
            BookingCustomer,
            {
              where: { bookingId: savedBooking.id },
            },
          );
          const customerIdToBookingCustomerId = new Map(
            bookingCustomers.map((bc) => [bc.customerId, bc.id]),
          );
          const validBookingCustomerIds = new Set(
            bookingCustomers.map((bc) => bc.id),
          );

          const allocations: BookingPaymentAllocation[] = initialAllocations
            .map((alloc: any) => {
              const targetBcId =
                (alloc.customerId
                  ? customerIdToBookingCustomerId.get(alloc.customerId)
                  : undefined) ||
                (alloc.bookingCustomerId
                  ? customerIdToBookingCustomerId.get(alloc.bookingCustomerId)
                  : undefined) ||
                (alloc.bookingCustomerId &&
                  validBookingCustomerIds.has(alloc.bookingCustomerId)
                  ? alloc.bookingCustomerId
                  : undefined);

              if (!targetBcId) return null;
              return queryRunner.manager.create(BookingPaymentAllocation, {
                paymentId: savedPayment.id,
                bookingCustomerId: targetBcId,
                amount: alloc.amount,
                notes: alloc.notes,
              });
            })
            .filter((a): a is BookingPaymentAllocation => Boolean(a));

          if (allocations.length > 0) {
            await queryRunner.manager.save(
              BookingPaymentAllocation,
              allocations,
            );
          }
        }
      }


      let usedBlock = false;
      let blockSlots = 0;
      if (createBookingDto.batchBlockId) {
        const block = await queryRunner.manager.findOne(BatchBlock, {
          where: {
            id: createBookingDto.batchBlockId,
            batchId: batch.id,
            status: BatchBlockStatus.ACTIVE,
          },
        });

        if (block) {
          block.status = BatchBlockStatus.CONVERTED;
          await queryRunner.manager.save(BatchBlock, block);
          blockSlots = block.slots;
          usedBlock = true;

          // Log block conversion in batch logs
          const log = queryRunner.manager.create(BatchLog, {
            batchId: batch.id,
            changedById: userId,
            action: 'slots_converted',
            previousData: { slots: block.slots, reason: block.reason },
            newData: { bookingId: savedBooking.id, status: BatchBlockStatus.CONVERTED },
          });
          await queryRunner.manager.save(BatchLog, log);
        }
      }

      // Update batch booked seats
      const numBooked = createBookingDto.customerIds.length;
      if (usedBlock) {
        await queryRunner.manager.update(Batch, batch.id, {
          bookedSeats: batch.bookedSeats + numBooked,
          blockedSeats: Math.max(0, batch.blockedSeats - blockSlots),
        });
      } else {
        await queryRunner.manager.update(Batch, batch.id, {
          bookedSeats: batch.bookedSeats + numBooked,
        });
      }

      // Set the current workflow ID back to the booking
      await queryRunner.manager.update(Booking, savedBooking.id, {
        currentWorkflowId: workflow.id,
      });

      await queryRunner.commitTransaction();

      return this.findOne(savedBooking.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(
    organizationId: string,
    status?: BookingStatus,
    page?: number,
    limit?: number,
    offset?: number,
    search?: string,
  ): Promise<any> {
    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.package', 'package')
      .leftJoinAndSelect('booking.batch', 'batch')
      .leftJoinAndSelect('booking.createdBy', 'createdBy')
      .leftJoinAndSelect('booking.agent', 'agent')
      .where('booking.organizationId = :organizationId', { organizationId })
      .orderBy('booking.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR booking.bookingNumber ILIKE :search OR package.name ILIKE :search OR agent.name ILIKE :search OR agent.agencyName ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      queryBuilder.skip(skip).take(limit);

      const [bookings, total] = await queryBuilder.getManyAndCount();

      const data = bookings.map((booking) => ({
        id: booking.id,
        bookingNumber: booking.bookingNumber,
        customerName:
          booking.customer.firstName + ' ' + (booking.customer.lastName || ''),
        customerEmail: booking.customer.email || '',
        packageName: booking.package.name,
        batchStartDate: booking.batch.startDate,
        numberOfCustomers: booking.numberOfCustomers,
        totalAmount: booking.totalAmount,
        discountAmount: booking.discountAmount || 0,
        specialOfferDiscount: booking.specialOfferDiscount || 0,
        batchOfferId: booking.batchOfferId || null,
        adjustmentAmount: booking.adjustmentAmount || 0,
        advancePaid: booking.advancePaid,
        balanceAmount: booking.balanceAmount,
        status: booking.status,
        createdAt: booking.createdAt,
        createdBy: booking.createdBy
          ? {
            id: booking.createdBy.id,
            name: booking.createdBy.name,
            email: booking.createdBy.email,
          }
          : null,
        agentId: booking.agentId,
        agentName: booking.agent
          ? booking.agent.agencyName
            ? `${booking.agent.name} (${booking.agent.agencyName})`
            : booking.agent.name
          : null,
        agentCommissionAmount: booking.agentCommissionAmount,
        agentPayoutStatus: booking.agentPayoutStatus,
      }));

      return {
        data,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }

    if (limit !== undefined) {
      queryBuilder.take(limit);
    }
    if (offset !== undefined) {
      queryBuilder.skip(offset);
    }

    const bookings = await queryBuilder.getMany();

    return bookings.map((booking) => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      customerName:
        booking.customer.firstName + ' ' + (booking.customer.lastName || ''),
      customerEmail: booking.customer.email || '',
      packageName: booking.package.name,
      batchStartDate: booking.batch.startDate,
      numberOfCustomers: booking.numberOfCustomers,
      totalAmount: booking.totalAmount,
      discountAmount: booking.discountAmount || 0,
      specialOfferDiscount: booking.specialOfferDiscount || 0,
      batchOfferId: booking.batchOfferId || null,
      adjustmentAmount: booking.adjustmentAmount || 0,
      advancePaid: booking.advancePaid,
      balanceAmount: booking.balanceAmount,
      status: booking.status,
      createdAt: booking.createdAt,
      createdBy: booking.createdBy
        ? {
          id: booking.createdBy.id,
          name: booking.createdBy.name,
          email: booking.createdBy.email,
        }
        : null,
      agentId: booking.agentId,
      agentName: booking.agent
        ? booking.agent.agencyName
          ? `${booking.agent.name} (${booking.agent.agencyName})`
          : booking.agent.name
        : null,
      agentCommissionAmount: booking.agentCommissionAmount,
      agentPayoutStatus: booking.agentPayoutStatus,
    }));
  }

  async findByCustomerId(
    customerId: string,
    organizationId: string,
  ): Promise<BookingSummaryDto[]> {
    const bookings = await this.bookingRepository.find({
      where: [
        { customerId, organizationId },
        { bookingCustomers: { customerId }, organizationId },
      ],
      relations: ['customer', 'package', 'batch', 'bookingCustomers', 'createdBy'],
      order: { createdAt: 'DESC' },
    });

    // Deduplicate bookings in case a customer is both the primary and a bookingCustomer passenger
    const uniqueBookings = Array.from(
      new Map(bookings.map((b) => [b.id, b])).values()
    );

    return uniqueBookings.map((booking) => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      customerName:
        booking.customer.firstName + ' ' + (booking.customer.lastName || ''),
      customerEmail: booking.customer.email || '',
      packageName: booking.package.name,
      batchId: booking.batchId,
      batchStartDate: booking.batch.startDate,
      numberOfCustomers: booking.numberOfCustomers,
      totalAmount: booking.totalAmount,
      discountAmount: booking.discountAmount || 0,
      specialOfferDiscount: booking.specialOfferDiscount || 0,
      batchOfferId: booking.batchOfferId || null,
      adjustmentAmount: booking.adjustmentAmount || 0,
      advancePaid: booking.advancePaid,
      balanceAmount: booking.balanceAmount,
      status: booking.status,
      createdAt: booking.createdAt,
      createdBy: booking.createdBy
        ? {
          id: booking.createdBy.id,
          name: booking.createdBy.name,
          email: booking.createdBy.email,
        }
        : null,
    }));
  }

  async findByManagerTeam(
    organizationId: string,
    teamUserIds: string[],
    status?: BookingStatus,
    limit = 50,
    offset = 0,
  ): Promise<BookingSummaryDto[]> {
    if (teamUserIds.length === 0) {
      return [];
    }

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.package', 'package')
      .leftJoinAndSelect('booking.batch', 'batch')
      .leftJoinAndSelect('booking.createdBy', 'createdBy')
      .where('booking.organizationId = :organizationId', { organizationId })
      .andWhere('booking.createdById IN (:...teamUserIds)', { teamUserIds })
      .orderBy('booking.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    const bookings = await queryBuilder.getMany();

    return bookings.map((booking) => ({
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      customerName:
        booking.customer.firstName + ' ' + (booking.customer.lastName || ''),
      customerEmail: booking.customer.email || '',
      packageName: booking.package.name,
      batchStartDate: booking.batch.startDate,
      numberOfCustomers: booking.numberOfCustomers,
      totalAmount: booking.totalAmount,
      discountAmount: booking.discountAmount || 0,
      adjustmentAmount: booking.adjustmentAmount || 0,
      advancePaid: booking.advancePaid,
      balanceAmount: booking.balanceAmount,
      status: booking.status,
      createdAt: booking.createdAt,
      createdBy: booking.createdBy
        ? {
          id: booking.createdBy.id,
          name: booking.createdBy.name,
          email: booking.createdBy.email,
        }
        : null,
    }));
  }

  async findOne(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'bookingCustomers',
        'bookingCustomers.customer',
        'bookingCustomers.packageTier',
        'package',
        'package.packageTiers',
        'batch',
        'batchOffer',
        'payments',
        'payments.allocations',
        'payments.allocations.bookingCustomer',
        'payments.allocations.bookingCustomer.customer',
        'payments.payerCustomer',
        'documents',
        'currentWorkflow',
        'currentWorkflow.steps',
        'agent',
      ],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

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

    const bookingTotal = Number(booking.totalAmount || 0);
    const count = booking.bookingCustomers?.length || 1;
    const rawCosts = (booking.bookingCustomers || []).map((bc) => {
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

    const customers = booking.bookingCustomers
      ? booking.bookingCustomers.map((bc, index): BookingCustomerResponseDto => {
        const customer = bc.customer;
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
        let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
        if (paidAmount >= calculatedShare && calculatedShare > 0) {
          paymentStatus = 'paid';
        } else if (paidAmount > 0) {
          paymentStatus = 'partial';
        }

        return {
          id: customer?.id || bc.customerId,
          bookingCustomerId: bc.id,
          firstName: customer?.firstName || '',
          lastName: customer?.lastName,
          middleName: customer?.middleName,
          email: customer?.email,
          phone: customer?.phone,
          alternativePhone: customer?.alternativePhone,
          dateOfBirth: customer?.dateOfBirth,
          gender: customer?.gender,
          address: customer?.address,
          emergencyContactName: customer?.emergencyContactName,
          emergencyContactPhone: customer?.emergencyContactPhone,
          emergencyContactRelation: customer?.emergencyContactRelation,
          specialRequests: customer?.specialRequests,
          medicalConditions: customer?.medicalConditions,
          dietaryRestrictions: customer?.dietaryRestrictions,
          packageTierId: bc.packageTierId,
          packageTierName: bc.packageTier?.name,
          ageCategory: bc.ageCategory || 'adult',
          calculatedShare,
          paidAmount,
          balanceAmount,
          paymentStatus,
        };
      })
      : [];

    return {
      id: booking.id,
      bookingNumber: booking.bookingNumber,
      primaryCustomer: {
        id: booking.customer.id,
        firstName: booking.customer.firstName,
        lastName: booking.customer.lastName || '',
        email: booking.customer.email || '',
        phone: booking.customer.phone || '',
        address: booking.customer.address || '',
      },
      package: {
        id: booking.package.id,
        name: booking.package.name,
        destination: booking.package.destination,
        days: booking.package.days,
        nights: booking.package.nights,
      },
      batch: {
        id: booking.batch.id,
        startDate: booking.batch.startDate,
        endDate: booking.batch.endDate,
        totalSeats: booking.batch.totalSeats,
        bookedSeats: booking.batch.bookedSeats,
      },
      batchOffer: booking.batchOffer
        ? {
          id: booking.batchOffer.id,
          name: booking.batchOffer.name,
          discountType: booking.batchOffer.discountType,
          discountMode: booking.batchOffer.discountMode,
          discountValue: Number(booking.batchOffer.discountValue),
          minDiscountValue:
            booking.batchOffer.minDiscountValue !== null
              ? Number(booking.batchOffer.minDiscountValue)
              : null,
          maxDiscountValue:
            booking.batchOffer.maxDiscountValue !== null
              ? Number(booking.batchOffer.maxDiscountValue)
              : null,
          discountScope: booking.batchOffer.discountScope,
        }
        : null,
      numberOfCustomers: booking.numberOfCustomers,
      totalAmount: booking.totalAmount,
      discountAmount: booking.discountAmount || 0,
      specialOfferDiscount: booking.specialOfferDiscount || 0,
      adjustmentAmount: booking.adjustmentAmount || 0,
      advancePaid: booking.advancePaid,
      balanceAmount: booking.balanceAmount,
      status: booking.status,
      specialRequests: booking.specialRequests,
      agentId: booking.agentId,
      agent: booking.agent
        ? {
          id: booking.agent.id,
          name: booking.agent.name,
          agencyName: booking.agent.agencyName,
          email: booking.agent.email,
          phone: booking.agent.phone,
        }
        : null,
      agentCommissionType: booking.agentCommissionType,
      agentCommissionValue: booking.agentCommissionValue,
      agentCommissionAmount: booking.agentCommissionAmount,
      agentPayoutStatus: booking.agentPayoutStatus,
      customers: booking.bookingCustomers ? booking.bookingCustomers.map(
        (bc): BookingCustomerResponseDto => {
          const customer = bc.customer;
          return {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            middleName: customer.middleName,
            email: customer.email,
            phone: customer.phone,
            alternativePhone: customer.alternativePhone,
            dateOfBirth: customer.dateOfBirth,
            gender: customer.gender,
            address: customer.address,
            emergencyContactName: customer.emergencyContactName,
            emergencyContactPhone: customer.emergencyContactPhone,
            emergencyContactRelation: customer.emergencyContactRelation,
            specialRequests: customer.specialRequests,
            medicalConditions: customer.medicalConditions,
            dietaryRestrictions: customer.dietaryRestrictions,
          };
        },
      ) : [],
      payments: booking.payments
        ? booking.payments.map((payment) => ({
          id: payment.id,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          paymentDate: payment.paymentDate,
          paymentReference: payment.paymentReference,
          transactionId: payment.transactionId,
          notes: payment.notes,
          receiptFilePath: payment.receiptFilePath,
          isPassengerSplit: payment.isPassengerSplit || false,
          payerName:
            payment.payerName ||
            (payment.payerCustomer
              ? `${payment.payerCustomer.firstName} ${payment.payerCustomer.lastName || ''}`.trim()
              : undefined),
          payerCustomerId: payment.payerCustomerId,
          allocations: payment.allocations
            ? payment.allocations.map((a) => ({
              id: a.id,
              bookingCustomerId: a.bookingCustomerId,
              customerId: a.bookingCustomer?.customer?.id,
              customerName: a.bookingCustomer?.customer
                ? `${a.bookingCustomer.customer.firstName} ${a.bookingCustomer.customer.lastName || ''}`.trim()
                : 'Passenger',
              customerEmail: a.bookingCustomer?.customer?.email,
              amount: Number(a.amount),
              notes: a.notes,
            }))
            : [],
        }))
        : [],
      currentWorkflowId: booking.currentWorkflowId,
      currentWorkflow: booking.currentWorkflow,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }


  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['bookingCustomers', 'batch', 'batch.batchTiers'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update customers if provided
      if (updateBookingDto.customerIds) {
        // Validate customers exist
        const customers = await this.customerRepository.findBy({
          id: In(updateBookingDto.customerIds),
        });

        if (customers.length !== updateBookingDto.customerIds.length) {
          throw new BadRequestException('One or more customers not found');
        }

        // Update customer associations
        const bookingToUpdate = await queryRunner.manager.findOne(Booking, {
          where: { id },
          relations: ['bookingCustomers'],
        });

        if (bookingToUpdate) {
          // Remove old booking customers
          await queryRunner.manager.delete(BookingCustomer, { bookingId: id });

          // Create new booking customers
          const newBookingCustomers = customers.map(c =>
            queryRunner.manager.create(BookingCustomer, {
              bookingId: id,
              customerId: c.id,
              ageCategory: 'adult'
            })
          );

          await queryRunner.manager.save(BookingCustomer, newBookingCustomers);

          bookingToUpdate.numberOfCustomers = customers.length;
          await queryRunner.manager.save(bookingToUpdate);
        }
      }

      // Update booking
      const { customerIds, ...bookingUpdate } = updateBookingDto;

      // Handle agent & commission updates
      if ('agentId' in updateBookingDto) {
        if (!updateBookingDto.agentId) {
          (bookingUpdate as any).agentId = null;
          (bookingUpdate as any).agentCommissionType = null;
          (bookingUpdate as any).agentCommissionValue = null;
          (bookingUpdate as any).agentCommissionAmount = 0;
          (bookingUpdate as any).agentPayoutStatus = AgentPayoutStatus.PENDING;
        } else {
          let agentCommissionType = updateBookingDto.agentCommissionType;
          let agentCommissionValue = updateBookingDto.agentCommissionValue;
          let agentCommissionAmount = updateBookingDto.agentCommissionAmount;

          if (agentCommissionAmount === undefined || agentCommissionAmount === null) {
            const agent = await queryRunner.manager.findOne(Agent, {
              where: { id: updateBookingDto.agentId },
            });
            if (agent) {
              agentCommissionType = agentCommissionType || agent.commissionType;
              agentCommissionValue =
                agentCommissionValue !== undefined
                  ? agentCommissionValue
                  : Number(agent.commissionValue || 0);

              const total = updateBookingDto.totalAmount ?? booking.totalAmount;
              if (agentCommissionType === CommissionType.PERCENTAGE) {
                agentCommissionAmount = (total * agentCommissionValue) / 100;
              } else {
                agentCommissionAmount = agentCommissionValue;
              }
            }
          }

          bookingUpdate.agentId = updateBookingDto.agentId;
          bookingUpdate.agentCommissionType = agentCommissionType;
          bookingUpdate.agentCommissionValue = agentCommissionValue;
          bookingUpdate.agentCommissionAmount = agentCommissionAmount || 0;
        }
      }

      await queryRunner.manager.update(Booking, id, bookingUpdate);

      // Update balance amount if total amount changed
      if (bookingUpdate.totalAmount !== undefined) {
        const newBalanceAmount =
          bookingUpdate.totalAmount - booking.advancePaid;
        await queryRunner.manager.update(Booking, id, {
          balanceAmount: newBalanceAmount,
        });
      }

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<void> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['batch'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update batch booked seats
      await queryRunner.manager.update(Batch, booking.batch.id, {
        bookedSeats: booking.batch.bookedSeats - booking.numberOfCustomers,
      });

      const workflowId = booking.currentWorkflowId;

      // Log deletion before actual delete
      await this.logAction(id, booking.createdById, 'delete', booking, null, queryRunner.manager);

      // Delete booking (cascades to payments, documents)
      await queryRunner.manager.delete(Booking, id);

      // Delete workflow and its related logs and steps after booking is removed
      if (workflowId) {
        await queryRunner.manager.delete('workflow_logs', {
          workflowId: workflowId,
        });
        await queryRunner.manager.delete('workflow_steps', {
          workflowId: workflowId,
        });
        await queryRunner.manager.delete('workflows', {
          id: workflowId,
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addPayment(
    bookingId: string,
    paymentDto: CreatePaymentDto,
    userId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const bookingWithOrg = await this.bookingRepository.findOne({
      where: { id: bookingId },
      select: ['organizationId'],
    });

    if (!bookingWithOrg) {
      throw new NotFoundException('Booking not found');
    }

    const paymentNumber = await this.generatePaymentNumber(
      bookingWithOrg.organizationId,
    );

    const payment = this.paymentRepository.create({
      ...paymentDto,
      paymentNumber,
      bookingId,
      recordedById: userId,
      status: PaymentStatus.PENDING,
      isPassengerSplit: paymentDto.isPassengerSplit || false,
      payerName: paymentDto.payerName,
      payerCustomerId: paymentDto.payerCustomerId,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Save allocations if present
    if (
      paymentDto.isPassengerSplit &&
      paymentDto.allocations &&
      paymentDto.allocations.length > 0
    ) {
      const allocations = paymentDto.allocations.map((alloc) =>
        this.paymentAllocationRepository.create({
          paymentId: savedPayment.id,
          bookingCustomerId: alloc.bookingCustomerId,
          amount: alloc.amount,
          notes: alloc.notes,
        }),
      );
      await this.paymentAllocationRepository.save(allocations);
    }

    // Record payment creation log
    const paymentLog = this.paymentLogRepository.create({
      paymentId: savedPayment.id,
      changedById: userId,
      action: 'created',
      newData: {
        paymentNumber: savedPayment.paymentNumber,
        amount: savedPayment.amount,
        status: savedPayment.status,
        paymentType: savedPayment.paymentType,
        paymentMethod: savedPayment.paymentMethod,
        paymentReference: savedPayment.paymentReference,
        transactionId: savedPayment.transactionId,
        payerName: savedPayment.payerName,
      },
    });
    await this.paymentLogRepository.save(paymentLog);

    // Only update booking advance paid and balance if payment was already completed
    if (savedPayment.status === PaymentStatus.COMPLETED) {
      const newAdvancePaid = Number(booking.advancePaid) + Number(paymentDto.amount);
      const newBalanceAmount = Number(booking.totalAmount) - newAdvancePaid;

      await this.bookingRepository.update(bookingId, {
        advancePaid: newAdvancePaid,
        balanceAmount: newBalanceAmount,
      });
    }

    return this.findOne(bookingId);
  }

  async getStats(organizationId: string): Promise<BookingStatsDto> {
    const [
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
    ] = await Promise.all([
      this.bookingRepository.count({ where: { organizationId } }),
      this.bookingRepository.count({
        where: { organizationId, status: BookingStatus.PENDING },
      }),
      this.bookingRepository.count({
        where: { organizationId, status: BookingStatus.CONFIRMED },
      }),
      this.bookingRepository.count({
        where: { organizationId, status: BookingStatus.CANCELLED },
      }),
      this.bookingRepository.count({
        where: { organizationId, status: BookingStatus.COMPLETED },
      }),
    ]);

    const revenueResult = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('SUM(booking.totalAmount)', 'totalRevenue')
      .addSelect('SUM(booking.balanceAmount)', 'pendingPayments')
      .addSelect('SUM(booking.numberOfCustomers)', 'totalCustomers')
      .where('booking.organizationId = :organizationId', { organizationId })
      .andWhere('booking.status != :status', {
        status: BookingStatus.CANCELLED,
      })
      .getRawOne();

    return {
      totalBookings,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      totalRevenue: parseFloat(revenueResult?.totalRevenue || '0'),
      pendingPayments: parseFloat(revenueResult?.pendingPayments || '0'),
      totalCustomers: parseInt(revenueResult?.totalCustomers || '0'),
    };
  }

  async getRecentBookings(
    organizationId: string,
    limit = 5,
  ): Promise<BookingSummaryDto[]> {
    const res = await this.findAll(organizationId, undefined, undefined, limit, 0);
    return Array.isArray(res) ? res : res.data;
  }

  private async generateBookingNumber(organizationId: string): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    const count = await this.bookingRepository.count({
      where: { organizationId },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `BK${year}${month}${sequence}`;
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

  async cancelBooking(id: string, userId: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['batch'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === BookingStatus.CANCELLED) {
      throw new BadRequestException('Booking is already cancelled');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const previousData = { ...booking };
      booking.status = BookingStatus.CANCELLED;

      await queryRunner.manager.save(booking);

      // Update batch seats
      await queryRunner.manager.update(Batch, booking.batch.id, {
        bookedSeats: booking.batch.bookedSeats - booking.numberOfCustomers,
      });

      // Log cancellation
      await this.logAction(
        id,
        userId,
        'cancel',
        previousData,
        booking,
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cancelCustomerFromBooking(
    bookingId: string,
    customerId: string,
    userId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['bookingCustomers', 'batch', 'batch.batchTiers'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const customerIndex = booking.bookingCustomers.findIndex((bc) => bc.customer.id === customerId);
    if (customerIndex === -1) {
      throw new NotFoundException('Customer not found in this booking');
    }

    if (booking.bookingCustomers.length === 1) {
      return this.cancelBooking(bookingId, userId);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const previousData = {
        numberOfCustomers: booking.numberOfCustomers,
        customerIds: booking.bookingCustomers.map((bc) => bc.customer.id),
      };

      const removedBookingCustomer = booking.bookingCustomers.splice(customerIndex, 1)[0];
      await queryRunner.manager.delete(BookingCustomer, removedBookingCustomer.id);

      booking.numberOfCustomers = booking.bookingCustomers.length;

      const packageEntity = await this.packageRepository.findOne({
        where: { id: booking.packageId },
        relations: ['packageTiers'],
      });
      if (packageEntity) {
        const packageTier = packageEntity.packageTiers?.find(t => t.id === booking.packageTierId) || packageEntity.packageTiers?.[0];
        const batchTier = booking.batch?.batchTiers?.find(bt => bt.packageTierId === packageTier?.id);
        const adultPrice = batchTier ? Number(batchTier.adultCost || 0) : (packageTier ? Number(packageTier.adultCost || 0) : 0);
        booking.totalAmount = adultPrice * booking.numberOfCustomers;
        booking.balanceAmount = booking.totalAmount - booking.advancePaid;
      }

      await queryRunner.manager.save(booking);

      // Update batch seats
      await queryRunner.manager.update(Batch, booking.batch.id, {
        bookedSeats: booking.batch.bookedSeats - 1,
      });

      // Log partial cancellation
      await this.logAction(
        bookingId,
        userId,
        'customer_removed',
        previousData,
        {
          numberOfCustomers: booking.numberOfCustomers,
          removedCustomerId: customerId,
        },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return this.findOne(bookingId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async addCustomerToBooking(
    bookingId: string,
    customerId: string,
    userId: string,
  ): Promise<BookingResponseDto> {
    return this.addCustomersToBooking(bookingId, [customerId], userId);
  }

  async addCustomersToBooking(
    bookingId: string,
    customerIds: string[],
    userId: string,
  ): Promise<BookingResponseDto> {
    if (!customerIds || customerIds.length === 0) {
      throw new BadRequestException('At least one customer must be provided');
    }

    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['bookingCustomers', 'batch', 'batch.batchTiers'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    const existingCustomerIds = booking.bookingCustomers?.map(bc => bc.customer.id) || [];
    const newCustomerIds = customerIds.filter(id => !existingCustomerIds.includes(id));

    if (newCustomerIds.length === 0) {
      throw new BadRequestException('All selected customers are already in this booking');
    }

    const customersToAdd = await this.customerRepository.findBy({
      id: In(newCustomerIds),
    });

    if (customersToAdd.length !== newCustomerIds.length) {
      throw new BadRequestException('One or more specified customers were not found');
    }

    const availableSeats = booking.batch.totalSeats - booking.batch.bookedSeats - booking.batch.blockedSeats;
    if (availableSeats < newCustomerIds.length) {
      throw new BadRequestException(
        `Only ${availableSeats} seats available in this batch`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const previousData = {
        numberOfCustomers: booking.numberOfCustomers,
        customerIds: existingCustomerIds,
      };

      const newBookingCustomers = newCustomerIds.map(cId =>
        queryRunner.manager.create(BookingCustomer, {
          bookingId,
          customerId: cId,
          ageCategory: 'adult',
        })
      );

      await queryRunner.manager.save(BookingCustomer, newBookingCustomers);

      booking.numberOfCustomers = booking.numberOfCustomers + newCustomerIds.length;

      const packageEntity = await this.packageRepository.findOne({
        where: { id: booking.packageId },
        relations: ['packageTiers'],
      });

      if (packageEntity) {
        const packageTier = packageEntity.packageTiers?.find(t => t.id === booking.packageTierId) || packageEntity.packageTiers?.[0];
        const batchTier = booking.batch?.batchTiers?.find(bt => bt.packageTierId === packageTier?.id);
        const adultPrice = batchTier ? Number(batchTier.adultCost || 0) : (packageTier ? Number(packageTier.adultCost || 0) : 0);
        booking.totalAmount = adultPrice * booking.numberOfCustomers;
        booking.balanceAmount = booking.totalAmount - booking.advancePaid;
      }

      await queryRunner.manager.save(booking);

      await queryRunner.manager.update(Batch, booking.batch.id, {
        bookedSeats: booking.batch.bookedSeats + newCustomerIds.length,
      });

      await this.logAction(
        bookingId,
        userId,
        'customer_added',
        previousData,
        {
          numberOfCustomers: booking.numberOfCustomers,
          addedCustomerIds: newCustomerIds,
        },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return this.findOne(bookingId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async moveBooking(
    bookingId: string,
    targetBatchId: string,
    userId: string,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
      relations: ['batch'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.batchId === targetBatchId) {
      throw new BadRequestException('Booking is already in this batch');
    }

    const targetBatch = await this.batchRepository.findOne({
      where: { id: targetBatchId },
    });

    if (!targetBatch) {
      throw new NotFoundException('Target batch not found');
    }

    const availableSeats = targetBatch.totalSeats - targetBatch.bookedSeats;
    if (availableSeats < booking.numberOfCustomers) {
      throw new BadRequestException(
        `Only ${availableSeats} seats available in the target batch`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const previousData = { batchId: booking.batchId };

      // Update old batch seats
      await queryRunner.manager.update(Batch, booking.batchId, {
        bookedSeats: booking.batch.bookedSeats - booking.numberOfCustomers,
      });

      // Update booking
      booking.batchId = targetBatchId;
      await queryRunner.manager.save(booking);

      // Update new batch seats
      await queryRunner.manager.update(Batch, targetBatchId, {
        bookedSeats: (targetBatch.bookedSeats || 0) + booking.numberOfCustomers,
      });

      // Log move
      await this.logAction(
        bookingId,
        userId,
        'batch_change',
        previousData,
        { batchId: targetBatchId },
        queryRunner.manager,
      );

      await queryRunner.commitTransaction();
      return this.findOne(bookingId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async logAction(
    bookingId: string,
    userId: string,
    action: string,
    previousData: any,
    newData: any,
    manager?: any,
  ): Promise<void> {
    const log = this.logRepository.create({
      bookingId,
      changedById: userId,
      action,
      previousData,
      newData,
    });

    if (manager) {
      await manager.save(BookingLog, log);
    } else {
      await this.logRepository.save(log);
    }
  }
}
