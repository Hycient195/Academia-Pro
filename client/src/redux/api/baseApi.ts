import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { GLOBAL_API_URL } from '../globalURLs';

// Base API configuration for Academia Pro
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: GLOBAL_API_URL,
    prepareHeaders: (headers) => {
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