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
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from 'src/database/entity/employee.entity';
import { PermissionSet } from 'src/database/entity/permission-set.entity';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { Repository } from 'typeorm';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionGuard } from '../auth/guard/permission.guard';
import {
  CreatePermissionSetDto,
  PermissionSetService,
  UpdatePermissionSetDto,
} from './permission-set.service';

@UseGuards(AuthGuard, PermissionGuard)
@Controller('permission-sets')
export class PermissionSetController {
  constructor(
    private readonly permissionSetService: PermissionSetService,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  // Get current user's own permission sets (no permission required)
  // Checks both user and employee permission sets (they should be in sync)
  @Get('my')
  async getMyPermissionSets(@Request() req: ApiRequestJWT) {
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    const employee = await this.employeeRepository.findOne({
      where: { userId, organizationId },
    });

    if (!employee) {
      return [];
    }

    const employeePermissionSets =
      await this.permissionSetService.getPermissionSetsForUser(employee.id);

    return employeePermissionSets;
  }

  // Create a new permission set
  @Post()
  @RequirePermission('permission-set', 'manage')
  async create(
    @Request() req: ApiRequestJWT,
    @Body() createDto: CreatePermissionSetDto,
  ): Promise<PermissionSet> {
    return await this.permissionSetService.create({
      ...createDto,
      organizationId: req.user.organizationId,
    });
  }

  // Get all permission sets for the organization
  @Get()
  @RequirePermission('permission-set', 'read')
  async findAll(@Request() req: ApiRequestJWT): Promise<PermissionSet[]> {
    return await this.permissionSetService.findAll(req.user.organizationId);
  }

  // Get a permission set by ID
  @Get(':id')
  @RequirePermission('permission-set', 'read')
  async findOne(@Param('id') id: string): Promise<PermissionSet | null> {
    return await this.permissionSetService.findOne(id);
  }

  // Update a permission set
  @Put(':id')
  @RequirePermission('permission-set', 'manage')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionSetDto,
  ): Promise<PermissionSet | null> {
    return await this.permissionSetService.update(id, updateDto);
  }

  // Delete a permission set
  @Delete(':id')
  @RequirePermission('permission-set', 'manage')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.permissionSetService.delete(id);
  }

  // Assign permission set to an employee
  @Post(':id/assign')
  @RequirePermission('permission-set', 'manage')
  async assignPermissionSet(
    @Param('id') permissionSetId: string,
    @Body() body: { employeeId: string },
  ) {
    return await this.permissionSetService.assignPermissionSet(
      permissionSetId,
      body.employeeId,
    );
  }

  // Remove permission set assignment from employee
  @Delete(':id/assign')
  @RequirePermission('permission-set', 'manage')
  async removePermissionSetAssignment(
    @Param('id') permissionSetId: string,
    @Body() body: { employeeId: string },
  ): Promise<void> {
    return await this.permissionSetService.removePermissionSetAssignment(
      permissionSetId,
      body.employeeId,
    );
  }

  // Get permission sets for a user via their employee profile (admin only for other users)
  @Get('user/:userId')
  @RequirePermission('permission-set', 'read')
  async getPermissionSetsForUser(
    @Request() req: ApiRequestJWT,
    @Param('userId') userId: string,
  ) {
    const employee = await this.employeeRepository.findOne({
      where: { userId, organizationId: req.user.organizationId },
    });
    if (!employee) return [];
    return await this.permissionSetService.getPermissionSetsForUser(employee.id);
  }

  @Get('employee/:employeeId')
  @RequirePermission('permission-set', 'read')
  async getPermissionSetsForEmployee(@Param('employeeId') employeeId: string) {
    return await this.permissionSetService.getPermissionSetsForUser(
      employeeId,
    );
  }
}
