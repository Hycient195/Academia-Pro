import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThan } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditAction, AuditSeverity } from './audit.service';
import { SecurityPolicy, PolicyType, PolicyStatus } from '../entities/security-policy.entity';
import { UserSession, SessionStatus } from '../entities/user-session.entity';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(SecurityPolicy)
    private securityPolicyRepository: Repository<SecurityPolicy>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    private dataSource: DataSource,
  ) {}

  async logSecurityEvent(
    action: AuditAction,
    userId: string | null,
    severity: AuditSeverity,
    description: string,
    metadata?: any,
    ipAddress: string = 'unknown',
    userAgent?: string,
  ): Promise<AuditLog> {
    try {
      this.logger.log(`Logging security event: ${action} for user: ${userId}`);

      const auditLog = this.auditLogRepository.create({
        userId,
        action,
        severity,
        resource: 'security',
        ipAddress,
        userAgent,
        details: {
          description,
          ...metadata,
        },
      });

      const savedLog = await this.auditLogRepository.save(auditLog);
      this.logger.log(`Security event logged with ID: ${savedLog.id}`);

      return savedLog;
    } catch (error) {
      this.logger.error(`Failed to log security event: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSecurityEvents(
    filters: {
      userId?: string;
      action?: AuditAction;
      severity?: AuditSeverity;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<{ events: AuditLog[]; total: number }> {
    try {
      this.logger.log(`Retrieving security events with filters:`, filters);

      const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

      if (filters.userId) {
        queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
      }

      if (filters.action) {
        queryBuilder.andWhere('audit.action = :action', { action: filters.action });
      }

      if (filters.severity) {
        queryBuilder.andWhere('audit.severity = :severity', { severity: filters.severity });
      }

      if (filters.startDate && filters.endDate) {
        queryBuilder.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
          startDate: filters.startDate,
          endDate: filters.endDate,
        });
      }

      const total = await queryBuilder.getCount();

      queryBuilder
        .orderBy('audit.timestamp', 'DESC')
        .limit(filters.limit || 50)
        .offset(filters.offset || 0);

      const events = await queryBuilder.getMany();

      return { events, total };
    } catch (error) {
      this.logger.error(`Failed to get security events: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSecurityDashboard(): Promise<any> {
    try {
      this.logger.log('Retrieving security dashboard data');

      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get event counts by severity
      const severityStats = await this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.severity', 'severity')
        .addSelect('COUNT(*)', 'count')
        .where('audit.timestamp >= :last30Days', { last30Days })
        .groupBy('audit.severity')
        .getRawMany();

      // Get event counts by action type
      const eventTypeStats = await this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.action', 'eventType')
        .addSelect('COUNT(*)', 'count')
        .where('audit.timestamp >= :last30Days', { last30Days })
        .groupBy('audit.action')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      // Get recent critical events
      const recentCriticalEvents = await this.auditLogRepository.find({
        where: {
          severity: AuditSeverity.CRITICAL,
          timestamp: MoreThan(last7Days),
        },
        order: { timestamp: 'DESC' },
        take: 10,
      });

      // Get active sessions count
      const activeSessionsCount = await this.userSessionRepository.count({
        where: { status: SessionStatus.ACTIVE },
      });

      // Get failed login attempts in last 24 hours
      const failedLoginAttempts = await this.auditLogRepository.count({
        where: {
          action: AuditAction.AUTHENTICATION_FAILED,
          timestamp: MoreThan(last24Hours),
        },
      });

      // Get active security policies
      const activePoliciesCount = await this.securityPolicyRepository.count({
        where: { status: PolicyStatus.ACTIVE },
      });

      return {
        overview: {
          totalEventsLast30Days: severityStats.reduce((sum, stat) => sum + parseInt(stat.count), 0),
          activeSessions: activeSessionsCount,
          failedLoginAttempts: failedLoginAttempts,
          activePolicies: activePoliciesCount,
        },
        severityBreakdown: severityStats.map(stat => ({
          severity: stat.severity,
          count: parseInt(stat.count),
        })),
        topEventTypes: eventTypeStats.map(stat => ({
          eventType: stat.eventType,
          count: parseInt(stat.count),
        })),
        recentCriticalEvents: recentCriticalEvents.map(event => ({
          id: event.id,
          action: event.action,
          description: event.details?.description || 'Security event',
          timestamp: event.timestamp,
          userId: event.userId,
          ipAddress: event.ipAddress,
        })),
        timeRange: {
          last24Hours,
          last7Days,
          last30Days,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get security dashboard: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSecurityMetrics(timeRange: '24h' | '7d' | '30d' = '7d'): Promise<any> {
    try {
      this.logger.log(`Retrieving security metrics for time range: ${timeRange}`);

      const now = new Date();
      let startDate: Date;

      switch (timeRange) {
        case '24h':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30d':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      // Daily event counts
      const dailyEvents = await this.auditLogRepository
        .createQueryBuilder('audit')
        .select("DATE(audit.timestamp)", 'date')
        .addSelect('COUNT(*)', 'count')
        .where('audit.timestamp >= :startDate', { startDate })
        .groupBy("DATE(audit.timestamp)")
        .orderBy("DATE(audit.timestamp)", 'ASC')
        .getRawMany();

      // Events by severity over time
      const severityTrends = await this.auditLogRepository
        .createQueryBuilder('audit')
        .select("DATE(audit.timestamp)", 'date')
        .addSelect('audit.severity', 'severity')
        .addSelect('COUNT(*)', 'count')
        .where('audit.timestamp >= :startDate', { startDate })
        .groupBy("DATE(audit.timestamp)")
        .addGroupBy('audit.severity')
        .orderBy("DATE(audit.timestamp)", 'ASC')
        .getRawMany();

      // Top users by event count
      const topUsers = await this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.userId', 'userId')
        .addSelect('COUNT(*)', 'eventCount')
        .where('audit.timestamp >= :startDate', { startDate })
        .andWhere('audit.userId IS NOT NULL')
        .groupBy('audit.userId')
        .orderBy('eventCount', 'DESC')
        .limit(10)
        .getRawMany();

      // Risk score distribution (calculated based on suspicious activity)
      const riskDistribution = await this.userSessionRepository
        .createQueryBuilder('session')
        .select('FLOOR(session.suspiciousActivityCount * 0.2)', 'riskRange')
        .addSelect('COUNT(*)', 'count')
        .where('session.createdAt >= :startDate', { startDate })
        .groupBy('FLOOR(session.suspiciousActivityCount * 0.2)')
        .orderBy('riskRange', 'ASC')
        .getRawMany();

      return {
        timeRange,
        startDate,
        endDate: now,
        dailyEvents: dailyEvents.map(item => ({
          date: item.date,
          count: parseInt(item.count),
        })),
        severityTrends: this.groupSeverityTrends(severityTrends),
        topUsers: topUsers.map(item => ({
          userId: item.userId,
          eventCount: parseInt(item.eventCount),
        })),
        riskDistribution: riskDistribution.map(item => ({
          riskRange: parseFloat(item.riskRange),
          count: parseInt(item.count),
        })),
      };
    } catch (error) {
      this.logger.error(`Failed to get security metrics: ${error.message}`, error.stack);
      throw error;
    }
  }

  private groupSeverityTrends(severityTrends: any[]): any {
    const grouped = {};

    severityTrends.forEach(item => {
      const date = item.date;
      if (!grouped[date]) {
        grouped[date] = { date };
      }
      grouped[date][item.severity] = parseInt(item.count);
    });

    return Object.values(grouped);
  }

  async validateSecurityPolicy(
    policyType: PolicyType,
    context: Record<string, any>,
    userId?: string,
  ): Promise<{ allowed: boolean; violations: string[]; policyId?: string }> {
    try {
      this.logger.log(`Validating security policy: ${policyType} for user: ${userId}`);

      // Find active policies of the specified type
      const policies = await this.securityPolicyRepository.find({
        where: {
          type: policyType,
          status: PolicyStatus.ACTIVE,
        },
        order: { priority: 'DESC' },
      });

      const violations: string[] = [];
      let policyId: string | undefined;

      for (const policy of policies) {
        if (!policy.isActive()) continue;

        const evaluation = await policy.evaluate(context);

        if (evaluation.result === 'deny') {
          violations.push(`${policy.name}: ${evaluation.reason || 'Policy violation'}`);
          policyId = policy.id;
          break;
        } else if (evaluation.result === 'warn') {
          violations.push(`${policy.name}: ${evaluation.reason || 'Policy warning'}`);
        }
      }

      const allowed = violations.length === 0 || violations.every(v => !v.includes('Policy violation'));

      // Log policy evaluation
      if (userId) {
        await this.logSecurityEvent(
          AuditAction.SECURITY_ALERT,
          userId,
          allowed ? AuditSeverity.LOW : AuditSeverity.MEDIUM,
          `Policy validation: ${policyType} - ${allowed ? 'Passed' : 'Failed'}`,
          { policyType, violations, context },
        );
      }

      return { allowed, violations, policyId };
    } catch (error) {
      this.logger.error(`Failed to validate security policy: ${error.message}`, error.stack);
      return { allowed: false, violations: [`Policy validation error: ${error.message}`] };
    }
  }

  async getActiveSecurityPolicies(): Promise<SecurityPolicy[]> {
    try {
      this.logger.log('Retrieving active security policies');

      return await this.securityPolicyRepository.find({
        where: { status: PolicyStatus.ACTIVE },
        order: { priority: 'DESC', updatedAt: 'DESC' },
      });
    } catch (error) {
      this.logger.error(`Failed to get active security policies: ${error.message}`, error.stack);
      throw error;
    }
  }

  async createSecurityIncident(
    title: string,
    description: string,
    severity: AuditSeverity,
    reportedBy: string,
    affectedUsers?: string[],
    metadata?: any,
  ): Promise<any> {
    try {
      this.logger.log(`Creating security incident: ${title}`);

      // Log the incident
      await this.logSecurityEvent(
        AuditAction.AUTHORIZATION_FAILED,
        reportedBy,
        severity,
        `Security incident: ${title} - ${description}`,
        {
          incident: true,
          title,
          description,
          affectedUsers,
          ...metadata,
        },
      );

      // Mock incident creation (would integrate with incident management system)
      const incident = {
        id: `incident-${Date.now()}`,
        title,
        description,
        severity,
        status: 'open',
        reportedBy,
        affectedUsers: affectedUsers || [],
        createdAt: new Date(),
        metadata,
      };

      return incident;
    } catch (error) {
      this.logger.error(`Failed to create security incident: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getComplianceStatus(): Promise<any> {
    try {
      this.logger.log('Retrieving compliance status');

      // Mock compliance data (would integrate with compliance monitoring system)
      return {
        gdpr: {
          status: 'compliant',
          lastAudit: new Date('2024-08-01'),
          nextAudit: new Date('2025-08-01'),
          complianceScore: 95,
        },
        ferpa: {
          status: 'compliant',
          lastAudit: new Date('2024-07-15'),
          nextAudit: new Date('2025-07-15'),
          complianceScore: 98,
        },
        hipaa: {
          status: 'not_applicable',
          lastAudit: null,
          nextAudit: null,
          complianceScore: 100,
        },
        overall: {
          status: 'compliant',
          complianceScore: 96,
          criticalIssues: 0,
          warningIssues: 2,
          lastFullAudit: new Date('2024-08-01'),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get compliance status: ${error.message}`, error.stack);
      throw error;
    }
  }
}