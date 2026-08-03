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

    const permissionSet = this.permissionSetRepository.create({
      ...permissionSetData,
      organizationId,
    });
    const savedPermissionSet =
      await this.permissionSetRepository.save(permissionSet);

    if (permissionIds && permissionIds.length > 0) {
      await this.updatePermissions(savedPermissionSet.id, permissionIds);
    }

    return this.findOne(savedPermissionSet.id);
  }

  // Find all permission sets for an organization
  async findAll(organizationId: string): Promise<PermissionSet[]> {
    return this.permissionSetRepository.find({
      where: { organizationId },
      relations: [
        'permissionSetPermissions',
        'permissionSetPermissions.permission',
      ],
    });
  }

  // Find one permission set by ID
  async findOne(id: string): Promise<PermissionSet> {
    const permissionSet = await this.permissionSetRepository.findOne({
      where: { id },
      relations: [
        'permissionSetPermissions',
        'permissionSetPermissions.permission',
      ],
    });

    if (!permissionSet) {
      throw new NotFoundException(`Permission set with ID ${id} not found`);
    }

    return permissionSet;
  }

  // Update a permission set
  async update(
    id: string,
    updateDto: UpdatePermissionSetDto,
  ): Promise<PermissionSet> {
    const { permissionIds, ...permissionSetData } = updateDto;

    await this.permissionSetRepository.update(id, permissionSetData);

    if (permissionIds !== undefined) {
      await this.updatePermissions(id, permissionIds);
    }

    return this.findOne(id);
  }

  // Delete a permission set
  async remove(id: string): Promise<void> {
    const permissionSet = await this.findOne(id);
    await this.permissionSetRepository.remove(permissionSet);
  }

  // Update permissions for a permission set
  private async updatePermissions(
    permissionSetId: string,
    permissionIds: string[],
  ): Promise<void> {
    // Delete existing permissions for this set
    await this.permissionSetPermissionRepository.delete({ permissionSetId });

    if (permissionIds.length === 0) {
      return;
    }

    // Verify all permissions exist
    const permissions = await this.permissionRepository.find({
      where: { id: In(permissionIds) },
    });

    if (permissions.length !== permissionIds.length) {
      throw new NotFoundException('One or more permissions not found');
    }

    // Create new relations
    const permissionSetPermissions = permissionIds.map((permissionId) =>
      this.permissionSetPermissionRepository.create({
        permissionSetId,
        permissionId,
      }),
    );

    await this.permissionSetPermissionRepository.save(
      permissionSetPermissions,
    );
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

    let sets = profilePermissionSets
      .map((pps) => pps.permissionSet)
      .filter((ps): ps is PermissionSet => !!ps);

    // Auto-heal: If an employee has NO permission sets assigned, check if there is an Admin permission set for their organization
    if (sets.length === 0) {
      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId },
      });

      if (employee && employee.organizationId) {
        const adminSet = await this.permissionSetRepository.findOne({
          where: [
            { organizationId: employee.organizationId, name: 'Admin - Full Access' },
            { organizationId: employee.organizationId, name: 'Admin' },
          ],
          relations: [
            'permissionSetPermissions',
            'permissionSetPermissions.permission',
          ],
        });

        if (adminSet) {
          try {
            await this.assignPermissionSet(adminSet.id, employeeId);
          } catch (e) {
            // Ignore duplicate assignment errors
          }
          sets = [adminSet];
        }
      }
    }

    return sets;
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

    // Get all permissions for this organization
    const permissions =
      await this.permissionService.findAll(organizationId);
    const permissionMap = new Map(permissions.map((p) => [p.name, p.id]));

    const createdSets: PermissionSet[] = [];

    // Create each default permission set
    for (const [key, config] of Object.entries(defaultPermissionSets)) {
      // Get permission IDs for this set
      const permissionIds = config.permissionNames
        .map((name) => permissionMap.get(name))
        .filter((id): id is string => id !== undefined);

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
