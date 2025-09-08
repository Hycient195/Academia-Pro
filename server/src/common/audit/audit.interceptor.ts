import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../../security/services/audit.service';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';
import { AuditConfigService } from './audit.config';
import { AUDITABLE_KEY, AuditableOptions } from './auditable.decorator';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly auditConfig: AuditConfigService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Skip audit for excluded endpoints
    if (this.auditConfig.isExcludedEndpoint(request.url)) {
      return next.handle();
    }

    // Set up audit context for the request
    const user = request.user as any;
    const userId = user?.sub || user?.id || user?.userId || 'anonymous';
    const correlationId = request.headers['x-correlation-id'] || this.generateCorrelationId();
    const schoolId = user?.schoolId || request.headers['x-school-id'];
    const sessionId = user?.sessionId || request.headers['x-session-id'];

    this.auditService.setAuditContext({
      userId,
      correlationId,
      schoolId,
      sessionId,
    });

    const startTime = Date.now();
    const method = request.method;
    const url = request.url;

    // Get auditable options from decorator
    const auditableOptions = this.reflector.get<AuditableOptions>(AUDITABLE_KEY, handler);

    // Determine audit parameters (decorator takes precedence)
    const resource = auditableOptions?.resource || auditableOptions?.customResource || this.detectResource(url);
    const crudAction = auditableOptions?.action || this.detectCrudAction(method, url);
    const resourceId = auditableOptions?.resourceId || this.extractResourceId(url);
    const severity = auditableOptions?.severity || this.getSeverityFromStatus(200, crudAction);

    // Check sampling rate
    if (auditableOptions?.samplingRate !== undefined && Math.random() > auditableOptions.samplingRate) {
      return next.handle(); // Skip audit for this request
    }

    return next.handle().pipe(
      tap(async (data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Check performance threshold
        if (auditableOptions?.performanceThreshold && duration > auditableOptions.performanceThreshold) {
          this.logger.warn(`Performance threshold exceeded: ${duration}ms for ${method} ${url}`);
        }

        // Log successful operation with integrity verification
        await this.auditService.logActivityWithIntegrity({
          userId,
          action: crudAction,
          resource,
          resourceId,
          details: {
            method,
            url,
            statusCode,
            duration,
            userAgent: request.headers['user-agent'],
            ipAddress: this.getClientIp(request),
            requestBody: auditableOptions?.includeRequestBody !== false ? this.sanitizeRequestBody(request.body) : '[REQUEST_BODY_EXCLUDED]',
            responseData: auditableOptions?.includeResponseBody !== false && this.shouldLogResponseData(statusCode, data) ? this.sanitizeResponseBody(data) : '[RESPONSE_DATA_EXCLUDED]',
            handler: handler.name,
            controller: controller.name,
            customMetadata: { ...this.getCustomMetadata(handler), ...auditableOptions?.metadata },
            performanceMetrics: {
              duration,
              threshold: auditableOptions?.performanceThreshold,
              exceeded: auditableOptions?.performanceThreshold ? duration > auditableOptions.performanceThreshold : false,
            },
          },
          ipAddress: this.getClientIp(request),
          userAgent: request.headers['user-agent'] || 'unknown',
          severity: auditableOptions?.severity || this.getSeverityFromStatus(statusCode, crudAction),
          correlationId,
          schoolId,
          sessionId,
        });

        this.logger.debug(`Audited ${crudAction} on ${resource} - ${statusCode} (${duration}ms)`);
      }),
      catchError(async (error) => {
        const duration = Date.now() - startTime;

        // Log error with integrity verification
        await this.auditService.logActivityWithIntegrity({
          userId,
          action: auditableOptions?.action || AuditAction.SECURITY_ALERT,
          resource: auditableOptions?.resource || resource,
          resourceId: auditableOptions?.resourceId || resourceId,
          details: {
            method,
            url,
            error: error.message,
            statusCode: error.status || 500,
            duration,
            stack: error.stack,
            handler: handler.name,
            controller: controller.name,
            userAgent: request.headers['user-agent'],
            ipAddress: this.getClientIp(request),
            requestBody: auditableOptions?.includeRequestBody !== false ? this.sanitizeRequestBody(request.body) : '[REQUEST_BODY_EXCLUDED]',
            customMetadata: { ...this.getCustomMetadata(handler), ...auditableOptions?.metadata },
            performanceMetrics: {
              duration,
              threshold: auditableOptions?.performanceThreshold,
              exceeded: auditableOptions?.performanceThreshold ? duration > auditableOptions.performanceThreshold : false,
            },
          },
          ipAddress: this.getClientIp(request),
          userAgent: request.headers['user-agent'] || 'unknown',
          severity: auditableOptions?.severity || AuditSeverity.HIGH,
          correlationId,
          schoolId,
          sessionId,
        });

        this.logger.error(`Audit error logged: ${error.message}`, error.stack);

        // Re-throw the error
        return throwError(() => error);
      }),
    );
  }

  private generateCorrelationId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private detectResource(url: string): string {
    // Extract resource from URL path
    const pathSegments = url.split('/').filter(segment => segment && !segment.match(/^\d+$/));
    return pathSegments[0] || 'api';
  }

  private detectCrudAction(method: string, url: string): AuditAction {
    switch (method.toUpperCase()) {
      case 'POST':
        return AuditAction.DATA_CREATED;
      case 'PUT':
      case 'PATCH':
        return AuditAction.DATA_UPDATED;
      case 'DELETE':
        return AuditAction.DATA_DELETED;
      case 'GET':
      default:
        return AuditAction.DATA_ACCESSED;
    }
  }

  private extractResourceId(url: string): string {
    // Extract ID from URL (assuming RESTful patterns like /resource/:id)
    const segments = url.split('/');
    const lastSegment = segments[segments.length - 1];
    return lastSegment && lastSegment.match(/^\d+$/) ? lastSegment : url;
  }

  private getClientIp(request: any): string {
    return (
      request.headers['x-forwarded-for'] ||
      request.headers['x-real-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      'unknown'
    ).split(',')[0].trim();
  }

  private sanitizeRequestBody(body: any): any {
    if (!body) return body;
    return this.auditConfig.sanitizeDetails(body);
  }

  private sanitizeResponseBody(body: any): any {
    if (!body) return body;
    return this.auditConfig.sanitizeDetails(body);
  }

  private shouldLogResponseData(statusCode: number, data: any): boolean {
    // Only log response data for successful operations and small payloads
    return statusCode >= 200 && statusCode < 300 && JSON.stringify(data).length < 10000;
  }

  private getCustomMetadata(handler: any): any {
    // Extract custom metadata from handler (can be enhanced with decorators later)
    return {
      handlerName: handler.name,
      // Add more metadata as needed
    };
  }

  private getSeverityFromStatus(statusCode: number, action: AuditAction): AuditSeverity {
    if (statusCode >= 500) return AuditSeverity.CRITICAL;
    if (statusCode >= 400) return AuditSeverity.HIGH;
    if (action === AuditAction.DATA_DELETED || action === AuditAction.DATA_CREATED) {
      return AuditSeverity.MEDIUM;
    }
    return AuditSeverity.LOW;
  }
}