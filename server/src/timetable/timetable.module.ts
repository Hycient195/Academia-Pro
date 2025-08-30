// Academia Pro - Timetable Module
// Comprehensive timetable and scheduling management system

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { TimetableController } from './controllers/timetable.controller';

// Services
import { TimetableService } from './services/timetable.service';

// Entities
import { Timetable } from './entities/timetable.entity';

// Guards
import { TimetableGuard } from './guards/timetable.guard';

// Interceptors
import { TimetableInterceptor } from './interceptors/timetable.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Timetable]),
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
  controllers: [TimetableController],
  providers: [
    TimetableService,
    TimetableGuard,
    TimetableInterceptor,
  ],
  exports: [
    TimetableService,
    TimetableGuard,
    TimetableInterceptor,
  ],
})
export class TimetableModule {}