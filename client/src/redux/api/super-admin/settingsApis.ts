import { superAdminBaseApi } from './superAdminBaseApi';

export const settingsApi = superAdminBaseApi.injectEndpoints({
  endpoints: (builder) => ({
    // General Settings
    getSystemSettings: builder.query<{
      general: {
        siteName: string;
        siteDescription: string;
        contactEmail: string;
        supportEmail: string;
        timezone: string;
        language: string;
        currency: string;
      };
      security: {
        sessionTimeout: number;
        passwordPolicy: {
          minLength: number;
          requireUppercase: boolean;
          requireLowercase: boolean;
          requireNumbers: boolean;
          requireSpecialChars: boolean;
        };
        twoFactorEnabled: boolean;
        loginAttemptsLimit: number;
        lockoutDuration: number;
      };
      notifications: {
        emailEnabled: boolean;
        smsEnabled: boolean;
        pushEnabled: boolean;
        alertThresholds: {
          critical: number;
          high: number;
          medium: number;
          low: number;
        };
      };
      integrations: {
        paymentGateway: string;
        emailService: string;
        smsService: string;
        storageProvider: string;
      };
    }, void>({
      query: () => '/super-admin/settings',
      providesTags: ['Settings'],
    }),

    updateSystemSettings: builder.mutation<void, {
      section: 'general' | 'security' | 'notifications' | 'integrations';
      settings: Record<string, unknown>;
    }>({
      query: ({ section, settings }) => ({
        url: `/super-admin/settings/${section}`,
        method: 'PATCH',
        body: settings,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Email Settings
    getEmailSettings: builder.query<{
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        username: string;
        fromEmail: string;
        fromName: string;
      };
      templates: Array<{
        id: string;
        name: string;
        subject: string;
        type: string;
        variables: string[];
      }>;
      notifications: {
        welcomeEmail: boolean;
        passwordReset: boolean;
        accountActivation: boolean;
        subscriptionRenewal: boolean;
        systemAlerts: boolean;
      };
    }, void>({
      query: () => '/super-admin/settings/email',
      providesTags: ['Settings'],
    }),

    updateEmailSettings: builder.mutation<void, {
      smtp?: {
        host?: string;
        port?: number;
        secure?: boolean;
        username?: string;
        password?: string;
        fromEmail?: string;
        fromName?: string;
      };
      notifications?: Record<string, boolean>;
    }>({
      query: (settings) => ({
        url: '/super-admin/settings/email',
        method: 'PATCH',
        body: settings,
      }),
      invalidatesTags: ['Settings'],
    }),

    testEmailSettings: builder.mutation<{
      success: boolean;
      message: string;
    }, {
      to: string;
      subject: string;
      body: string;
    }>({
      query: (testData) => ({
        url: '/super-admin/settings/email/test',
        method: 'POST',
        body: testData,
      }),
    }),

    // Payment Settings
    getPaymentSettings: builder.query<{
      gateways: Array<{
        id: string;
        name: string;
        type: string;
        isActive: boolean;
        config: Record<string, unknown>;
        testMode: boolean;
      }>;
      currencies: Array<{
        code: string;
        name: string;
        symbol: string;
        isActive: boolean;
      }>;
      subscriptionPlans: Array<{
        id: string;
        name: string;
        description: string;
        price: number;
        currency: string;
        interval: 'monthly' | 'yearly';
        features: string[];
        isActive: boolean;
      }>;
    }, void>({
      query: () => '/super-admin/settings/payment',
      providesTags: ['Settings'],
    }),

    updatePaymentGateway: builder.mutation<void, {
      gatewayId: string;
      config: Record<string, unknown>;
      isActive: boolean;
      testMode: boolean;
    }>({
      query: ({ gatewayId, ...config }) => ({
        url: `/super-admin/settings/payment/gateways/${gatewayId}`,
        method: 'PATCH',
        body: config,
      }),
      invalidatesTags: ['Settings'],
    }),

    createSubscriptionPlan: builder.mutation<{
      id: string;
      name: string;
      createdAt: string;
    }, {
      name: string;
      description: string;
      price: number;
      currency: string;
      interval: 'monthly' | 'yearly';
      features: string[];
    }>({
      query: (planData) => ({
        url: '/super-admin/settings/payment/plans',
        method: 'POST',
        body: planData,
      }),
      invalidatesTags: ['Settings'],
    }),

    updateSubscriptionPlan: builder.mutation<void, {
      planId: string;
      updates: Partial<{
        name: string;
        description: string;
        price: number;
        currency: string;
        interval: 'monthly' | 'yearly';
        features: string[];
        isActive: boolean;
      }>;
    }>({
      query: ({ planId, updates }) => ({
        url: `/super-admin/settings/payment/plans/${planId}`,
        method: 'PATCH',
        body: updates,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Backup Settings
    getBackupSettings: builder.query<{
      schedule: {
        frequency: 'daily' | 'weekly' | 'monthly';
        time: string;
        retention: number;
        autoDelete: boolean;
      };
      destinations: Array<{
        id: string;
        type: 'local' | 's3' | 'ftp';
        name: string;
        config: Record<string, unknown>;
        isActive: boolean;
      }>;
      lastBackup?: {
        timestamp: string;
        size: number;
        status: 'success' | 'failed';
        message?: string;
      };
    }, void>({
      query: () => '/super-admin/settings/backup',
      providesTags: ['Settings'],
    }),

    updateBackupSettings: builder.mutation<void, {
      schedule?: {
        frequency?: 'daily' | 'weekly' | 'monthly';
        time?: string;
        retention?: number;
        autoDelete?: boolean;
      };
      destinations?: Array<{
        id?: string;
        type: 'local' | 's3' | 'ftp';
        name: string;
        config: Record<string, unknown>;
        isActive: boolean;
      }>;
    }>({
      query: (settings) => ({
        url: '/super-admin/settings/backup',
        method: 'PATCH',
        body: settings,
      }),
      invalidatesTags: ['Settings'],
    }),

    triggerManualBackup: builder.mutation<{
      backupId: string;
      status: 'queued' | 'running' | 'completed' | 'failed';
    }, {
      type: 'full' | 'incremental';
      destinationId?: string;
    }>({
      query: (backupConfig) => ({
        url: '/super-admin/settings/backup/manual',
        method: 'POST',
        body: backupConfig,
      }),
      invalidatesTags: ['Settings'],
    }),

    // Maintenance Settings
    getMaintenanceSettings: builder.query<{
      maintenanceMode: boolean;
      maintenanceMessage: string;
      scheduledMaintenance?: {
        startTime: string;
        endTime: string;
        message: string;
      };
      allowedIPs: string[];
      maintenanceHistory: Array<{
        id: string;
        startTime: string;
        endTime: string;
        reason: string;
        performedBy: string;
      }>;
    }, void>({
      query: () => '/super-admin/settings/maintenance',
      providesTags: ['Settings'],
    }),

    updateMaintenanceSettings: builder.mutation<void, {
      maintenanceMode?: boolean;
      maintenanceMessage?: string;
      scheduledMaintenance?: {
        startTime: string;
        endTime: string;
        message: string;
      };
      allowedIPs?: string[];
    }>({
      query: (settings) => ({
        url: '/super-admin/settings/maintenance',
        method: 'PATCH',
        body: settings,
      }),
      invalidatesTags: ['Settings'],
    }),

    // API Settings
    getApiSettings: builder.query<{
      rateLimiting: {
        enabled: boolean;
        requestsPerMinute: number;
        requestsPerHour: number;
      };
      cors: {
        enabled: boolean;
        allowedOrigins: string[];
        allowedMethods: string[];
        allowedHeaders: string[];
      };
      authentication: {
        jwtExpiry: number;
        refreshTokenExpiry: number;
        cookieSettings: {
          secure: boolean;
          sameSite: 'strict' | 'lax' | 'none';
          httpOnly: boolean;
        };
      };
      apiKeys: Array<{
        id: string;
        name: string;
        key: string;
        permissions: string[];
        expiresAt?: string;
        isActive: boolean;
        createdAt: string;
      }>;
    }, void>({
      query: () => '/super-admin/settings/api',
      providesTags: ['Settings'],
    }),

    updateApiSettings: builder.mutation<void, {
      rateLimiting?: {
        enabled?: boolean;
        requestsPerMinute?: number;
        requestsPerHour?: number;
      };
      cors?: {
        enabled?: boolean;
        allowedOrigins?: string[];
        allowedMethods?: string[];
        allowedHeaders?: string[];
      };
      authentication?: {
        jwtExpiry?: number;
        refreshTokenExpiry?: number;
        cookieSettings?: {
          secure?: boolean;
          sameSite?: 'strict' | 'lax' | 'none';
          httpOnly?: boolean;
        };
      };
    }>({
      query: (settings) => ({
        url: '/super-admin/settings/api',
        method: 'PATCH',
        body: settings,
      }),
      invalidatesTags: ['Settings'],
    }),

    createApiKey: builder.mutation<{
      id: string;
      key: string;
      name: string;
    }, {
      name: string;
      permissions: string[];
      expiresAt?: string;
    }>({
      query: (apiKeyData) => ({
        url: '/super-admin/settings/api/keys',
        method: 'POST',
        body: apiKeyData,
      }),
      invalidatesTags: ['Settings'],
    }),

    revokeApiKey: builder.mutation<void, string>({
      query: (keyId) => ({
        url: `/super-admin/settings/api/keys/${keyId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Settings'],
    }),
  }),
});

export const {
  useGetSystemSettingsQuery,
  useUpdateSystemSettingsMutation,
  useGetEmailSettingsQuery,
  useUpdateEmailSettingsMutation,
  useTestEmailSettingsMutation,
  useGetPaymentSettingsQuery,
  useUpdatePaymentGatewayMutation,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useGetBackupSettingsQuery,
  useUpdateBackupSettingsMutation,
  useTriggerManualBackupMutation,
  useGetMaintenanceSettingsQuery,
  useUpdateMaintenanceSettingsMutation,
  useGetApiSettingsQuery,
  useUpdateApiSettingsMutation,
  useCreateApiKeyMutation,
  useRevokeApiKeyMutation,
} = settingsApi;