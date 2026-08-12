import { Controller, Get, Request, UseGuards, Param, Query } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { ActivityLogService } from './activity-log.service';
import { ActivityLog } from 'src/database/entity/activity-log.entity';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('activity-log')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @RequirePermission('employee', 'manage')
  async findAll(
    @Request() req: ApiRequestJWT,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('action') action?: string,
  ) {
    const pageNum = parseInt(page || '1', 10);
    const limitNum = parseInt(limit || '20', 10);
    return this.activityLogService.findAll(
      req.user.organizationId,
      pageNum,
      limitNum,
      search,
      action,
    );
  }

  @Get('employee/:employeeId')
  @RequirePermission('employee', 'read')
  async findByEmployee(
    @Request() req: ApiRequestJWT,
    @Param('employeeId') employeeId: string,
  ): Promise<ActivityLog[]> {
    return this.activityLogService.findByEmployee(
      req.user.organizationId,
      employeeId,
    );
  }
}
