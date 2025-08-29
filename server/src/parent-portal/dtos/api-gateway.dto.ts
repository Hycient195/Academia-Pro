import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsNumber, IsBoolean, IsDateString, IsObject, IsUrl, ValidateNested, Min, Max, IsUUID } from 'class-validator';

// Enums
export enum ApiVersion {
  V1 = 'v1',
  V2 = 'v2',
  BETA = 'beta',
  LATEST = 'latest',
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

export enum IntegrationType {
  PAYMENT_GATEWAY = 'payment_gateway',
  SMS_SERVICE = 'sms_service',
  EMAIL_SERVICE = 'email_service',
  CALENDAR_SERVICE = 'calendar_service',
  STORAGE_SERVICE = 'storage_service',
  ANALYTICS_SERVICE = 'analytics_service',
  NOTIFICATION_SERVICE = 'notification_service',
  LEARNING_PLATFORM = 'learning_platform',
  CUSTOM = 'custom',
}

export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  MAINTENANCE = 'maintenance',
  CONFIGURING = 'configuring',
}

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum WebhookEventType {
  GRADE_UPDATED = 'grade_updated',
  ATTENDANCE_MARKED = 'attendance_marked',
  ASSIGNMENT_POSTED = 'assignment_posted',
  FEE_DUE = 'fee_due',
  EVENT_SCHEDULED = 'event_scheduled',
  EMERGENCY_ALERT = 'emergency_alert',
  MESSAGE_RECEIVED = 'message_received',
  RESOURCE_UPLOADED = 'resource_uploaded',
  PAYMENT_RECEIVED = 'payment_received',
  TRANSPORTATION_UPDATE = 'transportation_update',
}

export enum ServiceHealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  MAINTENANCE = 'maintenance',
  UNKNOWN = 'unknown',
}

// Response DTOs
export class ApiResponseDto {
  @ApiProperty({
    description: 'Response status',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Response message',
    example: 'Request processed successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Response data',
  })
  data?: any;

  @ApiProperty({
    description: 'Response timestamp',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Request ID for tracking',
    example: 'req-abc123',
  })
  requestId: string;

  @ApiProperty({
    description: 'API version used',
    enum: ApiVersion,
  })
  version: ApiVersion;

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 150,
  })
  processingTime: number;
}

export class ApiRequestDto {
  @ApiProperty({
    description: 'HTTP method',
    enum: HttpMethod,
  })
  method: HttpMethod;

  @ApiProperty({
    description: 'API endpoint',
    example: '/api/academic/grades',
  })
  endpoint: string;

  @ApiProperty({
    description: 'Request headers',
  })
  headers: Record<string, string>;

  @ApiProperty({
    description: 'Query parameters',
  })
  query: Record<string, any>;

  @ApiProperty({
    description: 'Request body',
  })
  body?: any;

  @ApiProperty({
    description: 'Request timestamp',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Client IP address',
    example: '192.168.1.100',
  })
  ipAddress: string;

  @ApiProperty({
    description: 'User agent',
    example: 'ParentPortal/1.0.0',
  })
  userAgent: string;
}

export class ApiEndpointDto {
  @ApiProperty({
    description: 'Endpoint ID',
    example: 'endpoint-001',
  })
  endpointId: string;

  @ApiProperty({
    description: 'API version',
    enum: ApiVersion,
  })
  version: ApiVersion;

  @ApiProperty({
    description: 'HTTP method',
    enum: HttpMethod,
  })
  method: HttpMethod;

  @ApiProperty({
    description: 'Endpoint path',
    example: '/api/academic/grades',
  })
  path: string;

  @ApiProperty({
    description: 'Endpoint category',
    enum: ['academic', 'communication', 'fee', 'transportation', 'resource'],
  })
  category: string;

  @ApiProperty({
    description: 'Endpoint description',
    example: 'Retrieve student grades and performance data',
  })
  description: string;

  @ApiProperty({
    description: 'Request parameters',
  })
  parameters: {
    path?: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
    query?: Array<{
      name: string;
      type: string;
      required: boolean;
      description: string;
    }>;
    body?: {
      type: string;
      schema: any;
    };
  };

