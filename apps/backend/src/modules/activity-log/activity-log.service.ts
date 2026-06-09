import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from 'src/database/entity/activity-log.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async log(
    organizationId: string,
    performedById: string,
    action: string,
    details: string,
    metadata?: any,
  ): Promise<ActivityLog> {
    const log = this.activityLogRepository.create({
      organizationId,
      performedById,
      action,
      details,
      metadata,
    });
    return this.activityLogRepository.save(log);
  }

  async findAll(organizationId: string): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      where: { organizationId },
      relations: ['performedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmployee(organizationId: string, employeeId: string): Promise<ActivityLog[]> {
    return this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.performedBy', 'performedBy')
      .where('log.organizationId = :organizationId', { organizationId })
      .andWhere("log.metadata ->> 'employeeId' = :employeeId", { employeeId })
      .orderBy('log.createdAt', 'DESC')
      .getMany();
  }
}
