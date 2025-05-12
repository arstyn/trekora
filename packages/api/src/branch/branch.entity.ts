import { IOrganization } from 'organization/organization.entity';

export class IBranch {
  id: string;
  organizationId: string;
  organization: IOrganization;
  name: string;
  location?: string;
  createdAt: Date;
  isActive: boolean;
}
