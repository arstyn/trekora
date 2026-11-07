import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { LeaveStatus, LeaveType } from 'src/database/entity/employee-leave.entity';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { PermissionCheckService } from '../permission/permission-check.service';
import { LeaveService } from './leave.service';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('leave')
export class LeaveController {
  constructor(
    private readonly leaveService: LeaveService,
    private readonly permissionCheckService: PermissionCheckService,
  ) {}

  @Get('my')
  async findMyLeaves(
    @Request() req: ApiRequestJWT,
    @Query('year') year?: string,
  ) {
    return this.leaveService.findMyLeaves(
      req.user.userId,
      req.user.organizationId,
      year ? parseInt(year, 10) : undefined,
    );
  }

  @Get('balance/:employeeId')
  async getLeaveBalance(
    @Request() req: ApiRequestJWT,
    @Param('employeeId') employeeId: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.leaveService.getLeaveBalance(
      employeeId,
      req.user.organizationId,
      year ? parseInt(year, 10) : undefined,
      month ? parseInt(month, 10) : undefined,
    );
  }

  @Get()
  @RequirePermission('leave', 'read')
  async findAll(
    @Request() req: ApiRequestJWT,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('leaveType') leaveType?: string,
    @Query('employeeId') employeeId?: string,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('search') search?: string,
  ) {
    return this.leaveService.findAll(req.user.organizationId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status,
      leaveType,
      employeeId,
      month: month ? parseInt(month, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      search,
    });
  }

  @Get(':id')
  async findOne(@Request() req: ApiRequestJWT, @Param('id') id: string) {
    return this.leaveService.findOne(id, req.user.organizationId);
  }

  @Post()
  async create(
    @Request() req: ApiRequestJWT,
    @Body()
    body: {
      employeeId?: string;
      leaveType: LeaveType;
      startDate: string;
      endDate: string;
      isHalfDay?: boolean;
      reason: string;
      status?: LeaveStatus;
    },
  ) {
    return this.leaveService.create(
      req.user.organizationId,
      req.user.userId,
      body,
    );
  }

  @Patch(':id/status')
  @RequirePermission('leave', 'approve')
  async updateStatus(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
    @Body() body: { status: LeaveStatus; reviewNote?: string },
  ) {
    return this.leaveService.updateStatus(
      id,
      req.user.organizationId,
      req.user.userId,
      body,
    );
  }

  @Patch(':id')
  async update(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
    @Body()
    body: Partial<{
      leaveType: LeaveType;
      startDate: string;
      endDate: string;
      isHalfDay: boolean;
      reason: string;
    }>,
  ) {
    return this.leaveService.update(
      id,
      req.user.organizationId,
      req.user.userId,
      body,
    );
  }

  @Delete(':id')
  async remove(@Request() req: ApiRequestJWT, @Param('id') id: string) {
    const canDelete = await this.permissionCheckService.hasPermission(
      req.user.userId,
      req.user.organizationId,
      'leave',
      'delete',
    );
    return this.leaveService.remove(
      id,
      req.user.organizationId,
      req.user.userId,
      canDelete,
    );
  }
}