  @ApiProperty({
    description: 'Response schemas',
  })
  responses: {
    [statusCode: string]: {
      description: string;
      schema: any;
    };
  };

  @ApiProperty({
    description: 'Authentication requirements',
  })
  authentication: {
    required: boolean;
    scopes: string[];
  };

  @ApiProperty({
    description: 'Rate limiting',
  })
  rateLimit: {
    requests: number;
    period: string; // e.g., '1 minute', '1 hour'
  };

  @ApiProperty({
    description: 'Caching information',
  })
  caching: {
    enabled: boolean;
    ttl?: number; // Time to live in seconds
    cacheKey?: string;
  };

  @ApiProperty({
    description: 'Deprecation information',
  })
  deprecation?: {
    deprecated: boolean;
    sunsetDate?: Date;
    replacementEndpoint?: string;
  };

  @ApiProperty({
    description: 'Endpoint tags',
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Last updated',
  })
  lastUpdated: Date;

  @ApiProperty({
    description: 'Is endpoint active',
    example: true,
  })
  isActive: boolean;
}

export class ApiVersionDto {
  @ApiProperty({
    description: 'Version identifier',
    enum: ApiVersion,
  })
  version: ApiVersion;

  @ApiProperty({
    description: 'Version name',
    example: 'Version 1.0',
  })
  name: string;

  @ApiProperty({
    description: 'Version description',
    example: 'Stable production release',
  })
  description: string;

  @ApiProperty({
    description: 'Release date',
  })
  releaseDate: Date;

  @ApiProperty({
    description: 'Version status',
    enum: ['active', 'deprecated', 'retired'],
  })
  status: 'active' | 'deprecated' | 'retired';

  @ApiProperty({
    description: 'Supported until date',
  })
  supportedUntil?: Date;

  @ApiProperty({
    description: 'Changelog',
    type: [Object],
  })
  changelog: Array<{
    version: string;
    date: Date;
    changes: string[];
    breaking: boolean;
  }>;

  @ApiProperty({
    description: 'Base URL for this version',
    example: 'https://api.parentportal.com/v1',
  })
  baseUrl: string;

  @ApiProperty({
    description: 'Number of endpoints in this version',
    example: 45,
  })
  endpointCount: number;

  @ApiProperty({
    description: 'Is this the default version',
    example: true,
  })
  isDefault: boolean;
}

export class ApiDocumentationDto {
  @ApiProperty({
    description: 'API version',
    enum: ApiVersion,
  })
  version: ApiVersion;

  @ApiProperty({
    description: 'Documentation title',
    example: 'Parent Portal API v1 Documentation',
  })
  title: string;

  @ApiProperty({
    description: 'Documentation description',
  })
  description: string;

  @ApiProperty({
    description: 'Base URL',
    example: 'https://api.parentportal.com/v1',
  })
  baseUrl: string;

  @ApiProperty({
    description: 'Authentication information',
  })
  authentication: {
    type: string;
    description: string;
    scopes: Array<{
      name: string;
      description: string;
    }>;
  };

  @ApiProperty({
    description: 'API endpoints grouped by category',
  })
  endpoints: {
    [category: string]: ApiEndpointDto[];
  };

  @ApiProperty({
    description: 'Common response schemas',
  })
  schemas: {
    [schemaName: string]: any;
  };

  @ApiProperty({
    description: 'Error response schemas',
  })
  errors: {
    [errorCode: string]: {
      description: string;
      schema: any;
    };
  };

  @ApiProperty({
    description: 'Rate limiting information',
  })
  rateLimiting: {
    global: {
      requests: number;
      period: string;
    };
    endpoints: {
      [endpoint: string]: {
        requests: number;
        period: string;
      };
    };
  };

  @ApiProperty({
    description: 'SDK and client library information',
  })
  sdks: Array<{
    language: string;
    repository: string;
    documentation: string;
    version: string;
  }>;

  @ApiProperty({
    description: 'Last updated',
  })
  lastUpdated: Date;

  @ApiProperty({
    description: 'Contact information',
  })
  contact: {
    name: string;
    email: string;
    url?: string;
  };
}

