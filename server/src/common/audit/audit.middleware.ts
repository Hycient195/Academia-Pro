import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../../security/services/audit.service';
import { AuditConfigService } from './audit.config';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';

@Injectable()
export class AuditMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditMiddleware.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly auditConfig: AuditConfigService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const startTime = Date.now();

    // Skip audit for excluded endpoints
    if (this.auditConfig.isExcludedEndpoint(req.url)) {
      return next();
    }

    // Extract request details
    const user = req.user as any; // Cast to any to access JWT payload properties
    const userId = user?.sub || user?.id || user?.userId || 'anonymous';
    const correlationId = req.headers['x-correlation-id'] as string || this.generateCorrelationId();
    const schoolId = user?.schoolId || req.headers['x-school-id'] as string;
    const sessionId = user?.sessionId || req.headers['x-session-id'] as string;
    const ipAddress = this.getClientIp(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Set audit context
    this.auditService.setAuditContext({
      userId,
      correlationId,
      schoolId,
      sessionId,
    });

    // Capture request body for logging (before it might be modified)
    const requestBody = this.sanitizeRequestBody(req.body);

    // Override response methods to capture response details
    const originalSend = res.send;
    const originalJson = res.json;
    let responseBody: any = null;
    let responseSize = 0;

    const captureResponse = (body: any) => {
      responseBody = body;
      responseSize = Buffer.isBuffer(body) ? body.length : JSON.stringify(body).length;
      return body;
    };

    res.send = function(body: any) {
      return originalSend.call(this, captureResponse(body));
    };

    res.json = function(body: any) {
      return originalJson.call(this, captureResponse(body));
    };

    // Handle response finish
    res.on('finish', async () => {
      try {
        const duration = Date.now() - startTime;
        const statusCode = res.statusCode;
        const method = req.method;
        const url = req.url;

        // Get geolocation (async, non-blocking)
        const geolocation = await this.getGeolocation(ipAddress);

        // Log request/response details with integrity verification
        await this.auditService.logActivityWithIntegrity({
          userId,
          action: AuditAction.DATA_ACCESSED,
          resource: 'api',
          resourceId: `${method} ${url}`,
          details: {
            method,
            url,
            statusCode,
            duration,
            requestSize: req.headers['content-length'] ? parseInt(req.headers['content-length'] as string) : 0,
            responseSize,
            requestHeaders: this.sanitizeHeaders(req.headers),
            responseHeaders: this.sanitizeHeaders(res.getHeaders()),
            requestBody,
            responseBody: this.shouldLogResponseBody(statusCode) ? this.sanitizeResponseBody(responseBody) : '[RESPONSE_BODY_EXCLUDED]',
            geolocation,
            memoryUsage: this.getMemoryUsage(),
            performanceMetrics: this.getPerformanceMetrics(duration),
          },
          ipAddress,
          userAgent,
          severity: this.getSeverityFromStatus(statusCode),
          correlationId,
          schoolId,
          sessionId,
        });

        this.logger.debug(`Audited ${method} ${url} - ${statusCode} (${duration}ms)`);
      } catch (error) {
        this.logger.error(`Failed to log audit event: ${error.message}`, error.stack);
      }
    });

    // Handle response errors
    res.on('error', async (error) => {
      try {
        const duration = Date.now() - startTime;
        await this.auditService.logActivity({
          userId,
          action: AuditAction.SECURITY_ALERT,
          resource: 'api',
          resourceId: `${req.method} ${req.url}`,
          details: {
            error: error.message,
            stack: error.stack,
            duration,
          },
          ipAddress,
          userAgent,
          severity: AuditSeverity.HIGH,
          correlationId,
          schoolId,
          sessionId,
        });
      } catch (auditError) {
        this.logger.error(`Failed to log error audit: ${auditError.message}`, auditError.stack);
      }
    });

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
}