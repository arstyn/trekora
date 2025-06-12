import { AxiosRequest } from '@/lib/axios';
import { IBranch } from '@repo/api/branch/branch.entity';
import { IBranchCreateDTO } from '@repo/api/branch/dto/create-branch.dto';
import { IBranchUpdateDTO } from '@repo/api/branch/dto/update-branch.dto';

export async function getBranches() {
  try {
    const branches = await AxiosRequest.get<IBranch[]>('/branches');
    return { branches };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching branches.';
    return { error: errorMessage, branches: [] };
  }
}

export async function createBranch(branchData: IBranchCreateDTO) {
  try {
    const branch = await AxiosRequest.post<IBranchCreateDTO, IBranch>(
      '/branches',
      branchData,
    );
    return { branch };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while creating branch.';
    return { error: errorMessage };
  }
}

export async function updateBranch(
  id: string,
  branchData: IBranchUpdateDTO,
) {
  try {
    const branch = await AxiosRequest.put<IBranchUpdateDTO, IBranch>(
      `/branches/${id}`,
      branchData,
    );
    return { branch };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while updating branch.';
    return { error: errorMessage };
  }
}

export async function deleteBranch(id: string) {
  try {
    const branch = await AxiosRequest.delete<IBranchUpdateDTO>(`/branches/${id}`);
    return { branch };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while deleting branch.';
    return { error: errorMessage };
  }
}
