import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ActivityLog } from 'src/database/entity/activity-log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) { }

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

  async findAll(
    organizationId: string,
    page: number = 1,
    limit: number = 20,
    search?: string,
    action?: string,
  ) {
    const query = this.activityLogRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.performedBy', 'performedBy')
      .where('log.organizationId = :organizationId', { organizationId });

    if (action && action !== 'all') {
      query.andWhere('log.action = :action', { action });
    }

    if (search) {
      query.andWhere(
        '(LOWER(log.details) LIKE :search OR LOWER(performedBy.name) LIKE :search OR LOWER(performedBy.email) LIKE :search)',
        { search: `%${search.toLowerCase()}%` },
      );
    }

    const [data, total] = await query
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
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

  async findByAction(organizationId: string, action: string): Promise<ActivityLog[]> {
    return this.activityLogRepository.find({
      where: { organizationId, action },
      relations: ['performedBy'],
      order: { createdAt: 'DESC' },
    });
  }
}
