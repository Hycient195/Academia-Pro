import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { ParentPortalDashboardController } from './controllers/dashboard.controller';
import { ParentPortalAcademicController } from './controllers/academic.controller';
import { ParentPortalCommunicationController } from './controllers/communication.controller';
// import { ParentPortalAppointmentController } from './controllers/appointment.controller';
import { ParentPortalFeeController } from './controllers/fee.controller';
// import { ParentPortalTransportationController } from './controllers/transportation.controller';
import { ParentPortalTransportationController } from './controllers/transportation.controller';
import { ParentPortalResourceController } from './controllers/resource.controller';

// Services
import { ParentPortalDashboardService } from './services/dashboard.service';
import { ParentPortalAcademicService } from './services/academic.service';
import { ParentPortalCommunicationService } from './services/communication.service';
// import { ParentPortalAppointmentService } from './services/appointment.service';
import { ParentPortalFeeService } from './services/fee.service';
// import { ParentPortalTransportationService } from './services/transportation.service';
import { ParentPortalTransportationService } from './services/transportation.service';
import { ParentPortalResourceService } from './services/resource.service';

// Entities
import { ParentPortalAccess } from './entities/parent-portal-access.entity';
import { ParentStudentLink } from './entities/parent-student-link.entity';
import { PortalActivityLog } from './entities/portal-activity-log.entity';
import { CommunicationRecord } from './entities/communication-record.entity';
import { Appointment } from './entities/appointment.entity';
import { PaymentRecord } from './entities/payment-record.entity';
import { EmergencyContact } from './entities/emergency-contact.entity';
import { ResourceAccessLog } from './entities/resource-access-log.entity';
import { Parent } from '../parent/parent.entity';

// Guards
import { ParentPortalGuard } from './guards/parent-portal.guard';
import { ChildAccessGuard } from './guards/child-access.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ParentPortalAccess,
      ParentStudentLink,
      PortalActivityLog,
      CommunicationRecord,
      Appointment,
      PaymentRecord,
      EmergencyContact,
      ResourceAccessLog,
      Parent,
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
    ParentPortalDashboardController,
    ParentPortalAcademicController,
    ParentPortalCommunicationController,
    ParentPortalFeeController,
    ParentPortalTransportationController,
    ParentPortalResourceController,
  ],
  providers: [
    ParentPortalDashboardService,
    ParentPortalAcademicService,
    ParentPortalCommunicationService,
    ParentPortalFeeService,
    ParentPortalTransportationService,
    ParentPortalResourceService,
    ParentPortalGuard,
    ChildAccessGuard,
  ],
  exports: [
    ParentPortalDashboardService,
    ParentPortalAcademicService,
    ParentPortalCommunicationService,
    ParentPortalFeeService,
    ParentPortalTransportationService,
    ParentPortalResourceService,
  ],
})
export class ParentPortalModule {}