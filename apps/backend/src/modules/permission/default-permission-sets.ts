/**
 * Default permission sets configuration
 * These will be created for each organization
 */

export interface DefaultPermissionSetConfig {
  name: string;
  description: string;
  permissionNames: string[];
}

export const defaultPermissionSets: Record<
  'admin' | 'manager' | 'employee',
  DefaultPermissionSetConfig
> = {
  admin: {
    name: 'Admin - Full Access',
    description: 'Full access to all system features and settings',
    permissionNames: [
      // All permissions for admin
      'booking.create',
      'booking.read',
      'booking.update',
      'booking.delete',
      'booking.view',
      'lead.create',
      'lead.read',
      'lead.update',
      'lead.delete',
      'lead.view',
      'package.create',
      'package.read',
      'package.update',
      'package.delete',
      'package.view',
      'customer.create',
      'customer.read',
      'customer.update',
      'customer.delete',
      'customer.view',
      'employee.create',
      'employee.read',
      'employee.update',
      'employee.delete',
      'employee.view',
      'employee.manage',
      'payment.create',
      'payment.read',
      'payment.update',
      'payment.delete',
      'payment.view',
      'batch.create',
      'batch.read',
      'batch.update',
      'batch.delete',
      'batch.view',
      'branch.create',
      'branch.read',
      'branch.update',
      'branch.delete',
      'branch.view',
      'department.create',
      'department.read',
      'department.update',
      'department.delete',
      'department.view',
      'role.create',
      'role.read',
      'role.update',
      'role.delete',
      'role.view',
      'role.manage',
      'permission.create',
      'permission.read',
      'permission.update',
      'permission.delete',
      'permission.view',
      'permission.manage',
      'permission-set.create',
      'permission-set.read',
      'permission-set.update',
      'permission-set.delete',
      'permission-set.view',
      'permission-set.manage',
    ],
  },
  manager: {
    name: 'Manager - Team Management',
    description: 'Access to manage teams, view reports, and handle bookings',
    permissionNames: [
      // Booking permissions
      'booking.create',
      'booking.read',
      'booking.update',
      'booking.view',
      // Lead permissions
      'lead.create',
      'lead.read',
      'lead.update',
      'lead.view',
      // Package permissions (view only)
      'package.read',
      'package.view',
      // Customer permissions
      'customer.create',
      'customer.read',
      'customer.update',
      'customer.view',
      // Employee permissions (view and limited manage)
      'employee.read',
      'employee.view',
      // Payment permissions
      'payment.create',
      'payment.read',
      'payment.update',
      'payment.view',
      // Batch permissions
      'batch.create',
      'batch.read',
      'batch.update',
      'batch.view',
      // Branch permissions (view only)
      'branch.read',
      'branch.view',
      // Department permissions (view only)
      'department.read',
      'department.view',
    ],
  },
  employee: {
    name: 'Employee - Basic Access',
    description: 'Basic access to view and create bookings, leads, and customers',
    permissionNames: [
      // Booking permissions (create and view own)
      'booking.create',
      'booking.read',
      'booking.view',
      // Lead permissions
      'lead.create',
      'lead.read',
      'lead.update',
      'lead.view',
      // Package permissions (view only)
      'package.read',
      'package.view',
      // Customer permissions
      'customer.create',
      'customer.read',
      'customer.view',
      // Payment permissions (view only)
      'payment.read',
      'payment.view',
      // Batch permissions (view only)
      'batch.read',
      'batch.view',
    ],
  },
};

