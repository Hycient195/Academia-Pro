// Academia Pro - Library Interceptor
// Response transformation and logging for library operations

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
export class LibraryInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LibraryInterceptor.name);

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
          `${method} ${url} - ${response.statusCode} - ${processingTime}ms - User: ${user?.id || 'anonymous'}`
        );

        // Transform the response
        if (Array.isArray(data)) {
          // Handle array responses (list of books)
          return {
            success: true,
            data: data,
            meta: {
              count: data.length,
              timestamp: new Date().toISOString(),
              processingTime: `${processingTime}ms`,
            },
          };
        } else if (data && typeof data === 'object' && !data.success) {
          // Handle single object responses (individual book)
          return {
            success: true,
            data: data,
            meta: {
              timestamp: new Date().toISOString(),
              processingTime: `${processingTime}ms`,
            },
          };
        } else {
          // Handle other responses (statistics, reports, etc.)
          return data;
        }
      })
    );
  }
}