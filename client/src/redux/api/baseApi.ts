import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GLOBAL_API_URL } from '../globalURLs';
import type { RootState } from '../store';

// Base API configuration for Academia Pro
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: GLOBAL_API_URL,
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json');
      // Attach Authorization header when token is present to avoid relying solely on cookies
      const state = getState() as RootState;
      const token = state?.auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
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