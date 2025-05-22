/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { getAccessToken } from './auth.utils';

// Create an Axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND ?? 'http://localhost:3000/api', // Replace with your base URL
  timeout: 5000, // Set a timeout limit
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response && error.response.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error.message);
  },
);

class AxiosRequestClass {
  get = async <RESPONSE>(url: string, params?: any): Promise<RESPONSE> => {
    try {
      const { data } = await axiosInstance.get(url, params);
      return data;
    } catch (error: any) {
      if (error.response?.data || error?.message || error?.error) {
        throw new Error(error.response?.data || error?.message || error?.error);
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  };

  patch = async <BODY, RESPONSE>(
    url: string,
    body: BODY,
  ): Promise<RESPONSE> => {
    try {
      const { data } = await axiosInstance.patch(url, body);
      return data;
    } catch (error: any) {
      if (error) {
        throw new Error(error.response?.data || error?.message || error?.error);
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  };

  put = async <BODY, RESPONSE>(url: string, body: BODY): Promise<RESPONSE> => {
    try {
      const { data } = await axiosInstance.put(url, body);
      return data;
    } catch (error: any) {
      if (error) {
        throw new Error(error.response?.data || error?.message || error?.error);
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  };

  post = async <BODY, RESPONSE>(url: string, body: BODY): Promise<RESPONSE> => {
    try {
      const response = await axiosInstance.post(url, body);
      return response.data;
    } catch (error: any) {
      if (error) {
        throw new Error(error.response?.data || error?.message || error?.error);
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  };

  delete = async <RESPONSE>(url: string): Promise<RESPONSE> => {
    try {
      const { data } = await axiosInstance.delete(url);

      return data;
    } catch (error: any) {
      if (error) {
        throw new Error(error.response?.data || error?.message || error?.error);
      } else {
        throw new Error('An unexpected error occurred');
      }
    }
  };
}
const AxiosRequest = new AxiosRequestClass();

export { AxiosRequest };
