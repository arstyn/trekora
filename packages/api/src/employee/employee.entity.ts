import { IBranch } from 'branch/branch.entity';
import { IOrganization } from 'organization/organization.entity';
import { IUser } from 'user/user.entity';

export enum IEmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
}

export class IEmployee {
  id: string;
  user_id?: string;
  user?: IUser;
  branch_id?: string;
  branch?: IBranch;
  department?: string;
  //   designation_id: string;
  //   designation: Designation;
  organization_id: string;
  organization?: IOrganization;
  name: string;
  address?: string;
  phone_number?: string;
  email?: string;
  date_of_birth?: Date;
  gender?: string;
  nationality?: string;
  marital_status?: string;
  hire_date?: Date;
  avatar: string;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
  status: IEmployeeStatus;
}
