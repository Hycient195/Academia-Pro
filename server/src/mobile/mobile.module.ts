// Academia Pro - Mobile Module
// Module for mobile-optimized API endpoints

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import existing modules for data access
import { StudentPortalModule } from '../student-portal/student-portal.module';
import { TransportationModule } from '../transportation/transportation.module';

// Mobile controllers
import { MobileParentController } from './controllers/mobile-parent.controller';
import { MobileStudentController } from './controllers/mobile-student.controller';
import { MobileStaffController } from './controllers/mobile-staff.controller';
import { MobileAuthController } from './controllers/mobile-auth.controller';

// Mobile services
import { MobileNotificationService } from './services/mobile-notification.service';
import { MobileSyncService } from './services/mobile-sync.service';

@Module({
  imports: [
    StudentPortalModule,
    TransportationModule,
    // Add other modules as needed
  ],
  controllers: [
    MobileParentController,
    MobileStudentController,
    MobileStaffController,
    MobileAuthController,
  ],
  providers: [
    MobileNotificationService,
    MobileSyncService,
  ],
  exports: [
    MobileNotificationService,
    MobileSyncService,
  ],
})
export class MobileModule {}