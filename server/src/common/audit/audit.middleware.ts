import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../../security/services/audit.service';
import { AuditConfigService } from './audit.config';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';
import { SYSTEM_USER_ID } from '../../security/entities/audit-log.entity';
import { MissingUserIdException, InvalidUserIdFormatException } from '../exceptions/user-id.exception';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditMiddleware.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly auditConfig: AuditConfigService,
  ) {}

  private validateUserId(userId: string): void {
    if (!userId) {
      throw new MissingUserIdException();
    }

    // Skip validation for system user IDs
    if (userId === '00000000-0000-0000-0000-000000000000' || userId === SYSTEM_USER_ID) {
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new InvalidUserIdFormatException(userId);
    }
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Skip audit for excluded endpoints
    if (this.auditConfig.isExcludedEndpoint(req.url)) {
      return next();
    }

    // Capture early request data before authentication
    // IMPORTANT: Do NOT access req.user here as it's not yet set by guards
    const startTime = Date.now();
    const correlationId = req.headers['x-correlation-id'] as string || this.generateCorrelationId();
    const ipAddress = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Stash audit data on request for later use by interceptor
    (req as any).auditData = {
      startTime,
      correlationId,
      ipAddress,
      userAgent,
      method: req.method,
      url: req.url,
      requestBody: this.sanitizeRequestBody(req.body),
      requestHeaders: this.sanitizeHeaders(req.headers),
      requestSize: req.headers['content-length'] ? parseInt(req.headers['content-length'] as string) : 0,
    };

    this.logger.debug(`Audit middleware: Captured early data for ${req.method} ${req.url} from IP ${ipAddress}`);

    next();
  }

  private generateCorrelationId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getClientIp(req: Request): string {
    return (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown'
    ).split(',')[0].trim();
  }

  private async getGeolocation(ipAddress: string): Promise<any> {
    // Placeholder for geolocation service
    // In production, integrate with a geolocation API like ip-api.com or MaxMind
    try {
      // For now, return basic info or integrate with external service
      return {
        ip: ipAddress,
        country: 'Unknown',
        city: 'Unknown',
        // Add more fields as needed
      };
    } catch (error) {
      this.logger.warn(`Failed to get geolocation for ${ipAddress}: ${error.message}`);
      return { ip: ipAddress, error: 'Geolocation unavailable' };
    }
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;
    return this.auditConfig.sanitizeDetails(body);
  }

  private sanitizeResponseBody(body: any): any {
    if (!body) return body;
    // Sanitize sensitive data from response
    return this.auditConfig.sanitizeDetails(body);
  }

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    return sanitized;
  }

  private shouldLogResponseBody(statusCode: number): boolean {
    // Only log response body for certain status codes to avoid logging large responses
    return statusCode >= 200 && statusCode < 300;
  }

  private getSeverityFromStatus(statusCode: number): AuditSeverity {
    if (statusCode >= 500) return AuditSeverity.CRITICAL;
    if (statusCode >= 400) return AuditSeverity.HIGH;
    if (statusCode >= 300) return AuditSeverity.MEDIUM;
    return AuditSeverity.LOW;
  }

  private getMemoryUsage(): any {
    const memUsage = process.memoryUsage();
    return {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
    };
  }

  private getPerformanceMetrics(duration: number): any {
    return {
      responseTime: duration,
      isSlow: duration > 1000, // Flag slow requests > 1s
      timestamp: new Date().toISOString(),
    };
  }

  private isAuthenticationEndpoint(url: string, method: string): boolean {
    // Define authentication endpoints that don't require user context
    const authEndpoints = [
      '/auth/login',
      '/auth/super-admin/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/reset-password-request',
      '/auth/reset-password',
      '/auth/verify-email',
      '/auth/csrf-token'
    ];

    // Check if the URL matches any authentication endpoint
    return authEndpoints.some(endpoint => url.includes(endpoint)) && (method === 'POST' || method === 'GET');
  }
}