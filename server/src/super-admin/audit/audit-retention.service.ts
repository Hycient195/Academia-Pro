import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { AuditLog } from '../../security/entities/audit-log.entity';
import { StudentAuditLog } from '../../students/entities/student-audit-log.entity';
import { AuditService } from '../../security/services/audit.service';
import { AuditSeverity } from '../../security/types/audit.types';
import { SYSTEM_USER_ID } from '../../security/entities/audit-log.entity';

export interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  retentionPeriodDays: number;
  severity?: AuditSeverity;
  resource?: string;
  action?: string;
  enabled: boolean;
  lastExecuted?: Date;
  recordsDeleted?: number;
}

export interface RetentionExecutionResult {
  policyId: string;
  recordsDeleted: number;
  executionTime: number;
  errors?: string[];
}

@Injectable()
export class AuditRetentionService {
  private readonly logger = new Logger(AuditRetentionService.name);

  // Default retention policies
  private readonly defaultPolicies: RetentionPolicy[] = [
    {
      id: 'low-severity-logs',
      name: 'Low Severity Logs',
      description: 'Automatically delete low severity audit logs after 90 days',
      retentionPeriodDays: 90,
      severity: AuditSeverity.LOW,
      enabled: true,
    },
    {
      id: 'medium-severity-logs',
      name: 'Medium Severity Logs',
      description: 'Automatically delete medium severity audit logs after 180 days',
      retentionPeriodDays: 180,
      severity: AuditSeverity.MEDIUM,
      enabled: true,
    },
    {
      id: 'high-severity-logs',
      name: 'High Severity Logs',
      description: 'Automatically delete high severity audit logs after 365 days',
      retentionPeriodDays: 365,
      severity: AuditSeverity.HIGH,
      enabled: true,
    },
    {
      id: 'critical-severity-logs',
      name: 'Critical Severity Logs',
      description: 'Keep critical severity audit logs indefinitely',
      retentionPeriodDays: -1, // Never delete
      severity: AuditSeverity.CRITICAL,
      enabled: true,
    },
    {
      id: 'authentication-logs',
      name: 'Authentication Logs',
      description: 'Keep authentication logs for 180 days',
      retentionPeriodDays: 180,
      action: 'authentication_success',
      enabled: true,
    },
    {
      id: 'failed-authentication-logs',
      name: 'Failed Authentication Logs',
      description: 'Keep failed authentication logs for 365 days',
      retentionPeriodDays: 365,
      action: 'authentication_failed',
      enabled: true,
    },
  ];

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(StudentAuditLog)
    private readonly studentAuditLogRepository: Repository<StudentAuditLog>,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Get all retention policies
   */
  getRetentionPolicies(): RetentionPolicy[] {
    return [...this.defaultPolicies];
  }

  /**
   * Get a specific retention policy by ID
   */
  getRetentionPolicy(policyId: string): RetentionPolicy | null {
    return this.defaultPolicies.find(policy => policy.id === policyId) || null;
  }

