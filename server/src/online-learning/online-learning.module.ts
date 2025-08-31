import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { VirtualClassroomController } from './controllers/virtual-classroom.controller';
import { ContentManagementController } from './controllers/content-management.controller';
import { InteractiveToolsController } from './controllers/interactive-tools.controller';

// Services
import { VirtualClassroomService } from './services/virtual-classroom.service';

// Entities
import { VirtualClassroom } from './entities/virtual-classroom.entity';
import { DigitalContent } from './entities/digital-content.entity';
import { StudentProgress } from './entities/student-progress.entity';

// TODO: Add missing files when needed:
// - LearningAnalyticsController
// - InteractiveToolsService
// - ContentManagementService
// - LearningAnalyticsService
// - VideoConferencingService
// - ClassroomSession, ContentVersion, LearningMaterial, LearningAnalytics, InteractiveElement, Assessment entities
// - VirtualClassroomGateway
// - ClassroomAccessGuard, ContentAccessGuard

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VirtualClassroom,
      DigitalContent,
      StudentProgress,
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
    InteractiveToolsController,
  ],
  providers: [
    VirtualClassroomService,
  ],
  exports: [
    VirtualClassroomService,
  ],
})
export class OnlineLearningModule {}