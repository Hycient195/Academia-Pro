// Academia Pro - Hostel Interceptor
// Response transformation and logging for hostel operations

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HostelInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HostelInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const url = request.url;
    const user = request.user;

    const startTime = Date.now();

    return next.handle().pipe(
      map((data) => {
        const processingTime = Date.now() - startTime;

        // Log the operation
        this.logger.log(
          `${method} ${url} - ${response.statusCode} - ${processingTime}ms - User: ${user?.id || 'anonymous'} - Role: ${user?.role || 'unknown'}`
        );

        // Transform the response
        if (Array.isArray(data)) {
          // Handle array responses (list of hostels)
          return {
            success: true,
            data: data,
            meta: {
              count: data.length,
              timestamp: new Date().toISOString(),
              processingTime: `${processingTime}ms`,
              user: user?.id || 'anonymous',
            },
          };
        } else if (data && typeof data === 'object' && !data.success) {
          // Handle single object responses (individual hostel)
          return {
            success: true,
            data: data,
            meta: {
              timestamp: new Date().toISOString(),
              processingTime: `${processingTime}ms`,
              user: user?.id || 'anonymous',
            },
          };
        } else if (data && typeof data === 'object' && data.hostels) {
          // Handle report responses (utilization reports, etc.)
          return {
            success: true,
            data: data,
            meta: {
              timestamp: new Date().toISOString(),
              processingTime: `${processingTime}ms`,
              user: user?.id || 'anonymous',
              reportType: 'hostel_utilization',
            },
          };
        } else {
          // Handle other responses (statistics, dashboard, etc.)
          return data;
        }
      })
    );
  }
}