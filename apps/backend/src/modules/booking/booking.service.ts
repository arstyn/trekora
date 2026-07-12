import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Batch } from 'src/database/entity/batch.entity';
import { BookingDocument } from 'src/database/entity/booking-document.entity';
import { BookingLog } from 'src/database/entity/booking-log.entity';
import {
  BookingPayment,
  PaymentStatus,
} from 'src/database/entity/booking-payment.entity';
import { Booking, BookingStatus } from 'src/database/entity/booking.entity';
import { Customer } from 'src/database/entity/customer.entity';
import { Package } from 'src/database/entity/package-related/package.entity';
import {
  BookingCustomerResponseDto,
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
import { BookingCustomer } from 'src/database/entity/booking-customer.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(BookingPayment)
    private paymentRepository: Repository<BookingPayment>,
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

      const availableSeats = batch.totalSeats - batch.bookedSeats;
      if (availableSeats < createBookingDto.customerIds.length) {
        throw new BadRequestException(
          `Only ${availableSeats} seats available in this batch`,
        );
      }

      // Generate unique booking number
      const bookingNumber = await this.generateBookingNumber(organizationId);

      // Calculate balance amount
      const advancePaid = createBookingDto.initialPayment?.amount || 0;
      const balanceAmount = createBookingDto.totalAmount - advancePaid;

      // Create booking
      const booking = queryRunner.manager.create(Booking, {
        bookingNumber,
        customerId: createBookingDto.customerId,
        packageId: createBookingDto.packageId,
        packageTierId: createBookingDto.packageTierId,
        batchId: createBookingDto.batchId,
        numberOfCustomers: createBookingDto.customerIds.length,
        totalAmount: createBookingDto.totalAmount,
        advancePaid,
        balanceAmount,
        status: BookingStatus.PENDING,
        specialRequests: createBookingDto.specialRequests,
        additionalDetails: createBookingDto.additionalDetails,
        paymentStructureId: createBookingDto.paymentStructureId,
        isPaymentOverridden: createBookingDto.isPaymentOverridden || false,
        paymentOverrideReason: createBookingDto.paymentOverrideReason,
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
      if (createBookingDto.initialPayment && advancePaid > 0) {
        const paymentNumber = await this.generatePaymentNumber(organizationId);
        const payment = queryRunner.manager.create(BookingPayment, {
          ...createBookingDto.initialPayment,
          paymentNumber,
          bookingId: savedBooking.id,
          recordedById: userId,
          status: PaymentStatus.COMPLETED,
        });
        await queryRunner.manager.save(payment);
      }

      // Update batch booked seats
      await queryRunner.manager.update(Batch, batch.id, {
        bookedSeats: batch.bookedSeats + createBookingDto.customerIds.length,
      });

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
      .where('booking.organizationId = :organizationId', { organizationId })
      .orderBy('booking.createdAt', 'DESC');

    if (status) {
      queryBuilder.andWhere('booking.status = :status', { status });
    }

    if (search) {
      queryBuilder.andWhere(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR booking.bookingNumber ILIKE :search OR package.name ILIKE :search)',
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
      batchStartDate: booking.batch.startDate,
      numberOfCustomers: booking.numberOfCustomers,
      totalAmount: booking.totalAmount,
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
        'package',
        'package.packageTiers',
        'batch',
        'payments',
        'documents',
        'currentWorkflow',
        'currentWorkflow.steps',
      ],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

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
        basePrice: (() => {
          let price = Number(booking.package.basePrice || 0);
          if (booking.package.packageTiers && booking.package.packageTiers.length > 0) {
            const prices = booking.package.packageTiers.map(t => Number(t.adultCost || 0)).filter(p => p > 0);
            if (prices.length > 0) price = Math.min(...prices);
          }
          return price;
        })(),
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
      numberOfCustomers: booking.numberOfCustomers,
      totalAmount: booking.totalAmount,
      advancePaid: booking.advancePaid,
      balanceAmount: booking.balanceAmount,
      status: booking.status,
      specialRequests: booking.specialRequests,
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
      payments: booking.payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentDate: payment.paymentDate,
        paymentReference: payment.paymentReference,
        transactionId: payment.transactionId,
        notes: payment.notes,
        receiptFilePath: payment.receiptFilePath,
      })),
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
      relations: ['bookingCustomers', 'batch'],
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

      // Get the current workflow before deleting booking if needed, 
      // but onDelete: CASCADE in workflow-step should handle steps.
      // We should delete the workflow manually if it's not cascaded from booking.
      if (booking.currentWorkflowId) {
        await queryRunner.manager.delete('workflows', {
          id: booking.currentWorkflowId,
        });
      }

      // Log deletion before actual delete
      await this.logAction(id, booking.createdById, 'delete', booking, null, queryRunner.manager);

      // Delete booking (cascades to payments, documents)
      await queryRunner.manager.delete(Booking, id);

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
      status: PaymentStatus.COMPLETED,
    });

    await this.paymentRepository.save(payment);

    // Update booking advance paid and balance
    const newAdvancePaid = booking.advancePaid + paymentDto.amount;
    const newBalanceAmount = booking.totalAmount - newAdvancePaid;

    await this.bookingRepository.update(bookingId, {
      advancePaid: newAdvancePaid,
      balanceAmount: newBalanceAmount,
    });

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
      relations: ['bookingCustomers', 'batch'],
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

      // Recalculate amounts
      const packageEntity = await this.packageRepository.findOne({
        where: { id: booking.packageId },
      });
      if (packageEntity) {
        booking.totalAmount = packageEntity.basePrice * booking.numberOfCustomers;
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