export class ApiMetricsDto {
  @ApiProperty({
    description: 'Time range for metrics',
    example: 'day',
  })
  timeRange: string;

  @ApiProperty({
    description: 'Total API requests',
    example: 1250,
  })
  totalRequests: number;

  @ApiProperty({
    description: 'Successful requests',
    example: 1200,
  })
  successfulRequests: number;

  @ApiProperty({
    description: 'Failed requests',
    example: 50,
  })
  failedRequests: number;

  @ApiProperty({
    description: 'Average response time in milliseconds',
    example: 150,
  })
  averageResponseTime: number;

  @ApiProperty({
    description: 'Requests by HTTP method',
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  requestsByMethod: Record<string, number>;

  @ApiProperty({
    description: 'Requests by endpoint',
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  requestsByEndpoint: Record<string, number>;

  @ApiProperty({
    description: 'Requests by status code',
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  requestsByStatus: Record<string, number>;

  @ApiProperty({
    description: 'Top endpoints by usage',
    type: [Object],
  })
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
    averageResponseTime: number;
  }>;

  @ApiProperty({
    description: 'Error rate by endpoint',
    type: [Object],
  })
  errorRates: Array<{
    endpoint: string;
    errorCount: number;
    totalRequests: number;
    errorRate: number;
  }>;

  @ApiProperty({
    description: 'Response time percentiles',
  })
  responseTimePercentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };

  @ApiProperty({
    description: 'Rate limiting hits',
    example: 25,
  })
  rateLimitHits: number;

  @ApiProperty({
    description: 'Cache hit rate',
    example: 0.85,
  })
  cacheHitRate: number;

  @ApiProperty({
    description: 'Data transfer in bytes',
    example: 5242880,
  })
  dataTransfer: number;
}

export class ApiRateLimitDto {
  @ApiProperty({
    description: 'Global rate limit',
  })
  global: {
    limit: number;
    remaining: number;
    resetTime: Date;
    resetInSeconds: number;
  };

  @ApiProperty({
    description: 'Rate limits by endpoint',
    type: 'object',
    additionalProperties: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
        remaining: { type: 'number' },
        resetTime: { type: 'string', format: 'date-time' },
        resetInSeconds: { type: 'number' },
      },
    },
  })
  endpoints: Record<string, {
    limit: number;
    remaining: number;
    resetTime: Date;
    resetInSeconds: number;
  }>;

  @ApiProperty({
    description: 'Rate limit status',
    enum: ['normal', 'warning', 'exceeded'],
  })
  status: 'normal' | 'warning' | 'exceeded';

  @ApiProperty({
    description: 'Next reset time',
  })
  nextReset: Date;

  @ApiProperty({
    description: 'Rate limit policy',
  })
  policy: {
    burstLimit: number;
    sustainedLimit: number;
    burstDuration: number; // seconds
    sustainedDuration: number; // seconds
  };
}

export class WebhookDto {
  @ApiProperty({
    description: 'Webhook ID',
    example: 'webhook-001',
  })
  webhookId: string;

  @ApiProperty({
    description: 'Webhook name',
    example: 'Grade Updates Webhook',
  })
  name: string;

  @ApiProperty({
    description: 'Webhook URL',
    example: 'https://myapp.com/webhooks/grades',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'Webhook description',
    example: 'Receive notifications when grades are updated',
  })
  description: string;

  @ApiProperty({
    description: 'Event types to subscribe to',
    type: [String],
    enum: WebhookEventType,
  })
  @IsArray()
  @IsEnum(WebhookEventType, { each: true })
  events: WebhookEventType[];

  @ApiProperty({
    description: 'Webhook secret for signature verification',
    example: 'whsec_abc123def456',
  })
  secret: string;

  @ApiProperty({
    description: 'Is webhook active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Retry configuration',
  })
  retryConfig: {
    maxRetries: number;
    retryDelay: number; // seconds
    backoffMultiplier: number;
  };

  @ApiProperty({
    description: 'Filter configuration',
  })
  filters?: {
    studentIds?: string[];
    gradeLevels?: string[];
    subjects?: string[];
  };

  @ApiProperty({
    description: 'Created at',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last triggered',
  })
  lastTriggered?: Date;

  @ApiProperty({
    description: 'Success rate',
    example: 0.95,
  })
  successRate: number;

  @ApiProperty({
    description: 'Total deliveries',
    example: 150,
  })
  totalDeliveries: number;

  @ApiProperty({
    description: 'Failed deliveries',
    example: 7,
  })
  failedDeliveries: number;
}

export class WebhookEventDto {
  @ApiProperty({
    description: 'Event ID',
    example: 'event-001',
  })
  eventId: string;

  @ApiProperty({
    description: 'Webhook ID',
    example: 'webhook-001',
  })
  webhookId: string;

  @ApiProperty({
    description: 'Event type',
    enum: WebhookEventType,
  })
  eventType: WebhookEventType;

  @ApiProperty({
    description: 'Event data',
  })
  data: any;

  @ApiProperty({
    description: 'Event timestamp',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Delivery attempts',
    type: [Object],
  })
  deliveryAttempts: Array<{
    attemptNumber: number;
    timestamp: Date;
    status: 'success' | 'failed' | 'retry';
    responseStatus?: number;
    errorMessage?: string;
    duration: number; // milliseconds
  }>;

  @ApiProperty({
    description: 'Final delivery status',
    enum: ['success', 'failed', 'pending'],
  })
  status: 'success' | 'failed' | 'pending';

  @ApiProperty({
    description: 'Response status code',
    example: 200,
  })
  responseStatus?: number;

  @ApiProperty({
    description: 'Response body',
  })
  responseBody?: any;

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 150,
  })
  processingTime: number;
}

