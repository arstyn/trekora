export class IEmployeeCreateDTO {
  userId?: string;
  name?: string;
  email?: string;
  departments?: string[];
  roleId?: string;
  status: 'active' | 'inactive' | 'suspended' | 'terminated';
  joinDate?: string;
  avatar?: string;
  address?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  maritalStatus?: string;
  experience?: string;
  specialization?: string;
  additional_info?: string;
  organizationId?: string;
  emergencyContactName?: {
    name: string;
    phone: string;
    relation: string;
  }[];
  isActive?: boolean;
  profilePhoto?: string;
  verificationDocument?: string;
  verificationDocumentType?: string;
  // branchId?: string;
}
