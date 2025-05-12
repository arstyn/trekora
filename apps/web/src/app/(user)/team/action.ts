'use server';
import { IEmployee } from '@repo/api/employee/employee.entity';
import { IEmployeeCreateDTO } from '@repo/api/employee/dto/create-employee.dto';
import { AxiosRequest } from '@/lib/axios';
import { ICreateEmployeeFormValues } from './_component/add-employee-modal';

export async function getEmployees() {
  try {
    const employees = await AxiosRequest.get<IEmployee[]>('/employee');
    return { employees };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching employees.';
    return { error: errorMessage, employees: [] };
  }
}

export async function createEmployee(newEmployee: IEmployeeCreateDTO) {
  try {
    const employee = await AxiosRequest.post<IEmployeeCreateDTO, IEmployee>(
      '/employee',
      newEmployee,
    );
    return { employee };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching employees.';
    return { error: errorMessage };
  }
}
