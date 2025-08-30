import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { StudentPortalDashboardController } from './controllers/dashboard.controller';
import { StudentPortalAcademicController } from './controllers/academic.controller';
import { StudentPortalCommunicationController } from './controllers/communication.controller';
import { StudentPortalSelfServiceController } from './controllers/self-service.controller';
import { StudentPortalExtracurricularController } from './controllers/extracurricular.controller';
import { StudentPortalWellnessController } from './controllers/wellness.controller';
import { StudentPortalCareerController } from './controllers/career.controller';
import { StudentPortalLibraryController } from './controllers/library.controller';
import { StudentPortalTransportationController } from './controllers/transportation.controller';
import { StudentPortalFeeController } from './controllers/fee.controller';
import { StudentPortalEmergencyController } from './controllers/emergency.controller';

// Services
import { StudentPortalDashboardService } from './services/dashboard.service';
import { StudentPortalAcademicService } from './services/academic.service';
import { StudentPortalCommunicationService } from './services/communication.service';
import { StudentPortalSelfServiceService } from './services/self-service.service';
import { StudentPortalExtracurricularService } from './services/extracurricular.service';
import { StudentPortalWellnessService } from './services/wellness.service';
import { StudentPortalCareerService } from './services/career.service';
import { StudentPortalLibraryService } from './services/library.service';
import { StudentPortalTransportationService } from './services/transportation.service';
import { StudentPortalFeeService } from './services/fee.service';
import { StudentPortalEmergencyService } from './services/emergency.service';

// Entities
import { StudentPortalAccess } from './entities/student-portal-access.entity';
import { StudentActivityLog } from './entities/student-activity-log.entity';
import { StudentResourceAccess } from './entities/student-resource-access.entity';
import { StudentCommunicationRecord } from './entities/student-communication-record.entity';
import { StudentSelfServiceRequest } from './entities/student-self-service-request.entity';
import { StudentExtracurricularActivity } from './entities/student-extracurricular-activity.entity';
import { StudentWellnessRecord } from './entities/student-wellness-record.entity';
import { StudentCareerProfile } from './entities/student-career-profile.entity';

// Guards
import { StudentPortalGuard } from './guards/student-portal.guard';
import { StudentAccessGuard } from './guards/student-access.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentPortalAccess,
      StudentActivityLog,
      StudentResourceAccess,
      StudentCommunicationRecord,
      StudentSelfServiceRequest,
      StudentExtracurricularActivity,
      StudentWellnessRecord,
      StudentCareerProfile,
    ]),
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
  controllers: [
    StudentPortalDashboardController,
    StudentPortalAcademicController,
    StudentPortalCommunicationController,
    StudentPortalSelfServiceController,
    StudentPortalExtracurricularController,
    StudentPortalWellnessController,
    StudentPortalCareerController,
    StudentPortalLibraryController,
    StudentPortalTransportationController,
    StudentPortalFeeController,
    StudentPortalEmergencyController,
  ],
  providers: [
    StudentPortalDashboardService,
    StudentPortalAcademicService,
    StudentPortalCommunicationService,
    StudentPortalSelfServiceService,
    StudentPortalExtracurricularService,
    StudentPortalWellnessService,
    StudentPortalCareerService,
    StudentPortalLibraryService,
    StudentPortalTransportationService,
    StudentPortalFeeService,
    StudentPortalEmergencyService,
    StudentPortalGuard,
    StudentAccessGuard,
  ],
  exports: [
    StudentPortalDashboardService,
    StudentPortalAcademicService,
    StudentPortalCommunicationService,
    StudentPortalSelfServiceService,
    StudentPortalExtracurricularService,
    StudentPortalWellnessService,
    StudentPortalCareerService,
    StudentPortalLibraryService,
    StudentPortalTransportationService,
    StudentPortalFeeService,
    StudentPortalEmergencyService,
  ],
})
export class StudentPortalModule {}