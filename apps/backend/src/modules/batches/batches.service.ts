import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Batch } from 'src/database/entity/batch.entity';
import { Customer } from 'src/database/entity/customer.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { In, Repository } from 'typeorm';
import { CreateBatchDto } from './dto/create-batch.dto';
import { UpdateBatchDto } from './dto/update-batch.dto';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch) private batchRepo: Repository<Batch>,
    @InjectRepository(Employee) private empRepo: Repository<Employee>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
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
      status: 'upcoming',
    });

    return this.batchRepo.save(batch);
  }

  async findAll(organizationId: string, status?: string): Promise<Batch[]> {
    let query: { organizationId: string; status?: string } = {
      organizationId,
    };
    if (status) {
      query.status = status;
    }
    return this.batchRepo.find({
      where: query,
      relations: ['package', 'coordinators'],
    });
  }

  async findOne(id: string): Promise<Batch> {
    const batch = await this.batchRepo.findOne({ where: { id } });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async update(id: string, data: UpdateBatchDto): Promise<Batch> {
    const { coordinators, ...rest } = data;

    let coordinatorsData: Employee[] = [];

    if (coordinators) {
      coordinatorsData = await this.empRepo.findBy({
        id: In(coordinators),
      });
    }

    await this.findOne(id); // check existence
    await this.batchRepo.update(id, {
      ...rest,
      coordinators: coordinatorsData,
    });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.batchRepo.delete(id);
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

  async addPassenger(batchId: string, customerId: string): Promise<Batch> {
    const batch = await this.findOne(batchId);
    const customer = await this.customerRepo.findOneBy({ id: customerId });
    if (!customer) throw new NotFoundException('Customer not found');

    batch.passengers = [...(batch.passengers || []), customer];
    return this.batchRepo.save(batch);
  }

  async removePassenger(batchId: string, customerId: string): Promise<Batch> {
    const batch = await this.findOne(batchId);
    batch.passengers = batch.passengers.filter((p) => p.id !== customerId);
    return this.batchRepo.save(batch);
  }

  async getFastFillingBatches(): Promise<Batch[]> {
    return this.batchRepo
      .createQueryBuilder('batch')
      .where('(batch.booked_seats::float / batch.total_seats) >= 0.8')
      .orWhere('(batch.total_seats - batch.booked_seats) <= 5')
      .orderBy('batch.start_date', 'ASC')
      .getMany();
  }

  async findByPackage(packageId: string): Promise<Batch[]> {
    return this.batchRepo.find({
      where: { 
        packageId,
        status: 'upcoming'
      },
      relations: ['package'],
      order: { startDate: 'ASC' }
    });
  }

  async getAvailableBatches(packageId: string): Promise<Batch[]> {
    return this.batchRepo
      .createQueryBuilder('batch')
      .where('batch.packageId = :packageId', { packageId })
      .andWhere('batch.status = :status', { status: 'upcoming' })
      .andWhere('batch.start_date > :currentDate', { currentDate: new Date() })
      .andWhere('batch.booked_seats < batch.total_seats')
      .orderBy('batch.start_date', 'ASC')
      .getMany();
  }
}
