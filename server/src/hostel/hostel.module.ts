// Academia Pro - Hostel Module
// Comprehensive hostel/dormitory management system

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { HostelController } from './controllers/hostel.controller';

// Services
import { HostelService } from './services/hostel.service';

// Entities
import { Hostel } from './entities/hostel.entity';
import { Room } from './entities/room.entity';
import { HostelAllocation } from './entities/hostel-allocation.entity';

// Guards
import { HostelGuard } from './guards/hostel.guard';

// Interceptors
import { HostelInterceptor } from './interceptors/hostel.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Hostel,
      Room,
      HostelAllocation,
    ]),
  ],
  controllers: [HostelController],
  providers: [
    HostelService,
    HostelGuard,
    HostelInterceptor,
  ],
  exports: [
    HostelService,
    HostelGuard,
    HostelInterceptor,
    TypeOrmModule,
  ],
})
export class HostelModule {}