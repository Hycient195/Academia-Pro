import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Optional } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from '../../security/services/audit.service';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';

@Injectable()
export class AuditSocketInterceptor implements NestInterceptor {
  private readonly messageCounts = new Map<string, { count: number; resetTime: number }>();
  private readonly rateLimitWindow = 60000; // 1 minute
  private readonly rateLimitMax = 100; // 100 messages per minute per client

  constructor(@Optional() private readonly auditService?: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const client = context.switchToWs().getClient();
    const data = context.switchToWs().getData();
    const event = context.switchToWs().getPattern();

    // Rate limiting
    if (!this.checkRateLimit(client.id)) {
      if (this.auditService) {
        this.auditService.logActivity({
          userId: (client as any).user?.id || 'unknown',
          action: AuditAction.SECURITY_ALERT,
          resource: 'websocket',
          resourceId: 'rate_limit_exceeded',
          details: {
            eventType: 'websocket_rate_limit',
            clientId: client.id,
            event,
            ipAddress: client.handshake.address,
          },
          ipAddress: client.handshake.address,
          userAgent: client.handshake.headers['user-agent'] || 'unknown',
          severity: AuditSeverity.HIGH,
        });
      }

      return throwError(() => new Error('Rate limit exceeded'));
    }

    // Log WebSocket activity
    if (this.auditService) {
      this.auditService.logActivity({
        userId: (client as any).user?.id || 'unknown',
        action: AuditAction.DATA_ACCESSED,
        resource: 'websocket',
        resourceId: event,
        details: {
          eventType: 'websocket_message',
          clientId: client.id,
          event,
          hasData: !!data,
          dataSize: data ? JSON.stringify(data).length : 0,
        },
        ipAddress: client.handshake.address,
        userAgent: client.handshake.headers['user-agent'] || 'unknown',
        severity: AuditSeverity.LOW,
        sessionId: (client as any).user?.sessionId,
      });
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        // Log successful message processing
        if (duration > 1000) { // Log slow WebSocket operations
          this.auditService.logActivity({
            userId: (client as any).user?.id || 'unknown',
            action: AuditAction.SECURITY_ALERT,
            resource: 'websocket',
            resourceId: 'slow_operation',
            details: {
              eventType: 'websocket_slow_operation',
              clientId: client.id,
              event,
              duration,
            },
            ipAddress: client.handshake.address,
            userAgent: client.handshake.headers['user-agent'] || 'unknown',
            severity: AuditSeverity.MEDIUM,
          });
        }
      }),
      catchError((error) => {
        // Log WebSocket errors
        this.auditService.logActivity({
          userId: (client as any).user?.id || 'unknown',
          action: AuditAction.SECURITY_ALERT,
          resource: 'websocket',
          resourceId: 'error',
          details: {
            eventType: 'websocket_error',
            clientId: client.id,
            event,
            error: error.message,
          },
          ipAddress: client.handshake.address,
          userAgent: client.handshake.headers['user-agent'] || 'unknown',
          severity: AuditSeverity.HIGH,
        });

        return throwError(() => error);
      }),
    );
  }

  private checkRateLimit(clientId: string): boolean {
    const now = Date.now();
    const clientLimit = this.messageCounts.get(clientId);

    if (!clientLimit || now > clientLimit.resetTime) {
      // Reset or initialize rate limit for client
      this.messageCounts.set(clientId, {
        count: 1,
        resetTime: now + this.rateLimitWindow,
      });
      return true;
    }

    if (clientLimit.count >= this.rateLimitMax) {
      return false;
    }

    clientLimit.count++;
    return true;
  }

  // Cleanup old rate limit entries
  cleanupRateLimits(): void {
    const now = Date.now();
    for (const [clientId, limit] of this.messageCounts.entries()) {
      if (now > limit.resetTime) {
        this.messageCounts.delete(clientId);
      }
    }
  }
}