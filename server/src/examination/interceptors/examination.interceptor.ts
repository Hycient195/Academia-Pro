// Academia Pro - Examination Interceptor
// Interceptor for examination-related operations

import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ExaminationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // Add any response transformation logic here
        // For example, adding metadata, formatting dates, etc.
        return data;
      }),
    );
  }
}