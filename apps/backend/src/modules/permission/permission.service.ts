import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from 'src/database/entity/permission.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  // Create a new permission
  async create(permissionData: Partial<Permission>): Promise<Permission> {
    const permission = this.permissionRepository.create(permissionData);
    return await this.permissionRepository.save(permission);
  }

  // Find all permissions
  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      order: { resource: 'ASC', action: 'ASC' },
    });
  }

  // Find permissions by resource
  async findByResource(resource: string): Promise<Permission[]> {
    return await this.permissionRepository.find({
      where: { resource },
      order: { action: 'ASC' },
    });
  }

  // Find a permission by ID
  async findOne(id: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({ where: { id } });
  }

  // Find a permission by name
  async findByName(name: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({ where: { name } });
  }

  // Find a permission by resource and action
  async findByResourceAndAction(
    resource: string,
    action: string,
  ): Promise<Permission | null> {
    return await this.permissionRepository.findOne({
      where: { resource, action },
    });
  }

  // Update a permission by ID
  async update(
    id: string,
    updateData: Partial<Permission>,
  ): Promise<Permission | null> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });
    if (!permission) {
      return null;
    }
    Object.assign(permission, updateData);
    return await this.permissionRepository.save(permission);
  }

  // Delete a permission by ID
  async delete(id: string): Promise<void> {
    await this.permissionRepository.delete(id);
  }

  // Bulk create permissions
  async bulkCreate(
    permissionsData: Partial<Permission>[],
  ): Promise<Permission[]> {
    const permissions = this.permissionRepository.create(permissionsData);
    return await this.permissionRepository.save(permissions);
  }
}
