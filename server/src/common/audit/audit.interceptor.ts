import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditService } from '../../security/services/audit.service';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';
import { AuditConfigService } from './audit.config';
import { AUDITABLE_KEY, AuditableOptions } from './auditable.decorator';
import { SYSTEM_USER_ID } from '../../security/entities/audit-log.entity';
import { MissingUserIdException, InvalidUserIdFormatException } from '../exceptions/user-id.exception';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly auditConfig: AuditConfigService,
    private readonly reflector: Reflector,
  ) {}

  private validateUserId(userId: string): void {

    if (!userId) {
      throw new MissingUserIdException();
    }

    // Skip validation for system user IDs
    if (userId === '00000000-0000-0000-0000-000000000000' || userId === SYSTEM_USER_ID || userId === 'system') {
      return;
    }

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      throw new InvalidUserIdFormatException(userId);
    }
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Globally skip auditing when disabled (e.g., in test environment)
    if (!this.auditConfig?.isEnabled || !this.auditConfig.isEnabled()) {
      return next.handle();
    }

    // Skip audit for excluded endpoints
    if (this.auditConfig.isExcludedEndpoint(request.url)) {
      return next.handle();
    }

    // Get stashed audit data from middleware
    const auditData = (request as any).auditData;
    if (!auditData) {
      this.logger.error(`Audit data not found on request for ${request.method} ${request.url}. Middleware may not have run or failed. Skipping audit logging.`);
      // Continue with request processing but without audit
      return next.handle();
    }

    // Validate audit data integrity
    if (!auditData.startTime || !auditData.ipAddress || !auditData.correlationId) {
      this.logger.warn(`Incomplete audit data for ${request.method} ${request.url}. Some fields missing.`);
      // Continue but log warning
    }

    // Check if this is an authentication endpoint
    const isAuthEndpoint = this.isAuthenticationEndpoint(request.url, request.method);

    // Get user from request (now available after guard has run)
    const user = request.user as any;
    let userId = user?.sub || user?.id || user?.userId || null;

    this.logger.debug(`Audit interceptor: Processing ${request.method} ${request.url} with userId: ${userId || 'anonymous'} and IP: ${auditData.ipAddress}`);

    // For authentication endpoints, use a system identifier if no user ID is available
    if (isAuthEndpoint && !userId) {
      userId = '550e8400-e29b-41d4-a716-446655440000'; // Valid UUID for system authentication attempts
    }

    // Validate userId before proceeding (skip for auth endpoints)
    if (!isAuthEndpoint && userId) {
      this.validateUserId(userId);
    }

    // Ensure correlationId doesn't exceed VARCHAR(100) limit
    const correlationId = auditData.correlationId ? auditData.correlationId.substring(0, 100) : this.generateCorrelationId();
    const schoolId = user?.schoolId || request.headers['x-school-id'];
    const sessionId = this.sanitizeSessionId(user?.sessionId || request.headers['x-session-id']);

    // Get auditable options from decorator
    const auditableOptions = this.reflector.get<AuditableOptions>(AUDITABLE_KEY, handler);

    // Determine audit parameters (decorator takes precedence)
    const resource = auditableOptions?.resource || auditableOptions?.customResource || this.detectResource(auditData.url);

    // Ensure resource is within database limits (100 chars)
    const safeResource = resource && resource.length > 100 ? resource.substring(0, 100) : (resource || 'api');

    // Log the resource for debugging
    // console.log('Audit resource:', safeResource, 'length:', safeResource.length);
    // console.log('Original resource:', resource, 'length:', resource?.length);
    const crudAction = auditableOptions?.action || this.detectCrudAction(auditData.method, auditData.url);
    const resourceId = auditableOptions?.resourceId || this.extractResourceId(auditData.url);
    const severity = auditableOptions?.severity || this.getSeverityFromStatus(200, crudAction);

    // Performance optimization: Process audit logging asynchronously to avoid blocking response
    setImmediate(async () => {
      try {
        await this.auditService.runInAuditContext({
          userId,
          correlationId,
          schoolId,
          sessionId,
        }, async () => {
          await this.processAuditLog({
            userId,
            user,
            auditData,
            request,
            response,
            handler,
            controller,
            auditableOptions,
            resource: safeResource,
            crudAction,
            resourceId,
            correlationId,
            schoolId,
            sessionId,
          });
        });
      } catch (error) {
        this.logger.error(`Failed to process audit log asynchronously: ${error.message}`, error.stack);
      }
    });

    // Ensure action is a valid enum value
    const validAction = typeof crudAction === 'string' && Object.values(AuditAction).includes(crudAction as AuditAction)
      ? crudAction as AuditAction
      : AuditAction.DATA_ACCESSED;

    // Check sampling rate
    if (auditableOptions?.samplingRate !== undefined && Math.random() > auditableOptions.samplingRate) {
      return next.handle(); // Skip audit for this request
    }

    return next.handle().pipe(
      tap(async (data) => {
        // Response processing is now handled asynchronously in setImmediate
        // This tap is kept for any synchronous operations if needed
      }),
      catchError(async (error) => {
        // Error processing is now handled asynchronously in setImmediate
        // Re-throw the error to maintain error propagation
        return throwError(() => error);
      }),
    );
  }

  private generateCorrelationId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private isAuthenticationEndpoint(url: string, method: string): boolean {
    // Define authentication endpoints that don't require user context
    const authEndpoints = [
      '/auth/login',
      '/auth/me',
      '/auth/super-admin/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/reset-password-request',
      '/auth/reset-password',
      '/auth/verify-email'
    ];

    // Check if the URL matches any authentication endpoint
    return authEndpoints.some(endpoint => url.includes(endpoint)) && (method === 'POST' || method === 'GET');
  }

  private detectResource(url: string): string {
    // Strip query parameters from URL first
    const urlWithoutQuery = url.split('?')[0];

    // Extract resource from URL path and ensure it's within length limits
    const pathSegments = urlWithoutQuery.split('/').filter(segment => segment && !segment.match(/^\d+$/));
    const resource = pathSegments.length > 1 ? pathSegments.slice(1).join('/') : (pathSegments[0] || 'api');

    // Truncate if too long for the database field (100 chars limit)
    // Also ensure it's not empty after processing
    const truncatedResource = resource.length > 100 ? resource.substring(0, 100) : resource;
    return truncatedResource || 'api';
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
    const lastSegment = segments[segments.length - 1]?.includes("?") ? segments[segments.length - 1]?.split("?")[0] : segments[segments.length - 1];

    // If last segment is numeric (likely an ID), use it; otherwise use the full URL but truncated
    const resourceId = (lastSegment && lastSegment.match(/^\d+$/)) ? lastSegment : url;

    // Ensure resourceId doesn't exceed VARCHAR(100) limit
    return resourceId.length > 100 ? resourceId.substring(0, 100) : resourceId;
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
    if (statusCode < 200 || statusCode >= 300) {
      return false;
    }

    // Don't log if data is null, undefined, or empty
    if (data === null || data === undefined) {
      return false;
    }

    // For empty objects or arrays, don't log
    if (typeof data === 'object' && Object.keys(data).length === 0) {
      return false;
    }

    try {
      const dataString = JSON.stringify(data);
      return dataString.length < 10000;
    } catch (error) {
      // If JSON.stringify fails (circular references, etc.), don't log
      return false;
    }
  }

  private getCustomMetadata(handler: any): any {
    // Extract custom metadata from handler (can be enhanced with decorators later)
    return {
      handlerName: handler.name,
      // Add more metadata as needed
    };
  }

  private sanitizeSessionId(sessionId: any): string | undefined {
    if (!sessionId || typeof sessionId !== 'string') {
      return undefined;
    }

    // Trim whitespace and limit length
    const sanitized = sessionId.trim();
    if (sanitized.length === 0 || sanitized.length > 255) {
      return undefined;
    }

    return sanitized;
  }

  private getSeverityFromStatus(statusCode: number, action: AuditAction): AuditSeverity {
    if (statusCode >= 500) return AuditSeverity.CRITICAL;
    if (statusCode >= 400) return AuditSeverity.HIGH;
    if (action === AuditAction.DATA_DELETED || action === AuditAction.DATA_CREATED) {
      return AuditSeverity.MEDIUM;
    }
    return AuditSeverity.LOW;
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

  private sanitizeHeaders(headers: any): any {
    const sanitized = { ...headers };
    // Remove sensitive headers
    delete sanitized.authorization;
    delete sanitized.cookie;
    delete sanitized['x-api-key'];
    return sanitized;
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

  /**
   * Process audit logging asynchronously to avoid blocking the response
   */
  private async processAuditLog(params: {
    userId: string;
    user: any;
    auditData: any;
    request: any;
    response: any;
    handler: any;
    controller: any;
    auditableOptions: any;
    resource: string;
    crudAction: string;
    resourceId: string;
    correlationId: string;
    schoolId: string;
    sessionId: string;
  }): Promise<void> {
    const {
      userId,
      user,
      auditData,
      request,
      response,
      handler,
      controller,
      auditableOptions,
      resource,
      crudAction,
      resourceId,
      correlationId,
      schoolId,
      sessionId,
    } = params;

    try {
      const duration = Date.now() - auditData.startTime;
      const statusCode = response.statusCode;

      // Check performance threshold
      if (auditableOptions?.performanceThreshold && duration > auditableOptions.performanceThreshold) {
        this.logger.warn(`Performance threshold exceeded: ${duration}ms for ${auditData.method} ${auditData.url}`);
      }

      // Get geolocation (async, non-blocking)
      const geolocation = await this.getGeolocation(auditData.ipAddress);

      // Log successful operation with integrity verification
      await this.auditService.logActivityWithIntegrity({
        userId,
        action: crudAction,
        resource,
        resourceId,
        details: {
          method: auditData.method,
          url: auditData.url,
          statusCode,
          duration,
          requestSize: auditData.requestSize,
          responseSize: Buffer.isBuffer(response._body) ? response._body.length : (response._body ? JSON.stringify(response._body).length : 0),
          requestHeaders: auditData.requestHeaders,
          responseHeaders: this.sanitizeHeaders(response.getHeaders()),
          requestBody: auditableOptions?.includeRequestBody !== false ? auditData.requestBody : '[REQUEST_BODY_EXCLUDED]',
          responseData: auditableOptions?.includeResponseBody !== false && this.shouldLogResponseData(statusCode, response._body) ? this.sanitizeResponseBody(response._body) : '[RESPONSE_DATA_EXCLUDED]',
          geolocation,
          memoryUsage: this.getMemoryUsage(),
          performanceMetrics: this.getPerformanceMetrics(duration),
          handler: handler.name,
          controller: controller.name,
          customMetadata: { ...this.getCustomMetadata(handler), ...auditableOptions?.metadata },
        },
        ipAddress: auditData.ipAddress,
        userAgent: auditData.userAgent,
        severity: auditableOptions?.severity || this.getSeverityFromStatus(statusCode, crudAction as AuditAction),
        correlationId,
        schoolId,
        sessionId,
      });

      this.logger.debug(`Audited ${crudAction} on ${resource} - ${statusCode} (${duration}ms)`);
    } catch (error) {
      this.logger.error(`Failed to process audit log: ${error.message}`, error.stack);
    }
  }
}