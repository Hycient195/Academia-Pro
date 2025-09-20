import { createApi, fetchBaseQuery, FetchArgs } from '@reduxjs/toolkit/query/react';
import { GLOBAL_API_URL } from '../globalURLs';
import type { RootState } from '../store';
import type { BaseQueryApi } from '@reduxjs/toolkit/query';

// Helper function to get cookie value
const getCookieValue = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

// Custom base query with cookie + header authentication
const customBaseQuery = fetchBaseQuery({
  baseUrl: GLOBAL_API_URL,
  prepareHeaders: (headers, { getState }) => {
    headers.set('Content-Type', 'application/json');

    // Get token from Redux state (populated from cookies)
    const state = getState() as RootState;
    const token = state?.auth?.token;

    // Also try to get token directly from cookies as fallback
    const cookieToken = getCookieValue('accessToken') || getCookieValue('superAdminAccessToken');

    // Use token from Redux state or directly from cookies
    const authToken = token || cookieToken;

    if (authToken) {
      headers.set('Authorization', `Bearer ${authToken}`);
    }

    return headers;
  },
  credentials: 'include', // Send cookies with requests
});


// Base API configuration for Academia Pro
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: customBaseQuery,
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
    'Department',
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
    'DelegatedSchoolAdmins',
  ],
});