  /**
   * Execute retention policy cleanup
   */
  async executeRetentionPolicy(policyId: string): Promise<RetentionExecutionResult> {
    const policy = this.getRetentionPolicy(policyId);
    if (!policy) {
      throw new Error(`Retention policy ${policyId} not found`);
    }

    if (!policy.enabled) {
      throw new Error(`Retention policy ${policyId} is disabled`);
    }

    const startTime = Date.now();

    try {
      let totalDeleted = 0;
      const errors: string[] = [];

      // Execute cleanup for regular audit logs
      try {
        const auditDeleted = await this.executeAuditLogCleanup(policy);
        totalDeleted += auditDeleted;
      } catch (error) {
        errors.push(`Audit log cleanup failed: ${error.message}`);
      }

      // Execute cleanup for student audit logs
      try {
        const studentAuditDeleted = await this.executeStudentAuditLogCleanup(policy);
        totalDeleted += studentAuditDeleted;
      } catch (error) {
        errors.push(`Student audit log cleanup failed: ${error.message}`);
      }

      const executionTime = Date.now() - startTime;

      // Update policy execution info
      policy.lastExecuted = new Date();
      policy.recordsDeleted = totalDeleted;

      // Log the retention execution
      await this.auditService.logActivity({
        userId: SYSTEM_USER_ID,
        action: 'retention_policy_executed',
        resource: 'audit_retention',
        resourceId: policyId,
        details: {
          recordsDeleted: totalDeleted,
          executionTime,
          errors: errors.length > 0 ? errors : undefined,
        },
        severity: AuditSeverity.MEDIUM,
      });

      return {
        policyId,
        recordsDeleted: totalDeleted,
        executionTime,
        errors: errors.length > 0 ? errors : undefined,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;

      // Log the failed retention execution
      await this.auditService.logActivity({
        userId: SYSTEM_USER_ID,
        action: 'retention_policy_failed',
        resource: 'audit_retention',
        resourceId: policyId,
        details: {
          error: error.message,
          executionTime,
        },
        severity: AuditSeverity.HIGH,
      });

      throw error;
    }
  }

  /**
   * Execute retention cleanup for all enabled policies
   */
  async executeAllRetentionPolicies(): Promise<RetentionExecutionResult[]> {
    const enabledPolicies = this.defaultPolicies.filter(policy => policy.enabled);
    const results: RetentionExecutionResult[] = [];

    for (const policy of enabledPolicies) {
      try {
        const result = await this.executeRetentionPolicy(policy.id);
        results.push(result);
      } catch (error) {
        this.logger.error(`Failed to execute retention policy ${policy.id}:`, error);
        results.push({
          policyId: policy.id,
          recordsDeleted: 0,
          executionTime: 0,
          errors: [error.message],
        });
      }
    }

    return results;
  }

  /**
   * Get retention statistics
   */
  async getRetentionStatistics(): Promise<{
    totalAuditLogs: number;
    totalStudentAuditLogs: number;
    logsByAge: {
      lessThan30Days: number;
      between30And90Days: number;
      between90And180Days: number;
      between180And365Days: number;
      moreThan365Days: number;
    };
    policyExecutionHistory: Array<{
      policyId: string;
      lastExecuted: Date;
      recordsDeleted: number;
    }>;
    estimatedCleanupSize: {
      next30Days: number;
      next90Days: number;
      next180Days: number;
    };
  }> {
    // Get total counts
    const [totalAuditLogs, totalStudentAuditLogs] = await Promise.all([
      this.auditLogRepository.count(),
      this.studentAuditLogRepository.count(),
    ]);

    // Get logs by age ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
    const threeSixtyFiveDaysAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    const [lessThan30Days, between30And90Days, between90And180Days, between180And365Days, moreThan365Days] = await Promise.all([
      this.auditLogRepository.count({ where: { timestamp: MoreThan(thirtyDaysAgo) } }),
      this.auditLogRepository.createQueryBuilder('audit')
        .where('audit.timestamp < :thirtyDaysAgo', { thirtyDaysAgo })
        .andWhere('audit.timestamp > :ninetyDaysAgo', { ninetyDaysAgo })
        .getCount(),
      this.auditLogRepository.createQueryBuilder('audit')
        .where('audit.timestamp < :ninetyDaysAgo', { ninetyDaysAgo })
        .andWhere('audit.timestamp > :oneEightyDaysAgo', { oneEightyDaysAgo })
        .getCount(),
      this.auditLogRepository.createQueryBuilder('audit')
        .where('audit.timestamp < :oneEightyDaysAgo', { oneEightyDaysAgo })
        .andWhere('audit.timestamp > :threeSixtyFiveDaysAgo', { threeSixtyFiveDaysAgo })
        .getCount(),
      this.auditLogRepository.count({ where: { timestamp: LessThan(threeSixtyFiveDaysAgo) } }),
    ]);

    // Calculate estimated cleanup sizes
    const estimatedCleanupSize = {
      next30Days: await this.estimateCleanupSize(30),
      next90Days: await this.estimateCleanupSize(90),
      next180Days: await this.estimateCleanupSize(180),
    };

    return {
      totalAuditLogs,
      totalStudentAuditLogs,
      logsByAge: {
        lessThan30Days,
        between30And90Days,
        between90And180Days,
        between180And365Days,
        moreThan365Days,
      },
      policyExecutionHistory: this.defaultPolicies
        .filter(policy => policy.lastExecuted)
        .map(policy => ({
          policyId: policy.id,
          lastExecuted: policy.lastExecuted!,
          recordsDeleted: policy.recordsDeleted || 0,
        })),
      estimatedCleanupSize,
    };
  }

  /**
   * Preview what would be deleted by a retention policy
   */
  async previewRetentionPolicy(policyId: string): Promise<{
    auditLogsToDelete: number;
    studentAuditLogsToDelete: number;
    oldestLogDate: Date | null;
    newestLogDate: Date | null;
  }> {
    const policy = this.getRetentionPolicy(policyId);
    if (!policy) {
      throw new Error(`Retention policy ${policyId} not found`);
    }

    if (policy.retentionPeriodDays === -1) {
      // Never delete
      return {
        auditLogsToDelete: 0,
        studentAuditLogsToDelete: 0,
        oldestLogDate: null,
        newestLogDate: null,
      };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriodDays);

    // Count audit logs to delete
    let auditQuery = this.auditLogRepository.createQueryBuilder('audit')
      .where('audit.timestamp < :cutoffDate', { cutoffDate });

    if (policy.severity) {
      auditQuery = auditQuery.andWhere('audit.severity = :severity', { severity: policy.severity });
    }

    if (policy.action) {
      auditQuery = auditQuery.andWhere('audit.action = :action', { action: policy.action });
    }

    if (policy.resource) {
      auditQuery = auditQuery.andWhere('audit.resource = :resource', { resource: policy.resource });
    }

    const auditLogsToDelete = await auditQuery.getCount();

    // Count student audit logs to delete
    let studentAuditQuery = this.studentAuditLogRepository.createQueryBuilder('studentAudit')
      .where('studentAudit.createdAt < :cutoffDate', { cutoffDate });

    if (policy.severity) {
      studentAuditQuery = studentAuditQuery.andWhere('studentAudit.severity = :severity', { severity: policy.severity });
    }

    const studentAuditLogsToDelete = await studentAuditQuery.getCount();

    // Get date range info
    const dateRangeQuery = await auditQuery
      .select('MIN(audit.timestamp)', 'oldest')
      .addSelect('MAX(audit.timestamp)', 'newest')
      .getRawOne();

    return {
      auditLogsToDelete,
      studentAuditLogsToDelete,
      oldestLogDate: dateRangeQuery?.oldest || null,
      newestLogDate: dateRangeQuery?.newest || null,
    };
  }

  /**
   * Update retention policy settings
   */
  updateRetentionPolicy(policyId: string, updates: Partial<RetentionPolicy>): RetentionPolicy {
    const policyIndex = this.defaultPolicies.findIndex(policy => policy.id === policyId);
    if (policyIndex === -1) {
      throw new Error(`Retention policy ${policyId} not found`);
    }

    // Update the policy
    this.defaultPolicies[policyIndex] = {
      ...this.defaultPolicies[policyIndex],
      ...updates,
    };

    return this.defaultPolicies[policyIndex];
  }

  // Private methods

  private async executeAuditLogCleanup(policy: RetentionPolicy): Promise<number> {
    if (policy.retentionPeriodDays === -1) {
      return 0; // Never delete
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriodDays);

    let query = this.auditLogRepository.createQueryBuilder('audit')
      .delete()
      .where('audit.timestamp < :cutoffDate', { cutoffDate });

    if (policy.severity) {
      query = query.andWhere('audit.severity = :severity', { severity: policy.severity });
    }

    if (policy.action) {
      query = query.andWhere('audit.action = :action', { action: policy.action });
    }

    if (policy.resource) {
      query = query.andWhere('audit.resource = :resource', { resource: policy.resource });
    }

    const result = await query.execute();
    return result.affected || 0;
  }

  private async executeStudentAuditLogCleanup(policy: RetentionPolicy): Promise<number> {
    if (policy.retentionPeriodDays === -1) {
      return 0; // Never delete
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - policy.retentionPeriodDays);

    let query = this.studentAuditLogRepository.createQueryBuilder('studentAudit')
      .delete()
      .where('studentAudit.createdAt < :cutoffDate', { cutoffDate });

    if (policy.severity) {
      query = query.andWhere('studentAudit.severity = :severity', { severity: policy.severity });
    }

    const result = await query.execute();
    return result.affected || 0;
  }

  private async estimateCleanupSize(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const count = await this.auditLogRepository.count({
      where: { timestamp: LessThan(cutoffDate) },
    });

    return count;
  }
}