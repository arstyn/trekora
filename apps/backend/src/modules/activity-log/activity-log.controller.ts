import { Controller, Get, Request, UseGuards, Param } from '@nestjs/common';
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
  async findAll(@Request() req: ApiRequestJWT): Promise<ActivityLog[]> {
    return this.activityLogService.findAll(req.user.organizationId);
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
