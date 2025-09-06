// Academia Pro - Super Admin Module
// Module for super admin functionality

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import SchoolsModule
import { SchoolsModule } from '../schools/schools.module';

// Controllers
import { SuperAdminController } from './super-admin.controller';

// Services
import { CrossSchoolReportingService } from './cross-school-reporting.service';

@Module({
  imports: [
    forwardRef(() => SchoolsModule),
  ],
  controllers: [
    SuperAdminController,
  ],
  providers: [
    CrossSchoolReportingService,
  ],
  exports: [
    CrossSchoolReportingService,
  ],
})
export class SuperAdminModule {}