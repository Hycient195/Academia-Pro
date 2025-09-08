import { SetMetadata } from '@nestjs/common';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';

export interface AuditableOptions {
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
  severity?: AuditSeverity;
  customAction?: string;
  customResource?: string;
  includeRequestBody?: boolean;
  includeResponseBody?: boolean;
  excludeFields?: string[];
  performanceThreshold?: number; // in milliseconds
  samplingRate?: number; // 0-1, for high-traffic endpoints
  metadata?: Record<string, any>;
}

export const AUDITABLE_KEY = 'auditable';

export function Auditable(options: AuditableOptions = {}) {
  return SetMetadata(AUDITABLE_KEY, options);
}

// Convenience decorators for common audit scenarios
export function AuditCreate(resource?: string, resourceId?: string) {
  return Auditable({
    action: AuditAction.DATA_CREATED,
    resource,
    resourceId,
    severity: AuditSeverity.MEDIUM,
  });
}

export function AuditUpdate(resource?: string, resourceId?: string) {
  return Auditable({
    action: AuditAction.DATA_UPDATED,
    resource,
    resourceId,
    severity: AuditSeverity.LOW,
  });
}

export function AuditDelete(resource?: string, resourceId?: string) {
  return Auditable({
    action: AuditAction.DATA_DELETED,
    resource,
    resourceId,
    severity: AuditSeverity.HIGH,
  });
}

export function AuditRead(resource?: string, resourceId?: string) {
  return Auditable({
    action: AuditAction.DATA_ACCESSED,
    resource,
    resourceId,
    severity: AuditSeverity.LOW,
  });
}

export function AuditSecurity(eventType: string, severity: AuditSeverity = AuditSeverity.HIGH) {
  return Auditable({
    action: AuditAction.SECURITY_ALERT,
    resource: 'security',
    severity,
    metadata: { eventType },
  });
}

export function AuditAuth(success: boolean = true) {
  return Auditable({
    action: success ? AuditAction.AUTHENTICATION_SUCCESS : AuditAction.AUTHENTICATION_FAILED,
    resource: 'authentication',
    severity: success ? AuditSeverity.LOW : AuditSeverity.HIGH,
  });
}

export function AuditSystem(configKey?: string) {
  return Auditable({
    action: AuditAction.SYSTEM_CONFIG_CHANGED,
    resource: 'system',
    resourceId: configKey,
    severity: AuditSeverity.HIGH,
  });
}

// Performance monitoring decorator
export function MonitorPerformance(threshold: number = 1000) {
  return Auditable({
    performanceThreshold: threshold,
    metadata: { performanceMonitoring: true },
  });
}

// High-traffic endpoint with sampling
export function SampleAudit(samplingRate: number = 0.1) {
  return Auditable({
    samplingRate,
    metadata: { sampled: true },
  });
}