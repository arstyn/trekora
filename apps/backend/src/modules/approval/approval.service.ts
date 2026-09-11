import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ApprovalAction,
  ApprovalRequest,
  ApprovalStatus,
} from 'src/database/entity/approval-request.entity';
import { UserOrganization } from 'src/database/entity/user-organization.entity';
import { User } from 'src/database/entity/user.entity';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { AgentsService } from '../agents/agents.service';
import { BatchesService } from '../batches/batches.service';
import { BookingService } from '../booking/booking.service';
import { NotificationService } from '../notification/notification.service';
import { PaymentService } from '../payment/payment.service';
import { ApprovalFilterDto } from './dto/approval-filter.dto';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import {
  RejectApprovalRequestDto,
  ReviewApprovalRequestDto,
} from './dto/review-approval-request.dto';
import { AgentPayoutStatus } from 'src/database/entity/booking.entity';

@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(ApprovalRequest)
    private readonly approvalRepository: Repository<ApprovalRequest>,
    @InjectRepository(UserOrganization)
    private readonly userOrgRepository: Repository<UserOrganization>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly activityLogService: ActivityLogService,
    private readonly notificationService: NotificationService,
    @Inject(forwardRef(() => BookingService))
    private readonly bookingService: BookingService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService,
    @Inject(forwardRef(() => AgentsService))
    private readonly agentsService: AgentsService,
    @Inject(forwardRef(() => BatchesService))
    private readonly batchesService: BatchesService,
  ) {}

  async createRequest(
    dto: CreateApprovalRequestDto,
    userId: string,
    organizationId: string,
  ): Promise<ApprovalRequest> {
    // Check if an unresolved request already exists for this entity and action
    const existing = await this.approvalRepository.findOne({
      where: {
        organizationId,
        entityId: dto.entityId,
        action: dto.action,
        status: ApprovalStatus.PENDING,
      },
    });

    if (existing) {
      throw new BadRequestException(
        `A pending approval request already exists for this item (#${existing.entityReference || dto.entityReference || dto.entityId}).`,
      );
    }

    const request = this.approvalRepository.create({
      ...dto,
      organizationId,
      requestedById: userId,
      status: ApprovalStatus.PENDING,
    });

    const saved = await this.approvalRepository.save(request);

    // Fetch requester details for logging and notifications
    const requester = await this.userRepository.findOne({
      where: { id: userId },
    });
    const requesterName = requester
      ? requester.name || requester.email
      : 'An employee';

    // Activity Log
    await this.activityLogService.log(
      organizationId,
      userId,
      'approval.requested',
      `${requesterName} submitted approval request: ${dto.title}`,
      {
        requestId: saved.id,
        action: dto.action,
        resource: dto.resource,
        entityId: dto.entityId,
      },
    );

    // Feature-specific log (e.g. BookingLog, BookingPaymentLog)
    await this.logFeatureAction(
      dto.resource,
      dto.entityId,
      userId,
      'approval_requested',
      {
        action: dto.action,
        title: dto.title,
        reason: dto.reason,
        requestId: saved.id,
      },
      dto.payload?.bookingId,
      organizationId,
    );

    // Notify organization owners & managers
    try {
      const managers = await this.userOrgRepository.find({
        where: { organizationId, isActive: true },
        relations: ['user'],
      });

      const notifyPromises = managers
        .filter((uo) => uo.userId !== userId)
        .map((uo) =>
          this.notificationService.create(
            uo.userId,
            `Approval Request: ${dto.title} submitted by ${requesterName}.`,
          ),
        );

      await Promise.allSettled(notifyPromises);
    } catch (err) {
      // Non-blocking notification failure
      console.error('Failed to dispatch notifications for approval request:', err);
    }

    return this.findOne(saved.id, organizationId);
  }

  async findAll(organizationId: string, filter: ApprovalFilterDto) {
    const page = Math.max(1, parseInt(filter.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(filter.limit || '20', 10)));

    const query = this.approvalRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.requestedBy', 'requestedBy')
      .leftJoinAndSelect('request.reviewedBy', 'reviewedBy')
      .where('request.organizationId = :organizationId', { organizationId });

    if (filter.status) {
      query.andWhere('request.status = :status', { status: filter.status });
    }

    if (filter.action) {
      query.andWhere('request.action = :action', { action: filter.action });
    }

    if (filter.resource) {
      query.andWhere('request.resource = :resource', {
        resource: filter.resource,
      });
    }

    if (filter.search) {
      query.andWhere(
        '(LOWER(request.title) LIKE :search OR LOWER(request.entityReference) LIKE :search OR LOWER(requestedBy.name) LIKE :search OR LOWER(requestedBy.email) LIKE :search)',
        { search: `%${filter.search.toLowerCase()}%` },
      );
    }

    const [data, total] = await query
      .orderBy('request.createdAt', 'DESC')
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

  async getCounts(organizationId: string) {
    const pendingQuery = this.approvalRepository
      .createQueryBuilder('request')
      .select('request.resource', 'resource')
      .addSelect('COUNT(request.id)', 'count')
      .where('request.organizationId = :organizationId', { organizationId })
      .andWhere('request.status = :status', { status: ApprovalStatus.PENDING })
      .groupBy('request.resource');

    const rawCounts = await pendingQuery.getRawMany();

    const counts: Record<string, number> = {
      total: 0,
      booking: 0,
      payment: 0,
      agent: 0,
      batch: 0,
      customer: 0,
    };

    for (const item of rawCounts) {
      const c = parseInt(item.count, 10) || 0;
      counts[item.resource] = c;
      counts.total += c;
    }

    return counts;
  }

  async findOne(id: string, organizationId: string): Promise<ApprovalRequest> {
    const request = await this.approvalRepository.findOne({
      where: { id, organizationId },
      relations: ['requestedBy', 'reviewedBy'],
    });

    if (!request) {
      throw new NotFoundException(`Approval request not found`);
    }

    return request;
  }

  async findPendingForEntity(
    entityId: string,
    organizationId: string,
  ): Promise<ApprovalRequest | null> {
    return this.approvalRepository.findOne({
      where: {
        entityId,
        organizationId,
        status: ApprovalStatus.PENDING,
      },
      relations: ['requestedBy'],
      order: { createdAt: 'DESC' },
    });
  }

  async approve(
    id: string,
    reviewerUserId: string,
    organizationId: string,
    reviewDto: ReviewApprovalRequestDto,
  ): Promise<ApprovalRequest> {
    const request = await this.findOne(id, organizationId);

    if (request.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(
        `This request is already ${request.status} and cannot be modified.`,
      );
    }

    const mergedPayload = {
      ...(request.payload || {}),
      ...(reviewDto.adjustedPayload || {}),
    };

    // Execute corresponding domain operation
    switch (request.action) {
      case ApprovalAction.BOOKING_CANCEL: {
        await this.bookingService.cancelBooking(
          request.entityId,
          reviewerUserId,
          mergedPayload,
        );
        break;
      }
      case ApprovalAction.PAYMENT_REFUND: {
        await this.paymentService.create(
          mergedPayload as any,
          reviewerUserId,
          organizationId,
        );
        break;
      }
      case ApprovalAction.PAYMENT_DELETE: {
        await this.paymentService.delete(request.entityId, organizationId);
        break;
      }
      case ApprovalAction.AGENT_PAYOUT: {
        await this.agentsService.updatePayoutStatus(
          request.entityId,
          AgentPayoutStatus.PAID,
          organizationId,
        );
        break;
      }
      default:
        throw new BadRequestException(
          `Automated execution for action '${request.action}' is not supported.`,
        );
    }

    // Mark request approved
    request.status = ApprovalStatus.APPROVED;
    request.reviewedById = reviewerUserId;
    request.reviewedAt = new Date();
    request.reviewNotes = reviewDto.reviewNotes || null;
    request.payload = mergedPayload;

    const updated = await this.approvalRepository.save(request);

    // Audit Log
    await this.activityLogService.log(
      organizationId,
      reviewerUserId,
      'approval.approved',
      `Approved request: ${request.title}`,
      {
        requestId: request.id,
        action: request.action,
        requestedById: request.requestedById,
        notes: reviewDto.reviewNotes,
      },
    );

    // Feature-specific log (e.g. BookingLog, BookingPaymentLog)
    await this.logFeatureAction(
      request.resource,
      request.entityId,
      reviewerUserId,
      'approval_approved',
      {
        action: request.action,
        title: request.title,
        notes: reviewDto.reviewNotes || null,
        requestId: request.id,
      },
      request.payload?.bookingId,
      organizationId,
    );

    // Notify original requester
    if (request.requestedById && request.requestedById !== reviewerUserId) {
      await this.notificationService.create(
        request.requestedById,
        `Your request "${request.title}" has been approved.`,
      );
    }

    return updated;
  }

  async reject(
    id: string,
    reviewerUserId: string,
    organizationId: string,
    rejectDto: RejectApprovalRequestDto,
  ): Promise<ApprovalRequest> {
    const request = await this.findOne(id, organizationId);

    if (request.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(
        `This request is already ${request.status} and cannot be modified.`,
      );
    }

    request.status = ApprovalStatus.REJECTED;
    request.reviewedById = reviewerUserId;
    request.reviewedAt = new Date();
    request.reviewNotes = rejectDto.reason;

    const updated = await this.approvalRepository.save(request);

    // Audit Log
    await this.activityLogService.log(
      organizationId,
      reviewerUserId,
      'approval.rejected',
      `Rejected request: ${request.title}. Reason: ${rejectDto.reason}`,
      {
        requestId: request.id,
        action: request.action,
        requestedById: request.requestedById,
        reason: rejectDto.reason,
      },
    );

    // Feature-specific log (e.g. BookingLog, BookingPaymentLog)
    await this.logFeatureAction(
      request.resource,
      request.entityId,
      reviewerUserId,
      'approval_rejected',
      {
        action: request.action,
        title: request.title,
        reason: rejectDto.reason,
        requestId: request.id,
      },
      request.payload?.bookingId,
      organizationId,
    );

    // Notify original requester
    if (request.requestedById && request.requestedById !== reviewerUserId) {
      await this.notificationService.create(
        request.requestedById,
        `Your request "${request.title}" was rejected by management: ${rejectDto.reason}`,
      );
    }

    return updated;
  }

  async cancel(
    id: string,
    userId: string,
    organizationId: string,
  ): Promise<ApprovalRequest> {
    const request = await this.findOne(id, organizationId);

    if (request.status !== ApprovalStatus.PENDING) {
      throw new BadRequestException(
        `Only pending requests can be cancelled. Current status is ${request.status}.`,
      );
    }

    if (request.requestedById !== userId) {
      throw new ForbiddenException(
        'You can only cancel approval requests submitted by yourself.',
      );
    }

    request.status = ApprovalStatus.CANCELLED;
    const updated = await this.approvalRepository.save(request);

    await this.activityLogService.log(
      organizationId,
      userId,
      'approval.cancelled',
      `Cancelled own request: ${request.title}`,
      { requestId: request.id },
    );

    await this.logFeatureAction(
      request.resource,
      request.entityId,
      userId,
      'approval_cancelled',
      {
        action: request.action,
        title: request.title,
        requestId: request.id,
      },
      request.payload?.bookingId,
      organizationId,
    );

    return updated;
  }

  private async logFeatureAction(
    resource: string,
    entityId: string,
    userId: string,
    action: string,
    details: any,
    bookingId?: string,
    organizationId?: string,
  ): Promise<void> {
    try {
      if (resource === 'booking') {
        await this.bookingService.logAction(
          entityId,
          userId,
          action,
          null,
          details,
        );
      } else if (resource === 'batch') {
        await this.batchesService.logAction(
          entityId,
          userId,
          action,
          null,
          details,
        );
      } else if (resource === 'payment') {
        await this.paymentService.logPaymentAction(
          entityId,
          userId,
          action,
          null,
          details,
        );
        if (bookingId) {
          await this.bookingService.logAction(
            bookingId,
            userId,
            action,
            null,
            details,
          );
        }
      } else if (resource === 'customer') {
        if (organizationId) {
          await this.activityLogService.log(
            organizationId,
            userId,
            `customer.${action}`,
            details.title || `Customer approval action: ${action}`,
            { customerId: entityId, ...details },
          );
        }
      } else if (resource === 'agent') {
        if (organizationId) {
          await this.activityLogService.log(
            organizationId,
            userId,
            `agent.${action}`,
            details.title || `Agent approval action: ${action}`,
            { agentId: entityId, ...details },
          );
        }
      }
    } catch (err) {
      console.error(`Failed to record feature log for ${resource}:`, err);
    }
  }
}
