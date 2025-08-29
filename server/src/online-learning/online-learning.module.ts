import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { VirtualClassroomController } from './controllers/virtual-classroom.controller';
import { ContentManagementController } from './controllers/content-management.controller';
import { LearningAnalyticsController } from './controllers/learning-analytics.controller';
import { InteractiveToolsController } from './controllers/interactive-tools.controller';

// Services
import { VirtualClassroomService } from './services/virtual-classroom.service';
import { ContentManagementService } from './services/content-management.service';
import { LearningAnalyticsService } from './services/learning-analytics.service';
import { InteractiveToolsService } from './services/interactive-tools.service';
import { VideoConferencingService } from './services/video-conferencing.service';

// Entities
import { VirtualClassroom } from './entities/virtual-classroom.entity';
import { ClassroomSession } from './entities/classroom-session.entity';
import { DigitalContent } from './entities/digital-content.entity';
import { ContentVersion } from './entities/content-version.entity';
import { LearningMaterial } from './entities/learning-material.entity';
import { StudentProgress } from './entities/student-progress.entity';
import { LearningAnalytics } from './entities/learning-analytics.entity';
import { InteractiveElement } from './entities/interactive-element.entity';
import { Assessment } from './entities/assessment.entity';

// Gateways for WebSocket
import { VirtualClassroomGateway } from './gateways/virtual-classroom.gateway';

// Guards
import { ClassroomAccessGuard } from './guards/classroom-access.guard';
import { ContentAccessGuard } from './guards/content-access.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VirtualClassroom,
      ClassroomSession,
      DigitalContent,
      ContentVersion,
      LearningMaterial,
      StudentProgress,
      LearningAnalytics,
      InteractiveElement,
      Assessment,
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
    VirtualClassroomController,
    ContentManagementController,
    LearningAnalyticsController,
    InteractiveToolsController,
  ],
  providers: [
    VirtualClassroomService,
    ContentManagementService,
    LearningAnalyticsService,
    InteractiveToolsService,
    VideoConferencingService,
    VirtualClassroomGateway,
    ClassroomAccessGuard,
    ContentAccessGuard,
  ],
  exports: [
    VirtualClassroomService,
    ContentManagementService,
    LearningAnalyticsService,
    InteractiveToolsService,
    VideoConferencingService,
  ],
})
export class OnlineLearningModule {}