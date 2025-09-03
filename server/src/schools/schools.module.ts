// Academia Pro - Schools Module
// Module for multi-school architecture and school management

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { School } from './school.entity';
import { User } from '../users/user.entity';
import { Student } from '../students/student.entity';

// Services
import { SchoolsService } from './schools.service';
import { SchoolContextService } from './school-context.service';
import { CrossSchoolReportingService } from './cross-school-reporting.service';

// Controllers
import { SchoolsController } from './schools.controller';
import { SuperAdminController } from './super-admin.controller';
import { SchoolAdminController } from './school-admin.controller';

// Guards
import { SchoolContextGuard } from '../common/guards/school-context.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// Import other modules for service injection
import { StudentsModule } from '../students/students.module';
import { StaffModule } from '../staff/staff.module';
import { UsersModule } from '../users/users.module';
import { FeeModule } from '../fee/fee.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { CommunicationModule } from '../communication/communication.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      School,
      User,
      Student,
    ]),
    // Import other modules for service injection
    forwardRef(() => StudentsModule),
    forwardRef(() => StaffModule),
    forwardRef(() => UsersModule),
    forwardRef(() => FeeModule),
    forwardRef(() => AttendanceModule),
    forwardRef(() => CommunicationModule),
  ],
  controllers: [
    SchoolsController,
    SuperAdminController,
    SchoolAdminController,
  ],
  providers: [
    SchoolsService,
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