import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from '../../security/services/audit.service';
import { AuditLog } from '../../security/entities/audit-log.entity';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';
import { AuditInterceptor } from './audit.interceptor';
import { AuditConfigService } from './audit.config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([AuditLog]),
  ],
  providers: [
    AuditService,
    AuditInterceptor,
    AuditConfigService,
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
    TypeOrmModule,
    'AUDIT_TYPES',
  ],
})
export class AuditSharedModule {}