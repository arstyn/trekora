'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { AxiosRequest } from './axios';
import { validateJwt } from './jwt-util';
import { JWTPayload } from 'jose';
import { IRefreshResponseDto } from '@repo/api/auth/dto/auth.types';

export const refreshToken = async () => {
  const refreshToken = cookies().get('refreshToken')?.value;
  if (!refreshToken) {
    return null;
  }
  await validateJwt(refreshToken);
  const { accessToken } = await AxiosRequest.post<
    { refreshToken: string },
    { accessToken: string }
  >('/auth/refresh-token', { refreshToken });
  cookies().set('accessToken', accessToken, { httpOnly: true });
  return accessToken;
};

export const logout = async () => {
  // todo: Clear Refresh Token from db

  cookies().delete('accessToken');
  cookies().delete('refreshToken');

  redirect('/');
};

export const getSession = async () => {
  const token = await getAccessToken();
  if (!token) {
    return null;
  }
  const data = await validateJwt(token);
  return data;
};

export const getAccessToken = async () => {
  const token = cookies().get('accessToken')?.value;
  if (!token) {
    return null;
  }
  try {
    const decodedToken = await validateJwt(token);
    if (
      decodedToken &&
      decodedToken.exp &&
      decodedToken.exp * 1000 > Date.now()
    ) {
      return token;
    } else {
      return refreshToken();
    }
  } catch (e) {
    console.log('error', e);
  }
};

export async function getNewAccessToken() {
  let session: JWTPayload | null;

  try {
    const refreshToken = cookies().get('refreshToken')?.value;

    if (!refreshToken) {
      return null;
    }

    const { accessToken } = await AxiosRequest.post<
      { refreshToken: string },
      IRefreshResponseDto
    >('/auth/refresh-token', { refreshToken });

    cookies().set('accessToken', accessToken, { httpOnly: true });
    session = await getSession();
    if (session) {
      redirect('/dashboard');
    }
  } catch (error) {
    return null;
  }
}