export class IntegrationDto {
  @ApiProperty({
    description: 'Integration ID',
    example: 'integration-001',
  })
  integrationId: string;

  @ApiProperty({
    description: 'Integration name',
    example: 'Stripe Payment Gateway',
  })
  name: string;

  @ApiProperty({
    description: 'Integration type',
    enum: IntegrationType,
  })
  type: IntegrationType;

  @ApiProperty({
    description: 'Integration description',
    example: 'Integration with Stripe for payment processing',
  })
  description: string;

  @ApiProperty({
    description: 'Provider name',
    example: 'Stripe',
  })
  provider: string;

  @ApiProperty({
    description: 'Configuration settings',
  })
  config: {
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    baseUrl?: string;
    timeout?: number;
    retryConfig?: {
      maxRetries: number;
      retryDelay: number;
    };
  };

  @ApiProperty({
    description: 'Integration status',
    enum: IntegrationStatus,
  })
  status: IntegrationStatus;

  @ApiProperty({
    description: 'Supported features',
    type: [String],
  })
  features: string[];

  @ApiProperty({
    description: 'Rate limits',
  })
  rateLimits?: {
    requests: number;
    period: string;
  };

  @ApiProperty({
    description: 'Health check endpoint',
    example: 'https://api.stripe.com/health',
  })
  healthCheckUrl?: string;

  @ApiProperty({
    description: 'Created at',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last tested',
  })
  lastTested?: Date;

  @ApiProperty({
    description: 'Test results',
  })
  testResults?: {
    success: boolean;
    responseTime: number;
    errorMessage?: string;
  };

  @ApiProperty({
    description: 'Usage statistics',
  })
  usageStats: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
}

export class IntegrationStatusDto {
  @ApiProperty({
    description: 'Integration ID',
    example: 'integration-001',
  })
  integrationId: string;

  @ApiProperty({
    description: 'Current status',
    enum: IntegrationStatus,
  })
  status: IntegrationStatus;

  @ApiProperty({
    description: 'Status message',
    example: 'Integration is working correctly',
  })
  message: string;

  @ApiProperty({
    description: 'Last checked',
  })
  lastChecked: Date;

  @ApiProperty({
    description: 'Response time in milliseconds',
    example: 150,
  })
  responseTime: number;

  @ApiProperty({
    description: 'Error details',
  })
  error?: {
    code: string;
    message: string;
    details?: any;
  };

