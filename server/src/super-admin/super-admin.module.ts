// Academia Pro - Super Admin Module
// Module for super admin functionality

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Import SchoolsModule
import { SchoolsModule } from '../schools/schools.module';
import { UsersModule } from '../users/users.module';
import { IamModule } from '../iam/iam.module';

// Controllers
import { SuperAdminController } from './super-admin.controller';
import { SuperAdminUsersController } from './controllers/super-admin.controller';

// Services
import { CrossSchoolReportingService } from './cross-school-reporting.service';

@Module({
  imports: [
     forwardRef(() => SchoolsModule),
     forwardRef(() => UsersModule),
     forwardRef(() => IamModule),
  ],
  controllers: [
    SuperAdminController,
    SuperAdminUsersController,
  ],
  providers: [
    CrossSchoolReportingService,
  ],
  exports: [
    CrossSchoolReportingService,
  ],
})
export class SuperAdminModule {}