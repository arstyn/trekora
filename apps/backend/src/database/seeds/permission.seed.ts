export const permissions = [
  // Booking permissions
  {
    name: 'booking.create',
    resource: 'booking',
    action: 'create',
    description: 'Create new bookings',
  },
  {
    name: 'booking.read',
    resource: 'booking',
    action: 'read',
    description: 'View bookings',
  },
  {
    name: 'booking.update',
    resource: 'booking',
    action: 'update',
    description: 'Update existing bookings',
  },
  {
    name: 'booking.delete',
    resource: 'booking',
    action: 'delete',
    description: 'Delete bookings',
  },
  {
    name: 'booking.view',
    resource: 'booking',
    action: 'view',
    description: 'View booking details',
  },

  // Lead permissions
  {
    name: 'lead.create',
    resource: 'lead',
    action: 'create',
    description: 'Create new leads',
  },
  {
    name: 'lead.read',
    resource: 'lead',
    action: 'read',
    description: 'View leads',
  },
  {
    name: 'lead.update',
    resource: 'lead',
    action: 'update',
    description: 'Update existing leads',
  },
  {
    name: 'lead.delete',
    resource: 'lead',
    action: 'delete',
    description: 'Delete leads',
  },
  {
    name: 'lead.view',
    resource: 'lead',
    action: 'view',
    description: 'View lead details',
  },

  // Package permissions
  {
    name: 'package.create',
    resource: 'package',
    action: 'create',
    description: 'Create new packages',
  },
  {
    name: 'package.read',
    resource: 'package',
    action: 'read',
    description: 'View packages',
  },
  {
    name: 'package.update',
    resource: 'package',
    action: 'update',
    description: 'Update existing packages',
  },
  {
    name: 'package.delete',
    resource: 'package',
    action: 'delete',
    description: 'Delete packages',
  },
  {
    name: 'package.view',
    resource: 'package',
    action: 'view',
    description: 'View package details',
  },

  // Customer permissions
  {
    name: 'customer.create',
    resource: 'customer',
    action: 'create',
    description: 'Create new customers',
  },
  {
    name: 'customer.read',
    resource: 'customer',
    action: 'read',
    description: 'View customers',
  },
  {
    name: 'customer.update',
    resource: 'customer',
    action: 'update',
    description: 'Update existing customers',
  },
  {
    name: 'customer.delete',
    resource: 'customer',
    action: 'delete',
    description: 'Delete customers',
  },
  {
    name: 'customer.view',
    resource: 'customer',
    action: 'view',
    description: 'View customer details',
  },

  // Employee permissions
  {
    name: 'employee.create',
    resource: 'employee',
    action: 'create',
    description: 'Create new employees',
  },
  {
    name: 'employee.read',
    resource: 'employee',
    action: 'read',
    description: 'View employees',
  },
  {
    name: 'employee.update',
    resource: 'employee',
    action: 'update',
    description: 'Update existing employees',
  },
  {
    name: 'employee.delete',
    resource: 'employee',
    action: 'delete',
    description: 'Delete employees',
  },
  {
    name: 'employee.view',
    resource: 'employee',
    action: 'view',
    description: 'View employee details',
  },
  {
    name: 'employee.manage',
    resource: 'employee',
    action: 'manage',
    description: 'Manage employees (full access)',
  },

  // Payment permissions
  {
    name: 'payment.create',
    resource: 'payment',
    action: 'create',
    description: 'Create new payments',
  },
  {
    name: 'payment.read',
    resource: 'payment',
    action: 'read',
    description: 'View payments',
  },
  {
    name: 'payment.update',
    resource: 'payment',
    action: 'update',
    description: 'Update existing payments',
  },
  {
    name: 'payment.delete',
    resource: 'payment',
    action: 'delete',
    description: 'Delete payments',
  },
  {
    name: 'payment.view',
    resource: 'payment',
    action: 'view',
    description: 'View payment details',
  },

  // Batch permissions
  {
    name: 'batch.create',
    resource: 'batch',
    action: 'create',
    description: 'Create new batches',
  },
  {
    name: 'batch.read',
    resource: 'batch',
    action: 'read',
    description: 'View batches',
  },
  {
    name: 'batch.update',
    resource: 'batch',
    action: 'update',
    description: 'Update existing batches',
  },
  {
    name: 'batch.delete',
    resource: 'batch',
    action: 'delete',
    description: 'Delete batches',
  },
  {
    name: 'batch.view',
    resource: 'batch',
    action: 'view',
    description: 'View batch details',
  },

  // Branch permissions
  {
    name: 'branch.create',
    resource: 'branch',
    action: 'create',
    description: 'Create new branches',
  },
  {
    name: 'branch.read',
    resource: 'branch',
    action: 'read',
    description: 'View branches',
  },
  {
    name: 'branch.update',
    resource: 'branch',
    action: 'update',
    description: 'Update existing branches',
  },
  {
    name: 'branch.delete',
    resource: 'branch',
    action: 'delete',
    description: 'Delete branches',
  },
  {
    name: 'branch.view',
    resource: 'branch',
    action: 'view',
    description: 'View branch details',
  },

  // Department permissions
  {
    name: 'department.create',
    resource: 'department',
    action: 'create',
    description: 'Create new departments',
  },
  {
    name: 'department.read',
    resource: 'department',
    action: 'read',
    description: 'View departments',
  },
  {
    name: 'department.update',
    resource: 'department',
    action: 'update',
    description: 'Update existing departments',
  },
  {
    name: 'department.delete',
    resource: 'department',
    action: 'delete',
    description: 'Delete departments',
  },
  {
    name: 'department.view',
    resource: 'department',
    action: 'view',
    description: 'View department details',
  },

  // Role permissions
  {
    name: 'role.create',
    resource: 'role',
    action: 'create',
    description: 'Create new roles',
  },
  {
    name: 'role.read',
    resource: 'role',
    action: 'read',
    description: 'View roles',
  },
  {
    name: 'role.update',
    resource: 'role',
    action: 'update',
    description: 'Update existing roles',
  },
  {
    name: 'role.delete',
    resource: 'role',
    action: 'delete',
    description: 'Delete roles',
  },
  {
    name: 'role.view',
    resource: 'role',
    action: 'view',
    description: 'View role details',
  },
  {
    name: 'role.manage',
    resource: 'role',
    action: 'manage',
    description: 'Manage roles (full access)',
  },

  // Permission permissions
  {
    name: 'permission.create',
    resource: 'permission',
    action: 'create',
    description: 'Create new permissions',
  },
  {
    name: 'permission.read',
    resource: 'permission',
    action: 'read',
    description: 'View permissions',
  },
  {
    name: 'permission.update',
    resource: 'permission',
    action: 'update',
    description: 'Update existing permissions',
  },
  {
    name: 'permission.delete',
    resource: 'permission',
    action: 'delete',
    description: 'Delete permissions',
  },
  {
    name: 'permission.view',
    resource: 'permission',
    action: 'view',
    description: 'View permission details',
  },
  {
    name: 'permission.manage',
    resource: 'permission',
    action: 'manage',
    description: 'Manage permissions (full access)',
  },

  // Permission Set permissions
  {
    name: 'permission-set.create',
    resource: 'permission-set',
    action: 'create',
    description: 'Create new permission sets',
  },
  {
    name: 'permission-set.read',
    resource: 'permission-set',
    action: 'read',
    description: 'View permission sets',
  },
  {
    name: 'permission-set.update',
    resource: 'permission-set',
    action: 'update',
    description: 'Update existing permission sets',
  },
  {
    name: 'permission-set.delete',
    resource: 'permission-set',
    action: 'delete',
    description: 'Delete permission sets',
  },
  {
    name: 'permission-set.view',
    resource: 'permission-set',
    action: 'view',
    description: 'View permission set details',
  },
  {
    name: 'permission-set.manage',
    resource: 'permission-set',
    action: 'manage',
    description: 'Manage permission sets (full access)',
  },

  // Workflow permissions
  {
    name: 'workflow.create',
    resource: 'workflow',
    action: 'create',
    description: 'Create new workflows',
  },
  {
    name: 'workflow.read',
    resource: 'workflow',
    action: 'read',
    description: 'View workflows',
  },
  {
    name: 'workflow.update',
    resource: 'workflow',
    action: 'update',
    description: 'Update existing workflows',
  },
  {
    name: 'workflow.delete',
    resource: 'workflow',
    action: 'delete',
    description: 'Delete workflows',
  },
  {
    name: 'workflow.view',
    resource: 'workflow',
    action: 'view',
    description: 'View workflow details',
  },
];
