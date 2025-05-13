import { IEmployeeStatus } from 'employee/employee.entity';

export class IEmployeeCreateDTO {
  userId?: string;
  branchId?: string;
  department?: string[];
  //   designationId: string;
  //   designation: Designation;
  name: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  marital_status?: string;
  joinDate?: string;
  avatar?: string;
  isActive?: boolean;
  status: IEmployeeStatus;
}
