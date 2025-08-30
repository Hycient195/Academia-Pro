// Academia Pro - Fee Interceptor
// Response transformation and logging interceptor for fee operations

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class FeeInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FeeInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, user } = request;
    const startTime = Date.now();

    this.logger.log(
      `Fee Operation Started: ${method} ${url} by user ${user?.id || 'unknown'}`,
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(
          `Fee Operation Completed: ${method} ${url} in ${duration}ms`,
        );
      }),
      map((data) => {
        // Transform response to include metadata
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          return {
            success: true,
            data,
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          };
        }

        // For array responses (list operations)
        if (Array.isArray(data)) {
          return {
            success: true,
            data,
            count: data.length,
            timestamp: new Date().toISOString(),
            requestId: this.generateRequestId(),
          };
        }

        // For primitive responses
        return {
          success: true,
          data,
          timestamp: new Date().toISOString(),
          requestId: this.generateRequestId(),
        };
      }),
    );
  }

  private generateRequestId(): string {
    return `fee_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}