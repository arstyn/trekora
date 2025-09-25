import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Booking, BookingStatus } from 'src/database/entity/booking.entity';
import {
  BookingPayment,
  PaymentStatus,
} from 'src/database/entity/booking-payment.entity';
import { BookingPassenger } from 'src/database/entity/booking-passenger.entity';
import { BookingDocument } from 'src/database/entity/booking-document.entity';
import { BookingChecklist, ChecklistType } from 'src/database/entity/booking-checklist-entity';
import { Customer } from 'src/database/entity/customer.entity';
import { Package } from 'src/database/entity/package-related/package.entity';
import { Batch } from 'src/database/entity/batch.entity';
import {
  CreateBookingDto,
  UpdateBookingDto,
  BookingStatsDto,
  BookingSummaryDto,
  BookingResponseDto,
  CreatePaymentDto,
} from 'src/dto/booking.dto';
import {
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
  ChecklistItemResponseDto,
  ChecklistStatsDto,
} from 'src/dto/checklist-dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(BookingPayment)
    private paymentRepository: Repository<BookingPayment>,
    @InjectRepository(BookingPassenger)
    private passengerRepository: Repository<BookingPassenger>,
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
     
      const customer = await this.customerRepository.findOne({
        where: { id: createBookingDto.customerId },
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

 
      const packageEntity = await this.packageRepository.findOne({
        where: { id: createBookingDto.packageId },
      });
      if (!packageEntity) {
        throw new NotFoundException('Package not found');
      }

      const batch = await this.batchRepository.findOne({
        where: { id: createBookingDto.batchId },
      });
      if (!batch) {
        throw new NotFoundException('Batch not found');
      }

      const availableSeats = batch.totalSeats - batch.bookedSeats;
      if (availableSeats < createBookingDto.numberOfPassengers) {
        throw new BadRequestException(
          `Only ${availableSeats} seats available in this batch`,
        );
      }


      const bookingNumber = await this.generateBookingNumber(organizationId);
      const advancePaid = createBookingDto.initialPayment?.amount || 0;
      const balanceAmount = createBookingDto.totalAmount - advancePaid;


      const booking = queryRunner.manager.create(Booking, {
        bookingNumber,
        customerId: createBookingDto.customerId,
        packageId: createBookingDto.packageId,
        batchId: createBookingDto.batchId,
        numberOfPassengers: createBookingDto.numberOfPassengers,
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
      const savedPassengers: BookingPassenger[] = [];
      for (const passengerDto of createBookingDto.passengers) {
        const passenger = queryRunner.manager.create(BookingPassenger, {
          fullName: passengerDto.fullName,
          age: passengerDto.age,
          email: passengerDto.email,
          phone: passengerDto.phone,
          emergencyContact: passengerDto.emergencyContact,
          specialRequirements: passengerDto.specialRequirements,
          bookingId: savedBooking.id,
        });
        
        const savedPassenger = await queryRunner.manager.save(passenger);
        savedPassengers.push(savedPassenger);

        if (passengerDto.checklist && passengerDto.checklist.length > 0) {
          const individualChecklists = passengerDto.checklist.map((checklistItem, index) =>
            queryRunner.manager.create(BookingChecklist, {
              item: checklistItem.item,
              completed: checklistItem.completed || false,
              mandatory: checklistItem.mandatory || false,
              type: ChecklistType.INDIVIDUAL,
              bookingId: savedBooking.id,
              passengerId: savedPassenger.id,
              sortOrder: index,
            }),
          );
          await queryRunner.manager.save(individualChecklists);
        }
      }


      if (createBookingDto.groupChecklist && createBookingDto.groupChecklist.length > 0) {
        const groupChecklists = createBookingDto.groupChecklist.map((checklistItem, index) =>
          queryRunner.manager.create(BookingChecklist, {
            item: checklistItem.item,
            completed: checklistItem.completed || false,
            mandatory: checklistItem.mandatory || false,
            type: ChecklistType.GROUP,
            bookingId: savedBooking.id,
            sortOrder: index,
          }),
        );
        await queryRunner.manager.save(groupChecklists);
      }

      await queryRunner.manager
        .createQueryBuilder()
        .relation(Batch, 'passengers')
        .of(batch.id)
        .add(savedPassengers);

  
      if (createBookingDto.initialPayment && advancePaid > 0) {
        const payment = queryRunner.manager.create(BookingPayment, {
          ...createBookingDto.initialPayment,
          bookingId: savedBooking.id,
          recordedById: userId,
          status: PaymentStatus.COMPLETED,
        });
        await queryRunner.manager.save(payment);
      }

      await queryRunner.manager.update(Batch, batch.id, {
        bookedSeats: batch.bookedSeats + createBookingDto.numberOfPassengers,
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

  async findOne(id: string): Promise<BookingResponseDto> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'package',
        'batch',
        'passengers',
        'passengers.checklists',
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
      customer: {
        id: booking.customer.id,
        name: booking.customer.name,
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
      numberOfPassengers: booking.numberOfPassengers,
      totalAmount: booking.totalAmount,
      advancePaid: booking.advancePaid,
      balanceAmount: booking.balanceAmount,
      status: booking.status,
      specialRequests: booking.specialRequests,
      passengers: booking.passengers.map((passenger) => ({
        id: passenger.id,
        fullName: passenger.fullName,
        age: passenger.age,
        email: passenger.email,
        phone: passenger.phone,
        emergencyContact: passenger.emergencyContact,
        specialRequirements: passenger.specialRequirements,
        checklist: passenger.additionalInfo?.map((item) => ({
          id: item.id,
          item: item.item,
          completed: item.completed,
          mandatory: item.mandatory,
          type: item.type,
          sortOrder: item.sortOrder,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })) || [],
      })),
      groupChecklist: booking.checklists?.filter(item => item.type === ChecklistType.GROUP)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => ({
          id: item.id,
          item: item.item,
          completed: item.completed,
          mandatory: item.mandatory,
          type: item.type,
          sortOrder: item.sortOrder,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })) || [],
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

    if (createChecklistDto.type === ChecklistType.INDIVIDUAL && createChecklistDto.passengerId) {
      const passenger = await this.passengerRepository.findOne({
        where: { id: createChecklistDto.passengerId, bookingId },
      });
      if (!passenger) {
        throw new NotFoundException('Passenger not found');
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
      passengerId: savedItem.passengerId,
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
      passengerId: updatedItem.passengerId,
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

  async getChecklistStats(bookingId: string, type?: ChecklistType): Promise<ChecklistStatsDto> {
    const queryBuilder = this.checklistRepository
      .createQueryBuilder('checklist')
      .where('checklist.bookingId = :bookingId', { bookingId });

    if (type) {
      queryBuilder.andWhere('checklist.type = :type', { type });
    }

    const items = await queryBuilder.getMany();

    const totalItems = items.length;
    const completedItems = items.filter(item => item.completed).length;
    const mandatoryItems = items.filter(item => item.mandatory).length;
    const completedMandatoryItems = items.filter(item => item.mandatory && item.completed).length;

    return {
      totalItems,
      completedItems,
      mandatoryItems,
      completedMandatoryItems,
      completionPercentage: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
      mandatoryCompletionPercentage: mandatoryItems > 0 ? Math.round((completedMandatoryItems / mandatoryItems) * 100) : 0,
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

    return this.updateChecklistItem(id, { completed: !checklistItem.completed });
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
      customerName: booking.customer.name,
      customerEmail: booking.customer.email,
      packageName: booking.package.name,
      batchStartDate: booking.batch.startDate,
      numberOfPassengers: booking.numberOfPassengers,
      totalAmount: booking.totalAmount,
      advancePaid: booking.advancePaid,
      balanceAmount: booking.balanceAmount,
      status: booking.status,
      createdAt: booking.createdAt,
    }));
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