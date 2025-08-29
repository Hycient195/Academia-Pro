// Academia Pro - Common Module
// Shared services, guards, interceptors, and utilities

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Guards
import { ThrottlerGuard } from './common/guards/throttler.guard';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

// Interceptors
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

// Filters
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// Services
import { LoggerService } from './common/services/logger.service';
import { EmailService } from './common/services/email.service';
import { FileUploadService } from './common/services/file-upload.service';

// Decorators
export * from './common/decorators/roles.decorator';
export * from './common/decorators/user.decorator';

@Module({
  imports: [ConfigModule],
  providers: [
    // Guards
    ThrottlerGuard,
    JwtAuthGuard,
    RolesGuard,

    // Interceptors
    LoggingInterceptor,
    TimeoutInterceptor,
    TransformInterceptor,

    // Filters
    AllExceptionsFilter,

    // Services
    LoggerService,
    EmailService,
    FileUploadService,
  ],
  exports: [
    // Guards
    ThrottlerGuard,
    JwtAuthGuard,
    RolesGuard,

    // Interceptors
    LoggingInterceptor,
    TimeoutInterceptor,
    TransformInterceptor,

    // Filters
    AllExceptionsFilter,

    // Services
    LoggerService,
    EmailService,
    FileUploadService,

    // Config
    ConfigModule,
  ],
})
export class CommonModule {}