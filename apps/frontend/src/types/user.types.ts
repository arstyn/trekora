import type { IBranch } from "./branch.type";
import type { IOrganization } from "./organization.types";

export interface IUser {
	id: string;
	branchId?: string;
	name: string;
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
