import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuditService } from '../../security/services/audit.service';
import { AuditLog } from '../../security/entities/audit-log.entity';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';
import { AuditInterceptor } from './audit.interceptor';
import { AuditConfigService } from './audit.config';
import { AuditGateway } from './audit.gateway';
import { AuditSocketGuard } from './audit-socket.guard';
import { AuditSocketInterceptor } from './audit-socket.interceptor';
import { AuditSubscriptionService } from './audit-subscription.service';
import { AuditMetricsService } from './audit-metrics.service';
import { AuditConnectionManagerService } from './audit-connection-manager.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default-secret',
      signOptions: { expiresIn: '24h' },
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),
  ],
  providers: [
    AuditService,
    AuditInterceptor,
    AuditConfigService,
    AuditGateway,
    AuditSocketGuard,
    AuditSocketInterceptor,
    AuditSubscriptionService,
    AuditMetricsService,
    AuditConnectionManagerService,
    // Export audit types for use in other modules
    {
      provide: 'AUDIT_TYPES',
      useValue: { AuditAction, AuditSeverity },
    },
  ],
  exports: [
    AuditService,
    AuditInterceptor,
    AuditConfigService,
    AuditGateway,
    AuditSocketGuard,
    AuditSocketInterceptor,
    AuditSubscriptionService,
    AuditMetricsService,
    AuditConnectionManagerService,
    TypeOrmModule,
    'AUDIT_TYPES',
  ],
})
export class AuditSharedModule {}