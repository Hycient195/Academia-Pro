// Academia Pro - Common Module
// Shared services, guards, interceptors, and utilities

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Guards
import { ThrottlerGuard } from './src/common/guards/throttler.guard';
import { JwtAuthGuard } from './src/auth/guards/jwt-auth.guard';
import { RolesGuard } from './src/auth/guards/roles.guard';

// Interceptors
import { LoggingInterceptor } from './src/common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './src/common/interceptors/timeout.interceptor';
import { TransformInterceptor } from './src/common/interceptors/transform.interceptor';

// Filters
import { AllExceptionsFilter } from './src/common/filters/all-exceptions.filter';

// Services
import { LoggerService } from './src/common/services/logger.service';
import { EmailService } from './src/common/services/email.service';
import { FileUploadService } from './src/common/services/file-upload.service';

// Decorators
export * from './src/common/decorators/roles.decorator';

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