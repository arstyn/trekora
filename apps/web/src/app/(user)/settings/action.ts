'use server';

import { AxiosRequest } from '@/lib/axios';
import { IUser } from '@repo/api/user/user.entity';
import { IEmployeeCreateDTO } from '@repo/api/employee/dto/create-employee.dto';
import { cookies } from 'next/headers';
import { useRouter } from 'next/router';

export async function getUser() {
  try {
    const user = await AxiosRequest.get<any>(`/employee/profile`);
    return { user };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching user details.';
    return { error: errorMessage, user: [] };
  }
}

export async function updateUser(id: string, updatedUser: IEmployeeCreateDTO) {
  try {
    const user = await AxiosRequest.put<IEmployeeCreateDTO, IUser>(
      `/employee/${id}`,
      updatedUser,
    );
    return { user };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while updating user details.';
    return { error: errorMessage };
  }
}

export async function logout() {
  try {
    const response = await AxiosRequest.post<
      {},
      { success: boolean; message: string }
    >('/auth/logout', {});

    if (response?.success) {
      const cookieStore = cookies();
      cookieStore.delete('accessToken');
      cookieStore.delete('x');
    }

    return response;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ??
      error.message ??
      'An error occurred while logging out.';
    return { error: errorMessage };
  }
}
