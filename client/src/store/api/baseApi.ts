import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/store';

// Base API configuration for Academia Pro
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
    prepareHeaders: (headers, { getState }) => {
      // Get token from auth state
      const token = (getState() as RootState)?.auth?.token;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      headers.set('Content-Type', 'application/json');

      return headers;
    },
    credentials: 'include',
  }),
  endpoints: () => ({}),
  tagTypes: [
    'Schools',
    'Users',
    'Analytics',
    'SystemHealth',
    'Auth',
    'SystemOverview',
    'SystemMetrics',
    'Activities',
    'Alerts',
  ],
});

// Export hooks for usage in components
export const {
  usePrefetch,
} = baseApi;