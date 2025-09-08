import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  ISystemOverview,
  ISuperAdminSchool,
  ISuperAdminUser,
  ISystemMetrics,
  ISuperAdminAnalyticsData,
  ISystemHealth,
  ISubscriptionAnalytics,
  ISchoolComparison,
  IGeographicReport,
  IAuditLog,
  IAuditMetrics,
  IAuditFilters,
  ISchoolFilters,
  IUserFilters,
  ICreateSchoolRequest,
  IUpdateSchoolRequest,
  IBulkUserUpdateRequest,
  IBulkOperationResult,
  IPermission,
  IRole,
  IDelegatedAccount,
  ICreateDelegatedAccountRequest,
  IUpdateDelegatedAccountRequest,
  ISuperAdminLoginRequest,
  ISuperAdminLoginResponse,
} from '@academia-pro/types/super-admin';
import { PaginatedResponse } from '@academia-pro/types/shared';
import { GLOBAL_API_URL } from '../globalURLs';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';

export const superAdminApi = createApi({
  reducerPath: 'superAdminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: GLOBAL_API_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: [
    'Schools',
    'Users',
    'Analytics',
    'SystemHealth',
    'SystemOverview',
    'SystemMetrics',
    'SubscriptionAnalytics',
    'SchoolComparison',
    'GeographicReport',
    'AuditLogs',
    'AuditMetrics',
    'DelegatedAccounts',
    'Permissions',
    'Roles',
  ],
  endpoints: (builder) => ({
    // Super Admin Authentication
    superAdminLogin: builder.mutation<ISuperAdminLoginResponse, ISuperAdminLoginRequest>({
      query: (credentials) => ({
        url: '/super-admin/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // System Overview
    getSystemOverview: builder.query<ISystemOverview, void>({
      query: () => '/super-admin/reports/overview',
      providesTags: ['SystemOverview'],
    }),

    // School Management
    getAllSchools: builder.query<PaginatedResponse<ISuperAdminSchool>, ISchoolFilters>({
      query: (filters) => ({
        url: '/super-admin/schools',
        params: filters,
      }),
      providesTags: ['Schools'],
    }),

    getSchoolById: builder.query<ISuperAdminSchool, string>({
      query: (schoolId) => `/super-admin/schools/${schoolId}`,
      providesTags: (result, error, schoolId) => [{ type: 'Schools', id: schoolId }],
    }),

    createSchool: builder.mutation<ISuperAdminSchool, ICreateSchoolRequest>({
      query: (schoolData) => ({
        url: '/super-admin/schools',
        method: 'POST',
        body: schoolData,
      }),
      invalidatesTags: ['Schools', 'SystemOverview'],
    }),

    updateSchool: builder.mutation<ISuperAdminSchool, { schoolId: string; updates: IUpdateSchoolRequest }>({
      query: ({ schoolId, updates }) => ({
        url: `/super-admin/schools/${schoolId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { schoolId }) => [
        { type: 'Schools', id: schoolId },
        'Schools', // Also invalidate the general schools list
        'SystemOverview'
      ],
    }),

    deleteSchool: builder.mutation<void, string>({
      query: (schoolId) => ({
        url: `/super-admin/schools/${schoolId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Schools', 'SystemOverview'],
    }),

    // User Management
    createUser: builder.mutation<ISuperAdminUser, { firstName: string; lastName: string; middleName?: string; email: string; roles?: EUserRole[]; schoolId?: string; status?: EUserStatus; phone?: string }>({
      query: (userData) => ({
        url: '/super-admin/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users', 'SystemOverview'],
    }),

    getAllUsers: builder.query<PaginatedResponse<ISuperAdminUser>, IUserFilters>({
      query: (filters) => ({
        url: '/super-admin/users',
        params: filters,
      }),
      providesTags: ['Users'],
    }),

    getCrossSchoolUsers: builder.query<{ users: ISuperAdminUser[]; total: number }, IUserFilters>({
      query: (filters) => ({
        url: '/super-admin/users',
        params: filters,
      }),
      providesTags: ['Users'],
    }),

    getUserById: builder.query<ISuperAdminUser, string>({
      query: (userId) => `/super-admin/users/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Users', id: userId }],
    }),

    updateUser: builder.mutation<ISuperAdminUser, { userId: string; updates: { firstName?: string; lastName?: string; middleName?: string; email?: string; roles?: EUserRole[]; schoolId?: string; status?: EUserStatus; phone?: string } }>({
      query: ({ userId, updates }) => ({
        url: `/super-admin/users/${userId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'Users', id: userId },
        'Users', // Also invalidate the general users list
        'SystemOverview'
      ],
    }),

    bulkUpdateUsers: builder.mutation<IBulkOperationResult, IBulkUserUpdateRequest>({
      query: (bulkData) => ({
        url: '/super-admin/users/bulk',
        method: 'PATCH',
        body: bulkData,
      }),
      invalidatesTags: ['Users', 'SystemOverview'],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/super-admin/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users', 'SystemOverview'],
    }),

    reactivateUser: builder.mutation<ISuperAdminUser, string>({
      query: (userId) => ({
        url: `/super-admin/users/${userId}/reactivate`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, userId) => [
        { type: 'Users', id: userId },
        'Users',
        'SystemOverview'
      ],
    }),

    // Analytics
    getSystemAnalytics: builder.query<ISuperAdminAnalyticsData, { period: string }>({
      query: ({ period }) => ({
        url: '/super-admin/analytics',
        params: { period },
      }),
      providesTags: ['Analytics'],
    }),

    getSystemMetrics: builder.query<ISystemMetrics, void>({
      query: () => '/super-admin/metrics',
      providesTags: ['SystemMetrics'],
    }),

    // System Health
    getSystemHealth: builder.query<ISystemHealth, void>({
      query: () => '/super-admin/health',
      providesTags: ['SystemHealth'],
    }),

    // Subscription Analytics
    getSubscriptionAnalytics: builder.query<ISubscriptionAnalytics, void>({
      query: () => '/super-admin/reports/subscription',
      providesTags: ['SubscriptionAnalytics'],
    }),

    // School Comparison
    getSchoolComparison: builder.query<ISchoolComparison, { schoolIds?: string }>({
      query: ({ schoolIds }) => ({
        url: '/super-admin/comparison',
        params: { schoolIds },
      }),
      providesTags: ['SchoolComparison'],
    }),

    // Geographic Report
    getGeographicReport: builder.query<IGeographicReport, void>({
      query: () => '/super-admin/geographic',
      providesTags: ['GeographicReport'],
    }),

    // Audit Logs
    getAuditLogs: builder.query<{ logs: IAuditLog[]; total: number; pagination: { page: number; limit: number; total: number; totalPages: number } }, IAuditFilters>({
      query: (filters) => ({
        url: '/super-admin/audit/logs',
        params: filters,
      }),
      providesTags: ['AuditLogs'],
    }),

    getAuditMetrics: builder.query<IAuditMetrics, { period: string }>({
      query: ({ period }) => ({
        url: '/super-admin/audit/metrics',
        params: { period },
      }),
      providesTags: ['AuditMetrics'],
    }),

    // IAM endpoints
    getDelegatedAccounts: builder.query<IDelegatedAccount[], void>({
      query: () => '/super-admin/iam/delegated-accounts',
      providesTags: ['DelegatedAccounts'],
    }),

    getDelegatedAccountById: builder.query<IDelegatedAccount, string>({
      query: (id) => `/super-admin/iam/delegated-accounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'DelegatedAccounts', id }],
    }),

    createDelegatedAccount: builder.mutation<IDelegatedAccount, ICreateDelegatedAccountRequest>({
      query: (accountData) => ({
        url: '/super-admin/iam/delegated-accounts',
        method: 'POST',
        body: accountData,
      }),
      invalidatesTags: ['DelegatedAccounts'],
    }),

    updateDelegatedAccount: builder.mutation<IDelegatedAccount, { id: string; updates: IUpdateDelegatedAccountRequest }>({
      query: ({ id, updates }) => ({
        url: `/super-admin/iam/delegated-accounts/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DelegatedAccounts', id },
        'DelegatedAccounts'
      ],
    }),

    revokeDelegatedAccount: builder.mutation<IDelegatedAccount, string>({
      query: (id) => ({
        url: `/super-admin/iam/delegated-accounts/${id}/revoke`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'DelegatedAccounts', id },
        'DelegatedAccounts'
      ],
    }),

    suspendDelegatedAccount: builder.mutation<IDelegatedAccount, string>({
      query: (id) => ({
        url: `/super-admin/iam/delegated-accounts/${id}/suspend`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'DelegatedAccounts', id },
        'DelegatedAccounts'
      ],
    }),

    unsuspendDelegatedAccount: builder.mutation<IDelegatedAccount, string>({
      query: (id) => ({
        url: `/super-admin/iam/delegated-accounts/${id}/unsuspend`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'DelegatedAccounts', id },
        'DelegatedAccounts'
      ],
    }),

    deleteDelegatedAccount: builder.mutation<void, string>({
      query: (id) => ({
        url: `/super-admin/iam/delegated-accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DelegatedAccounts'],
    }),

    getPermissions: builder.query<IPermission[], void>({
      query: () => '/super-admin/iam/permissions',
      providesTags: ['Permissions'],
    }),

    getRoles: builder.query<IRole[], void>({
      query: () => '/super-admin/iam/roles',
      providesTags: ['Roles'],
    }),

    getRoleById: builder.query<IRole, string>({
      query: (id) => `/super-admin/iam/roles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Roles', id }],
    }),

    createRole: builder.mutation<IRole, { name: string; description?: string; permissionIds?: string[] }>({
      query: (roleData) => ({
        url: '/super-admin/iam/roles',
        method: 'POST',
        body: roleData,
      }),
      invalidatesTags: ['Roles'],
    }),

    updateRole: builder.mutation<IRole, { id: string; name?: string; description?: string; permissionIds?: string[] }>({
      query: ({ id, ...updates }) => ({
        url: `/super-admin/iam/roles/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Roles', id },
        'Roles'
      ],
    }),

    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/super-admin/iam/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),
  }),
});