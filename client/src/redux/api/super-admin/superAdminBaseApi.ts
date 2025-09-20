import { createApi, fetchBaseQuery, FetchArgs } from '@reduxjs/toolkit/query/react';
import { GLOBAL_API_URL } from '../../globalURLs';
import type { RootState } from '../../store';
import type { BaseQueryApi } from '@reduxjs/toolkit/query';

// Shared header key (align with server and common)
const HEADER_X_SCHOOL_ID = 'x-school-id';

// Helper function to get super admin CSRF token from cookies
const getSuperAdminCSRFTokenFromCookies = (): string | null => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'superAdminCsrfToken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

// Helper to read active school from localStorage (fallback when store isn't ready)
const getActiveSchoolIdFromStorage = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('activeSchoolId');
  } catch {
    return null;
  }
};

// Custom base query with CSRF support for super admin
const customSuperAdminBaseQuery = fetchBaseQuery({
  baseUrl: GLOBAL_API_URL,
  prepareHeaders: (headers, { getState }) => {
    headers.set('Content-Type', 'application/json');
    // Attach Authorization header when token is present to avoid relying solely on cookies
    const state = getState() as RootState;
    const token = state?.auth?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    // Inject x-school-id if available (supports cross-school operations where applicable)
    const activeSchoolId = state?.school?.activeSchoolId || getActiveSchoolIdFromStorage();
    if (activeSchoolId) {
      headers.set(HEADER_X_SCHOOL_ID, activeSchoolId);
    }
    return headers;
  },
  credentials: 'include',
});

// Wrapper to add CSRF token for non-GET requests for super admin
const superAdminBaseQueryWithCSRF = async (args: string | FetchArgs, api: BaseQueryApi, extraOptions: object) => {
  // Determine if this is a mutation (non-GET request)
  let isMutation = false;
  let method = 'GET';

  if (typeof args === 'object') {
    method = args.method || 'GET';
    // Check if method indicates a mutation
    isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase());
  }

  console.log('Frontend Super Admin CSRF Debug:', {
    url: typeof args === 'object' ? args.url : args,
    method,
    isMutation,
    cookies: typeof document !== 'undefined' ? document.cookie : 'no document',
    allCookies: typeof document !== 'undefined' ? Object.fromEntries(document.cookie.split(';').map(c => c.trim().split('='))) : 'no document',
  });

  // For mutations, add CSRF token
  if (isMutation) {
    const csrfToken = getSuperAdminCSRFTokenFromCookies();
    console.log('Frontend Super Admin CSRF Debug - Mutation:', {
      csrfToken: csrfToken ? '[PRESENT]' : '[MISSING]',
      csrfTokenValue: csrfToken,
      csrfTokenLength: csrfToken?.length,
      cookieNames: typeof document !== 'undefined' ? document.cookie.split(';').map(c => c.trim().split('=')[0]) : [],
    });

    if (csrfToken) {
      if (typeof args === 'object') {
        args = { ...args, headers: { ...args.headers, 'X-CSRF-Token': csrfToken } };
        console.log('Frontend Super Admin CSRF Debug - Added token to headers:', {
          headerValue: csrfToken,
          finalHeaders: args.headers,
        });
      }
    } else {
      console.log('Frontend Super Admin CSRF Debug - No CSRF token found, not adding to headers');
    }
  }

  return customSuperAdminBaseQuery(args, api, extraOptions);
};

// Base API configuration for Super Admin Academia Pro
export const superAdminBaseApi = createApi({
  reducerPath: 'superAdminBaseApi',
  baseQuery: superAdminBaseQueryWithCSRF,
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
  ],
});