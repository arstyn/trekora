import { AxiosRequest } from "@/lib/axios";
import { IUser } from "@repo/api/user/user.entity";

export async function getUser(userID: string) {
  try {
    const user = await AxiosRequest.get<IUser[]>(`/users/${userID}`);
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
