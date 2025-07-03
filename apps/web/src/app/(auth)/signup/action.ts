'use server';

import { getSession } from '@/lib/auth.utils';
import { AxiosRequest } from '@/lib/axios';
import { ILoginResponse } from '@repo/api/auth/dto/auth.types';
import { SignupFormDTO } from '@repo/validation';
import { JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signup(formData: SignupFormDTO): Promise<{ error?: string }> {
  let session: JWTPayload | null;

  try {
    const response = await AxiosRequest.post<SignupFormDTO, ILoginResponse>(
      '/auth/signup',
      formData
    );

    if (!response?.accessToken || !response?.refreshToken) {
      return { error: 'Invalid response from server' };
    }

    cookies().set('accessToken', response.accessToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    cookies().set('x', response.refreshToken, { 
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    session = await getSession();

    if (!session) {
      return { error: 'Failed to create session' };
    }

  } catch (error: any) {
    console.error('Signup error:', error);
    return { 
      error: error?.response?.data?.message || error?.message || 'An error occurred during signup'
    };
  }

  redirect('/dashboard');
}
