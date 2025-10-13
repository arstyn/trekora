import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  PreBooking,
  PreBookingStatus,
} from 'src/database/entity/pre-booking.entity';
import { Lead } from 'src/database/entity/lead.entity';
import { Package } from 'src/database/entity/package-related/package.entity';
import { Customer } from 'src/database/entity/customer.entity';
import { Booking } from 'src/database/entity/booking.entity';
import {
  ConvertLeadToPreBookingDto,
  UpdatePreBookingPackageDto,
  UpdateTemporaryCustomerDetailsDto,
  CreateCustomerFromPreBookingDto,
  ConvertPreBookingToBookingDto,
  UpdatePreBookingDto,
  PreBookingResponseDto,
  PreBookingSummaryDto,
  PreBookingStatsDto,
} from 'src/dto/pre-booking.dto';
import { BookingService } from '../booking/booking.service';

@Injectable()
export class PreBookingService {
  constructor(
    @InjectRepository(PreBooking)
    private preBookingRepository: Repository<PreBooking>,
    @InjectRepository(Lead)
    private leadRepository: Repository<Lead>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private bookingService: BookingService,
    private dataSource: DataSource,
  ) {}

  // Convert a lead to pre-booking
  async convertLeadToPreBooking(
    dto: ConvertLeadToPreBookingDto,
    userId: string,
    organizationId: string,
  ): Promise<PreBookingResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate lead exists and load preferred package
      const lead = await this.leadRepository.findOne({
        where: { id: dto.leadId, organizationId },
        relations: ['preferredPackage'],
      });

      if (!lead) {
        throw new NotFoundException('Lead not found');
      }

      // Check if lead is already converted to pre-booking
      const existingPreBooking = await this.preBookingRepository.findOne({
        where: { leadId: dto.leadId },
      });

      if (existingPreBooking) {
        throw new BadRequestException(
          'Lead is already converted to pre-booking',
        );
      }

      // Generate pre-booking number
      const preBookingNumber =
        await this.generatePreBookingNumber(organizationId);

      // Calculate estimated amount if package is available
      let estimatedAmount: number | undefined;
      if (lead.preferredPackage && lead.numberOfPassengers) {
        estimatedAmount = lead.preferredPackage.price * lead.numberOfPassengers;
      }

      // Determine initial status based on package selection
      const initialStatus = lead.preferredPackageId
        ? PreBookingStatus.CUSTOMER_DETAILS_PENDING
        : PreBookingStatus.PENDING;

      // Create pre-booking with lead details
      const preBooking = queryRunner.manager.create(PreBooking, {
        preBookingNumber,
        leadId: dto.leadId,
        status: initialStatus,
        notes: dto.notes,
        packageId: lead.preferredPackageId || undefined,
        numberOfTravelers: lead.numberOfPassengers || 1,
        estimatedAmount,
        temporaryCustomerDetails: {
          firstName: lead.name?.split(' ')[0] || 'N/A',
          lastName: lead.name?.split(' ').slice(1).join(' ') || 'N/A',
          email: lead.email || 'N/A',
          phone: lead.phone || 'N/A',
        },
        additionalDetails: {
          consideredPackageIds: lead.consideredPackageIds || [],
        },
        createdById: userId,
        organizationId,
      });

      const savedPreBooking = await queryRunner.manager.save(preBooking);

      // Update lead status to converted
      await queryRunner.manager.update(Lead, lead.id, {
        status: 'converted',
      });

      await queryRunner.commitTransaction();

