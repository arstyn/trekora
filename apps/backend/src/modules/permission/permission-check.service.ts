import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entity/user.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { Role } from 'src/database/entity/role.entity';
import { PermissionSetService } from './permission-set.service';
import { Permission } from 'src/database/entity/permission.entity';
import { PermissionSet } from 'src/database/entity/permission-set.entity';

@Injectable()
export class PermissionCheckService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly permissionSetService: PermissionSetService,
  ) {}

  /**
   * Check if a user has a specific permission
   * Uses permission sets only - no role dependency
   */
  async hasPermission(
    userId: string,
    organizationId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId, organizationId },
    });

    console.log(
      '🚀 ~ permission-check.service.ts:37 ~ PermissionCheckService ~ hasPermission ~ user:',
      user,
    );

    if (!user) {
      return false;
    }

    // Get all permission sets assigned to the user
    const userPermissionSets =
      await this.permissionSetService.getPermissionSetsForUser(userId);

    console.log(
      '🚀 ~ permission-check.service.ts:48 ~ PermissionCheckService ~ hasPermission ~ userPermissionSets:',
      userPermissionSets,
    );

    // Also check if user has a linked employee and get their permission sets
    const employee = await this.employeeRepository.findOne({
      where: { userId, organizationId },
    });

    console.log(
      '🚀 ~ permission-check.service.ts:56 ~ PermissionCheckService ~ hasPermission ~ employee:',
      employee,
    );

    let employeePermissionSets: PermissionSet[] = [];
    if (employee) {
      employeePermissionSets =
        await this.permissionSetService.getPermissionSetsForUser(
          undefined,
          employee.id,
        );
    }

    // Combine both sets and remove duplicates
    const allPermissionSets = [
      ...userPermissionSets,
      ...employeePermissionSets,
    ];
    const uniquePermissionSets = Array.from(
      new Map(allPermissionSets.map((ps) => [ps.id, ps])).values(),
    );

    // Get permissions from all assigned permission sets
    // Filter by organizationId to ensure tenant isolation
    const allPermissions: Permission[] = [];
    for (const permissionSet of uniquePermissionSets) {
      // Ensure permission set belongs to the organization
      if (permissionSet.organizationId !== organizationId) {
        continue;
      }
      if (permissionSet.permissionSetPermissions) {
        const permissions = permissionSet.permissionSetPermissions
          .map((psp) => psp.permission)
          .filter((p) => p && p.organizationId === organizationId);
        allPermissions.push(...permissions);
      }
    }

    console.log(allPermissions);

    // Check if the required permission exists
    return allPermissions.some(
      (permission) =>
        permission.resource === resource && permission.action === action,
    );
  }

  /**
   * Check if an employee has a specific permission
   * Uses permission sets only - no role dependency
   */
  async hasPermissionForEmployee(
    employeeId: string,
    organizationId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, organizationId },
      relations: ['user'],
    });

    if (!employee) {
      return false;
    }

    // If employee has a user account, check user permissions first
    if (employee.userId) {
      const hasUserPermission = await this.hasPermission(
        employee.userId,
        organizationId,
        resource,
        action,
      );
      if (hasUserPermission) {
        return true;
      }
    }

    // Get all permission sets assigned to the employee
    const permissionSets =
      await this.permissionSetService.getPermissionSetsForUser(
        undefined,
        employeeId,
      );

    // Get permissions from all assigned permission sets
    // Filter by organizationId to ensure tenant isolation
    const allPermissions: Permission[] = [];
    for (const permissionSet of permissionSets) {
      // Ensure permission set belongs to the organization
      if (permissionSet.organizationId !== organizationId) {
        continue;
      }
      if (permissionSet.permissionSetPermissions) {
        const permissions = permissionSet.permissionSetPermissions
          .map((psp) => psp.permission)
          .filter((p) => p && p.organizationId === organizationId);
        allPermissions.push(...permissions);
      }
    }

    // Check if the required permission exists
    return allPermissions.some(
      (permission) =>
        permission.resource === resource && permission.action === action,
    );
  }

  /**
   * Check if user has a specific role
   */
  async hasRole(
    userId: string,
    organizationId: string,
    roleName: string,
  ): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId, organizationId },
      relations: ['role'],
    });

    return user?.role?.name === roleName;
  }

  /**
   * Check if user is admin
   */
  async isAdmin(userId: string, organizationId: string): Promise<boolean> {
    return this.hasRole(userId, organizationId, 'admin');
  }
}
