import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/database/entity/user.entity';
import { Employee } from 'src/database/entity/employee.entity';
import { Role } from 'src/database/entity/role.entity';
import { PermissionSetService } from './permission-set.service';
import { Permission } from 'src/database/entity/permission.entity';

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
   */
  async hasPermission(
    userId: string,
    organizationId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    // Admins have all permissions
    const user = await this.userRepository.findOne({
      where: { id: userId, organizationId },
      relations: ['role'],
    });

    if (!user) {
      return false;
    }

    // Check if user is admin
    if (user.role?.name === 'admin') {
      return true;
    }

    // Get all permission sets assigned to the user
    const permissionSets =
      await this.permissionSetService.getPermissionSetsForUser(userId);

    // Get permissions from all assigned permission sets
    const allPermissions: Permission[] = [];
    for (const permissionSet of permissionSets) {
      if (permissionSet.permissionSetPermissions) {
        const permissions = permissionSet.permissionSetPermissions.map(
          (psp) => psp.permission,
        );
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
   * Check if an employee has a specific permission
   */
  async hasPermissionForEmployee(
    employeeId: string,
    organizationId: string,
    resource: string,
    action: string,
  ): Promise<boolean> {
    const employee = await this.employeeRepository.findOne({
      where: { id: employeeId, organizationId },
      relations: ['role', 'user'],
    });

    if (!employee) {
      return false;
    }

    // Check if employee is admin
    if (employee.role?.name === 'admin') {
      return true;
    }

    // If employee has a user account, check user permissions
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
    const allPermissions: Permission[] = [];
    for (const permissionSet of permissionSets) {
      if (permissionSet.permissionSetPermissions) {
        const permissions = permissionSet.permissionSetPermissions.map(
          (psp) => psp.permission,
        );
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
