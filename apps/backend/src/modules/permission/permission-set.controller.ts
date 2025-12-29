import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';
import {
  PermissionSetService,
  CreatePermissionSetDto,
  UpdatePermissionSetDto,
} from './permission-set.service';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { RolesGuard } from '../auth/guard/roles.guard';
import { RequireRole } from '../auth/decorator/require-role.decorator';
import { PermissionSet } from 'src/database/entity/permission-set.entity';

@UseGuards(AuthGuard, RolesGuard)
@RequireRole('admin')
@Controller('api/permission-sets')
export class PermissionSetController {
  constructor(private readonly permissionSetService: PermissionSetService) {}

  // Create a new permission set
  @Post()
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
  async findAll(@Request() req: ApiRequestJWT): Promise<PermissionSet[]> {
    return await this.permissionSetService.findAll(req.user.organizationId);
  }

  // Get a permission set by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<PermissionSet | null> {
    return await this.permissionSetService.findOne(id);
  }

  // Update a permission set
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionSetDto,
  ): Promise<PermissionSet | null> {
    return await this.permissionSetService.update(id, updateDto);
  }

  // Delete a permission set
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.permissionSetService.delete(id);
  }

  // Assign permission set to user or employee
  @Post(':id/assign')
  async assignPermissionSet(
    @Param('id') permissionSetId: string,
    @Body() body: { userId?: string; employeeId?: string },
  ) {
    return await this.permissionSetService.assignPermissionSet(
      permissionSetId,
      body.userId,
      body.employeeId,
    );
  }

  // Remove permission set assignment from user or employee
  @Delete(':id/assign')
  async removePermissionSetAssignment(
    @Param('id') permissionSetId: string,
    @Body() body: { userId?: string; employeeId?: string },
  ): Promise<void> {
    return await this.permissionSetService.removePermissionSetAssignment(
      permissionSetId,
      body.userId,
      body.employeeId,
    );
  }

  // Get permission sets for a user or employee (admin only for other users)
  @Get('user/:userId')
  async getPermissionSetsForUser(
    @Request() req: ApiRequestJWT,
    @Param('userId') userId: string,
  ) {
    // Only allow admins to view other users' permission sets
    // Users can view their own via the 'my' endpoint
    return await this.permissionSetService.getPermissionSetsForUser(userId);
  }

  @Get('employee/:employeeId')
  async getPermissionSetsForEmployee(@Param('employeeId') employeeId: string) {
    return await this.permissionSetService.getPermissionSetsForUser(
      undefined,
      employeeId,
    );
  }
}
