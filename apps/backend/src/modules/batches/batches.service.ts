import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Batch, BatchStatus } from 'src/database/entity/batch.entity';
import { Customer } from 'src/database/entity/customer.entity';
import { Employee } from 'src/database/entity/employee.entity';
import {
  BookingChecklist,
  ChecklistType,
} from 'src/database/entity/booking-checklist.entity';
import { In, Repository } from 'typeorm';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';
import {
  CreateChecklistItemDto,
  UpdateChecklistItemDto,
} from 'src/dto/checklist.dto';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch) private batchRepo: Repository<Batch>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(Customer)
    private customerRepo: Repository<Customer>,
    @InjectRepository(BookingChecklist)
    private checklistRepo: Repository<BookingChecklist>,
  ) {}

  async create(data: CreateBatchDto, organizationId: string): Promise<Batch> {
    const { packageId, coordinators, ...rest } = data;

    const coordinatorsData = await this.empRepo.findBy({
      id: In(coordinators),
    });

    const batch = this.batchRepo.create({
      ...rest,
      package: { id: packageId },
      organizationId,
      coordinators: coordinatorsData,
      bookedSeats: 0,
      status: BatchStatus.UPCOMING,
    });

    return this.batchRepo.save(batch);
  }

  async findAll(
    organizationId: string,
    status?: BatchStatus,
  ): Promise<Batch[]> {
    let query: { organizationId: string; status?: BatchStatus } = {
      organizationId,
    };
    if (status) {
      query.status = status;
    }
    return this.batchRepo.find({
      where: query,
      relations: ['package', 'coordinators'],
      select: {
        package: {
          id: true,
          name: true,
        },
        coordinators: {
          id: true,
          name: true,
          status: true,
        },
      },
    });
  }

  async findOne(id: string): Promise<Batch> {
    const batch = await this.batchRepo.findOne({
      where: { id },
      relations: ['package', 'coordinators', 'customers'],
      select: {
        package: {
          id: true,
          name: true,
          description: true,
          price: true,
          destination: true,
        },
      },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    // Fetch checklists for this batch that are associated with customers
    const checklists = await this.checklistRepo.find({
      where: {
        batchId: id,
      },
    });

    // Group checklists by customerId and calculate stats
    const checklistStatsByCustomer = checklists.reduce(
      (acc, checklist) => {
        if (checklist.customerId) {
          if (!acc[checklist.customerId]) {
            acc[checklist.customerId] = {
              completed: 0,
              total: 0,
            };
          }
          acc[checklist.customerId].total += 1;
          if (checklist.completed) {
            acc[checklist.customerId].completed += 1;
          }
        }
        return acc;
      },
      {} as Record<string, { completed: number; total: number }>,
    );

    // Attach checklist stats to each customer
    batch.customers = batch.customers.map((customer) => ({
      ...customer,
      checklistStats: checklistStatsByCustomer[customer.id] || {
        completed: 0,
        total: 0,
      },
    }));

    return batch;
  }

  async update(id: string, data: UpdateBatchDto): Promise<Batch> {
    const { coordinators, ...rest } = data;

    // Fetch current batch including coordinators relation
    const existingBatch = await this.batchRepo.findOne({
      where: { id },
      relations: ['coordinators'],
    });

    if (!existingBatch) throw new NotFoundException('Batch not found');

    // Prepare update object by comparing fields
    const updateData: Partial<Batch> = {};

    for (const key in rest) {
      if (
        rest[key] !== undefined &&
        rest[key] !== (existingBatch as any)[key]
      ) {
        (updateData as any)[key] = rest[key];
      }
    }

    // Handle coordinators comparison
    if (coordinators) {
      const coordinatorsData = await this.empRepo.findBy({
        id: In(coordinators),
      });

      const existingIds = existingBatch.coordinators.map((c) => c.id).sort();
      const newIds = coordinatorsData.map((c) => c.id).sort();

      const isDifferent =
        existingIds.length !== newIds.length ||
        !existingIds.every((id, index) => id === newIds[index]);

      if (isDifferent) {
        updateData.coordinators = coordinatorsData;
      }
    }

    // Only update if there is something to update
    if (Object.keys(updateData).length > 0) {
      await this.batchRepo.save({
        ...existingBatch,
        ...updateData,
      });
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.batchRepo.delete(id);
  }

  async markActive(id: string): Promise<Batch> {
    const batch = await this.findOne(id);

    // Check if all mandatory checklists for all customers in this batch are completed
    const checklists = await this.checklistRepo.find({
      where: { batchId: id, mandatory: true },
    });

    const incompleteMandatory = checklists.filter((c) => !c.completed);
    if (incompleteMandatory.length > 0) {
      throw new Error(
        `Cannot activate batch. ${incompleteMandatory.length} mandatory checklist items are still pending.`,
      );
    }

    batch.status = BatchStatus.ACTIVE;
    return this.batchRepo.save(batch);
  }

  async markCompleted(id: string): Promise<Batch> {
    const batch = await this.findOne(id);
    batch.status = BatchStatus.COMPLETED;
    return this.batchRepo.save(batch);
  }

  async addCoordinator(batchId: string, employeeId: string): Promise<Batch> {
    const batch = await this.findOne(batchId);
    const employee = await this.empRepo.findOneBy({ id: employeeId });
    if (!employee) throw new NotFoundException('Employee not found');

    batch.coordinators = [...(batch.coordinators || []), employee];
    return this.batchRepo.save(batch);
  }

  async removeCoordinator(batchId: string, employeeId: string): Promise<Batch> {
    const batch = await this.findOne(batchId);
    batch.coordinators = batch.coordinators.filter((e) => e.id !== employeeId);
    return this.batchRepo.save(batch);
  }

  async addCustomer(batchId: string, customerId: string): Promise<Batch> {
    const batch = await this.findOne(batchId);
    const customer = await this.customerRepo.findOneBy({ id: customerId });
    if (!customer) throw new NotFoundException('Customer not found');

    batch.customers = [...(batch.customers || []), customer];
    return this.batchRepo.save(batch);
  }

  async removeCustomer(batchId: string, customerId: string): Promise<Batch> {
    const batch = await this.findOne(batchId);
    batch.customers = batch.customers.filter((c) => c.id !== customerId);
    return this.batchRepo.save(batch);
  }

  async getFastFillingBatches(organizationId: string): Promise<Batch[]> {
    const batches = await this.batchRepo
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.package', 'package')
      .where('batch.organization_id = :organization_id', {
        organization_id: organizationId,
      })
      .andWhere(
        '(batch.booked_seats::float / NULLIF(batch.total_seats, 0)) >= 0.8 AND (batch.booked_seats::float / NULLIF(batch.total_seats, 0)) < 1.0 OR (batch.total_seats - batch.booked_seats) <= 5 AND (batch.total_seats - batch.booked_seats) > 0',
      )
      .orderBy('batch.startDate', 'ASC')
      .limit(5)
      .getMany();

    // Optional: Add fillRate to each result (computed on the fly)
    return batches.map((batch) => ({
      ...batch,
      fillRate:
        batch.totalSeats > 0
          ? parseFloat(
              ((batch.bookedSeats / batch.totalSeats) * 100).toFixed(2),
            )
          : null,
    }));
  }

  async getBatchDashboardStats(organizationId: string): Promise<{
    activeBatches: number;
    upcomingBatches: number;
    availableSeats: number;
    fastFilling: number;
  }> {
    const now = new Date();

    const batches = await this.batchRepo.find({
      where: { organization: { id: organizationId } },
    });

    let activeBatches = 0;
    let upcomingBatches = 0;
    let availableSeats = 0;
    let fastFilling = 0;

    for (const batch of batches) {
      const start = new Date(batch.startDate);
      const end = new Date(batch.endDate);

      // Active: today is between start and end
      if (start <= now && now <= end) {
        activeBatches++;
      }

      // Upcoming: starts in the future
      if (start > now) {
        upcomingBatches++;
        availableSeats += (batch.totalSeats ?? 0) - (batch.bookedSeats ?? 0);
      }

      // Fast Filling: booked ≥ 80% or only 5 seats left
      if (
        batch.totalSeats &&
        (batch.bookedSeats / batch.totalSeats >= 0.8 ||
          batch.totalSeats - batch.bookedSeats <= 5)
      ) {
        fastFilling++;
      }
    }

    return {
      activeBatches,
      upcomingBatches,
      availableSeats,
      fastFilling,
    };
  }

  async findByPackage(packageId: string): Promise<Batch[]> {
    return this.batchRepo.find({
      where: {
        packageId,
        status: BatchStatus.UPCOMING,
      },
      relations: ['package'],
      order: { startDate: 'ASC' },
    });
  }

  async getAvailableBatches(packageId: string): Promise<Batch[]> {
    return this.batchRepo
      .createQueryBuilder('batch')
      .where('batch.packageId = :packageId', { packageId })
      .andWhere('batch.status = :status', { status: BatchStatus.UPCOMING })
      .andWhere('batch.start_date > :currentDate', { currentDate: new Date() })
      .andWhere('batch.booked_seats < batch.total_seats')
      .orderBy('batch.start_date', 'ASC')
      .getMany();
  }

  // Checklist Management
  async addChecklistItem(
    batchId: string,
    dto: CreateChecklistItemDto,
    userId: string,
  ): Promise<BookingChecklist> {
    const batch = await this.findOne(batchId);

    // Verify customer exists if customerId is provided
    if (dto.customerId) {
      const customer = await this.customerRepo.findOneBy({
        id: dto.customerId,
      });
      if (!customer) {
        throw new NotFoundException('Customer not found');
      }
    }

    const checklistItem = this.checklistRepo.create({
      ...dto,
      batchId: batch.id,
      completed: dto.completed ?? false,
      mandatory: dto.mandatory ?? false,
      sortOrder: dto.sortOrder ?? 0,
      createdById: userId,
    });

    return this.checklistRepo.save(checklistItem);
  }

  async updateChecklistItem(
    checklistId: string,
    dto: UpdateChecklistItemDto,
  ): Promise<BookingChecklist> {
    const checklist = await this.checklistRepo.findOneBy({ id: checklistId });
    if (!checklist) {
      throw new NotFoundException('Checklist item not found');
    }

    Object.assign(checklist, dto);
    return this.checklistRepo.save(checklist);
  }

  async deleteChecklistItem(checklistId: string): Promise<void> {
    const checklist = await this.checklistRepo.findOneBy({ id: checklistId });
    if (!checklist) {
      throw new NotFoundException('Checklist item not found');
    }
    await this.checklistRepo.delete(checklistId);
  }

  async getChecklistItems(batchId: string): Promise<BookingChecklist[]> {
    return this.checklistRepo.find({
      where: { batchId },
      relations: ['customer'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async getChecklistItemsByCustomer(
    batchId: string,
    customerId: string,
  ): Promise<BookingChecklist[]> {
    return this.checklistRepo.find({
      where: { batchId, customerId },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async getIndividualChecklistItems(
    batchId: string,
    customerId?: string,
  ): Promise<BookingChecklist[]> {
    const where: any = { batchId, type: ChecklistType.INDIVIDUAL };
    if (customerId) {
      where.customerId = customerId;
    }
    return this.checklistRepo.find({
      where,
      relations: ['customer'],
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async toggleChecklistItem(
    checklistId: string,
    userId: string,
  ): Promise<BookingChecklist> {
    const checklist = await this.checklistRepo.findOneBy({ id: checklistId });
    if (!checklist) {
      throw new NotFoundException('Checklist item not found');
    }
    checklist.completed = !checklist.completed;
    checklist.updatedById = userId;
    return this.checklistRepo.save(checklist);
  }
}
