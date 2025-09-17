// Academia Pro - Staff Module
// Comprehensive staff management and HR operations system

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuditSharedModule } from '../common/audit/audit.shared.module';

// Controllers
import { StaffController } from './controllers/staff.controller';

// Services
import { StaffService } from './services/staff.service';

// Entities
import { Staff } from './entities/staff.entity';
import { Department } from './entities/department.entity';

// Modules
import { DepartmentModule } from './department.module';

// Guards
import { StaffGuard } from './guards/staff.guard';

// Interceptors
import { StaffInterceptor } from './interceptors/staff.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Staff, Department]),
    DepartmentModule,
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
    AuditSharedModule,
  ],
  controllers: [StaffController],
  providers: [
    StaffService,
    StaffGuard,
    StaffInterceptor,
  ],
  exports: [
    StaffService,
    StaffGuard,
    StaffInterceptor,
  ],
})
export class StaffModule {}