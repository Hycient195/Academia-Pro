export enum AuditAction {
  // Authentication & Authorization
  LOGIN = 'login',
  LOGOUT = 'logout',
  AUTHENTICATION_SUCCESS = 'authentication_success',
  AUTHENTICATION_FAILED = 'authentication_failed',
  AUTHORIZATION_SUCCESS = 'authorization_success',
  AUTHORIZATION_FAILED = 'authorization_failed',

  // User Management
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_BLOCKED = 'user_blocked',
  USER_UNBLOCKED = 'user_unblocked',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET = 'password_reset',

  // Data Operations
  DATA_CREATED = 'data_created',
  DATA_UPDATED = 'data_updated',
  DATA_DELETED = 'data_deleted',
  DATA_EXPORTED = 'data_exported',
  DATA_ACCESSED = 'data_accessed',

  // Security Events
  SECURITY_CONFIG_CHANGED = 'security_config_changed',
  AUDIT_LOG_ACCESSED = 'audit_log_accessed',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  SECURITY_ALERT = 'security_alert',

  // System Operations
  SYSTEM_CONFIG_CHANGED = 'system_config_changed',
  BACKUP_CREATED = 'backup_created',
  BACKUP_RESTORED = 'backup_restored',
  MAINTENANCE_MODE_ENABLED = 'maintenance_mode_enabled',
  MAINTENANCE_MODE_DISABLED = 'maintenance_mode_disabled',

  // API Operations
  API_KEY_CREATED = 'api_key_created',
  API_KEY_REVOKED = 'api_key_revoked',
  WEBHOOK_CREATED = 'webhook_created',
  WEBHOOK_DELETED = 'webhook_deleted',
  INTEGRATION_CREATED = 'integration_created',
  INTEGRATION_UPDATED = 'integration_updated',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface AuditLogData {
  userId: string;
  action: AuditAction | string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  severity?: AuditSeverity;
  schoolId?: string;
  sessionId?: string;
  correlationId?: string;
}