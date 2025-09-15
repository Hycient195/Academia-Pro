// Academia Pro - Students Module
// Comprehensive student lifecycle management from enrollment to graduation

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthJwtModule } from '../auth/auth-jwt.module';
import { AuditSharedModule } from '../common/audit/audit.shared.module';

// Controllers
import { StudentsController } from './students.controller';
import { StudentEnrollmentController } from './controllers/enrollment.controller';
import { StudentProfileController } from './controllers/profile.controller';
import { StudentTransferController } from './controllers/transfer.controller';
import { StudentHealthController } from './controllers/health.controller';
import { StudentAchievementController } from './controllers/achievement.controller';
import { StudentDisciplineController } from './controllers/discipline.controller';
import { StudentDocumentController } from './controllers/document.controller';
import { StudentAlumniController } from './controllers/alumni.controller';

// Services
import { StudentsService } from './students.service';
import { StudentAuditService } from './services/student-audit.service';
import { StudentEnrollmentService } from './services/enrollment.service';
import { StudentProfileService } from './services/profile.service';
import { StudentTransferService } from './services/transfer.service';
import { StudentHealthService } from './services/health.service';
import { StudentAchievementService } from './services/achievement.service';
import { StudentDisciplineService } from './services/discipline.service';
import { StudentDocumentService } from './services/document.service';
import { StudentAlumniService } from './services/alumni.service';

// Entities
import { Student } from './student.entity';
import { StudentTransfer } from './entities/student-transfer.entity';
import { StudentDocument } from './entities/student-document.entity';
import { StudentAchievement } from './entities/student-achievement.entity';
import { StudentDiscipline } from './entities/student-discipline.entity';
import { StudentMedicalRecord } from './entities/student-medical-record.entity';
import { StudentAlumni } from './entities/student-alumni.entity';
import { StudentAuditLog } from './entities/student-audit-log.entity';

// Guards
import { StudentManagementGuard } from './guards/student-management.guard';
import { DocumentAccessGuard } from './guards/document-access.guard';
import { CsrfGuard } from '../auth/guards/csrf.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      StudentTransfer,
      StudentDocument,
      StudentAchievement,
      StudentDiscipline,
      StudentMedicalRecord,
      StudentAlumni,
      StudentAuditLog,
    ]),
    AuthJwtModule,
    AuditSharedModule,
  ],
  controllers: [
    StudentsController,
    StudentEnrollmentController,
    StudentProfileController,
    StudentTransferController,
    StudentHealthController,
    StudentAchievementController,
    StudentDisciplineController,
    StudentDocumentController,
    StudentAlumniController,
  ],
  providers: [
    StudentsService,
    StudentAuditService,
    StudentEnrollmentService,
    StudentProfileService,
    StudentTransferService,
    StudentHealthService,
    StudentAchievementService,
    StudentDisciplineService,
    StudentDocumentService,
    StudentAlumniService,
    StudentManagementGuard,
    DocumentAccessGuard,
    CsrfGuard,
  ],
  exports: [
    StudentsService,
    StudentAuditService,
    StudentEnrollmentService,
    StudentProfileService,
    StudentTransferService,
    StudentHealthService,
    StudentAchievementService,
    StudentDisciplineService,
    StudentDocumentService,
    StudentAlumniService,
  ],
})
export class StudentsModule {}