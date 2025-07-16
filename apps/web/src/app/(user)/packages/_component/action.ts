import { AxiosRequest } from '@/lib/axios';
import { IPackages, PackageFormData } from '@repo/validation';

export async function getPackages() {
  try {
    const packages = await AxiosRequest.get<IPackages[]>('/packages');
    return { packages };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching packages.';
    return { error: errorMessage, packages: [] };
  }
}

export async function getPackage(id: string) {
  try {
    const packageData = await AxiosRequest.get<PackageFormData>(
      `/packages/${id}`,
    );
    return { packageData };
  } catch (error: any) {
    const errorMessage =
      error.message ?? 'An error occurred while fetching packages.';
    return { error: errorMessage, packages: [] };
  }
}
