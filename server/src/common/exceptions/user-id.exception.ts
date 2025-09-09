// Academia Pro - User ID Exception
// Custom exception for user ID validation errors

import { HttpException, HttpStatus } from '@nestjs/common';

export class UserIdException extends HttpException {
  constructor(message: string = 'User ID validation failed') {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'User ID Validation Error',
        timestamp: new Date().toISOString(),
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class MissingUserIdException extends UserIdException {
  constructor() {
    super('User ID is required for this operation');
  }
}

export class InvalidUserIdFormatException extends UserIdException {
  constructor(userId?: string) {
    const message = userId
      ? `Invalid user ID format: ${userId}. Expected UUID format.`
      : 'Invalid user ID format. Expected UUID format.';
    super(message);
  }
}

export class UserIdValidationException extends UserIdException {
  constructor(reason: string) {
    super(`User ID validation failed: ${reason}`);
  }
}