import { Injectable } from '@nestjs/common';

export interface AuditConfig {
  enabled: boolean;
  bufferSize: number;
  flushInterval: number;
  retentionDays: number;
  maxExportRecords: number;
  sensitiveFields: string[];
  excludedEndpoints: string[];
  logLevels: {
    [key: string]: boolean;
  };
}

@Injectable()
export class AuditConfigService {
  private config: AuditConfig = {
    enabled: true,
    bufferSize: 50,
    flushInterval: 30000, // 30 seconds
    retentionDays: 90,
    maxExportRecords: 10000,
    sensitiveFields: ['password', 'token', 'secret', 'key'],
    excludedEndpoints: ['/health', '/metrics'],
    logLevels: {
      LOW: true,
      MEDIUM: true,
      HIGH: true,
      CRITICAL: true,
    },
  };

  getConfig(): AuditConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<AuditConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getBufferSize(): number {
    return this.config.bufferSize;
  }

  getFlushInterval(): number {
    return this.config.flushInterval;
  }

  getRetentionDays(): number {
    return this.config.retentionDays;
  }

  getMaxExportRecords(): number {
    return this.config.maxExportRecords;
  }

  isSensitiveField(field: string): boolean {
    return this.config.sensitiveFields.includes(field.toLowerCase());
  }

  isExcludedEndpoint(endpoint: string): boolean {
    return this.config.excludedEndpoints.some(excluded =>
      endpoint.startsWith(excluded)
    );
  }

  isLogLevelEnabled(level: string): boolean {
    return this.config.logLevels[level] ?? true;
  }

  // Sanitize sensitive data from audit details
  sanitizeDetails(details: Record<string, any>): Record<string, any> {
    if (!details) return details;

    const sanitized = { ...details };
    for (const field of this.config.sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }
    return sanitized;
  }
}