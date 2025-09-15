import { superAdminBaseApi } from './superAdminBaseApi';

import type {
  ISystemHealth,
  ISystemMetrics,
  ISystemOverview,
  ISystemHealthResponse,
  IAnalyticsDataResponse,
  ISystemOverviewResponse
} from '@academia-pro/types/super-admin';

export const systemApi = superAdminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    // System Health
    getSystemHealth: builder.query<ISystemHealthResponse, void>({
      query: () => '/super-admin/system/health',
      providesTags: ['Health'],
    }),

    getDetailedSystemHealth: builder.query<ISystemHealth, {
      includeServices?: boolean;
      includeMetrics?: boolean;
    }>({
      query: (params) => ({
        url: '/super-admin/system/health/detailed',
        params,
      }),
      providesTags: ['Health'],
    }),

    // System Metrics
    getSystemMetrics: builder.query<ISystemMetrics, {
      period?: string;
      granularity?: '1m' | '5m' | '15m' | '1h' | '1d';
    }>({
      query: (params) => ({
        url: '/super-admin/system/metrics',
        params,
      }),
      providesTags: ['Metrics'],
    }),

    getRealtimeSystemMetrics: builder.query<ISystemMetrics, void>({
      query: () => '/super-admin/system/metrics/realtime',
      providesTags: ['Metrics'],
    }),

    // System Overview
    getSystemOverview: builder.query<ISystemOverviewResponse, void>({
      query: () => '/super-admin/system/overview',
      providesTags: ['System'],
    }),

    // Service Management
    getServicesStatus: builder.query<Array<{
      name: string;
      status: 'healthy' | 'warning' | 'critical' | 'stopped';
      uptime: number;
      responseTime: number;
      lastChecked: string;
      version?: string;
      memoryUsage?: number;
      cpuUsage?: number;
    }>, void>({
      query: () => '/super-admin/system/services',
      providesTags: ['System'],
    }),

    restartService: builder.mutation<{
      success: boolean;
      message: string;
      serviceName: string;
    }, string>({
      query: (serviceName) => ({
        url: `/super-admin/system/services/${serviceName}/restart`,
        method: 'POST',
      }),
      invalidatesTags: ['System', 'Health'],
    }),

    stopService: builder.mutation<{
      success: boolean;
      message: string;
      serviceName: string;
    }, string>({
      query: (serviceName) => ({
        url: `/super-admin/system/services/${serviceName}/stop`,
        method: 'POST',
      }),
      invalidatesTags: ['System', 'Health'],
    }),

    startService: builder.mutation<{
      success: boolean;
      message: string;
      serviceName: string;
    }, string>({
      query: (serviceName) => ({
        url: `/super-admin/system/services/${serviceName}/start`,
        method: 'POST',
      }),
      invalidatesTags: ['System', 'Health'],
    }),

    // Database Management
    getDatabaseStatus: builder.query<{
      status: 'healthy' | 'warning' | 'critical';
      connections: {
        active: number;
        idle: number;
        total: number;
        max: number;
      };
      performance: {
        queryTime: number;
        throughput: number;
        cacheHitRatio: number;
      };
      storage: {
        used: number;
        total: number;
        available: number;
      };
      lastBackup?: string;
      version: string;
    }, void>({
      query: () => '/super-admin/system/database/status',
      providesTags: ['System'],
    }),

    runDatabaseMaintenance: builder.mutation<{
      success: boolean;
      message: string;
      operations: string[];
    }, {
      operations: Array<'vacuum' | 'analyze' | 'reindex' | 'cleanup'>;
    }>({
      query: (config) => ({
        url: '/super-admin/system/database/maintenance',
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['System'],
    }),

    // Cache Management
    getCacheStatus: builder.query<{
      status: 'healthy' | 'warning' | 'critical';
      hitRatio: number;
      memoryUsage: number;
      totalKeys: number;
      evictedKeys: number;
      connectedClients: number;
      uptime: number;
    }, void>({
      query: () => '/super-admin/system/cache/status',
      providesTags: ['System'],
    }),

    clearCache: builder.mutation<{
      success: boolean;
      message: string;
      keysCleared: number;
    }, {
      pattern?: string;
      all?: boolean;
    }>({
      query: (config) => ({
        url: '/super-admin/system/cache/clear',
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['System'],
    }),

    // Queue Management
    getQueueStatus: builder.query<Array<{
      name: string;
      status: 'active' | 'paused' | 'stopped';
      jobs: {
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
      };
      workers: number;
      throughput: number;
    }>, void>({
      query: () => '/super-admin/system/queues',
      providesTags: ['System'],
    }),

    pauseQueue: builder.mutation<{
      success: boolean;
      message: string;
      queueName: string;
    }, string>({
      query: (queueName) => ({
        url: `/super-admin/system/queues/${queueName}/pause`,
        method: 'POST',
      }),
      invalidatesTags: ['System'],
    }),

    resumeQueue: builder.mutation<{
      success: boolean;
      message: string;
      queueName: string;
    }, string>({
      query: (queueName) => ({
        url: `/super-admin/system/queues/${queueName}/resume`,
        method: 'POST',
      }),
      invalidatesTags: ['System'],
    }),

    clearQueue: builder.mutation<{
      success: boolean;
      message: string;
      queueName: string;
      jobsCleared: number;
    }, {
      queueName: string;
      state?: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
    }>({
      query: ({ queueName, ...config }) => ({
        url: `/super-admin/system/queues/${queueName}/clear`,
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['System'],
    }),

    // Log Management
    getSystemLogs: builder.query<{
      logs: Array<{
        timestamp: string;
        level: 'error' | 'warn' | 'info' | 'debug';
        message: string;
        service: string;
        metadata?: Record<string, unknown>;
      }>;
      total: number;
      page: number;
      limit: number;
    }, {
      level?: string;
      service?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/super-admin/system/logs',
        params,
      }),
      providesTags: ['Logs'],
    }),

    downloadSystemLogs: builder.mutation<Blob, {
      level?: string;
      service?: string;
      startDate?: string;
      endDate?: string;
      format: 'json' | 'txt' | 'csv';
    }>({
      query: (params) => ({
        url: '/super-admin/system/logs/download',
        method: 'POST',
        body: params,
        responseHandler: (response) => response.blob(),
      }),
    }),

    // Performance Monitoring
    getPerformanceMetrics: builder.query<{
      responseTime: {
        average: number;
        p95: number;
        p99: number;
        max: number;
      };
      throughput: {
        requestsPerSecond: number;
        requestsPerMinute: number;
        requestsPerHour: number;
      };
      errorRate: {
        total: number;
        rate: number;
        byEndpoint: Record<string, number>;
      };
      resourceUsage: {
        cpu: number;
        memory: number;
        disk: number;
        network: number;
      };
    }, {
      period?: string;
      granularity?: string;
    }>({
      query: (params) => ({
        url: '/super-admin/system/performance',
        params,
      }),
      providesTags: ['Metrics'],
    }),

    // System Configuration
    getSystemConfig: builder.query<{
      environment: string;
      version: string;
      buildTime: string;
      nodeVersion: string;
      database: {
        type: string;
        version: string;
        connectionString: string;
      };
      cache: {
        type: string;
        version?: string;
      };
      queue: {
        type: string;
        version?: string;
      };
      features: Record<string, boolean>;
    }, void>({
      query: () => '/super-admin/system/config',
      providesTags: ['System'],
    }),

    // System Maintenance
    runSystemMaintenance: builder.mutation<{
      success: boolean;
      message: string;
      operations: Array<{
        name: string;
        status: 'success' | 'failed';
        message?: string;
        duration: number;
      }>;
    }, {
      operations: Array<
        'cleanup-temp-files' |
        'optimize-database' |
        'clear-old-logs' |
        'update-dependencies' |
        'restart-services'
      >;
      schedule?: {
        cron: string;
        enabled: boolean;
      };
    }>({
      query: (config) => ({
        url: '/super-admin/system/maintenance',
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['System', 'Health'],
    }),

    // Alert Management
    getSystemAlerts: builder.query<Array<{
      id: string;
      type: 'performance' | 'security' | 'system' | 'database' | 'service';
      severity: 'low' | 'medium' | 'high' | 'critical';
      title: string;
      message: string;
      timestamp: string;
      resolved: boolean;
      resolvedAt?: string;
      resolvedBy?: string;
      metadata?: Record<string, unknown>;
    }>, {
      status?: 'active' | 'resolved';
      type?: string;
      severity?: string;
      limit?: number;
    }>({
      query: (params) => ({
        url: '/super-admin/system/alerts',
        params,
      }),
      providesTags: ['System'],
    }),

    resolveSystemAlert: builder.mutation<void, {
      alertId: string;
      resolution: string;
      notes?: string;
    }>({
      query: ({ alertId, ...data }) => ({
        url: `/super-admin/system/alerts/${alertId}/resolve`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['System'],
    }),

    // Backup and Recovery
    getBackupStatus: builder.query<Array<{
      id: string;
      type: 'full' | 'incremental';
      status: 'running' | 'completed' | 'failed';
      createdAt: string;
      completedAt?: string;
      size?: number;
      destination: string;
      error?: string;
    }>, void>({
      query: () => '/super-admin/system/backups',
      providesTags: ['System'],
    }),

    createSystemBackup: builder.mutation<{
      backupId: string;
      status: 'queued' | 'running';
    }, {
      type: 'full' | 'incremental';
      includeDatabase: boolean;
      includeFiles: boolean;
      compression: boolean;
    }>({
      query: (config) => ({
        url: '/super-admin/system/backups',
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['System'],
    }),

    restoreFromBackup: builder.mutation<{
      success: boolean;
      message: string;
      restoreId: string;
    }, {
      backupId: string;
      components: Array<'database' | 'files' | 'config'>;
      dryRun?: boolean;
    }>({
      query: ({ backupId, ...config }) => ({
        url: `/super-admin/system/backups/${backupId}/restore`,
        method: 'POST',
        body: config,
      }),
      invalidatesTags: ['System'],
    }),
  }),
});

export const {
  useGetSystemHealthQuery,
  useGetDetailedSystemHealthQuery,
  useGetSystemMetricsQuery,
  useGetRealtimeSystemMetricsQuery,
  useGetSystemOverviewQuery,
  useGetServicesStatusQuery,
  useRestartServiceMutation,
  useStopServiceMutation,
  useStartServiceMutation,
  useGetDatabaseStatusQuery,
  useRunDatabaseMaintenanceMutation,
  useGetCacheStatusQuery,
  useClearCacheMutation,
  useGetQueueStatusQuery,
  usePauseQueueMutation,
  useResumeQueueMutation,
  useClearQueueMutation,
  useGetSystemLogsQuery,
  useDownloadSystemLogsMutation,
  useGetPerformanceMetricsQuery,
  useGetSystemConfigQuery,
  useRunSystemMaintenanceMutation,
  useGetSystemAlertsQuery,
  useResolveSystemAlertMutation,
  useGetBackupStatusQuery,
  useCreateSystemBackupMutation,
  useRestoreFromBackupMutation,
} = systemApi;