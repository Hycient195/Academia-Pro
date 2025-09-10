import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { AuditLog } from '../../security/entities/audit-log.entity';
import { StudentAuditLog } from '../../students/entities/student-audit-log.entity';
import { User } from '../../users/user.entity';

// Controllers
import { AuditController } from './audit.controller';
import { AuditMetricsController } from './audit-metrics.controller';

// Services
import { AuditManagementService } from './audit-management.service';
import { AuditAggregationService } from './audit-aggregation.service';
import { AuditExportService } from './audit-export.service';
import { AuditRetentionService } from './audit-retention.service';

// External dependencies
import { AuditService } from '../../security/services/audit.service';
import { SecurityModule } from '../../security/security.module';
import { StudentsModule } from '../../students/students.module';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [
    // TypeORM entities
    TypeOrmModule.forFeature([
      AuditLog,
      StudentAuditLog,
      User,
    ]),

    // External modules for dependencies
    forwardRef(() => SecurityModule), // For AuditService
    forwardRef(() => StudentsModule), // For StudentAuditLog access
    forwardRef(() => RedisModule), // For caching
  ],
  controllers: [
    AuditController,
    AuditMetricsController,
  ],
  providers: [
    // Services
    AuditManagementService,
    AuditAggregationService,
    AuditExportService,
    AuditRetentionService,

    // External services (imported from other modules)
    AuditService,
  ],
  exports: [
    // Export services for use in other modules
    AuditManagementService,
    AuditAggregationService,
    AuditExportService,
    AuditRetentionService,
  ],
})
export class AuditModule {}