import { baseApi } from './userBaseApi';
import { setCredentials, logout, updateToken } from '../slices/authSlice';
import type { RootState } from '../store';

import type { IAuthUser, IAuthTokens, ILoginRequest, ILoginResponse, IRegisterRequest, IChangePasswordRequest, IChangePasswordResponse } from '@academia-pro/types/auth';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ILoginResponse, ILoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({
            user: { ...data.user, permissions: [] },
            token: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
          }));
        } catch (error) {
          console.error('Login failed:', error);
        }
      },
    }),

    register: builder.mutation<ILoginResponse, IRegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials({
            user: { ...data.user, permissions: [] },
            token: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
          }));
        } catch (error) {
          console.error('Register failed:', error);
        }
      },
    }),

    refreshToken: builder.mutation<IAuthTokens, { refreshToken: string }>({
      query: (data) => ({
        url: '/auth/refresh',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          const { data } = await queryFulfilled;
          const state = getState() as RootState;
          const currentUser = state.auth.user;
          if (currentUser) {
            dispatch(setCredentials({
              user: currentUser,
              token: data.accessToken,
              refreshToken: data.refreshToken,
            }));
          } else {
            // If no user, just update tokens
            dispatch(updateToken(data.accessToken));
          }
        } catch (error) {
          console.error('Refresh token failed:', error);
        }
      },
    }),

    changePassword: builder.mutation<IChangePasswordResponse, IChangePasswordRequest>({
      query: (data) => ({
        url: '/auth/change-password',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auth'],
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logout());
        } catch (error) {
          console.error('Logout failed:', error);
        }
      },
    }),

    getProfile: builder.query<IAuthUser, void>({
      query: () => '/auth/me',
      providesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useChangePasswordMutation,
} = authApi;