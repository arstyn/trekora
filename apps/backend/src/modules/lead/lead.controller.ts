import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { LeadService } from './lead.service';
import { Lead } from 'src/database/entity/lead.entity';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { LeadDto } from 'src/dto/lead-create.dto';
import { EmployeeService } from '../employee/employee.service';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('api/lead')
export class LeadController {
  constructor(
    private readonly leadService: LeadService,
    private readonly employeeService: EmployeeService,
  ) { }

  @Post()
  @RequirePermission('lead', 'create')
  async create(
    @Request() req: ApiRequestJWT,
    @Body() leadData: LeadDto,
  ): Promise<Lead> {
    return this.leadService.create(req.user, leadData);
  }

  @Get()
  @RequirePermission('lead', 'read')
  async findAll(@Request() req: ApiRequestJWT): Promise<Lead[]> {
    return this.leadService.findAll(req.user.organizationId);
  }

  @Get('team')
  @RequirePermission('employee', 'read')
  async findTeamLeads(@Request() req: ApiRequestJWT): Promise<Lead[]> {
    // Get current user's employee record
    const employee = await this.employeeService.findProfile(req.user.userId);
    if (!employee || !employee.id) {
      return [];
    }

    // Get direct reports
    const directReports = await this.employeeService.getDirectReports(employee.id);
    const teamUserIds = directReports
      .map((emp) => emp.userId)
      .filter((id): id is string => !!id);

    if (teamUserIds.length === 0) {
      return [];
    }

    return this.leadService.findByManagerTeam(req.user.organizationId, teamUserIds);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Lead | null> {
    return this.leadService.findOne(id);
  }

  @Put(':id')
  @RequirePermission('lead', 'update')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Lead>,
  ): Promise<Lead | null> {
    return this.leadService.update(id, updateData);
  }

  @Delete(':id')
  @RequirePermission('lead', 'delete')
  async remove(@Param('id') id: string): Promise<void> {
    return this.leadService.remove(id);
  }
}
