// Academia Pro - Logging Interceptor
// Interceptor for logging HTTP requests and responses

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    // console.log(`[${new Date().toISOString()}] ${method} ${url} - Request started`);

    return next
      .handle()
      .pipe(
        tap(() => {
          // console.log(`[${new Date().toISOString()}] ${method} ${url} - Request completed in ${Date.now() - now}ms`);
        }),
      );
  }
}