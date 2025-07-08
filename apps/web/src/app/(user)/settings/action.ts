import { AxiosRequest } from "@/lib/axios";
import { IEmployee } from "@repo/api/employee/employee.entity";
import { IUser } from "@repo/api/user/user.entity";
import { UserProfile } from "./_component/user-profile-section";
import { IEmployeeCreateDTO } from "@repo/api/employee/dto/create-employee.dto";

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