  @ApiProperty({
    description: 'Health metrics',
  })
  healthMetrics: {
    uptime: number; // percentage
    averageResponseTime: number;
    errorRate: number;
    lastError?: Date;
  };

  @ApiProperty({
    description: 'Configuration status',
    enum: ['valid', 'invalid', 'warning'],
  })
  configStatus: 'valid' | 'invalid' | 'warning';

  @ApiProperty({
    description: 'Recommended actions',
    type: [String],
  })
  recommendedActions: string[];
}

export class NotificationDto {
  @ApiProperty({
    description: 'Notification ID',
    example: 'notification-001',
  })
  notificationId: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'Grade Updated',
  })
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Your child\'s mathematics grade has been updated',
  })
  message: string;

  @ApiProperty({
    description: 'Notification priority',
    enum: NotificationPriority,
  })
  priority: NotificationPriority;

  @ApiProperty({
    description: 'Notification data',
  })
  data?: any;

  @ApiProperty({
    description: 'Target recipients',
    type: [String],
  })
  recipients: string[];

  @ApiProperty({
    description: 'Delivery channels',
    type: [String],
    enum: NotificationType,
  })
  channels: NotificationType[];

  @ApiProperty({
    description: 'Scheduled delivery time',
  })
  scheduledAt?: Date;

  @ApiProperty({
    description: 'Expiration time',
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Created at',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Delivery status',
  })
  deliveryStatus: {
    [channel: string]: {
      status: 'pending' | 'sent' | 'delivered' | 'failed';
      sentAt?: Date;
      deliveredAt?: Date;
      errorMessage?: string;
      retryCount: number;
    };
  };

  @ApiProperty({
    description: 'Metadata',
  })
  metadata: {
    category: string;
    source: string;
    correlationId?: string;
    studentId?: string;
    gradeId?: string;
  };

  @ApiProperty({
    description: 'Is notification read',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Read at',
  })
  readAt?: Date;
}

export class NotificationSettingsDto {
  @ApiProperty({
    description: 'Settings ID',
    example: 'settings-001',
  })
  settingsId: string;

  @ApiProperty({
    description: 'Email notifications enabled',
    example: true,
  })
  emailEnabled: boolean;

  @ApiProperty({
    description: 'SMS notifications enabled',
    example: false,
  })
  smsEnabled: boolean;

  @ApiProperty({
    description: 'Push notifications enabled',
    example: true,
  })
  pushEnabled: boolean;

  @ApiProperty({
    description: 'In-app notifications enabled',
    example: true,
  })
  inAppEnabled: boolean;

  @ApiProperty({
    description: 'Notification preferences by category',
  })
  categoryPreferences: {
    academic: {
      enabled: boolean;
      priority: NotificationPriority;
      quietHours: {
        enabled: boolean;
        start: string; // HH:mm format
        end: string; // HH:mm format
      };
    };
    attendance: {
      enabled: boolean;
      priority: NotificationPriority;
      quietHours: {
        enabled: boolean;
        start: string;
        end: string;
        end: string;
      };
    };
    fees: {
      enabled: boolean;
      priority: NotificationPriority;
      quietHours: {
        enabled: boolean;
        start: string;
        end: string;
      };
    };
    transportation: {
      enabled: boolean;
      priority: NotificationPriority;
      quietHours: {
        enabled: boolean;
        start: string;
        end: string;
      };
    };
    general: {
      enabled: boolean;
      priority: NotificationPriority;
      quietHours: {
        enabled: boolean;
        start: string;
        end: string;
      };
    };
  };

  @ApiProperty({
    description: 'Delivery preferences',
  })
  deliveryPreferences: {
    batchNotifications: boolean;
    batchInterval: number; // minutes
    maxNotificationsPerHour: number;
    preferredLanguage: string;
    timezone: string;
  };

  @ApiProperty({
    description: 'Device preferences',
  })
  devicePreferences: {
    allowedDevices: string[];
    primaryDevice?: string;
    notificationSounds: boolean;
    vibrationEnabled: boolean;
  };

  @ApiProperty({
    description: 'Last updated',
  })
  lastUpdated: Date;
}

export class PushTokenDto {
  @ApiProperty({
    description: 'Token ID',
    example: 'token-001',
  })
  tokenId: string;

