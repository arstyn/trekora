import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BookingPayment,
  PaymentStatus,
} from 'src/database/entity/booking-payment.entity';
import { Booking, BookingStatus } from 'src/database/entity/booking.entity';
import { DataSource, In, Repository } from 'typeorm';
import { Batch } from 'src/database/entity/batch.entity';
import {
  BookingChecklist,
  ChecklistType,
} from 'src/database/entity/booking-checklist.entity';
import { BookingDocument } from 'src/database/entity/booking-document.entity';
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
import {
  ChecklistItemResponseDto,
  ChecklistStatsDto,
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
} from 'src/dto/checklist-dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(BookingPayment)
    private paymentRepository: Repository<BookingPayment>,
    @InjectRepository(BookingDocument)
    private documentRepository: Repository<BookingDocument>,
    @InjectRepository(BookingChecklist)
    private checklistRepository: Repository<BookingChecklist>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(Batch)
    private batchRepository: Repository<Batch>,
    private dataSource: DataSource,
  ) {}

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

      // Validate package exists and load pre-trip checklist
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
        batchId: createBookingDto.batchId,
        numberOfCustomers: createBookingDto.customerIds.length,
        totalAmount: createBookingDto.totalAmount,
        advancePaid,
        balanceAmount,
        status: BookingStatus.PENDING,
        specialRequests: createBookingDto.specialRequests,
        additionalDetails: createBookingDto.additionalDetails,
        createdById: userId,
        organizationId,
      });

      const savedBooking = await queryRunner.manager.save(booking);

      // Validate and associate customers
      const customers = await this.customerRepository.findBy({
        id: In(createBookingDto.customerIds),
      });

      if (customers.length !== createBookingDto.customerIds.length) {
        throw new BadRequestException('One or more customers not found');
      }

      // Associate customers with the booking
      savedBooking.customers = customers;
      await queryRunner.manager.save(savedBooking);

      // Create package checklist items from package pre-trip checklist
      for (const customer of customers) {
        if (
          packageEntity.preTripChecklist &&
          packageEntity.preTripChecklist.length > 0
        ) {
          const packageChecklists = packageEntity.preTripChecklist.map(
            (checklistItem, index) => {
              const checklist = {
                item: checklistItem.task,
                completed: false,
                mandatory: true,
                type: ChecklistType.PACKAGE,
                bookingId: savedBooking.id,
                sortOrder: index,
                batchId: batch.id,
                createdById: userId,
                customerId: customer.id,
              };

              return queryRunner.manager.create(BookingChecklist, checklist);
            },
          );
          await queryRunner.manager.save(packageChecklists);
        }
      }

      // Create user-provided checklist items (optional)
      if (
        createBookingDto.checklistItems &&
        createBookingDto.checklistItems.length > 0
      ) {
        const userChecklists = createBookingDto.checklistItems.map(
          (checklistItem) => {
            const checklist: any = {
              item: checklistItem.item,
              completed: checklistItem.completed || false,
              mandatory: checklistItem.mandatory || false,
              type: checklistItem.type || ChecklistType.INDIVIDUAL,
              bookingId: savedBooking.id,
              batchId: batch.id,
              createdById: userId,
            };
            if (checklistItem.customerId) {
              checklist.customerId = checklistItem.customerId;
            }
            if (checklistItem.notes) {
              checklist.notes = checklistItem.notes;
            }
            return queryRunner.manager.create(BookingChecklist, checklist);
          },
        );
        await queryRunner.manager.save(userChecklists);
      }

      // Add customers to batch
      await queryRunner.manager
        .createQueryBuilder()
        .relation(Batch, 'customers')
        .of(batch.id)
        .add(customers);

      // Create initial payment if provided
      if (createBookingDto.initialPayment && advancePaid > 0) {
        const payment = queryRunner.manager.create(BookingPayment, {
          ...createBookingDto.initialPayment,
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
    limit = 50,
    offset = 0,
  ): Promise<BookingSummaryDto[]> {
    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.package', 'package')
      .leftJoinAndSelect('booking.batch', 'batch')
      .where('booking.organizationId = :organizationId', { organizationId })
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
        booking.customer.firstName + ' ' + booking.customer.lastName,
      customerEmail: booking.customer.email,
      packageName: booking.package.name,
      batchStartDate: booking.batch.startDate,
      numberOfCustomers: booking.numberOfCustomers,
      totalAmount: booking.totalAmount,
      advancePaid: booking.advancePaid,
      balanceAmount: booking.balanceAmount,
      status: booking.status,
      createdAt: booking.createdAt,
    }));
  }

  async findOne(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'customers',
        'package',
        'batch',
        'checklists',
        'payments',
        'documents',
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
        lastName: booking.customer.lastName,
        email: booking.customer.email,
        phone: booking.customer.phone,
        address: booking.customer.address,
      },
      package: {
        id: booking.package.id,
        name: booking.package.name,
        price: booking.package.price,
        destination: booking.package.destination,
        duration: booking.package.duration,
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
      customers: booking.customers.map(
        (customer): BookingCustomerResponseDto => ({
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
        }),
      ),
      payments: booking.payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        paymentDate: payment.paymentDate,
        paymentReference: payment.paymentReference,
      })),
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
      relations: ['customers', 'batch'],
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
          relations: ['customers'],
        });

        if (bookingToUpdate) {
          bookingToUpdate.customers = customers;
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

      // Delete booking (cascades to customers, payments, documents, checklists)
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

    const payment = this.paymentRepository.create({
      ...paymentDto,
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
    return this.findAll(organizationId, undefined, limit, 0);
  }

  // Checklist-specific methods
  async addChecklistItem(
    bookingId: string,
    createChecklistDto: CreateChecklistItemDto,
  ): Promise<ChecklistItemResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Validate customer exists if it's an individual checklist item
    if (
      createChecklistDto.type === ChecklistType.INDIVIDUAL &&
      createChecklistDto.customerId
    ) {
      const customer = await this.customerRepository.findOne({
        where: { id: createChecklistDto.customerId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    const checklistItem = this.checklistRepository.create({
      ...createChecklistDto,
      bookingId,
    });

    const savedItem = await this.checklistRepository.save(checklistItem);

    return {
      id: savedItem.id,
      item: savedItem.item,
      completed: savedItem.completed,
      mandatory: savedItem.mandatory,
      type: savedItem.type,
      customerId: savedItem.customerId,
      sortOrder: savedItem.sortOrder,
      createdAt: savedItem.createdAt,
      updatedAt: savedItem.updatedAt,
    };
  }

  async updateChecklistItem(
    id: string,
    updateChecklistDto: UpdateChecklistItemDto,
  ): Promise<ChecklistItemResponseDto> {
    const checklistItem = await this.checklistRepository.findOne({
      where: { id },
    });

    if (!checklistItem) {
      throw new NotFoundException('Checklist item not found');
    }

    await this.checklistRepository.update(id, updateChecklistDto);
    const updatedItem = await this.checklistRepository.findOne({
      where: { id },
    });

    if (!updatedItem) {
      throw new NotFoundException('Checklist item not found after update');
    }

    return {
      id: updatedItem.id,
      item: updatedItem.item,
      completed: updatedItem.completed,
      mandatory: updatedItem.mandatory,
      type: updatedItem.type,
      customerId: updatedItem.customerId,
      sortOrder: updatedItem.sortOrder,
      createdAt: updatedItem.createdAt,
      updatedAt: updatedItem.updatedAt,
    };
  }

  async deleteChecklistItem(id: string): Promise<void> {
    const result = await this.checklistRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Checklist item not found');
    }
  }

  async getChecklistStats(
    bookingId: string,
    type?: ChecklistType,
  ): Promise<ChecklistStatsDto> {
    const queryBuilder = this.checklistRepository
      .createQueryBuilder('checklist')
      .where('checklist.bookingId = :bookingId', { bookingId });

    if (type) {
      queryBuilder.andWhere('checklist.type = :type', { type });
    }

    const items = await queryBuilder.getMany();

    const totalItems = items.length;
    const completedItems = items.filter((item) => item.completed).length;
    const mandatoryItems = items.filter((item) => item.mandatory).length;
    const completedMandatoryItems = items.filter(
      (item) => item.mandatory && item.completed,
    ).length;

    return {
      totalItems,
      completedItems,
      mandatoryItems,
      completedMandatoryItems,
      completionPercentage:
        totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      mandatoryCompletionPercentage:
        mandatoryItems > 0
          ? Math.round((completedMandatoryItems / mandatoryItems) * 100)
          : 0,
    };
  }

  async toggleChecklistItem(id: string): Promise<ChecklistItemResponseDto> {
    const checklistItem = await this.checklistRepository.findOne({
      where: { id },
    });

    if (!checklistItem) {
      throw new NotFoundException('Checklist item not found');
    }

    await this.checklistRepository.update(id, {
      completed: !checklistItem.completed,
    });

    return this.updateChecklistItem(id, {
      completed: !checklistItem.completed,
    });
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
}
