// Academia Pro - Logger Service
// Centralized logging service for the application

import { Injectable, Logger } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

@Injectable()
export class LoggerService extends Logger {
  private context: string;

  constructor() {
    super('LoggerService');
    this.context = 'LoggerService';
  }

  setContext(context: string): void {
    this.context = context;
  }

  error(message: string, trace?: string, context?: string): void {
    super.error(message, trace, context || this.context);
  }

  warn(message: string, context?: string): void {
    super.warn(message, context || this.context);
  }

  log(message: string, context?: string): void {
    super.log(message, context || this.context);
  }

  debug(message: string, context?: string): void {
    super.debug(message, context || this.context);
  }

  verbose(message: string, context?: string): void {
    super.verbose(message, context || this.context);
  }
}