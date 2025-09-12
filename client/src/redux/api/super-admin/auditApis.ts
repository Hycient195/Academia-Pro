import { baseApi } from '../baseApi';

import type {
  IAuditLog,
  IAuditMetrics,
  IAuditFilters,
  IAuditLogsResponse,
  IAuditMetricsResponse
} from '@academia-pro/types/super-admin';

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get audit logs with filtering and pagination
    getAuditLogs: builder.query<IAuditLogsResponse, IAuditFilters>({
      query: (filters) => ({
        url: '/super-admin/audit/logs',
        params: filters,
      }),
      providesTags: ['AuditLogs'],
    }),

    // Get audit metrics
    getAuditMetrics: builder.query<IAuditMetricsResponse, { period?: string; schoolId?: string }>({
      query: (params) => ({
        url: '/super-admin/audit/metrics',
        params,
      }),
      providesTags: ['AuditMetrics'],
    }),

    // Get audit log by ID
    getAuditLogById: builder.query<IAuditLog, string>({
      query: (id) => `/super-admin/audit/logs/${id}`,
      providesTags: (result, error, id) => [{ type: 'AuditLogs', id }],
    }),

    // Search audit logs
    searchAuditLogs: builder.query<IAuditLogsResponse, {
      query: string;
      filters?: IAuditFilters;
    }>({
      query: ({ query, filters }) => ({
        url: '/super-admin/audit/search',
        params: { query, ...filters },
      }),
      providesTags: ['AuditLogs'],
    }),

    // Export audit logs
    exportAuditLogs: builder.mutation<Blob, {
      filters: IAuditFilters;
      format: 'csv' | 'excel' | 'pdf';
    }>({
      query: ({ filters, format }) => ({
        url: '/super-admin/audit/export',
        method: 'POST',
        body: { filters, format },
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Get audit statistics
    getAuditStatistics: builder.query<{
      totalLogs: number;
      logsBySeverity: Record<string, number>;
      logsByAction: Record<string, number>;
      logsByResource: Record<string, number>;
      recentActivity: IAuditLog[];
      suspiciousActivities: IAuditLog[];
    }, { period?: string }>({
      query: (params) => ({
        url: '/super-admin/audit/statistics',
        params,
      }),
      providesTags: ['AuditMetrics'],
    }),

    // Get security events
    getSecurityEvents: builder.query<IAuditLogsResponse, {
      severity?: 'high' | 'critical';
      period?: string;
    }>({
      query: (params) => ({
        url: '/super-admin/audit/security-events',
        params,
      }),
      providesTags: ['AuditLogs'],
    }),

    // Archive old audit logs
    archiveAuditLogs: builder.mutation<{
      archived: number;
      totalProcessed: number;
    }, {
      olderThan: string; // ISO date string
      retentionPeriod?: number; // days
    }>({
      query: (data) => ({
        url: '/super-admin/audit/archive',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['AuditLogs', 'AuditMetrics'],
    }),

    // Delete audit logs (admin only)
    deleteAuditLogs: builder.mutation<{
      deleted: number;
      totalProcessed: number;
    }, {
      ids?: string[];
      filters?: IAuditFilters;
    }>({
      query: (data) => ({
        url: '/super-admin/audit/delete',
        method: 'DELETE',
        body: data,
      }),
      invalidatesTags: ['AuditLogs', 'AuditMetrics'],
    }),

    // Get audit configuration
    getAuditConfig: builder.query<{
      retentionPeriod: number;
      archiveAfter: number;
      enableRealTime: boolean;
      sensitiveActions: string[];
      excludedUsers: string[];
      alertThresholds: {
        suspiciousActivitiesPerHour: number;
        failedLoginsPerHour: number;
        criticalEventsPerHour: number;
      };
    }, void>({
      query: () => '/super-admin/audit/config',
    }),

    // Update audit configuration
    updateAuditConfig: builder.mutation<void, {
      retentionPeriod?: number;
      archiveAfter?: number;
      enableRealTime?: boolean;
      sensitiveActions?: string[];
      excludedUsers?: string[];
      alertThresholds?: {
        suspiciousActivitiesPerHour?: number;
        failedLoginsPerHour?: number;
        criticalEventsPerHour?: number;
      };
    }>({
      query: (config) => ({
        url: '/super-admin/audit/config',
        method: 'PATCH',
        body: config,
      }),
    }),

    // Get audit alerts
    getAuditAlerts: builder.query<Array<{
      id: string;
      type: 'suspicious-activity' | 'security-breach' | 'unusual-pattern' | 'compliance-violation';
      severity: 'low' | 'medium' | 'high' | 'critical';
      message: string;
      details: Record<string, any>;
      timestamp: string;
      resolved: boolean;
      resolvedAt?: string;
      resolvedBy?: string;
    }>, { status?: 'active' | 'resolved'; limit?: number }>({
      query: (params) => ({
        url: '/super-admin/audit/alerts',
        params,
      }),
    }),

    // Resolve audit alert
    resolveAuditAlert: builder.mutation<void, {
      alertId: string;
      resolution: string;
      notes?: string;
    }>({
      query: ({ alertId, ...data }) => ({
        url: `/super-admin/audit/alerts/${alertId}/resolve`,
        method: 'PATCH',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
  useGetAuditMetricsQuery,
  useGetAuditLogByIdQuery,
  useSearchAuditLogsQuery,
  useExportAuditLogsMutation,
  useGetAuditStatisticsQuery,
  useGetSecurityEventsQuery,
  useArchiveAuditLogsMutation,
  useDeleteAuditLogsMutation,
  useGetAuditConfigQuery,
  useUpdateAuditConfigMutation,
  useGetAuditAlertsQuery,
  useResolveAuditAlertMutation,
} = auditApi;