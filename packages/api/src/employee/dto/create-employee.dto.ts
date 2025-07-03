export class IEmployeeCreateDTO {
  userId?: string;
  name: string;
  email?: string;
  departments?: string[];
  roleId?: string;
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  joinDate?: string;
  avatar?: string;
  address?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  maritalStatus?: string;
  organizationId?: string;
  emergencyContactName?: {
    name: string;
    phoneNumber: string;
    relation: string;
  }[];
  // branchId?: string;
}
