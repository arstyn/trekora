import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from 'src/database/entity/permission.entity';
import { permissions } from '../../database/seeds/permission.seed';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) { }

  // Create a new permission
  async create(
    permissionData: Partial<Permission>,
    organizationId: string,
  ): Promise<Permission> {
    const permission = this.permissionRepository.create({
      ...permissionData,
      organizationId,
    });
    return await this.permissionRepository.save(permission);
  }

  // Find all permissions for an organization
  async findAll(organizationId: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { organizationId },
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  // Find permissions by resource for an organization
  async findByResource(
    resource: string,
    organizationId: string,
  ): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { resource, organizationId },
      order: { action: 'ASC' },
    });
  }

  // Find a permission by ID (must belong to organization)
  async findOne(id: string, organizationId: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { id, organizationId },
    });
  }

  // Find a permission by name for an organization
  async findByName(
    name: string,
    organizationId: string,
  ): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { name, organizationId },
    });
  }

  // Find a permission by resource and action for an organization
  async findByResourceAndAction(
    resource: string,
    action: string,
    organizationId: string,
  ): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { resource, action, organizationId },
    });
  }

  // Update a permission by ID (must belong to organization)
  async update(
    id: string,
    updateData: Partial<Permission>,
    organizationId: string,
  ): Promise<Permission | null> {
    const permission = await this.permissionRepository.findOne({
      where: { id, organizationId },
    });
    if (!permission) {
      return null;
    }
    Object.assign(permission, updateData);
    return await this.permissionRepository.save(permission);
  }

  // Delete a permission by ID (must belong to organization)
  async delete(id: string, organizationId: string): Promise<void> {
    await this.permissionRepository.delete({ id, organizationId });
  }

  // Bulk create permissions for an organization
  async bulkCreate(
    permissionsData: Partial<Permission>[],
    organizationId: string,
  ): Promise<Permission[]> {
    const permissions = this.permissionRepository.create(
      permissionsData.map((p) => ({ ...p, organizationId })),
    );
    return await this.permissionRepository.save(permissions);
  }

  // Create default permissions for an organization
  // This should be called when a new organization is created
  async createDefaultPermissionsForOrganization(
    organizationId: string,
  ): Promise<Permission[]> {
    // Using statically imported permissions

    // Check which permissions already exist for this organization
    const existingPermissions = await this.findAll(organizationId);
    const existingPermissionNames = new Set(
      existingPermissions.map((p) => p.name),
    );

    // Filter out permissions that already exist
    const permissionsToCreate = permissions.filter(
      (p) => !existingPermissionNames.has(p.name),
    );

    if (permissionsToCreate.length === 0) {
      return existingPermissions;
    }

    // Create the permissions
    return await this.bulkCreate(permissionsToCreate, organizationId);
  }
}