      return this.findOne(savedPreBooking.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Update pre-booking with package and date selection
  async updatePackageAndDates(
    id: string,
    dto: UpdatePreBookingPackageDto,
  ): Promise<PreBookingResponseDto> {
    const preBooking = await this.preBookingRepository.findOne({
      where: { id },
    });

    if (!preBooking) {
      throw new NotFoundException('Pre-booking not found');
    }

    // Validate package exists
    const packageEntity = await this.packageRepository.findOne({
      where: { id: dto.packageId },
    });

    if (!packageEntity) {
      throw new NotFoundException('Package not found');
    }

    // Calculate estimated amount if not provided
    const estimatedAmount =
      dto.estimatedAmount || packageEntity.price * dto.numberOfTravelers;

    // Update pre-booking
    await this.preBookingRepository.update(id, {
      packageId: dto.packageId,
      preferredStartDate: dto.preferredStartDate,
      preferredEndDate: dto.preferredEndDate,
      numberOfTravelers: dto.numberOfTravelers,
      specialRequests: dto.specialRequests,
      estimatedAmount,
      status: PreBookingStatus.CUSTOMER_DETAILS_PENDING,
    });

    return this.findOne(id);
  }

  // Update temporary customer details
  async updateTemporaryCustomerDetails(
    id: string,
    dto: UpdateTemporaryCustomerDetailsDto,
  ): Promise<PreBookingResponseDto> {
    const preBooking = await this.preBookingRepository.findOne({
      where: { id },
    });

    if (!preBooking) {
      throw new NotFoundException('Pre-booking not found');
    }

    await this.preBookingRepository.update(id, {
      temporaryCustomerDetails: dto.temporaryCustomerDetails,
      notes: dto.notes,
    });

    return this.findOne(id);
  }

  // Create a customer from pre-booking
  async createCustomerFromPreBooking(
    id: string,
    dto: CreateCustomerFromPreBookingDto,
    userId: string,
  ): Promise<PreBookingResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const preBooking = await this.preBookingRepository.findOne({
        where: { id },
      });

      if (!preBooking) {
        throw new NotFoundException('Pre-booking not found');
      }

      if (preBooking.customerId) {
        throw new BadRequestException(
          'Customer already created for this pre-booking',
        );
      }

      // Check if customer with same email exists
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: dto.email },
      });

      if (existingCustomer) {
        throw new BadRequestException(
          'Customer with this email already exists',
        );
      }

      // Create customer
      const customer = queryRunner.manager.create(Customer, dto);
      customer.createdById = userId;
      customer.organizationId = preBooking.organizationId;

      const savedCustomer = await queryRunner.manager.save(customer);

      // Update pre-booking with customer reference
      await queryRunner.manager.update(PreBooking, id, {
        customerId: savedCustomer.id,
        status: PreBookingStatus.CUSTOMER_CREATED,
      });

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Convert pre-booking to booking
  async convertToBooking(
    id: string,
    dto: ConvertPreBookingToBookingDto,
    userId: string,
  ): Promise<PreBookingResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const preBooking = await this.preBookingRepository.findOne({
        where: { id },
        relations: ['customer', 'package'],
      });

      if (!preBooking) {
        throw new NotFoundException('Pre-booking not found');
      }

      if (!preBooking.customerId) {
        throw new BadRequestException(
          'Customer details must be completed before converting to booking',
        );
      }

      if (!preBooking.packageId) {
        throw new BadRequestException(
          'Package must be selected before converting to booking',
        );
      }

      if (preBooking.bookingId) {
        throw new BadRequestException(
          'Pre-booking is already converted to booking',
        );
      }

      // Create booking using BookingService
      const booking = await this.bookingService.create(
        {
          customerId: preBooking.customerId,
          packageId: preBooking.packageId,
          batchId: dto.batchId,
          customerIds: dto.customerIds,
          totalAmount: dto.totalAmount,
          initialPayment: dto.initialPayment,
          specialRequests: dto.specialRequests || preBooking.specialRequests,
          additionalDetails: dto.additionalDetails,
        },
        userId,
        preBooking.organizationId,
      );

      // Update pre-booking with booking reference
      await queryRunner.manager.update(PreBooking, id, {
        bookingId: booking.id,
        status: PreBookingStatus.CONVERTED_TO_BOOKING,
      });

      await queryRunner.commitTransaction();

      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Find all pre-bookings
  async findAll(
    organizationId: string,
    status?: PreBookingStatus,
    limit = 50,
    offset = 0,
  ): Promise<PreBookingSummaryDto[]> {
    const queryBuilder = this.preBookingRepository
      .createQueryBuilder('preBooking')
      .leftJoinAndSelect('preBooking.lead', 'lead')
      .leftJoinAndSelect('preBooking.package', 'package')
      .where('preBooking.organizationId = :organizationId', { organizationId })
      .orderBy('preBooking.createdAt', 'DESC')
      .take(limit)
      .skip(offset);

    if (status) {
      queryBuilder.andWhere('preBooking.status = :status', { status });
    }

    const preBookings = await queryBuilder.getMany();

    return preBookings.map((preBooking) => ({
      id: preBooking.id,
      preBookingNumber: preBooking.preBookingNumber,
      leadName: preBooking.lead?.name || 'N/A',
      packageName: preBooking.package?.name,
      numberOfTravelers: preBooking.numberOfTravelers,
      preferredStartDate: preBooking.preferredStartDate,
      estimatedAmount: preBooking.estimatedAmount,
      status: preBooking.status,
      createdAt: preBooking.createdAt,
    }));
  }

  // Find one pre-booking
  async findOne(id: string): Promise<PreBookingResponseDto> {
    const preBooking = await this.preBookingRepository.findOne({
      where: { id },
      relations: ['lead', 'package', 'customer', 'booking'],
    });

    if (!preBooking) {
      throw new NotFoundException('Pre-booking not found');
    }

    return {
      id: preBooking.id,
      preBookingNumber: preBooking.preBookingNumber,
      lead: preBooking.lead
        ? {
            id: preBooking.lead.id,
            name: preBooking.lead.name,
            email: preBooking.lead.email,
            phone: preBooking.lead.phone,
            status: preBooking.lead.status,
          }
        : undefined,
      package: preBooking.package
        ? {
            id: preBooking.package.id,
            name: preBooking.package.name,
            destination: preBooking.package.destination,
            duration: preBooking.package.duration,
            price: preBooking.package.price,
          }
        : undefined,
      preferredStartDate: preBooking.preferredStartDate,
      preferredEndDate: preBooking.preferredEndDate,
      numberOfTravelers: preBooking.numberOfTravelers,
      temporaryCustomerDetails:
        (preBooking.temporaryCustomerDetails as any) || undefined,
      customer: preBooking.customer
        ? {
            id: preBooking.customer.id,
            firstName: preBooking.customer.firstName,
            lastName: preBooking.customer.lastName,
            email: preBooking.customer.email,
            phone: preBooking.customer.phone,
          }
        : undefined,
      booking: preBooking.booking
        ? {
            id: preBooking.booking.id,
            bookingNumber: preBooking.booking.bookingNumber,
          }
        : undefined,
      status: preBooking.status,
      specialRequests: preBooking.specialRequests,
      notes: preBooking.notes,
      estimatedAmount: preBooking.estimatedAmount,
      additionalDetails: preBooking.additionalDetails,
      createdAt: preBooking.createdAt,
      updatedAt: preBooking.updatedAt,
    };
  }

  // Update pre-booking
  async update(
    id: string,
    dto: UpdatePreBookingDto,
  ): Promise<PreBookingResponseDto> {
    const preBooking = await this.preBookingRepository.findOne({
      where: { id },
    });

    if (!preBooking) {
      throw new NotFoundException('Pre-booking not found');
    }

    // Validate package if provided
    if (dto.packageId) {
      const packageEntity = await this.packageRepository.findOne({
        where: { id: dto.packageId },
      });

      if (!packageEntity) {
        throw new NotFoundException('Package not found');
      }
    }

    await this.preBookingRepository.update(id, dto);

    return this.findOne(id);
  }

  // Delete pre-booking
  async remove(id: string): Promise<void> {
    const preBooking = await this.preBookingRepository.findOne({
      where: { id },
    });

    if (!preBooking) {
      throw new NotFoundException('Pre-booking not found');
    }

    if (preBooking.status === PreBookingStatus.CONVERTED_TO_BOOKING) {
      throw new BadRequestException(
        'Cannot delete pre-booking that is already converted to booking',
      );
    }

    await this.preBookingRepository.delete(id);
  }

  // Cancel pre-booking
  async cancel(id: string): Promise<PreBookingResponseDto> {
    const preBooking = await this.preBookingRepository.findOne({
      where: { id },
    });

    if (!preBooking) {
      throw new NotFoundException('Pre-booking not found');
    }

    if (preBooking.status === PreBookingStatus.CONVERTED_TO_BOOKING) {
      throw new BadRequestException(
        'Cannot cancel pre-booking that is already converted to booking',
      );
    }

    await this.preBookingRepository.update(id, {
      status: PreBookingStatus.CANCELLED,
    });

    return this.findOne(id);
  }

  // Get statistics
  async getStats(organizationId: string): Promise<PreBookingStatsDto> {
    const [
      totalPreBookings,
      pendingPreBookings,
      customerDetailsPending,
      customerCreated,
      convertedToBookings,
      cancelledPreBookings,
    ] = await Promise.all([
      this.preBookingRepository.count({ where: { organizationId } }),
      this.preBookingRepository.count({
        where: { organizationId, status: PreBookingStatus.PENDING },
      }),
      this.preBookingRepository.count({
        where: {
          organizationId,
          status: PreBookingStatus.CUSTOMER_DETAILS_PENDING,
        },
      }),
      this.preBookingRepository.count({
        where: { organizationId, status: PreBookingStatus.CUSTOMER_CREATED },
      }),
      this.preBookingRepository.count({
        where: {
          organizationId,
          status: PreBookingStatus.CONVERTED_TO_BOOKING,
        },
      }),
      this.preBookingRepository.count({
        where: { organizationId, status: PreBookingStatus.CANCELLED },
      }),
    ]);

    const revenueResult = await this.preBookingRepository
      .createQueryBuilder('preBooking')
      .select('SUM(preBooking.estimatedAmount)', 'totalEstimatedRevenue')
      .where('preBooking.organizationId = :organizationId', { organizationId })
      .andWhere('preBooking.status != :status', {
        status: PreBookingStatus.CANCELLED,
      })
      .andWhere('preBooking.status != :convertedStatus', {
        convertedStatus: PreBookingStatus.CONVERTED_TO_BOOKING,
      })
      .getRawOne();

    return {
      totalPreBookings,
      pendingPreBookings,
      customerDetailsPending,
      customerCreated,
      convertedToBookings,
      cancelledPreBookings,
      totalEstimatedRevenue: parseFloat(
        revenueResult?.totalEstimatedRevenue || '0',
      ),
    };
  }

  // Generate pre-booking number
  private async generatePreBookingNumber(
    organizationId: string,
  ): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');

    const count = await this.preBookingRepository.count({
      where: { organizationId },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `PB${year}${month}${sequence}`;
  }
}
