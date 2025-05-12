'use server';

import { AxiosRequest } from '@/lib/axios';

export async function getEmployees() {
  try {
    const employees = await AxiosRequest.get('/employee');
    return employees;
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching employees.';
    return { error: errorMessage };
  }
}
