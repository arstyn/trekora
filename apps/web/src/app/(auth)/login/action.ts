'use server';

import { cookies } from 'next/headers';
import { LoginFormValues } from './_component/login-form';
import { AxiosRequest } from '@/lib/axios';
import { getSession } from '@/lib/auth.utils';
import { redirect } from 'next/navigation';
import { JWTPayload } from 'jose';
import { ILoginDto, ILoginResponse } from '@repo/api/auth/dto/auth.types';

export async function login(formData: LoginFormValues) {
  const { email, password } = formData;

  let session: JWTPayload | null;

  try {
    const { accessToken, refreshToken } = await AxiosRequest.post<
      ILoginDto,
      ILoginResponse
    >('/auth/login', {
      email,
      password,
    });

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
