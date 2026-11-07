import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EmployeeLeave,
  LeaveStatus,
  LeaveType,
} from 'src/database/entity/employee-leave.entity';
import { EmployeeSalaryStructure } from 'src/database/entity/employee-salary-structure.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { Organization } from 'src/database/entity/organization.entity';
import { Repository } from 'typeorm';
import { ActivityLogService } from '../activity-log/activity-log.service';

@Injectable()
export class LeaveService {
  constructor(
    @InjectRepository(EmployeeLeave)
    private readonly leaveRepository: Repository<EmployeeLeave>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Organization)
    private readonly organizationRepository: Repository<Organization>,
    @InjectRepository(EmployeeSalaryStructure)
    private readonly salaryStructureRepository: Repository<EmployeeSalaryStructure>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  private async generateLeaveNumber(organizationId: string): Promise<string> {
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const count = await this.leaveRepository.count({ where: { organizationId } });
    const seq = String(count + 1).padStart(4, '0');
    const candidate = `LV-${ym}-${seq}`;
    const exists = await this.leaveRepository.findOne({
      where: { leaveNumber: candidate },
    });
    if (exists) {
      return `LV-${ym}-${seq}-${Math.floor(100 + Math.random() * 900)}`;
    }
    return candidate;
  }

  async getEmployeeByUserId(
    userId: string,
    organizationId: string,
  ): Promise<Employee | null> {
    return this.employeeRepository.findOne({
      where: { userId, organizationId },
      relations: ['branch'],
    });
  }

