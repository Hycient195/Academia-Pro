// Academia Pro - Main Application Module
// Root module that configures the entire NestJS application

import { Module, MiddlewareConsumer, RequestMethod, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

// Middleware
import { CookieAuthMiddleware } from './auth/middleware/cookie-auth.middleware';
import { CSRFMiddleware } from './auth/middleware/csrf.middleware';
import { SecurityMiddleware } from './auth/middleware/security.middleware';

// Core modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SchoolsModule } from './schools/schools.module';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { StudentsModule } from './students/students.module';
import { AcademicModule } from './academic/academic.module';
import { AttendanceModule } from './attendance/attendance.module';
import { ExaminationModule } from './examination/examination.module';
import { TimetableModule } from './timetable/timetable.module';
import { StaffModule } from './staff/staff.module';
import { LibraryModule } from './library/library.module';
import { HostelModule } from './hostel/hostel.module';
import { FeeModule } from './fee/fee.module';
import { CommunicationModule } from './communication/communication.module';
import { ParentPortalModule } from './parent-portal/parent-portal.module';
import { TransportationModule } from './transportation/transportation.module';
import { InventoryModule } from './inventory/inventory.module';
import { SecurityModule } from './security/security.module';

// Common modules
import { CommonModule } from './common/common.module';
import { RedisModule } from './redis/redis.module';
import { SeedersModule } from './database/seeders/seeders.module';

// Guards, interceptors, and filters
import { ThrottlerGuard } from './common/guards/throttler.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// Audit components
import { AuditInterceptor } from './common/audit/audit.interceptor';
import { AuditMiddleware } from './common/audit/audit.middleware';

// Database configuration
import { getDatabaseConfig } from './database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      // cache: true,
    }),

    // Database connection
    // TypeOrmModule.forRoot(databaseConfig),

    forwardRef(() =>
      TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => await getDatabaseConfig(configService),
        inject: [ConfigService],
      }),
    ),

    // Add User entity for global middleware access
    TypeOrmModule.forFeature([]),
    

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60 * 1000,    // Time window in milliseconds
      limit: 100, // Number of requests per window
    }]),

    // Redis module (before database for cache)
    forwardRef(() => RedisModule),

    // Feature modules
    forwardRef(() => CommonModule),
    // forwardRef(() => RedisModule),
    forwardRef(() => SeedersModule),
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    StaffModule,
    forwardRef(() => SuperAdminModule),
    forwardRef(() => StudentsModule),
    forwardRef(() => AcademicModule),
    forwardRef(() => AttendanceModule),
    forwardRef(() => ExaminationModule),
    forwardRef(() => TimetableModule),
    forwardRef(() => LibraryModule),
    forwardRef(() => HostelModule),
    forwardRef(() => FeeModule),
    forwardRef(() => CommunicationModule),
    forwardRef(() => ParentPortalModule),
    forwardRef(() => TransportationModule),
    forwardRef(() => InventoryModule),
    forwardRef(() => SecurityModule),

    // TODO: Add remaining modules as they are implemented
    // FeeModule,
    // TimetableModule,
    // LibraryModule,
    // TransportationModule,
    // HostelModule,
    // StaffModule,
    // InventoryModule,
    // ReportsModule,
    // StudentPortalModule,
    // OnlineLearningModule,
    // IntegrationModule,
    // MobileModule,
  ],
  providers: [
    // Global guards
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // Global interceptors
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },

    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    AppService,
  ],
  controllers: [AppController]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply audit middleware globally (before other middleware)
    consumer
      .apply(AuditMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // Apply security middleware globally
    consumer
      .apply(SecurityMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // Apply authentication middleware to protected routes
    consumer
      .apply(CookieAuthMiddleware)
      .exclude(
        { path: 'api/v1/auth/login', method: RequestMethod.POST },
        { path: 'api/v1/auth/register', method: RequestMethod.POST },
        { path: 'api/v1/auth/refresh', method: RequestMethod.POST },
        { path: 'api/v1/auth/reset-password-request', method: RequestMethod.POST },
        { path: 'api/v1/auth/reset-password', method: RequestMethod.POST },
        { path: 'api/v1/auth/verify-email', method: RequestMethod.POST },
        { path: 'api/v1/auth/csrf-token', method: RequestMethod.GET },
        { path: 'api/v1/super-admin/auth/login', method: RequestMethod.POST },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    // Apply CSRF middleware to state-changing operations
    consumer
      .apply(CSRFMiddleware)
      .exclude(
        { path: 'api/v1/auth/login', method: RequestMethod.POST },
        { path: 'api/v1/auth/register', method: RequestMethod.POST },
        { path: 'api/v1/auth/refresh', method: RequestMethod.POST },
        { path: 'api/v1/auth/csrf-token', method: RequestMethod.GET },
        { path: 'api/v1/auth/me', method: RequestMethod.GET },
        { path: 'api/v1/super-admin/auth/login', method: RequestMethod.POST },
        { path: 'api/v1/super-admin/*', method: RequestMethod.ALL }, // Exclude all super-admin routes
      )
      .forRoutes({ path: '*', method: RequestMethod.POST });
  }
}