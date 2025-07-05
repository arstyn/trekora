'use server';

import { AxiosRequest } from '@/lib/axios';

type ActivationResult = {
  success: boolean;
  message: string;
  status: 'success' | 'error' | 'expired' | 'invalid' | 'already_active';
};

export async function activateUser(token: string): Promise<ActivationResult> {
  try {
    // Mock validation - replace with your actual database logic
    if (!token || token.length < 10) {
      return {
        success: false,
        message: 'Invalid activation token',
        status: 'invalid',
      };
    }

    await AxiosRequest.post(`/auth/activate-user/${token}`, {});
    return {
      success: true,
      message: 'Your account has been successfully activated!',
      status: 'success',
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.message ??
        'An error occurred while activating your account. Please try again.',
      status: 'error',
    };
  }
}
