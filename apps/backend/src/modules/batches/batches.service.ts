import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BatchLog } from 'src/database/entity/batch-log.entity';
import { Batch, BatchStatus } from 'src/database/entity/batch.entity';
import { BookingStatus } from 'src/database/entity/booking.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { WorkflowStepStatus } from 'src/database/entity/workflow/workflow-step.entity';
import { In, Repository } from 'typeorm';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch) private batchRepo: Repository<Batch>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(BatchLog) private logRepo: Repository<BatchLog>,
  ) { }

  async logAction(
    batchId: string,
    userId: string,
    action: string,
    previousData: any,
    newData: any,
  ): Promise<void> {
    const log = this.logRepo.create({
      batchId,
      changedById: userId,
      action,
      previousData,
      newData,
    });
    await this.logRepo.save(log);
  }

  async getLogs(batchId: string) {
    return this.logRepo.find({
      where: { batchId },
      relations: ['changedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(data: CreateBatchDto, organizationId: string, userId: string): Promise<Batch> {
    const { packageId, coordinators, ignoreConflicts, ...rest } = data;

    if (!ignoreConflicts) {
      const conflicts = await this.checkConflicts(
        organizationId,
        packageId,
        data.startDate,
        data.endDate,
        coordinators,
      );

      if (conflicts.length > 0) {
        throw new BadRequestException({
          message: 'Potential scheduling conflicts detected.',
          conflicts,
        });
      }
    }

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

    const savedBatch = await this.batchRepo.save(batch);
    await this.logAction(savedBatch.id, userId, 'create', null, savedBatch);
    return savedBatch;
  }

  async findAll(
    organizationId: string,
    status?: BatchStatus,
    page?: number,
    limit?: number,
    search?: string,
  ): Promise<any> {
    const query = this.batchRepo
      .createQueryBuilder('batch')
      .leftJoinAndSelect('batch.package', 'package')
      .leftJoinAndSelect('batch.coordinators', 'coordinators')
      .where('batch.organizationId = :organizationId', { organizationId });

    if (status) {
      query.andWhere('batch.status = :status', { status });
    }

    if (search) {
      query.andWhere('package.name ILIKE :search', { search: `%${search}%` });
    }

    query.orderBy('batch.startDate', 'ASC');

    if (page !== undefined && limit !== undefined) {
      const skip = (page - 1) * limit;
      query.skip(skip).take(limit);

      const [data, total] = await query.getManyAndCount();

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

    return query.getMany();
  }

  async checkConflicts(
    organizationId: string,
    packageId: string,
    startDateStr: string,
    endDateStr: string,
    coordinatorIds: string[],
  ): Promise<string[]> {
    const conflicts: string[] = [];
    if (!packageId || !startDateStr || !endDateStr) {
      return conflicts;
    }

    const newStart = new Date(startDateStr);
    const newEnd = new Date(endDateStr);

    const batches = await this.batchRepo.find({
      where: { organizationId },
      relations: ['package', 'coordinators'],
    });

    batches.forEach((batch) => {
      const batchStart = new Date(batch.startDate);
      const batchEnd = new Date(batch.endDate);

      // Overlap check: S1 <= E2 && S2 <= E1
      const datesOverlap = newStart <= batchEnd && batchStart <= newEnd;

      if (datesOverlap) {
        // 1. Same package conflict
        if (batch.packageId === packageId) {
          const pkgName = batch.package?.name || 'this package';
          const startFormatted = batchStart.toLocaleDateString('en-GB');
          const endFormatted = batchEnd.toLocaleDateString('en-GB');
          conflicts.push(
            `An overlapping batch for package "${pkgName}" already exists from ${startFormatted} to ${endFormatted}.`,
          );
        }

        // 2. Coordinator conflict
        if (coordinatorIds && coordinatorIds.length > 0 && batch.coordinators && batch.coordinators.length > 0) {
          const commonCoordinators = batch.coordinators.filter((c) =>
            coordinatorIds.includes(c.id),
          );

          if (commonCoordinators.length > 0) {
            const names = commonCoordinators.map((c) => c.name).join(', ');
            const conflictingPkgName = batch.package?.name || 'another package';
            const startFormatted = batchStart.toLocaleDateString('en-GB');
            const endFormatted = batchEnd.toLocaleDateString('en-GB');
            conflicts.push(
              `Coordinator(s) (${names}) are already assigned to batch of "${conflictingPkgName}" during this timeframe (${startFormatted} - ${endFormatted}).`,
            );
          }
        }
      }
    });

    return conflicts;
  }

  async findOne(id: string): Promise<Batch> {
    const batch = await this.batchRepo.findOne({
      where: { id },
      relations: [
        'package',
        'coordinators',
        'bookings',
        'bookings.customers',
        'bookings.currentWorkflow',
        'bookings.currentWorkflow.steps',
      ],
      select: {
        package: {
          id: true,
          name: true,
          description: true,
          basePrice: true,
          destination: true,
        },
      },
    });
    if (!batch) throw new NotFoundException('Batch not found');

    return batch;
  }

  async update(id: string, data: UpdateBatchDto, userId: string): Promise<Batch> {
    const { coordinators, ...rest } = data;

    const existingBatch = await this.batchRepo.findOne({
      where: { id },
      relations: ['coordinators'],
    });

    if (!existingBatch) throw new NotFoundException('Batch not found');

    const updateData: Partial<Batch> = {};
    const previousData: any = {};

    for (const key in rest) {
      if (
        rest[key] !== undefined &&
        rest[key] !== (existingBatch as any)[key]
      ) {
        (updateData as any)[key] = rest[key];
        (previousData as any)[key] = (existingBatch as any)[key];
      }
    }

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
        previousData.coordinatorIds = existingIds;
      }
    }

    if (Object.keys(updateData).length > 0) {
      await this.batchRepo.save({
        ...existingBatch,
        ...updateData,
      });
      await this.logAction(id, userId, 'update', previousData, updateData);
    }

    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const batch = await this.findOne(id);
    await this.logAction(id, userId, 'delete', batch, null);
    await this.batchRepo.delete(id);
  }

  async markActive(id: string, userId: string): Promise<Batch> {
    const batch = await this.findOne(id);

    const incompleteBookings = (batch.bookings || []).filter((booking) => {
      if (booking.status === BookingStatus.CANCELLED) return false;

      const workflow = booking.currentWorkflow;
      if (!workflow) return false;

      const mandatorySteps = (workflow.steps || []).filter(
        (step) => step.isMandatory,
      );
      return mandatorySteps.some(
        (step) =>
          step.status !== WorkflowStepStatus.COMPLETED &&
          step.status !== WorkflowStepStatus.SKIPPED,
      );
    });

    if (incompleteBookings.length > 0) {
      const bookingNumbers = incompleteBookings
        .map((b) => b.bookingNumber)
        .join(', ');
      throw new BadRequestException(
        `Cannot activate batch. The following bookings have incomplete mandatory workflow steps: ${bookingNumbers}`,
      );
    }

    const prevStatus = batch.status;
    batch.status = BatchStatus.ACTIVE;
    const saved = await this.batchRepo.save(batch);
    await this.logAction(id, userId, 'status_change', prevStatus, BatchStatus.ACTIVE);
    return saved;
  }

  async markCompleted(id: string, userId: string): Promise<Batch> {
    const batch = await this.findOne(id);
    const prevStatus = batch.status;
    batch.status = BatchStatus.COMPLETED;
    const saved = await this.batchRepo.save(batch);
    await this.logAction(id, userId, 'status_change', prevStatus, BatchStatus.COMPLETED);
    return saved;
  }

  async addCoordinator(batchId: string, employeeId: string, userId: string): Promise<Batch> {
    const batch = await this.findOne(batchId);
    const employee = await this.empRepo.findOneBy({ id: employeeId });
    if (!employee) throw new NotFoundException('Employee not found');

    batch.coordinators = [...(batch.coordinators || []), employee];
    const saved = await this.batchRepo.save(batch);
    await this.logAction(batchId, userId, 'coordinator_add', null, { employeeId, name: employee.name });
    return saved;
  }

  async removeCoordinator(batchId: string, employeeId: string, userId: string): Promise<Batch> {
    const batch = await this.findOne(batchId);
    const employee = batch.coordinators.find((e) => e.id === employeeId);
    batch.coordinators = batch.coordinators.filter((e) => e.id !== employeeId);
    const saved = await this.batchRepo.save(batch);
    await this.logAction(batchId, userId, 'coordinator_remove', { employeeId, name: employee?.name }, null);
    return saved;
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
    completedBatches: number;
    availableSeats: number;
    fastFilling: number;
  }> {
    const now = new Date();

    const batches = await this.batchRepo.find({
      where: { organization: { id: organizationId } },
    });

    let activeBatches = 0;
    let upcomingBatches = 0;
    let completedBatches = 0;
    let availableSeats = 0;
    let fastFilling = 0;

    for (const batch of batches) {
      const start = new Date(batch.startDate);
      const end = new Date(batch.endDate);

      if (start <= now && now <= end) {
        activeBatches++;
      }

      if (start > now) {
        upcomingBatches++;
        availableSeats += (batch.totalSeats ?? 0) - (batch.bookedSeats ?? 0);
      }

      if (end < now || batch.status === BatchStatus.COMPLETED) {
        completedBatches++;
      }

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
      completedBatches,
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
}
