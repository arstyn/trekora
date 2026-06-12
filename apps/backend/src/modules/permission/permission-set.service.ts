import { Injectable, NotFoundException, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from 'src/database/entity/employee.entity';
import { PermissionSetPermission } from 'src/database/entity/permission-set-permission.entity';
import { PermissionSet } from 'src/database/entity/permission-set.entity';
import { Permission } from 'src/database/entity/permission.entity';
import { ProfilePermissionSet } from 'src/database/entity/profile-permission-set.entity';
import { In, Repository } from 'typeorm';
import { defaultPermissionSets } from './default-permission-sets';
import { PermissionService } from './permission.service';

export interface CreatePermissionSetDto {
  name: string;
  description?: string;
  organizationId: string;
  permissionIds?: string[];
}

export interface UpdatePermissionSetDto {
  name?: string;
  description?: string;
  permissionIds?: string[];
}

@Injectable()
export class PermissionSetService {
  constructor(
    @InjectRepository(PermissionSet)
    private readonly permissionSetRepository: Repository<PermissionSet>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(PermissionSetPermission)
    private readonly permissionSetPermissionRepository: Repository<PermissionSetPermission>,
    @InjectRepository(ProfilePermissionSet)
    private readonly profilePermissionSetRepository: Repository<ProfilePermissionSet>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @Inject(forwardRef(() => PermissionService))
    private readonly permissionService: PermissionService,
  ) { }

  // Create a new permission set with permissions
  async create(createDto: CreatePermissionSetDto): Promise<PermissionSet> {
    const { permissionIds, organizationId, ...permissionSetData } = createDto;

    const permissionSet =
      this.permissionSetRepository.create({
        ...permissionSetData,
        organizationId,
      });
    const savedPermissionSet =
      await this.permissionSetRepository.save(permissionSet);

    // Add permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      await this.updatePermissionSetPermissions(
        savedPermissionSet.id,
        permissionIds,
        organizationId,
      );
    }

    const result = await this.findOne(savedPermissionSet.id);
    if (!result) {
      throw new NotFoundException(
        `Permission set with ID ${savedPermissionSet.id} not found`,
      );
    }
    return result;
  }

  // Find all permission sets for an organization
  async findAll(organizationId: string): Promise<PermissionSet[]> {
    return await this.permissionSetRepository.find({
      where: { organizationId },
      relations: [
        'permissionSetPermissions',
        'permissionSetPermissions.permission',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  // Find a permission set by ID
  async findOne(id: string): Promise<PermissionSet | null> {
    return await this.permissionSetRepository.findOne({
      where: { id },
      relations: [
        'permissionSetPermissions',
        'permissionSetPermissions.permission',
      ],
    });
  }

  // Update a permission set
  async update(
    id: string,
    updateDto: UpdatePermissionSetDto,
  ): Promise<PermissionSet | null> {
    const permissionSet = await this.permissionSetRepository.findOne({
      where: { id },
    });
    if (!permissionSet) {
      throw new NotFoundException(`Permission set with ID ${id} not found`);
    }

    const { permissionIds, ...updateData } = updateDto;
    Object.assign(permissionSet, updateData);
    const updatedPermissionSet =
      await this.permissionSetRepository.save(permissionSet);

    // Update permissions if provided
    if (permissionIds !== undefined) {
      await this.updatePermissionSetPermissions(
        id,
        permissionIds,
        permissionSet.organizationId,
      );
    }

    return this.findOne(id);
  }

  // Delete a permission set
  async delete(id: string): Promise<void> {
    const permissionSet = await this.permissionSetRepository.findOne({
      where: { id },
    });
    if (!permissionSet) {
      throw new NotFoundException(`Permission set with ID ${id} not found`);
    }
    await this.permissionSetRepository.delete(id);
  }

  // Update permissions for a permission set
  private async updatePermissionSetPermissions(
    permissionSetId: string,
    permissionIds: string[],
    organizationId: string,
  ): Promise<void> {
    // Remove existing permissions
    await this.permissionSetPermissionRepository.delete({
      permissionSetId,
    });

    // Add new permissions (filtered by organizationId to ensure security)
    if (permissionIds.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(permissionIds), organizationId },
      });

      const permissionSetPermissions = permissions.map((permission) =>
        this.permissionSetPermissionRepository.create({
          permissionSetId,
          permissionId: permission.id,
        }),
      );

      await this.permissionSetPermissionRepository.save(
        permissionSetPermissions,
      );
    }
  }

  // Assign permission set to an employee profile
  async assignPermissionSet(
    permissionSetId: string,
    employeeId: string,
  ): Promise<ProfilePermissionSet[]> {
    if (!employeeId) {
      throw new Error('employeeId must be provided');
    }

    const results: ProfilePermissionSet[] = [];

    // Check if already assigned to employee
    let existingEmployee = await this.profilePermissionSetRepository.findOne({
      where: {
        permissionSetId,
        employeeId,
      },
    });

    if (!existingEmployee) {
      existingEmployee = this.profilePermissionSetRepository.create({
        permissionSetId,
        employeeId,
      });
      existingEmployee = await this.profilePermissionSetRepository.save(existingEmployee);
    }
    results.push(existingEmployee);

    return results;
  }

  // Remove permission set assignment from employee
  async removePermissionSetAssignment(
    permissionSetId: string,
    employeeId: string,
  ): Promise<void> {
    if (employeeId) {
      await this.profilePermissionSetRepository.delete({
        permissionSetId,
        employeeId,
      });
    }
  }

  // Get permission sets for an employee profile
  async getPermissionSetsForUser(
    employeeId: string,
  ): Promise<PermissionSet[]> {
    const profilePermissionSets = await this.profilePermissionSetRepository.find({
      where: {
        employeeId,
      },
      relations: [
        'permissionSet',
        'permissionSet.permissionSetPermissions',
        'permissionSet.permissionSetPermissions.permission',
      ],
    });

    return profilePermissionSets.map((pps) => pps.permissionSet);
  }

  /**
   * Create default permission sets for an organization
   * This should be called when a new organization is created
   * First creates default permissions for the organization, then creates permission sets
   */
  async createDefaultPermissionSetsForOrganization(
    organizationId: string,
  ): Promise<PermissionSet[]> {
    // First, create default permissions for this organization
    await this.permissionService.createDefaultPermissionsForOrganization(
      organizationId,
    );

    const createdSets: PermissionSet[] = [];

    // Get all permissions for this organization
    const allPermissions = await this.permissionRepository.find({
      where: { organizationId },
    });
    const permissionMap = new Map(allPermissions.map((p) => [p.name, p.id]));

    // Create permission sets for each role
    for (const [roleName, config] of Object.entries(defaultPermissionSets)) {
      // Find permission IDs for this permission set
      const permissionIds: string[] = [];
      for (const permissionName of config.permissionNames) {
        const permissionId = permissionMap.get(permissionName);
        if (permissionId) {
          permissionIds.push(permissionId);
        } else {
          console.warn(
            `Permission ${permissionName} not found for organization ${organizationId}, skipping for ${roleName} permission set`,
          );
        }
      }

      // Create the permission set
      const permissionSet = await this.create({
        name: config.name,
        description: config.description,
        organizationId,
        permissionIds,
      });

      createdSets.push(permissionSet);
    }

    return createdSets;
  }
}
