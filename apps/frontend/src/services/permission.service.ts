import axiosInstance from "@/lib/axios";
import type {
  Permission,
  PermissionSet,
  CreatePermissionDto,
  UpdatePermissionDto,
  CreatePermissionSetDto,
  UpdatePermissionSetDto,
  AssignPermissionSetDto,
} from "@/types/permission.types";

export class PermissionService {
  private static permissionsUrl = "/permissions";
  private static permissionSetsUrl = "/permission-sets";

  /* -------- Permission APIs -------- */
  static async getAllPermissions(): Promise<Permission[]> {
    const response = await axiosInstance.get(this.permissionsUrl);
    return response.data;
  }

  static async getPermissionsByResource(
    resource: string
  ): Promise<Permission[]> {
    const response = await axiosInstance.get(
      `${this.permissionsUrl}/resource/${resource}`
    );
    return response.data;
  }

  static async getPermissionById(id: string): Promise<Permission> {
    const response = await axiosInstance.get(`${this.permissionsUrl}/${id}`);
    return response.data;
  }

  static async createPermission(
    data: CreatePermissionDto
  ): Promise<Permission> {
    const response = await axiosInstance.post(this.permissionsUrl, data);
    return response.data;
  }

  static async updatePermission(
    id: string,
    data: UpdatePermissionDto
  ): Promise<Permission> {
    const response = await axiosInstance.put(
      `${this.permissionsUrl}/${id}`,
      data
    );
    return response.data;
  }

  static async deletePermission(id: string): Promise<void> {
    await axiosInstance.delete(`${this.permissionsUrl}/${id}`);
  }

  /* -------- Permission Set APIs -------- */
  static async getAllPermissionSets(): Promise<PermissionSet[]> {
    const response = await axiosInstance.get(this.permissionSetsUrl);
    return response.data;
  }

  static async getPermissionSetById(id: string): Promise<PermissionSet> {
    const response = await axiosInstance.get(`${this.permissionSetsUrl}/${id}`);
    return response.data;
  }

  static async createPermissionSet(
    data: CreatePermissionSetDto
  ): Promise<PermissionSet> {
    const response = await axiosInstance.post(this.permissionSetsUrl, data);
    return response.data;
  }

  static async updatePermissionSet(
    id: string,
    data: UpdatePermissionSetDto
  ): Promise<PermissionSet> {
    const response = await axiosInstance.put(
      `${this.permissionSetsUrl}/${id}`,
      data
    );
    return response.data;
  }

  static async deletePermissionSet(id: string): Promise<void> {
    await axiosInstance.delete(`${this.permissionSetsUrl}/${id}`);
  }

  static async assignPermissionSet(
    permissionSetId: string,
    data: AssignPermissionSetDto
  ): Promise<void> {
    await axiosInstance.post(
      `${this.permissionSetsUrl}/${permissionSetId}/assign`,
      data
    );
  }

  static async removePermissionSetAssignment(
    permissionSetId: string,
    data: AssignPermissionSetDto
  ): Promise<void> {
    await axiosInstance.delete(
      `${this.permissionSetsUrl}/${permissionSetId}/assign`,
      { data }
    );
  }

  static async getPermissionSetsForUser(userId: string): Promise<PermissionSet[]> {
    const response = await axiosInstance.get(
      `${this.permissionSetsUrl}/user/${userId}`
    );
    return response.data;
  }

  static async getPermissionSetsForEmployee(
    employeeId: string
  ): Promise<PermissionSet[]> {
    const response = await axiosInstance.get(
      `${this.permissionSetsUrl}/employee/${employeeId}`
    );
    return response.data;
  }
}

