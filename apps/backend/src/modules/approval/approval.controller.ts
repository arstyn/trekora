import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { ApprovalService } from './approval.service';
import { ApprovalFilterDto } from './dto/approval-filter.dto';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import {
  RejectApprovalRequestDto,
  ReviewApprovalRequestDto,
} from './dto/review-approval-request.dto';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Post()
  async create(
    @Request() req: ApiRequestJWT,
    @Body() dto: CreateApprovalRequestDto,
  ) {
    return this.approvalService.createRequest(
      dto,
      req.user.userId,
      req.user.organizationId,
    );
  }

  @Get()
  @RequirePermission('approval', 'read')
  async findAll(
    @Request() req: ApiRequestJWT,
    @Query() filter: ApprovalFilterDto,
  ) {
    return this.approvalService.findAll(req.user.organizationId, filter);
  }

  @Get('counts')
  @RequirePermission('approval', 'read')
  async getCounts(@Request() req: ApiRequestJWT) {
    return this.approvalService.getCounts(req.user.organizationId);
  }

  @Get('entity/:entityId')
  async getPendingForEntity(
    @Request() req: ApiRequestJWT,
    @Param('entityId') entityId: string,
  ) {
    return this.approvalService.findPendingForEntity(
      entityId,
      req.user.organizationId,
    );
  }

  @Get(':id')
  @RequirePermission('approval', 'read')
  async findOne(@Request() req: ApiRequestJWT, @Param('id') id: string) {
    return this.approvalService.findOne(id, req.user.organizationId);
  }

  @Post(':id/approve')
  @RequirePermission('approval', 'manage')
  async approve(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
    @Body() reviewDto: ReviewApprovalRequestDto,
  ) {
    return this.approvalService.approve(
      id,
      req.user.userId,
      req.user.organizationId,
      reviewDto,
    );
  }

  @Post(':id/reject')
  @RequirePermission('approval', 'manage')
  async reject(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
    @Body() rejectDto: RejectApprovalRequestDto,
  ) {
    return this.approvalService.reject(
      id,
      req.user.userId,
      req.user.organizationId,
      rejectDto,
    );
  }

  @Post(':id/cancel')
  async cancel(@Request() req: ApiRequestJWT, @Param('id') id: string) {
    return this.approvalService.cancel(
      id,
      req.user.userId,
      req.user.organizationId,
    );
  }
}
