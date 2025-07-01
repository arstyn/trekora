'use server';

import { getSession } from '@/lib/auth.utils';
import { AxiosRequest } from '@/lib/axios';
import { ILoginResponse } from '@repo/api/auth/dto/auth.types';
import { SignupFormDTO } from '@repo/validation';
import { JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function signup(formData: SignupFormDTO) {
  let session: JWTPayload | null;

  try {
    const { accessToken, refreshToken } = await AxiosRequest.post<
      SignupFormDTO,
      ILoginResponse
    >('/auth/signup', formData);

    cookies().set('accessToken', accessToken, { httpOnly: true });
    cookies().set('x', refreshToken, { httpOnly: true });
    session = await getSession();
  } catch (error) {
    throw Error(error as string);
  }

  if (session) {
    redirect('/dashboard');
  }
}
