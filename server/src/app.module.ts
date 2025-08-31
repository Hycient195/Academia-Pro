// Academia Pro - Main Application Module
// Root module that configures the entire NestJS application

import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

// Core modules
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SchoolsModule } from './schools/schools.module';
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

// Common modules
import { CommonModule } from './common/common.module';
import { RedisModule } from './redis/redis.module';

// Guards, interceptors, and filters
import { ThrottlerGuard } from './common/guards/throttler.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

// Database configuration
import { databaseConfig } from './database.config';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // Database connection
    TypeOrmModule.forRoot(databaseConfig),

    // Rate limiting
    ThrottlerModule.forRoot([{
      ttl: 60 * 1000,    // Time window in milliseconds
      limit: 100, // Number of requests per window
    }]),

    // Feature modules
    CommonModule,
    RedisModule,
    AuthModule,
    UsersModule,
    SchoolsModule,
    StudentsModule,
    AcademicModule,
    AttendanceModule,
    ExaminationModule,
    TimetableModule,
    StaffModule,
    LibraryModule,
    HostelModule,
    FeeModule,
    CommunicationModule,
    ParentPortalModule,
    TransportationModule,
    InventoryModule,

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
    // SecurityModule,
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

    // Global exception filter
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply middleware to specific routes
    consumer
      .apply() // Add any global middleware here
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';

// @Module({
//   imports: [],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}
