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
} from '@nestjs/common';
import { Permission } from 'src/database/entity/permission.entity';
import { AuthGuard } from '../auth/guard/auth.guard';
import { PermissionService } from './permission.service';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';
import { RolesGuard } from '../auth/guard/roles.guard';
import { RequireRole } from '../auth/decorator/require-role.decorator';

@UseGuards(AuthGuard, RolesGuard)
@RequireRole('admin')
@Controller('api/permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // Create a new permission
  @Post()
  async create(
    @Body() permissionData: Partial<Permission>,
  ): Promise<Permission> {
    return await this.permissionService.create(permissionData);
  }

  // Get all permissions
  @Get()
  async findAll(): Promise<Permission[]> {
    return await this.permissionService.findAll();
  }

  // Get permissions by resource
  @Get('resource/:resource')
  async findByResource(
    @Param('resource') resource: string,
  ): Promise<Permission[]> {
    return await this.permissionService.findByResource(resource);
  }

  // Get a permission by ID
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Permission | null> {
    return await this.permissionService.findOne(id);
  }

  // Update a permission by ID
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: Partial<Permission>,
  ): Promise<Permission | null> {
    return await this.permissionService.update(id, updateData);
  }

  // Delete a permission by ID
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.permissionService.delete(id);
  }
}
