import { IBranch } from '../branch/branch.entity';
import { IOrganization } from '../organization/organization.entity';

export class IUser {
  id: string;
  branchId?: string;
  organizationId?: string;
  branch?: IBranch;
  organization?: IOrganization;
  email: string;
  phone?: string;
  password: string;
  roleId?: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
