import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GLOBAL_API_URL } from '../../globalURLs';

import type { IAuthUser, ILoginRequest, ILoginResponse, IRegisterRequest, IChangePasswordRequest, IChangePasswordResponse } from '@academia-pro/types/auth';

export const commonApis = createApi({
  reducerPath: 'superAdminGeneralApis',
  baseQuery: fetchBaseQuery({
    baseUrl: GLOBAL_API_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['SuperAdminAuth'],
  endpoints: (builder) => ({
    superAdminLogin: builder.mutation<ILoginResponse, ILoginRequest>({
      query: (credentials) => ({
        url: '/auth/super-admin/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    refreshToken: builder.mutation<{ token: string }, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/super-admin/refresh',
        method: 'POST',
        body: data,
      }),
    }),

    changePassword: builder.mutation<IChangePasswordResponse, IChangePasswordRequest>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SuperAdminAuth'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),

    getProfile: builder.query<IAuthUser, void>({
      query: () => '/auth/me',
      providesTags: ['SuperAdminAuth'],
    }),
  }),
});

export const {
  useSuperAdminLoginMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useChangePasswordMutation,
} = commonApis;