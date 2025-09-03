import { Injectable, Logger, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThan, LessThan } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditAction, AuditSeverity } from '../types/audit.types';
import { UserSession, SessionStatus } from '../entities/user-session.entity';
import { SecurityService } from './security.service';
import { PolicyService } from './policy.service';

export interface ThreatIndicator {
  id: string;
  type: 'anomaly' | 'pattern' | 'behavior' | 'external';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0-1
  description: string;
  indicators: string[];
  affectedUsers: string[];
  affectedResources: string[];
  detectionTime: Date;
  riskScore: number;
  recommendedActions: string[];
  metadata: Record<string, any>;
}

export interface AnomalyDetectionResult {
  isAnomalous: boolean;
  anomalyScore: number;
  detectedPatterns: string[];
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  explanation: string;
}

@Injectable()
export class ThreatDetectionService {
  private readonly logger = new Logger(ThreatDetectionService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
    @Inject(forwardRef(() => SecurityService))
    private securityService: SecurityService,
    @Inject(forwardRef(() => PolicyService))
    private policyService: PolicyService,
    private dataSource: DataSource,
  ) {}

  async detectThreats(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<ThreatIndicator[]> {
    try {
      this.logger.log(`Detecting threats for time range: ${timeRange}`);

      const now = new Date();
      const startTime = this.getStartTime(timeRange);

      const threats: ThreatIndicator[] = [];

      // Detect brute force attacks
      const bruteForceThreats = await this.detectBruteForceAttacks(startTime, now);
      threats.push(...bruteForceThreats);

      // Detect unusual login patterns
      const loginAnomalies = await this.detectLoginAnomalies(startTime, now);
      threats.push(...loginAnomalies);

      // Detect session anomalies
      const sessionThreats = await this.detectSessionAnomalies(startTime, now);
      threats.push(...sessionThreats);

      // Detect privilege escalation attempts
      const privilegeThreats = await this.detectPrivilegeEscalation(startTime, now);
      threats.push(...privilegeThreats);

      // Detect data access anomalies
      const dataAccessThreats = await this.detectDataAccessAnomalies(startTime, now);
      threats.push(...dataAccessThreats);

      // Sort by risk score and severity
      threats.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
        return severityDiff !== 0 ? severityDiff : b.riskScore - a.riskScore;
      });

      // Log threat detection results
      await this.logThreatDetection(threats, timeRange);

      return threats;
    } catch (error) {
      this.logger.error(`Threat detection error: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async detectBruteForceAttacks(startTime: Date, endTime: Date): Promise<ThreatIndicator[]> {
    const threats: ThreatIndicator[] = [];

    try {
      // Get failed login attempts grouped by IP and user
      const failedLogins = await this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.ipAddress', 'ipAddress')
        .addSelect('COUNT(*)', 'attempts')
        .addSelect('ARRAY_AGG(audit.userId)', 'userIds')
        .where('audit.action = :action', { action: AuditAction.AUTHENTICATION_FAILED })
        .andWhere('audit.timestamp BETWEEN :startTime AND :endTime', { startTime, endTime })
        .groupBy('audit.ipAddress')
        .having('COUNT(*) >= :threshold', { threshold: 5 })
        .getRawMany();

      for (const failedLogin of failedLogins) {
        const attempts = parseInt(failedLogin.attempts);
        const riskScore = Math.min(attempts / 20, 1); // Scale risk score

        let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
        if (attempts >= 20) severity = 'critical';
        else if (attempts >= 10) severity = 'high';
        else if (attempts >= 5) severity = 'medium';

        threats.push({
          id: `brute-force-${failedLogin.ipAddress}-${Date.now()}`,
          type: 'pattern',
          severity,
          confidence: 0.9,
          description: `Brute force attack detected from IP ${failedLogin.ipAddress}`,
          indicators: [`${attempts} failed login attempts`, 'Multiple users targeted'],
          affectedUsers: failedLogin.userIds.filter(id => id),
          affectedResources: ['authentication_system'],
          detectionTime: new Date(),
          riskScore,
          recommendedActions: [
            'Block IP address temporarily',
            'Notify affected users',
            'Enable additional authentication requirements',
            'Review authentication logs',
          ],
          metadata: {
            ipAddress: failedLogin.ipAddress,
            attempts,
            timeWindow: `${startTime.toISOString()} to ${endTime.toISOString()}`,
          },
        });
      }
    } catch (error) {
      this.logger.error('Error detecting brute force attacks', error);
    }

    return threats;
  }

  private async detectLoginAnomalies(startTime: Date, endTime: Date): Promise<ThreatIndicator[]> {
    const threats: ThreatIndicator[] = [];

    try {
      // Detect unusual login times
      const unusualLogins = await this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.userId', 'userId')
        .addSelect('COUNT(*)', 'loginCount')
        .addSelect('MIN(EXTRACT(hour from audit.timestamp))', 'earliestHour')
        .addSelect('MAX(EXTRACT(hour from audit.timestamp))', 'latestHour')
        .where('audit.action = :action', { action: AuditAction.LOGIN })
        .andWhere('audit.timestamp BETWEEN :startTime AND :endTime', { startTime, endTime })
        .groupBy('audit.userId')
        .having('COUNT(*) >= :minLogins', { minLogins: 3 })
        .getRawMany();

      for (const login of unusualLogins) {
        const earliestHour = parseInt(login.earliestHour);
        const latestHour = parseInt(login.latestHour);

        // Check for unusual hours (e.g., 2 AM - 5 AM)
        if ((earliestHour >= 2 && earliestHour <= 5) || (latestHour >= 2 && latestHour <= 5)) {
          threats.push({
            id: `unusual-login-${login.userId}-${Date.now()}`,
            type: 'behavior',
            severity: 'medium',
            confidence: 0.7,
            description: `Unusual login time detected for user ${login.userId}`,
            indicators: [`Login between ${earliestHour}:00 and ${latestHour}:00`, 'Outside normal business hours'],
            affectedUsers: [login.userId],
            affectedResources: ['user_account'],
            detectionTime: new Date(),
            riskScore: 0.6,
            recommendedActions: [
              'Verify login legitimacy with user',
              'Review recent account activity',
              'Consider temporary account lock',
              'Update user notification preferences',
            ],
            metadata: {
              userId: login.userId,
              loginCount: parseInt(login.loginCount),
              earliestHour,
              latestHour,
            },
          });
        }
      }
    } catch (error) {
      this.logger.error('Error detecting login anomalies', error);
    }

    return threats;
  }

  private async detectSessionAnomalies(startTime: Date, endTime: Date): Promise<ThreatIndicator[]> {
    const threats: ThreatIndicator[] = [];

    try {
      // Detect long-running sessions
      const longSessions = await this.userSessionRepository
        .createQueryBuilder('session')
        .where('session.status = :status', { status: SessionStatus.ACTIVE })
        .andWhere('session.createdAt < :cutoffTime', { cutoffTime: new Date(Date.now() - 8 * 60 * 60 * 1000) }) // 8 hours ago
        .getMany();

      for (const session of longSessions) {
        const sessionDuration = Date.now() - session.createdAt.getTime();
        const hours = sessionDuration / (1000 * 60 * 60);

        if (hours > 12) { // Sessions longer than 12 hours
          threats.push({
            id: `long-session-${session.id}`,
            type: 'anomaly',
            severity: 'medium',
            confidence: 0.8,
            description: `Unusually long session detected (${hours.toFixed(1)} hours)`,
            indicators: [`Session duration: ${hours.toFixed(1)} hours`, 'Exceeds normal usage patterns'],
            affectedUsers: [session.userId],
            affectedResources: ['user_session'],
            detectionTime: new Date(),
            riskScore: Math.min(hours / 24, 1), // Scale risk by duration
            recommendedActions: [
              'Force session renewal',
              'Notify user of unusual activity',
              'Review session activity logs',
              'Consider account security review',
            ],
            metadata: {
              sessionId: session.id,
              userId: session.userId,
              durationHours: hours,
              createdAt: session.createdAt,
            },
          });
        }
      }

      // Detect multiple concurrent sessions
      const concurrentSessions = await this.userSessionRepository
        .createQueryBuilder('session')
        .select('session.userId', 'userId')
        .addSelect('COUNT(*)', 'sessionCount')
        .where('session.status = :status', { status: SessionStatus.ACTIVE })
        .groupBy('session.userId')
        .having('COUNT(*) > :maxSessions', { maxSessions: 3 })
        .getRawMany();

      for (const concurrent of concurrentSessions) {
        threats.push({
          id: `concurrent-sessions-${concurrent.userId}-${Date.now()}`,
          type: 'behavior',
          severity: 'low',
          confidence: 0.6,
          description: `Multiple concurrent sessions detected for user ${concurrent.userId}`,
          indicators: [`${concurrent.sessionCount} active sessions`, 'Exceeds normal concurrent usage'],
          affectedUsers: [concurrent.userId],
          affectedResources: ['user_sessions'],
          detectionTime: new Date(),
          riskScore: 0.4,
          recommendedActions: [
            'Review session legitimacy',
            'Consider limiting concurrent sessions',
            'Notify user of multiple active sessions',
            'Enable session management features',
          ],
          metadata: {
            userId: concurrent.userId,
            sessionCount: parseInt(concurrent.sessionCount),
          },
        });
      }
    } catch (error) {
      this.logger.error('Error detecting session anomalies', error);
    }

    return threats;
  }

  private async detectPrivilegeEscalation(startTime: Date, endTime: Date): Promise<ThreatIndicator[]> {
    const threats: ThreatIndicator[] = [];

    try {
      // Detect rapid permission changes
      const permissionChanges = await this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.userId', 'userId')
        .addSelect('COUNT(*)', 'changeCount')
        .where('audit.eventType IN (:...events)', {
          events: [AuditAction.USER_UPDATED, AuditAction.SECURITY_CONFIG_CHANGED]
        })
        .andWhere('audit.timestamp BETWEEN :startTime AND :endTime', { startTime, endTime })
        .groupBy('audit.userId')
        .having('COUNT(*) >= :threshold', { threshold: 5 })
        .getRawMany();

      for (const change of permissionChanges) {
        threats.push({
          id: `privilege-escalation-${change.userId}-${Date.now()}`,
          type: 'behavior',
          severity: 'high',
          confidence: 0.8,
          description: `Rapid privilege escalation detected for user ${change.userId}`,
          indicators: [`${change.changeCount} permission changes in short time`, 'Potential privilege abuse'],
          affectedUsers: [change.userId],
          affectedResources: ['user_permissions', 'user_roles'],
          detectionTime: new Date(),
          riskScore: 0.8,
          recommendedActions: [
            'Review permission changes for legitimacy',
            'Temporarily revoke suspicious permissions',
            'Audit user activity logs',
            'Implement approval workflow for privilege changes',
          ],
          metadata: {
            userId: change.userId,
            changeCount: parseInt(change.changeCount),
            timeWindow: `${startTime.toISOString()} to ${endTime.toISOString()}`,
          },
        });
      }
    } catch (error) {
      this.logger.error('Error detecting privilege escalation', error);
    }

    return threats;
  }

  private async detectDataAccessAnomalies(startTime: Date, endTime: Date): Promise<ThreatIndicator[]> {
    const threats: ThreatIndicator[] = [];

    try {
      // Detect unusual data access patterns
      const dataAccess = await this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.userId', 'userId')
        .addSelect('audit.resourceType', 'resourceType')
        .addSelect('COUNT(*)', 'accessCount')
        .where('audit.action = :action', { action: AuditAction.DATA_ACCESSED })
        .andWhere('audit.timestamp BETWEEN :startTime AND :endTime', { startTime, endTime })
        .groupBy('audit.userId, audit.resourceType')
        .having('COUNT(*) >= :threshold', { threshold: 100 })
        .getRawMany();

      for (const access of dataAccess) {
        threats.push({
          id: `data-access-anomaly-${access.userId}-${access.resourceType}-${Date.now()}`,
          type: 'behavior',
          severity: 'medium',
          confidence: 0.7,
          description: `Unusual data access pattern detected for ${access.resourceType}`,
          indicators: [`${access.accessCount} accesses to ${access.resourceType}`, 'Exceeds normal access patterns'],
          affectedUsers: [access.userId],
          affectedResources: [access.resourceType],
          detectionTime: new Date(),
          riskScore: 0.6,
          recommendedActions: [
            'Review data access legitimacy',
            'Implement access rate limiting',
            'Monitor user behavior patterns',
            'Consider additional access controls',
          ],
          metadata: {
            userId: access.userId,
            resourceType: access.resourceType,
            accessCount: parseInt(access.accessCount),
          },
        });
      }
    } catch (error) {
      this.logger.error('Error detecting data access anomalies', error);
    }

    return threats;
  }

  async analyzeUserBehavior(userId: string, days: number = 30): Promise<AnomalyDetectionResult> {
    try {
      this.logger.log(`Analyzing user behavior for ${userId} over ${days} days`);

      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Get user's activity patterns
      const userActivity = await this.auditLogRepository
        .createQueryBuilder('audit')
        .select('audit.eventType', 'eventType')
        .addSelect('COUNT(*)', 'count')
        .addSelect('AVG(EXTRACT(hour from audit.timestamp))', 'avgHour')
        .addSelect('STDDEV(EXTRACT(hour from audit.timestamp))', 'hourVariance')
        .where('audit.userId = :userId', { userId })
        .andWhere('audit.timestamp >= :startDate', { startDate })
        .groupBy('audit.eventType')
        .getRawMany();

      // Calculate anomaly score based on patterns
      let anomalyScore = 0;
      const detectedPatterns: string[] = [];

      for (const activity of userActivity) {
        const count = parseInt(activity.count);
        const avgHour = parseFloat(activity.avgHour);
        const hourVariance = parseFloat(activity.hourVariance);

        // Check for unusual activity volume
        if (count > 1000) { // Very high activity
          anomalyScore += 0.3;
          detectedPatterns.push(`High ${activity.eventType} activity (${count} events)`);
        }

        // Check for unusual timing patterns
        if (hourVariance < 1) { // Very consistent timing (potentially automated)
          anomalyScore += 0.2;
          detectedPatterns.push(`Unusually consistent ${activity.eventType} timing`);
        }

        // Check for off-hours activity
        if ((avgHour < 6 || avgHour > 22) && count > 10) {
          anomalyScore += 0.1;
          detectedPatterns.push(`Off-hours ${activity.eventType} activity`);
        }
      }

      // Normalize anomaly score
      anomalyScore = Math.min(anomalyScore, 1);

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (anomalyScore > 0.8) riskLevel = 'critical';
      else if (anomalyScore > 0.6) riskLevel = 'high';
      else if (anomalyScore > 0.4) riskLevel = 'medium';

      const explanation = detectedPatterns.length > 0
        ? `Detected patterns: ${detectedPatterns.join(', ')}`
        : 'No significant anomalies detected';

      return {
        isAnomalous: anomalyScore > 0.5,
        anomalyScore,
        detectedPatterns,
        confidence: 0.8,
        riskLevel,
        explanation,
      };
    } catch (error) {
      this.logger.error(`User behavior analysis error for ${userId}: ${error.message}`, error.stack);
      return {
        isAnomalous: false,
        anomalyScore: 0,
        detectedPatterns: [],
        confidence: 0,
        riskLevel: 'low',
        explanation: 'Analysis failed due to error',
      };
    }
  }

  private getStartTime(timeRange: '1h' | '24h' | '7d' | '30d'): Date {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private async logThreatDetection(threats: ThreatIndicator[], timeRange: string): Promise<void> {
    try {
      const threatCount = threats.length;
      const highSeverityCount = threats.filter(t => t.severity === 'high' || t.severity === 'critical').length;

      await this.securityService.logSecurityEvent(
        AuditAction.SUSPICIOUS_ACTIVITY,
        null,
        highSeverityCount > 0 ? AuditSeverity.HIGH : AuditSeverity.LOW,
        `Threat detection completed: ${threatCount} threats detected`,
        {
          threatDetection: true,
          timeRange,
          totalThreats: threatCount,
          highSeverityThreats: highSeverityCount,
          threatTypes: [...new Set(threats.map(t => t.type))],
          threatSeverities: threats.reduce((acc, t) => {
            acc[t.severity] = (acc[t.severity] || 0) + 1;
            return acc;
          }, {}),
        },
      );
    } catch (error) {
      this.logger.error('Failed to log threat detection', error);
    }
  }

  // Utility methods for external integration
  async getThreatIntelligence(): Promise<any> {
    // Mock threat intelligence data
    return {
      globalThreatLevel: 'moderate',
      activeThreats: [
        'credential_stuffing',
        'brute_force_attacks',
        'phishing_campaigns',
      ],
      emergingThreats: [
        'ai_generated_attacks',
        'supply_chain_attacks',
      ],
      recommendedActions: [
        'Enable MFA for all users',
        'Implement rate limiting',
        'Regular security training',
        'Monitor for unusual patterns',
      ],
      lastUpdated: new Date(),
    };
  }

  async generateThreatReport(timeRange: '24h' | '7d' | '30d' = '7d'): Promise<any> {
    const threats = await this.detectThreats(timeRange);

    return {
      reportPeriod: timeRange,
      generatedAt: new Date(),
      summary: {
        totalThreats: threats.length,
        criticalThreats: threats.filter(t => t.severity === 'critical').length,
        highThreats: threats.filter(t => t.severity === 'high').length,
        mediumThreats: threats.filter(t => t.severity === 'medium').length,
        lowThreats: threats.filter(t => t.severity === 'low').length,
      },
      threatsByType: threats.reduce((acc, threat) => {
        acc[threat.type] = (acc[threat.type] || 0) + 1;
        return acc;
      }, {}),
      topAffectedUsers: this.getTopAffectedUsers(threats),
      topAffectedResources: this.getTopAffectedResources(threats),
      recommendations: this.generateRecommendations(threats),
      threats: threats.slice(0, 50), // Top 50 threats
    };
  }

  private getTopAffectedUsers(threats: ThreatIndicator[]): Array<{ userId: string; threatCount: number }> {
    const userCounts = threats.reduce((acc, threat) => {
      threat.affectedUsers.forEach(userId => {
        acc[userId] = (acc[userId] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.entries(userCounts)
      .map(([userId, count]) => ({ userId, threatCount: count as number }))
      .sort((a, b) => b.threatCount - a.threatCount)
      .slice(0, 10);
  }

  private getTopAffectedResources(threats: ThreatIndicator[]): Array<{ resource: string; threatCount: number }> {
    const resourceCounts = threats.reduce((acc, threat) => {
      threat.affectedResources.forEach(resource => {
        acc[resource] = (acc[resource] || 0) + 1;
      });
      return acc;
    }, {});

    return Object.entries(resourceCounts)
      .map(([resource, count]) => ({ resource, threatCount: count as number }))
      .sort((a, b) => b.threatCount - a.threatCount)
      .slice(0, 10);
  }

  private generateRecommendations(threats: ThreatIndicator[]): string[] {
    const recommendations = new Set<string>();

    threats.forEach(threat => {
      threat.recommendedActions.forEach(action => recommendations.add(action));
    });

    // Add general recommendations based on threat patterns
    if (threats.some(t => t.type === 'pattern' && t.description.includes('brute force'))) {
      recommendations.add('Implement account lockout policies');
      recommendations.add('Enable CAPTCHA for login attempts');
    }

    if (threats.some(t => t.type === 'behavior' && t.description.includes('unusual'))) {
      recommendations.add('Implement user behavior analytics');
      recommendations.add('Set up real-time alerting for unusual activities');
    }

    if (threats.some(t => t.severity === 'critical')) {
      recommendations.add('Immediate security incident response required');
      recommendations.add('Consider involving security experts');
    }

    return Array.from(recommendations);
  }
}