// Academia Pro - Schools Module
// Module for multi-school architecture and school management

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { School } from './school.entity';
import { User } from '../users/user.entity';
import { Student } from '../students/student.entity';

// Services
import { SchoolContextService } from './school-context.service';
import { CrossSchoolReportingService } from './cross-school-reporting.service';

// Controllers
import { SuperAdminController } from './super-admin.controller';
import { SchoolAdminController } from './school-admin.controller';

// Guards
import { SchoolContextGuard } from '../common/guards/school-context.guard';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      School,
      User,
      Student,
    ]),
  ],
  controllers: [
    SuperAdminController,
    SchoolAdminController,
  ],
  providers: [
    SchoolContextService,
    CrossSchoolReportingService,
    SchoolContextGuard,
    RolesGuard,
  ],
  exports: [
    SchoolContextService,
    SchoolContextGuard,
    TypeOrmModule,
  ],
})
export class SchoolsModule {}