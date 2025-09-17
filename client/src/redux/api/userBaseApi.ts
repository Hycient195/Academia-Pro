import { createApi, fetchBaseQuery, FetchArgs } from '@reduxjs/toolkit/query/react';
import { GLOBAL_API_URL } from '../globalURLs';
import type { RootState } from '../store';
import type { BaseQueryApi } from '@reduxjs/toolkit/query';

// Helper function to get CSRF token from cookies
const getCSRFTokenFromCookies = (): string | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrfToken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Custom base query with CSRF support
const customBaseQuery = fetchBaseQuery({
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
});

// Wrapper to add CSRF token for non-GET requests
const baseQueryWithCSRF = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: object) => {
  // Determine if this is a mutation (non-GET request)
  let isMutation = false;
  let method = 'GET';

  if (typeof args === 'object') {
    method = args.method || 'GET';
    // Check if method indicates a mutation
    isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }

  // For mutations, add CSRF token
  if (isMutation) {
    const csrfToken = getCSRFTokenFromCookies();

    if (csrfToken) {
      if (typeof args === 'object') {
        args = { ...args, headers: { ...args.headers, 'X-CSRF-Token': csrfToken } };
      }
    } else {
      console.log('Frontend CSRF Debug - No CSRF token found, not adding to headers');
    }
  }

  return customBaseQuery(args, api, extraOptions);
};

// Base API configuration for Academia Pro
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithCSRF,
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
    'Students',
    'Staff',
    'Academic',
    'Attendance',
    'Examination',
    'Fee',
    'Communication',
    'Reports',
    'Timetable',
    'Library',
    'Inventory',
    'Transportation',
    'Hostel',
    'ParentPortal',
    'StudentPortal',
    'AuditLogs',
    'AuditMetrics',
    'Dashboard',
    'Roles',
    'Permissions',
    'DelegatedAccounts',
    'Subscriptions',
    'Settings',
    'System',
    'Health',
    'Metrics',
    'Logs',
    'SchoolOverview',
  ],
});