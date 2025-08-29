import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Guards
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { IpWhitelistGuard } from './guards/ip-whitelist.guard';
import { SessionGuard } from './guards/session.guard';

// Interceptors
import { SecurityInterceptor } from './interceptors/security.interceptor';
import { AuditInterceptor } from './interceptors/audit.interceptor';
import { EncryptionInterceptor } from './interceptors/encryption.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';

// Middleware
import { SecurityHeadersMiddleware } from './middleware/security-headers.middleware';
import { CorsMiddleware } from './middleware/cors.middleware';
import { HelmetMiddleware } from './middleware/helmet.middleware';
import { RateLimitMiddleware } from './middleware/rate-limit.middleware';

// Services
import { SecurityService } from './services/security.service';
import { AuditService } from './services/audit.service';
import { EncryptionService } from './services/encryption.service';
import { AuthenticationService } from './services/authentication.service';
import { AuthorizationService } from './services/authorization.service';
import { SessionService } from './services/session.service';
import { ComplianceService } from './services/compliance.service';
import { VulnerabilityService } from './services/vulnerability.service';

// Entities
import { AuditLog } from './entities/audit-log.entity';
import { SecurityEvent } from './entities/security-event.entity';
import { UserSession } from './entities/user-session.entity';
import { FailedLoginAttempt } from './entities/failed-login-attempt.entity';
import { SecurityConfig } from './entities/security-config.entity';
import { ComplianceRecord } from './entities/compliance-record.entity';
import { DataRetentionPolicy } from './entities/data-retention-policy.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditLog,
      SecurityEvent,
      UserSession,
      FailedLoginAttempt,
      SecurityConfig,
      ComplianceRecord,
      DataRetentionPolicy,
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
    RateLimitGuard,
    IpWhitelistGuard,
    SessionGuard,

    // Interceptors
    SecurityInterceptor,
    AuditInterceptor,
    EncryptionInterceptor,
    LoggingInterceptor,

    // Middleware
    SecurityHeadersMiddleware,
    CorsMiddleware,
    HelmetMiddleware,
    RateLimitMiddleware,

    // Services
    SecurityService,
    AuditService,
    EncryptionService,
    AuthenticationService,
    AuthorizationService,
    SessionService,
    ComplianceService,
    VulnerabilityService,
  ],
  exports: [
    // Guards
    JwtAuthGuard,
    RolesGuard,
    RateLimitGuard,
    IpWhitelistGuard,
    SessionGuard,

    // Interceptors
    SecurityInterceptor,
    AuditInterceptor,
    EncryptionInterceptor,
    LoggingInterceptor,

    // Middleware
    SecurityHeadersMiddleware,
    CorsMiddleware,
    HelmetMiddleware,
    RateLimitMiddleware,

    // Services
    SecurityService,
    AuditService,
    EncryptionService,
    AuthenticationService,
    AuthorizationService,
    SessionService,
    ComplianceService,
    VulnerabilityService,

    // JWT Module for use in other modules
    JwtModule,
  ],
})
export class SecurityModule {}