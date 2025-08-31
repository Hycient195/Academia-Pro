import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

// Services
import { SecurityService } from './services/security.service';
import { AuditService } from './services/audit.service';
import { ComplianceService } from './services/compliance.service';
import { PolicyService } from './services/policy.service';
import { ThreatDetectionService } from './services/threat-detection.service';

// Entities
import { AuditLog } from './entities/audit-log.entity';
import { SecurityEvent } from './entities/security-event.entity';
import { UserSession } from './entities/user-session.entity';

// TODO: Add missing files when needed:
// - Guards: RateLimitGuard, IpWhitelistGuard, SessionGuard
// - Interceptors: SecurityInterceptor, AuditInterceptor, EncryptionInterceptor, LoggingInterceptor
// - Middleware: SecurityHeadersMiddleware, CorsMiddleware, HelmetMiddleware, RateLimitMiddleware
// - Services: EncryptionService, AuthenticationService, AuthorizationService, SessionService, VulnerabilityService
// - Entities: FailedLoginAttempt, SecurityConfig, ComplianceRecord, DataRetentionPolicy

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditLog,
      SecurityEvent,
      UserSession,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1h'),
          issuer: configService.get<string>('JWT_ISSUER', 'academia-pro'),
          audience: configService.get<string>('JWT_AUDIENCE', 'academia-pro-api'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    // Guards
    JwtAuthGuard,
    RolesGuard,

    // Services
    SecurityService,
    AuditService,
    ComplianceService,
    PolicyService,
    ThreatDetectionService,
  ],
  exports: [
    // Guards
    JwtAuthGuard,
    RolesGuard,

    // Services
    SecurityService,
    AuditService,
    ComplianceService,
    PolicyService,
    ThreatDetectionService,

    // JWT Module for use in other modules
    JwtModule,
  ],
})
export class SecurityModule {}