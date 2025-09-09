// Academia Pro - All Exceptions Filter
// Global exception filter for handling all types of exceptions

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UserIdException, MissingUserIdException, InvalidUserIdFormatException } from '../exceptions/user-id.exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // Handle custom user ID exceptions with enhanced messages
      if (exception instanceof UserIdException) {
        const response = exception.getResponse() as any;
        message = response.message || exception.message;
        // Add additional context for user ID validation errors
        if (exception instanceof MissingUserIdException) {
          message = 'Authentication required: User ID is missing from request context';
        } else if (exception instanceof InvalidUserIdFormatException) {
          message = 'Authentication failed: Invalid user ID format provided';
        }
      } else {
        message = typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as any).message || message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    console.error(`[${new Date().toISOString()}] ${request.method} ${request.url} - ${status} ${message}`);

    response.status(status).json(errorResponse);
  }
}