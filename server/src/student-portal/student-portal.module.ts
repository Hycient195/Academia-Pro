import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Controllers
import { StudentPortalDashboardController } from './controllers/dashboard.controller';
import { StudentPortalAcademicController } from './controllers/academic.controller';
// Note: Other controllers will be implemented in future phases

// Services
import { StudentPortalDashboardService } from './services/dashboard.service';
import { StudentPortalAcademicService } from './services/academic.service';
// Note: Other services will be implemented in future phases

// Entities
import { StudentPortalAccess } from './entities/student-portal-access.entity';
import { StudentProfile } from './entities/student-profile.entity';
// Note: Other entities will be implemented in future phases

// Guards (commented out until implemented)
// import { StudentPortalGuard } from './guards/student-portal.guard';
// import { AgeAppropriateGuard } from './guards/age-appropriate.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StudentPortalAccess,
      StudentProfile,
      // Note: Other entities will be added as they are implemented
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
    // Note: Other controllers will be added as they are implemented
  ],
  providers: [
    StudentPortalDashboardService,
    StudentPortalAcademicService,
    // Note: Other services and guards will be added as they are implemented
  ],
  exports: [
    StudentPortalDashboardService,
    StudentPortalAcademicService,
    // Note: Other services will be exported as they are implemented
  ],
})
export class StudentPortalModule {}