  @ApiProperty({
    description: 'Device token',
    example: 'fcm_token_abc123def456',
  })
  deviceToken: string;

  @ApiProperty({
    description: 'Device type',
    enum: ['ios', 'android', 'web'],
  })
  deviceType: 'ios' | 'android' | 'web';

  @ApiProperty({
    description: 'Device name',
    example: 'John\'s iPhone',
  })
  deviceName: string;

  @ApiProperty({
    description: 'Device model',
    example: 'iPhone 12 Pro',
  })
  deviceModel?: string;

  @ApiProperty({
    description: 'Operating system',
    example: 'iOS 15.2',
  })
  osVersion?: string;

  @ApiProperty({
    description: 'App version',
    example: '1.2.3',
  })
  appVersion?: string;

  @ApiProperty({
    description: 'Is token active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Last used',
  })
  lastUsed?: Date;

  @ApiProperty({
    description: 'Registered at',
  })
  registeredAt: Date;

  @ApiProperty({
    description: 'Expires at',
  })
  expiresAt?: Date;
}

export class ApiKeyDto {
  @ApiProperty({
    description: 'API key ID',
    example: 'key-001',
  })
  keyId: string;

  @ApiProperty({
    description: 'API key name',
    example: 'Mobile App Key',
  })
  name: string;

  @ApiProperty({
    description: 'API key description',
    example: 'Key for mobile application access',
  })
  description: string;

  @ApiProperty({
    description: 'API key prefix',
    example: 'pp_live_',
  })
  prefix: string;

  @ApiProperty({
    description: 'Masked API key',
    example: 'pp_live_****1234',
  })
  maskedKey: string;

  @ApiProperty({
    description: 'API key permissions',
    type: [String],
  })
  permissions: string[];

  @ApiProperty({
    description: 'Rate limits',
  })
  rateLimits: {
    requests: number;
    period: string;
  };

  @ApiProperty({
    description: 'Allowed IP addresses',
    type: [String],
  })
  allowedIPs: string[];

  @ApiProperty({
    description: 'Expiration date',
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Last used',
  })
  lastUsed?: Date;

  @ApiProperty({
    description: 'Usage count',
    example: 1250,
  })
  usageCount: number;

  @ApiProperty({
    description: 'Is key active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Created at',
  })
  createdAt: Date;
}

export class ApiLogDto {
  @ApiProperty({
    description: 'Log ID',
    example: 'log-001',
  })
  logId: string;

  @ApiProperty({
    description: 'Request timestamp',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'HTTP method',
    enum: HttpMethod,
  })
  method: HttpMethod;

  @ApiProperty({
    description: 'Request endpoint',
    example: '/api/academic/grades',
  })
  endpoint: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 200,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Response time in milliseconds',
    example: 150,
  })
  responseTime: number;

  @ApiProperty({
    description: 'Request size in bytes',
    example: 1024,
  })
  requestSize: number;

  @ApiProperty({
    description: 'Response size in bytes',
    example: 2048,
  })
  responseSize: number;

  @ApiProperty({
    description: 'Client IP address',
    example: '192.168.1.100',
  })
  ipAddress: string;

  @ApiProperty({
    description: 'User agent',
    example: 'ParentPortal/1.0.0',
  })
  userAgent: string;

  @ApiProperty({
    description: 'API version used',
    enum: ApiVersion,
  })
  version: ApiVersion;

  @ApiProperty({
    description: 'Request ID',
    example: 'req-abc123',
  })
  requestId: string;

  @ApiProperty({
    description: 'Error message',
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Rate limit information',
  })
  rateLimit?: {
    limit: number;
    remaining: number;
    resetIn: number;
  };

  @ApiProperty({
    description: 'Geolocation information',
  })
  geolocation?: {
    country: string;
    region: string;
    city: string;
    coordinates?: [number, number];
  };
}

export class ServiceHealthDto {
  @ApiProperty({
    description: 'Service name',
    example: 'payment-gateway',
  })
  serviceName: string;

  @ApiProperty({
    description: 'Service display name',
    example: 'Stripe Payment Gateway',
  })
  displayName: string;

