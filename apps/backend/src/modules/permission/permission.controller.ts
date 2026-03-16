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
import { PermissionGuard } from '../auth/guard/permission.guard';
import { RequirePermission } from '../auth/decorator/require-permission.decorator';
import { PermissionService } from './permission.service';
import { ApiRequestJWT } from 'src/dto/api-request-jwt.types';

@UseGuards(AuthGuard, PermissionGuard)
@RequirePermission('permission', 'manage')
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  // Create a new permission
  @Post()
  async create(
    @Request() req: ApiRequestJWT,
    @Body() permissionData: Partial<Permission>,
  ): Promise<Permission> {
    return await this.permissionService.create(
      permissionData,
      req.user.organizationId,
    );
  }

  // Get all permissions
  @Get()
  async findAll(@Request() req: ApiRequestJWT): Promise<Permission[]> {
    return await this.permissionService.findAll(req.user.organizationId);
  }

  // Get permissions by resource
  @Get('resource/:resource')
  async findByResource(
    @Request() req: ApiRequestJWT,
    @Param('resource') resource: string,
  ): Promise<Permission[]> {
    return await this.permissionService.findByResource(
      resource,
      req.user.organizationId,
    );
  }

  // Get a permission by ID
  @Get(':id')
  async findOne(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
  ): Promise<Permission | null> {
    return await this.permissionService.findOne(id, req.user.organizationId);
  }

  // Update a permission by ID
  @Put(':id')
  async update(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
    @Body() updateData: Partial<Permission>,
  ): Promise<Permission | null> {
    return await this.permissionService.update(
      id,
      updateData,
      req.user.organizationId,
    );
  }

  // Delete a permission by ID
  @Delete(':id')
  async delete(
    @Request() req: ApiRequestJWT,
    @Param('id') id: string,
  ): Promise<void> {
    return await this.permissionService.delete(id, req.user.organizationId);
  }
}
