'use server';

import { AxiosRequest } from '@/lib/axios';

type ResendActivationResult = {
  success: boolean;
  message: string;
};

export async function resendActivation(
  email: string,
): Promise<ResendActivationResult> {
  try {
    if (!email || !email.includes('@')) {
      return {
        success: false,
        message: 'Please enter a valid email address.',
      };
    }
    await AxiosRequest.post('/auth/resend-activation', { email });
    return {
      success: true,
      message:
        'If your email is registered and not yet activated, a new activation link has been sent.',
    };
  } catch (error: any) {
    return {
      success: false,
      message:
        error.message ??
        'An error occurred while sending the activation link. Please try again.',
    };
  }
}
