'use server';
import { AxiosRequest } from '@/lib/axios';
import { IEmployeeCreateDTO } from '@repo/api/employee/dto/create-employee.dto';
import { IEmployee } from '@repo/api/employee/employee.entity';
import { IDepartment } from '@repo/api/department/department.entity';
import { IRole } from '@repo/api/auth/dto/role.types';

export async function getEmployees() {
  try {
    const employees = await AxiosRequest.get<IEmployee[]>('/employee');
    console.log('🚀 ~ action.ts:15 ~ getEmployees ~ employees:', employees);
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

export async function getRoles() {
  try {
    const roles = await AxiosRequest.get<IRole[]>('/role');
    return { roles };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching roles.';
    return { error: errorMessage, roles: [] };
  }
}

export async function getDepartments() {
  try {
    const departments = await AxiosRequest.get<IDepartment[]>('/department');
    return { departments };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching departments.';
    return { error: errorMessage, departments: [] };
  }
}
