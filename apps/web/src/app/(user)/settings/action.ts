import { AxiosRequest } from "@/lib/axios";
import { IEmployee } from "@repo/api/employee/employee.entity";
import { IUser } from "@repo/api/user/user.entity";

export async function getUser(emploeyeeID: string) {
  try {
    const user = await AxiosRequest.get<any>(`/employee/${emploeyeeID}/profile`);
    return { user };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching user details.';
    return { error: errorMessage, user: [] };
  }
}

export async function updateUser(id: string, updatedUser: IUser) {
  try {
    const user = await AxiosRequest.put<IUser, IUser>(
      `/users/${id}`,
      updatedUser,
    );
    return { user };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while updating user details.';
    return { error: errorMessage };
  }
}
