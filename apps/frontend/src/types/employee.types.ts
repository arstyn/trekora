import type { IBranch } from "./branch.type";
import type { IOrganization } from "./organization.types";
import type { IRole } from "./role.types";
import type { IUserDepartments } from "./user-department.types";
import type { IUser } from "./user.types";

export interface IEmployeeCreateDTO {
	userId?: string;
	name: string;
	email?: string;
	departments?: string[];
	roleId?: string;
	status: "active" | "inactive" | "suspended" | "terminated";
	joinDate?: string;
	avatar?: string;
	address?: string;
	phone?: string;
	dateOfBirth?: string;
	gender?: string;
	nationality?: string;
	maritalStatus?: string;
	organizationId?: string;
	emergencyContactName?: {
		name: string;
		phone: string;
		relation: string;
	}[];
	// branchId?: string;
}

export type IEmployeeStatus = "active" | "inactive" | "suspended" | "terminated";

export interface IEmployee {
	id: string;
	userId?: string;
	user?: IUser;
	branchId?: string;
	branch?: IBranch;
	role: IRole;
	roleId?: string;
	organizationId: string;
	organization?: IOrganization;
	name: string;
	address?: string;
	phone?: string;
	email?: string;
	dateOfBirth?: Date;
	gender?: "male" | "female" | "other";
	nationality?: string;
	maritalStatus?: "single" | "married";
	joinDate?: Date;
	avatar: string;
	createdAt: Date;
	updatedAt: Date;
	isActive: boolean;
	status: IEmployeeStatus;
	employeeDepartments?: IUserDepartments[];
}