  @ApiProperty({
    description: 'Service status',
    enum: ServiceHealthStatus,
  })
  status: ServiceHealthStatus;

  @ApiProperty({
    description: 'Status message',
    example: 'Service is operating normally',
  })
  message: string;

  @ApiProperty({
    description: 'Last checked',
  })
  lastChecked: Date;

  @ApiProperty({
    description: 'Response time in milliseconds',
    example: 150,
  })
  responseTime: number;

  @ApiProperty({
    description: 'Uptime percentage',
    example: 99.9,
  })
  uptime: number;

  @ApiProperty({
    description: 'Error rate',
    example: 0.01,
  })
  errorRate: number;

  @ApiProperty({
    description: 'Service version',
    example: '2.1.3',
  })
  version?: string;

  @ApiProperty({
    description: 'Service endpoint',
    example: 'https://api.stripe.com',
  })
  endpoint?: string;

  @ApiProperty({
    description: 'Health check details',
  })
  healthCheck: {
    url: string;
    method: string;
    expectedStatus: number;
    timeout: number;
  };

  @ApiProperty({
    description: 'Recent incidents',
    type: [Object],
  })
  recentIncidents: Array<{
    incidentId: string;
    type: string;
    message: string;
    timestamp: Date;
    resolved: boolean;
  }>;
}

export class ApiAnalyticsDto {
  @ApiProperty({
    description: 'Time range for analytics',
    example: 'month',
  })
  timeRange: string;

  @ApiProperty({
    description: 'Overall API usage',
  })
  overview: {
    totalRequests: number;
    uniqueUsers: number;
    averageRequestsPerUser: number;
    peakRequestsPerHour: number;
    totalDataTransfer: number;
  };

  @ApiProperty({
    description: 'Usage trends',
  })
  trends: {
    requestsOverTime: Array<{
      date: string;
      requests: number;
      errors: number;
      averageResponseTime: number;
    }>;
    topEndpoints: Array<{
      endpoint: string;
      requests: number;
      percentage: number;
    }>;
    userActivity: Array<{
      userId: string;
      requests: number;
      lastActivity: Date;
    }>;
  };

  @ApiProperty({
    description: 'Performance metrics',
  })
  performance: {
    averageResponseTime: number;
    p95ResponseTime: number;
    errorRate: number;
    cacheHitRate: number;
    throughput: number; // requests per second
  };

  @ApiProperty({
    description: 'Geographic distribution',
  })
  geography: {
    topCountries: Array<{
      country: string;
      requests: number;
      percentage: number;
    }>;
    topRegions: Array<{
      region: string;
      requests: number;
      percentage: number;
    }>;
  };

  @ApiProperty({
    description: 'Device and platform analytics',
  })
  devices: {
    topPlatforms: Array<{
      platform: string;
      requests: number;
      percentage: number;
    }>;
    topDevices: Array<{
      device: string;
      requests: number;
      percentage: number;
    }>;
    appVersions: Array<{
      version: string;
      users: number;
      percentage: number;
    }>;
  };

  @ApiProperty({
    description: 'Error analysis',
  })
  errors: {
    topErrorCodes: Array<{
      statusCode: number;
      count: number;
      percentage: number;
    }>;
    topErrorEndpoints: Array<{
      endpoint: string;
      errors: number;
      errorRate: number;
    }>;
    errorTrends: Array<{
      date: string;
      errors: number;
      errorRate: number;
    }>;
  };

  @ApiProperty({
    description: 'Integration usage',
  })
  integrations: {
    topIntegrations: Array<{
      integration: string;
      requests: number;
      successRate: number;
    }>;
    integrationHealth: Array<{
      integration: string;
      status: ServiceHealthStatus;
      uptime: number;
    }>;
  };

  @ApiProperty({
    description: 'Security metrics',
  })
  security: {
    rateLimitHits: number;
    blockedRequests: number;
    suspiciousActivities: number;
    authenticationFailures: number;
  };

  @ApiProperty({
    description: 'Generated at',
  })
  generatedAt: Date;
}

// Index export
export * from './api-gateway.dto';