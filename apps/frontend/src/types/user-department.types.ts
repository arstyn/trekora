import type { IDepartment } from "./department.type";
import type { IEmployee } from "./employee.types";
import type { IUser } from "./user.types";

export interface IUserDepartments {
	id: string;
	userId: string | null;
	employeeId: string | null;
	departmentId: string;
	createdAt: Date;
	updatedAt: Date;
	user: IUser | null;
	employee: IEmployee | null;
	department: IDepartment;
}
