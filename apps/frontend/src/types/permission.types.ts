export interface Permission {
    id: string;
    name: string;
    resource: string;
    action: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PermissionSetPermission {
    id: string;
    permissionSetId: string;
    permissionId: string;
    permission: Permission;
}

export interface PermissionSet {
    id: string;
    name: string;
    description?: string;
    organizationId: string;
    permissionSetPermissions?: PermissionSetPermission[];
    createdAt: string;
    updatedAt: string;
}

export interface CreatePermissionDto {
    name: string;
    resource: string;
    action: string;
    description?: string;
}

export interface UpdatePermissionDto {
    name?: string;
    resource?: string;
    action?: string;
    description?: string;
}

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

export interface AssignPermissionSetDto {
    userId?: string;
    employeeId?: string;
}
