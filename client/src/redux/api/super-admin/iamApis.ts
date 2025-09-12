import { baseApi } from '../baseApi';

import type {
  ISuperAdminUser,
  ISuperAdminUsersListResponse,
  IRole,
  IPermission,
  IDelegatedAccount,
  ICreateDelegatedAccountRequest,
  IUpdateDelegatedAccountRequest,
  IRolesResponse,
  IPermissionsResponse,
  IDelegatedAccountsResponse,
  IUserFilters,
  IBulkUserUpdateRequest,
  IBulkOperationResult,
  IAuditLogsResponse
} from '@academia-pro/types/super-admin';

export const iamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // User Management
    getUsers: builder.query<ISuperAdminUsersListResponse, IUserFilters>({
      query: (filters) => ({
        url: '/super-admin/users',
        params: filters,
      }),
      providesTags: ['Users'],
    }),

    getUserById: builder.query<ISuperAdminUser, string>({
      query: (id) => `/super-admin/users/${id}`,
      providesTags: (result, error, id) => [{ type: 'Users', id }],
    }),

    createUser: builder.mutation<ISuperAdminUser, {
      firstName: string;
      lastName: string;
      middleName?: string;
      email: string;
      roles: string[];
      schoolId?: string;
      phone?: string;
      sendWelcomeEmail?: boolean;
    }>({
      query: (userData) => ({
        url: '/super-admin/users',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Users'],
    }),

    updateUser: builder.mutation<ISuperAdminUser, {
      id: string;
      updates: Partial<ISuperAdminUser>;
    }>({
      query: ({ id, updates }) => ({
        url: `/super-admin/users/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Users', id },
        'Users'
      ],
    }),

    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/super-admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Users'],
    }),

    bulkUpdateUsers: builder.mutation<IBulkOperationResult, IBulkUserUpdateRequest>({
      query: (data) => ({
        url: '/super-admin/users/bulk-update',
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),

    // Role Management
    getRoles: builder.query<IRolesResponse, { page?: number; limit?: number }>({
      query: (params) => ({
        url: '/super-admin/roles',
        params,
      }),
      providesTags: ['Roles'],
    }),

    getRoleById: builder.query<IRole, string>({
      query: (id) => `/super-admin/roles/${id}`,
      providesTags: (result, error, id) => [{ type: 'Roles', id }],
    }),

    createRole: builder.mutation<IRole, {
      name: string;
      description: string;
      permissions: string[];
    }>({
      query: (roleData) => ({
        url: '/super-admin/roles',
        method: 'POST',
        body: roleData,
      }),
      invalidatesTags: ['Roles'],
    }),

    updateRole: builder.mutation<IRole, {
      id: string;
      updates: Partial<IRole>;
    }>({
      query: ({ id, updates }) => ({
        url: `/super-admin/roles/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Roles', id },
        'Roles'
      ],
    }),

    deleteRole: builder.mutation<void, string>({
      query: (id) => ({
        url: `/super-admin/roles/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Roles'],
    }),

    // Permission Management
    getPermissions: builder.query<IPermissionsResponse, void>({
      query: () => '/super-admin/permissions',
      providesTags: ['Permissions'],
    }),

    createPermission: builder.mutation<IPermission, {
      name: string;
      description: string;
      resource: string;
      action: string;
    }>({
      query: (permissionData) => ({
        url: '/super-admin/permissions',
        method: 'POST',
        body: permissionData,
      }),
      invalidatesTags: ['Permissions'],
    }),

    updatePermission: builder.mutation<IPermission, {
      id: string;
      updates: Partial<IPermission>;
    }>({
      query: ({ id, updates }) => ({
        url: `/super-admin/permissions/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Permissions'],
    }),

    deletePermission: builder.mutation<void, string>({
      query: (id) => ({
        url: `/super-admin/permissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Permissions'],
    }),

    // Delegated Accounts
    getDelegatedAccounts: builder.query<IDelegatedAccountsResponse, {
      page?: number;
      limit?: number;
      status?: string;
    }>({
      query: (params) => ({
        url: '/super-admin/delegated-accounts',
        params,
      }),
      providesTags: ['DelegatedAccounts'],
    }),

    getDelegatedAccountById: builder.query<IDelegatedAccount, string>({
      query: (id) => `/super-admin/delegated-accounts/${id}`,
      providesTags: (result, error, id) => [{ type: 'DelegatedAccounts', id }],
    }),

    createDelegatedAccount: builder.mutation<IDelegatedAccount, ICreateDelegatedAccountRequest>({
      query: (accountData) => ({
        url: '/super-admin/delegated-accounts',
        method: 'POST',
        body: accountData,
      }),
      invalidatesTags: ['DelegatedAccounts'],
    }),

    updateDelegatedAccount: builder.mutation<IDelegatedAccount, {
      id: string;
      updates: IUpdateDelegatedAccountRequest;
    }>({
      query: ({ id, updates }) => ({
        url: `/super-admin/delegated-accounts/${id}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DelegatedAccounts', id },
        'DelegatedAccounts'
      ],
    }),

    revokeDelegatedAccount: builder.mutation<void, {
      id: string;
      reason?: string;
    }>({
      query: ({ id, reason }) => ({
        url: `/super-admin/delegated-accounts/${id}/revoke`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'DelegatedAccounts', id },
        'DelegatedAccounts'
      ],
    }),

    deleteDelegatedAccount: builder.mutation<void, string>({
      query: (id) => ({
        url: `/super-admin/delegated-accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['DelegatedAccounts'],
    }),

    // User Authentication & Sessions
    resetUserPassword: builder.mutation<void, {
      userId: string;
      sendEmail?: boolean;
    }>({
      query: ({ userId, sendEmail }) => ({
        url: `/super-admin/users/${userId}/reset-password`,
        method: 'POST',
        body: { sendEmail },
      }),
    }),

    getUserSessions: builder.query<Array<{
      id: string;
      deviceInfo: string;
      ipAddress: string;
      userAgent: string;
      lastActivity: string;
      createdAt: string;
      isActive: boolean;
    }>, string>({
      query: (userId) => `/super-admin/users/${userId}/sessions`,
    }),

    terminateUserSession: builder.mutation<void, {
      userId: string;
      sessionId: string;
    }>({
      query: ({ userId, sessionId }) => ({
        url: `/super-admin/users/${userId}/sessions/${sessionId}`,
        method: 'DELETE',
      }),
    }),

    terminateAllUserSessions: builder.mutation<void, {
      userId: string;
      exceptCurrent?: boolean;
    }>({
      query: ({ userId, exceptCurrent }) => ({
        url: `/super-admin/users/${userId}/sessions`,
        method: 'DELETE',
        body: { exceptCurrent },
      }),
    }),

    // User Activity & Audit
    getUserActivity: builder.query<Array<{
      id: string;
      action: string;
      resource: string;
      timestamp: string;
      ipAddress: string;
      userAgent: string;
      details?: Record<string, unknown>;
    }>, {
      userId: string;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }>({
      query: ({ userId, ...params }) => ({
        url: `/super-admin/users/${userId}/activity`,
        params,
      }),
    }),

    // Bulk Operations
    bulkDeleteUsers: builder.mutation<IBulkOperationResult, {
      userIds: string[];
      reason?: string;
    }>({
      query: (data) => ({
        url: '/super-admin/users/bulk-delete',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),

    bulkAssignRoles: builder.mutation<IBulkOperationResult, {
      userIds: string[];
      roleIds: string[];
    }>({
      query: (data) => ({
        url: '/super-admin/users/bulk-assign-roles',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useBulkUpdateUsersMutation,
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useCreatePermissionMutation,
  useUpdatePermissionMutation,
  useDeletePermissionMutation,
  useGetDelegatedAccountsQuery,
  useGetDelegatedAccountByIdQuery,
  useCreateDelegatedAccountMutation,
  useUpdateDelegatedAccountMutation,
  useRevokeDelegatedAccountMutation,
  useDeleteDelegatedAccountMutation,
  useResetUserPasswordMutation,
  useGetUserSessionsQuery,
  useTerminateUserSessionMutation,
  useTerminateAllUserSessionsMutation,
  useGetUserActivityQuery,
  useBulkDeleteUsersMutation,
  useBulkAssignRolesMutation,
} = iamApi;