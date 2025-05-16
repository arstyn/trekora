import { IBranch } from '../branch/branch.entity';
import { IOrganization } from '../organization/organization.entity';
import { IUser } from '../user/user.entity';

export enum IEmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

export class IEmployee {
  id: string;
  userId?: string;
  user?: IUser;
  branchId?: string;
  branch?: IBranch;
  department?: string;
  //   designationId: string;
  //   designation: Designation;
  organizationId: string;
  organization?: IOrganization;
  name: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: string;
  nationality?: string;
  marital_status?: string;
  joinDate?: Date;
  avatar: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  status: IEmployeeStatus;
}
