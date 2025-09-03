// Academia Pro - Attendance Module
// Module for managing student attendance across various contexts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Entities
import { Attendance } from './entities/attendance.entity';
import { Student } from '../students/student.entity';

// Controllers
import { AttendanceController } from './controllers/attendance.controller';

// Services
import { AttendanceService } from './services/attendance.service';

// Guards
import { AttendanceGuard } from './guards/attendance.guard';

// Interceptors
import { AttendanceInterceptor } from './interceptors/attendance.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Attendance, Student]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '24h'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttendanceGuard,
    AttendanceInterceptor,
  ],
  exports: [
    AttendanceService,
    AttendanceGuard,
  ],
})
export class AttendanceModule {}