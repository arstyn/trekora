export class IBranchCreateDTO {
  name: string;
  location: string;
  organizationId?: string;
  isActive?: boolean;
  managerId?: string;
}
