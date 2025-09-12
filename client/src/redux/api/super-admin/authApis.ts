import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GLOBAL_API_URL } from '../../globalURLs';

import type { IAuthUser, ILoginRequest, ILoginResponse, IChangePasswordRequest, IChangePasswordResponse } from '@academia-pro/types/auth';

export const superAdminAuthApi = createApi({
  reducerPath: 'superAdminAuthApi',
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

    superAdminRefreshToken: builder.mutation<{ token: string }, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/super-admin/refresh',
        method: 'POST',
        body: data,
      }),
    }),

    superAdminChangePassword: builder.mutation<IChangePasswordResponse, IChangePasswordRequest>({
      query: (data) => ({
        url: '/auth/super-admin/change-password',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SuperAdminAuth'],
    }),

    superAdminLogout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/super-admin/logout',
        method: 'POST',
      }),
    }),

    getSuperAdminProfile: builder.query<IAuthUser, void>({
      query: () => '/auth/super-admin/me',
      providesTags: ['SuperAdminAuth'],
    }),
  }),
});

export const {
  useSuperAdminLoginMutation,
  useSuperAdminRefreshTokenMutation,
  useSuperAdminLogoutMutation,
  useGetSuperAdminProfileQuery,
  useSuperAdminChangePasswordMutation,
} = superAdminAuthApi;