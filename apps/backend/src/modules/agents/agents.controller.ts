import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { AgentStatus } from 'src/database/entity/agent.entity';
import { AgentPayoutStatus } from 'src/database/entity/booking.entity';
import { CreateAgentDto, UpdateAgentDto } from 'src/dto/agent.dto';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { AuthGuard } from '../auth/guard/auth.guard';
import { AgentsService } from './agents.service';
import { PermissionCheckService } from '../permission/permission-check.service';
import { ApprovalService } from '../approval/approval.service';
import { ApprovalAction } from 'src/database/entity/approval-request.entity';

@UseGuards(AuthGuard)
@Controller('agents')
export class AgentsController {
  constructor(
    private readonly agentsService: AgentsService,
    private readonly permissionCheckService: PermissionCheckService,
    @Inject(forwardRef(() => ApprovalService))
    private readonly approvalService: ApprovalService,
  ) {}

  @Post()
  async create(
    @Request() req: ApiRequestJWT,
    @Body() createAgentDto: CreateAgentDto,
  ) {
    return this.agentsService.create(createAgentDto, req.user.organizationId, req.user.userId);
  }

  @Get()
  async findAll(
    @Request() req: ApiRequestJWT,
    @Query('search') search?: string,
    @Query('status') status?: AgentStatus,
  ) {
    return this.agentsService.findAll(
      req.user.organizationId,
      search,
      status,
    );
  }

  @Get(':id')
  async findOne(@Request() req: ApiRequestJWT, @Param('id') id: string) {
    return this.agentsService.findOne(id, req.user.organizationId);
  }

  @Patch(':id')
  async update(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
    @Body() updateAgentDto: UpdateAgentDto,
  ) {
    return this.agentsService.update(
      id,
      updateAgentDto,
      req.user.organizationId,
      req.user.userId,
    );
  }

  @Delete(':id')
  async remove(@Request() req: ApiRequestJWT, @Param('id') id: string) {
    return this.agentsService.remove(id, req.user.organizationId);
  }

  @Patch('payout/:bookingId')
  async updatePayoutStatus(
    @Request() req: ApiRequestJWT,
    @Param('bookingId') bookingId: string,
    @Body('payoutStatus') payoutStatus: AgentPayoutStatus,
  ) {
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    if (payoutStatus === AgentPayoutStatus.PAID) {
      const canDirectApprove = await this.permissionCheckService.hasPermission(
        userId,
        organizationId,
        'agent',
        'payout_approve',
      );

      if (canDirectApprove) {
        return this.agentsService.updatePayoutStatus(
          bookingId,
          payoutStatus,
          organizationId,
          userId,
        );
      }

      const canRequestPayout =
        (await this.permissionCheckService.hasPermission(
          userId,
          organizationId,
          'agent',
          'payout_request',
        )) ||
        (await this.permissionCheckService.hasPermission(
          userId,
          organizationId,
          'booking',
          'update',
        ));

      if (!canRequestPayout) {
        throw new ForbiddenException(
          'You do not have permission to approve or request agent commission payouts.',
        );
      }

      const approvalRequest = await this.approvalService.createRequest(
        {
          action: ApprovalAction.AGENT_PAYOUT,
          resource: 'agent',
          entityId: bookingId,
          entityReference: `Booking Commission Payout`,
          title: `Agent Commission Payout Request for Booking`,
          reason: 'Commission settlement requested',
          payload: { bookingId, payoutStatus },
          snapshot: { bookingId, payoutStatus },
        },
        userId,
        organizationId,
      );

      return {
        requiresApproval: true,
        message: 'Agent payout request submitted to manager for approval.',
        approvalRequest,
      };
    }

    return this.agentsService.updatePayoutStatus(
      bookingId,
      payoutStatus,
      organizationId,
    );
  }
}
