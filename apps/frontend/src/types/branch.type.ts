import type { IOrganization } from "./organization.types";

export interface IBranch {
	id: string;
	organizationId?: string;
	organization: IOrganization;
	name: string;
	location?: string;
	createdAt: Date;
	isActive: boolean;
}
