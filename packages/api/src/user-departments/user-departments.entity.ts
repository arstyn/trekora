import { IDepartment } from 'department/department.entity';
import { IEmployee } from 'employee/employee.entity';
import { IUser } from 'user/user.entity';

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