  private calculateDaysBetween(
    startDate: string | Date,
    endDate: string | Date,
    isHalfDay?: boolean,
  ): number {
    if (isHalfDay) return 0.5;
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) {
      throw new BadRequestException('End date cannot be earlier than start date');
    }
    return Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  }

  async getLeaveBalance(
    employeeId: string,
    organizationId: string,
    year?: number,
    month?: number,
  ) {
    const targetYear = year || new Date().getFullYear();
    const [org, structure] = await Promise.all([
      this.organizationRepository.findOne({ where: { id: organizationId } }),
      this.salaryStructureRepository.findOne({
        where: { employeeId, organizationId },
      }),
    ]);

    const orgFields =
      typeof org?.salarySlipFields === 'string'
        ? JSON.parse(org.salarySlipFields)
        : org?.salarySlipFields || {};

    const casualQuota =
      structure?.casualLeaveQuota ?? orgFields.casualLeaveQuota ?? 12;
    const sickQuota =
      structure?.sickLeaveQuota ?? orgFields.sickLeaveQuota ?? 10;
    const paidQuota =
      structure?.paidLeaveQuota ?? orgFields.paidLeaveQuota ?? 15;

    const yearStart = `${targetYear}-01-01`;
    const yearEnd = `${targetYear}-12-31`;

    const leaves = await this.leaveRepository
      .createQueryBuilder('leave')
      .where('leave.employeeId = :employeeId', { employeeId })
      .andWhere('leave.organizationId = :organizationId', { organizationId })
      .andWhere('leave.startDate <= :yearEnd AND leave.endDate >= :yearStart', {
        yearStart,
        yearEnd,
      })
      .getMany();

    const stats = {
      casual: { quota: casualQuota, used: 0, pending: 0, remaining: casualQuota },
      sick: { quota: sickQuota, used: 0, pending: 0, remaining: sickQuota },
      paid: { quota: paidQuota, used: 0, pending: 0, remaining: paidQuota },
      unpaid: { quota: 0, used: 0, pending: 0, remaining: 0 },
    };

    let monthlyPaidLeaves = 0;
    let monthlyUnpaidLeaves = 0;

    for (const lv of leaves) {
      const days = Number(lv.totalDays) || 0;
      const typeKey = lv.leaveType as keyof typeof stats;
      if (!stats[typeKey]) continue;

      if (lv.status === LeaveStatus.APPROVED) {
        stats[typeKey].used += days;
      } else if (lv.status === LeaveStatus.PENDING) {
        stats[typeKey].pending += days;
      }

      if (month && lv.status === LeaveStatus.APPROVED) {
        const mStart = new Date(targetYear, month - 1, 1);
        const mEnd = new Date(targetYear, month, 0);
        const lStart = new Date(lv.startDate);
        const lEnd = new Date(lv.endDate);
        lStart.setHours(0, 0, 0, 0);
        lEnd.setHours(0, 0, 0, 0);

        const overlapStart = lStart > mStart ? lStart : mStart;
        const overlapEnd = lEnd < mEnd ? lEnd : mEnd;
        if (overlapStart <= overlapEnd) {
          const overlapDays = lv.isHalfDay
            ? 0.5
            : Math.round(
                (overlapEnd.getTime() - overlapStart.getTime()) /
                  (1000 * 60 * 60 * 24),
              ) + 1;
          if (lv.leaveType === LeaveType.UNPAID) {
            monthlyUnpaidLeaves += overlapDays;
          } else {
            monthlyPaidLeaves += overlapDays;
          }
        }
      }
    }

    stats.casual.remaining = Math.max(0, stats.casual.quota - stats.casual.used);
    stats.sick.remaining = Math.max(0, stats.sick.quota - stats.sick.used);
    stats.paid.remaining = Math.max(0, stats.paid.quota - stats.paid.used);

    return {
      year: targetYear,
      month: month || null,
      balances: stats,
      monthlySummary: {
        paidLeaves: monthlyPaidLeaves,
        unpaidLeaves: monthlyUnpaidLeaves,
        totalLeaves: monthlyPaidLeaves + monthlyUnpaidLeaves,
      },
    };
  }

  async findAll(
    organizationId: string,
    params: {
      page?: number;
      limit?: number;
      status?: string;
      leaveType?: string;
      employeeId?: string;
      month?: number;
      year?: number;
      search?: string;
    },
  ) {
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 10;

    const qb = this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .leftJoinAndSelect('employee.branch', 'branch')
      .leftJoinAndSelect('leave.reviewedBy', 'reviewedBy')
      .leftJoinAndSelect('leave.createdBy', 'createdBy')
      .where('leave.organizationId = :organizationId', { organizationId });

    if (params.status && params.status !== 'all') {
      qb.andWhere('leave.status = :status', { status: params.status });
    }

    if (params.leaveType && params.leaveType !== 'all') {
      qb.andWhere('leave.leaveType = :leaveType', {
        leaveType: params.leaveType,
      });
    }

    if (params.employeeId && params.employeeId !== 'all') {
      qb.andWhere('leave.employeeId = :employeeId', {
        employeeId: params.employeeId,
      });
    }

    if (params.year) {
      const y = Number(params.year);
      if (params.month) {
        const m = Number(params.month);
        const startStr = `${y}-${String(m).padStart(2, '0')}-01`;
        const lastDay = new Date(y, m, 0).getDate();
        const endStr = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
        qb.andWhere('leave.startDate <= :endStr AND leave.endDate >= :startStr', {
          startStr,
          endStr,
        });
      } else {
        const startStr = `${y}-01-01`;
        const endStr = `${y}-12-31`;
        qb.andWhere('leave.startDate <= :endStr AND leave.endDate >= :startStr', {
          startStr,
          endStr,
        });
      }
    }

    if (params.search) {
      qb.andWhere(
        '(LOWER(employee.name) LIKE :search OR LOWER(leave.leaveNumber) LIKE :search OR LOWER(leave.reason) LIKE :search)',
        { search: `%${params.search.toLowerCase()}%` },
      );
    }

    const [data, total] = await qb
      .orderBy('leave.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // Summary counts for the organization
    const allOrgLeaves = await this.leaveRepository.find({
      where: { organizationId },
      select: ['status', 'totalDays'],
    });

    const summary = {
      total: allOrgLeaves.length,
      pending: allOrgLeaves.filter((l) => l.status === LeaveStatus.PENDING).length,
      approved: allOrgLeaves.filter((l) => l.status === LeaveStatus.APPROVED).length,
      rejected: allOrgLeaves.filter((l) => l.status === LeaveStatus.REJECTED).length,
    };

    return {
      data,
      summary,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findMyLeaves(userId: string, organizationId: string, year?: number) {
    const employee = await this.getEmployeeByUserId(userId, organizationId);
    if (!employee) {
      return {
        employee: null,
        leaves: [],
        balance: null,
      };
    }

    const [leaves, balance] = await Promise.all([
      this.leaveRepository.find({
        where: { employeeId: employee.id, organizationId },
        relations: ['employee', 'reviewedBy', 'createdBy'],
        order: { createdAt: 'DESC' },
      }),
      this.getLeaveBalance(employee.id, organizationId, year),
    ]);

    return {
      employee,
      leaves,
      balance,
    };
  }

  async findOne(id: string, organizationId: string): Promise<EmployeeLeave> {
    const leave = await this.leaveRepository.findOne({
      where: { id, organizationId },
      relations: ['employee', 'employee.branch', 'reviewedBy', 'createdBy'],
    });
    if (!leave) {
      throw new NotFoundException('Leave record not found');
    }
    return leave;
  }

  async create(
    organizationId: string,
    userId: string,
    payload: {
      employeeId?: string;
      leaveType: LeaveType;
      startDate: string;
      endDate: string;
      isHalfDay?: boolean;
      reason: string;
      status?: LeaveStatus;
    },
  ): Promise<EmployeeLeave> {
    let targetEmployeeId = payload.employeeId;
    if (!targetEmployeeId) {
      const emp = await this.getEmployeeByUserId(userId, organizationId);
      if (!emp) {
        throw new BadRequestException(
          'Employee profile not found for current user',
        );
      }
      targetEmployeeId = emp.id;
    }

    const employee = await this.employeeRepository.findOne({
      where: { id: targetEmployeeId, organizationId },
    });
    if (!employee) {
      throw new NotFoundException('Employee not found in this organization');
    }

    const isHalfDay = Boolean(payload.isHalfDay);
    const effectiveEndDate = isHalfDay ? payload.startDate : payload.endDate;
    const totalDays = this.calculateDaysBetween(
      payload.startDate,
      effectiveEndDate,
      isHalfDay,
    );

    const leaveNumber = await this.generateLeaveNumber(organizationId);

    const leave = this.leaveRepository.create({
      leaveNumber,
      employeeId: employee.id,
      organizationId,
      leaveType: payload.leaveType || LeaveType.CASUAL,
      startDate: payload.startDate,
      endDate: effectiveEndDate,
      isHalfDay,
      totalDays,
      reason: payload.reason,
      status: payload.status || LeaveStatus.PENDING,
      createdById: userId,
      ...(payload.status === LeaveStatus.APPROVED
        ? { reviewedById: userId, reviewedAt: new Date() }
        : {}),
    });

    const saved = await this.leaveRepository.save(leave);

    try {
      await this.activityLogService.log(
        organizationId,
        userId,
        'leave_created',
        `Applied ${totalDays} day(s) of ${saved.leaveType.toUpperCase()} leave for ${employee.name} (${saved.leaveNumber})`,
        {
          leaveId: saved.id,
          entityId: saved.id,
          employeeId: employee.id,
          leaveNumber: saved.leaveNumber,
          leaveType: saved.leaveType,
          totalDays,
          newStatus: saved.status,
        },
      );
    } catch (e) {
      console.error('Failed to log leave creation:', e);
    }

    return this.findOne(saved.id, organizationId);
  }

  async updateStatus(
    id: string,
    organizationId: string,
    userId: string,
    payload: {
      status: LeaveStatus;
      reviewNote?: string;
    },
  ): Promise<EmployeeLeave> {
    const leave = await this.findOne(id, organizationId);
    const previousStatus = leave.status;

    leave.status = payload.status;
    leave.reviewedById = userId;
    leave.reviewedAt = new Date();
    if (payload.reviewNote !== undefined) {
      leave.reviewNote = payload.reviewNote;
    }

    await this.leaveRepository.save(leave);

    try {
      await this.activityLogService.log(
        organizationId,
        userId,
        `leave_${payload.status}`,
        `Leave ${leave.leaveNumber} for ${leave.employee?.name || 'Employee'} marked as ${payload.status.toUpperCase()}`,
        {
          leaveId: leave.id,
          entityId: leave.id,
          employeeId: leave.employeeId,
          leaveNumber: leave.leaveNumber,
          previousStatus,
          newStatus: payload.status,
          reason: payload.reviewNote || undefined,
        },
      );
    } catch (e) {
      console.error('Failed to log leave status update:', e);
    }

    return this.findOne(id, organizationId);
  }

  async update(
    id: string,
    organizationId: string,
    userId: string,
    payload: Partial<{
      leaveType: LeaveType;
      startDate: string;
      endDate: string;
      isHalfDay: boolean;
      reason: string;
    }>,
  ): Promise<EmployeeLeave> {
    const leave = await this.findOne(id, organizationId);

    const startDate = payload.startDate ?? leave.startDate;
    const isHalfDay =
      payload.isHalfDay !== undefined ? payload.isHalfDay : leave.isHalfDay;
    const endDate = isHalfDay
      ? startDate
      : (payload.endDate ?? leave.endDate);

    leave.leaveType = payload.leaveType ?? leave.leaveType;
    leave.startDate = startDate;
    leave.endDate = endDate;
    leave.isHalfDay = isHalfDay;
    leave.totalDays = this.calculateDaysBetween(startDate, endDate, isHalfDay);
    if (payload.reason !== undefined) {
      leave.reason = payload.reason;
    }

    await this.leaveRepository.save(leave);

    try {
      await this.activityLogService.log(
        organizationId,
        userId,
        'leave_updated',
        `Updated leave request ${leave.leaveNumber} for ${leave.employee?.name || 'Employee'}`,
        {
          leaveId: leave.id,
          entityId: leave.id,
          employeeId: leave.employeeId,
          leaveNumber: leave.leaveNumber,
        },
      );
    } catch (e) {
      console.error('Failed to log leave update:', e);
    }

    return this.findOne(id, organizationId);
  }

  async remove(
    id: string,
    organizationId: string,
    userId: string,
    canManageAll: boolean,
  ): Promise<void> {
    const leave = await this.findOne(id, organizationId);
    if (!canManageAll) {
      const emp = await this.getEmployeeByUserId(userId, organizationId);
      if (!emp || emp.id !== leave.employeeId) {
        throw new ForbiddenException('You can only delete your own pending leave requests');
      }
      if (leave.status !== LeaveStatus.PENDING) {
        throw new BadRequestException('Only pending leave requests can be deleted');
      }
    }
    await this.leaveRepository.remove(leave);
  }
}

