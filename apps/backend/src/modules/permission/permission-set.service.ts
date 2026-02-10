import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from 'src/database/entity/employee.entity';
import { PermissionSetPermission } from 'src/database/entity/permission-set-permission.entity';
import { PermissionSet } from 'src/database/entity/permission-set.entity';
import { Permission } from 'src/database/entity/permission.entity';
import { UserPermissionSet } from 'src/database/entity/user-permission-set.entity';
import { In, Repository } from 'typeorm';
import { defaultPermissionSets } from './default-permission-sets';

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
    @InjectRepository(UserPermissionSet)
    private readonly userPermissionSetRepository: Repository<UserPermissionSet>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) { }

  // Create a new permission set with permissions
  async create(createDto: CreatePermissionSetDto): Promise<PermissionSet> {
    const { permissionIds, ...permissionSetData } = createDto;

    const permissionSet =
      this.permissionSetRepository.create(permissionSetData);
    const savedPermissionSet =
      await this.permissionSetRepository.save(permissionSet);

    // Add permissions if provided
    if (permissionIds && permissionIds.length > 0) {
      await this.updatePermissionSetPermissions(
        savedPermissionSet.id,
        permissionIds,
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
      await this.updatePermissionSetPermissions(id, permissionIds);
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
  ): Promise<void> {
    // Remove existing permissions
    await this.permissionSetPermissionRepository.delete({
      permissionSetId,
    });

    // Add new permissions
    if (permissionIds.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(permissionIds) },
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

  // Assign permission set to user or employee
  // Ensures user and employee are always in sync when linked
  async assignPermissionSet(
    permissionSetId: string,
    userId?: string,
    employeeId?: string,
  ): Promise<UserPermissionSet[]> {
    if (!userId && !employeeId) {
      throw new Error('Either userId or employeeId must be provided');
    }

    const results: UserPermissionSet[] = [];

    // If assigning to a user, also assign to linked employee
    if (userId) {
      // Check if already assigned to user
      let existingUser = await this.userPermissionSetRepository.findOne({
        where: {
          permissionSetId,
          userId,
        },
      });

      if (!existingUser) {
        existingUser = this.userPermissionSetRepository.create({
          permissionSetId,
          userId,
        });
        existingUser = await this.userPermissionSetRepository.save(existingUser);
      }
      results.push(existingUser);

      // Find linked employee and sync
      const employee = await this.employeeRepository.findOne({
        where: { userId },
      });

      if (employee) {
        const existingEmployee = await this.userPermissionSetRepository.findOne({
          where: {
            permissionSetId,
            employeeId: employee.id,
          },
        });

        if (!existingEmployee) {
          const employeePermissionSet = this.userPermissionSetRepository.create({
            permissionSetId,
            employeeId: employee.id,
          });
          results.push(await this.userPermissionSetRepository.save(employeePermissionSet));
        } else {
          results.push(existingEmployee);
        }
      }
    }

    // If assigning to an employee, also assign to linked user
    if (employeeId) {
      // Check if already assigned to employee
      let existingEmployee = await this.userPermissionSetRepository.findOne({
        where: {
          permissionSetId,
          employeeId,
        },
      });

      if (!existingEmployee) {
        existingEmployee = this.userPermissionSetRepository.create({
          permissionSetId,
          employeeId,
        });
        existingEmployee = await this.userPermissionSetRepository.save(existingEmployee);
      }
      results.push(existingEmployee);

      // Find linked user and sync
      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId },
      });

      if (employee?.userId) {
        const existingUser = await this.userPermissionSetRepository.findOne({
          where: {
            permissionSetId,
            userId: employee.userId,
          },
        });

        if (!existingUser) {
          const userPermissionSet = this.userPermissionSetRepository.create({
            permissionSetId,
            userId: employee.userId,
          });
          results.push(await this.userPermissionSetRepository.save(userPermissionSet));
        } else {
          results.push(existingUser);
        }
      }
    }

    // Remove duplicates
    const uniqueResults = Array.from(
      new Map(results.map((r) => [r.id, r])).values()
    );

    return uniqueResults;
  }

  // Remove permission set assignment from user or employee
  // Ensures user and employee are always in sync when linked
  async removePermissionSetAssignment(
    permissionSetId: string,
    userId?: string,
    employeeId?: string,
  ): Promise<void> {
    // If removing from user, also remove from linked employee
    if (userId) {
      await this.userPermissionSetRepository.delete({
        permissionSetId,
        userId,
      });

      // Find linked employee and sync
      const employee = await this.employeeRepository.findOne({
        where: { userId },
      });

      if (employee) {
        await this.userPermissionSetRepository.delete({
          permissionSetId,
          employeeId: employee.id,
        });
      }
    }

    // If removing from employee, also remove from linked user
    if (employeeId) {
      await this.userPermissionSetRepository.delete({
        permissionSetId,
        employeeId,
      });

      // Find linked user and sync
      const employee = await this.employeeRepository.findOne({
        where: { id: employeeId },
      });

      if (employee?.userId) {
        await this.userPermissionSetRepository.delete({
          permissionSetId,
          userId: employee.userId,
        });
      }
    }
  }

  // Get permission sets for a user or employee
  async getPermissionSetsForUser(
    userId?: string,
    employeeId?: string,
  ): Promise<PermissionSet[]> {
    const userPermissionSets = await this.userPermissionSetRepository.find({
      where: {
        ...(userId ? { userId } : {}),
        ...(employeeId ? { employeeId } : {}),
      },
      relations: [
        'permissionSet',
        'permissionSet.permissionSetPermissions',
        'permissionSet.permissionSetPermissions.permission',
      ],
    });

    return userPermissionSets.map((ups) => ups.permissionSet);
  }

  /**
   * Create default permission sets for an organization
   * This should be called when a new organization is created
   */
  async createDefaultPermissionSetsForOrganization(
    organizationId: string,
  ): Promise<PermissionSet[]> {
    const createdSets: PermissionSet[] = [];

    // Get all permissions from database
    const allPermissions = await this.permissionRepository.find();
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
            `Permission ${permissionName} not found, skipping for ${roleName} permission set`,
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
