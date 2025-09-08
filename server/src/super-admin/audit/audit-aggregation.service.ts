import { Injectable, Logger, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AuditLog } from '../../security/entities/audit-log.entity';
import { StudentAuditLog } from '../../students/entities/student-audit-log.entity';
import { AuditMetricsFiltersDto, AuditDashboardDto, AuditTrendsDto, AuditAnomaliesDto, AuditMetricsResponseDto } from './audit-metrics.dto';
import { AuditSeverity } from '../../security/types/audit.types';
import { AuditSeverity as StudentAuditSeverity } from '../../students/entities/student-audit-log.entity';
import { CacheService } from '../../redis/cache.service';

@Injectable()
export class AuditAggregationService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AuditAggregationService.name);
  private readonly cachePrefix = 'audit_metrics';
  private readonly cacheTtl = 300; // 5 minutes
  private realtimeMetrics: Map<string, any> = new Map();
  private intervalId: NodeJS.Timeout | null = null;

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(StudentAuditLog)
    private readonly studentAuditLogRepository: Repository<StudentAuditLog>,
    private readonly cacheService: CacheService,
  ) {}

  async onModuleInit() {
    // Start background aggregation job
    this.startBackgroundAggregation();
    this.logger.log('AuditAggregationService initialized with background aggregation');
  }

  async onModuleDestroy() {
    // Clean up background job
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.logger.log('AuditAggregationService destroyed');
  }

  private startBackgroundAggregation() {
    // Run aggregation every 5 minutes
    this.intervalId = setInterval(async () => {
      try {
        await this.performBackgroundAggregation();
      } catch (error) {
        this.logger.error('Background aggregation error:', error);
      }
    }, 5 * 60 * 1000);
  }

  private async performBackgroundAggregation() {
    this.logger.debug('Performing background aggregation');

    // Update cached metrics
    const filters = { timeRange: 30 } as AuditMetricsFiltersDto;
    const dashboard = await this.generateDashboard(filters);

    // Cache the results
    await this.cacheService.set('dashboard', dashboard, {
      keyPrefix: this.cachePrefix,
      ttl: this.cacheTtl
    });

    // Update real-time metrics
    this.updateRealtimeMetrics(dashboard);
  }

  private updateRealtimeMetrics(dashboard: AuditDashboardDto) {
    this.realtimeMetrics.set('totalLogs', dashboard.summary.totalLogs);
    this.realtimeMetrics.set('criticalEvents', dashboard.summary.criticalEventsCount);
    this.realtimeMetrics.set('recentActivity', dashboard.summary.recentActivityCount);
    this.realtimeMetrics.set('lastUpdated', new Date());
  }

  /**
   * Clear all metrics cache
   */
  async clearMetricsCache(): Promise<void> {
    try {
      await this.cacheService.invalidatePattern(`${this.cachePrefix}:*`);
      this.logger.log('Metrics cache cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing metrics cache:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive audit dashboard data with caching
   */
  async generateDashboard(filters: AuditMetricsFiltersDto): Promise<AuditDashboardDto> {
    const cacheKey = `dashboard_${JSON.stringify(filters)}`;

    // Try to get from cache first
    const cached = await this.cacheService.get<AuditDashboardDto>(cacheKey, this.cachePrefix);
    if (cached) {
      this.logger.debug('Dashboard data retrieved from cache');
      return cached;
    }

    this.logger.debug('Generating fresh dashboard data');

    const [summary, severityBreakdown, actionBreakdown, resourceBreakdown, topUsers, topSchools, recentCriticalEvents, trends, anomalies, compliance] = await Promise.all([
      this.getDashboardSummary(filters),
      this.getSeverityBreakdown(filters),
      this.getActionBreakdown(filters),
      this.getResourceBreakdown(filters),
      this.getTopUsers(filters),
      this.getTopSchools(filters),
      this.getRecentCriticalEvents(filters),
      this.getDashboardTrends(filters),
      this.detectAnomalies({ detectionMode: 'daily', sensitivity: 2.0, lookbackDays: 30, anomalyTypes: ['spike_in_activity', 'unusual_login_times', 'suspicious_ip_addresses'] }),
      this.getComplianceMetrics(filters),
    ]);

    const dashboard = {
      summary,
      severityBreakdown,
      actionBreakdown,
      resourceBreakdown,
      topUsers,
      topSchools,
      recentCriticalEvents,
      trends,
      anomalies,
      compliance,
    };

    // Cache the result
    await this.cacheService.set(cacheKey, dashboard, {
      keyPrefix: this.cachePrefix,
      ttl: this.cacheTtl
    });

    return dashboard;
  }

  /**
   * Get dashboard summary metrics
   */
  private async getDashboardSummary(filters: AuditMetricsFiltersDto): Promise<AuditDashboardDto['summary']> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    const totalLogs = await queryBuilder.getCount();

    // Get unique schools and users
    const uniqueSchools = await queryBuilder
      .select('COUNT(DISTINCT audit.schoolId)', 'count')
      .getRawOne();

    const uniqueUsers = await queryBuilder
      .select('COUNT(DISTINCT audit.userId)', 'count')
      .getRawOne();

    // Calculate average logs per day
    const dateRange = this.calculateDateRange(filters);
    const averageLogsPerDay = totalLogs / Math.max(dateRange, 1);

    // Get critical events count
    const criticalEventsQuery = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(criticalEventsQuery, filters);
    criticalEventsQuery.andWhere('audit.severity = :severity', { severity: AuditSeverity.CRITICAL });
    const criticalEventsCount = await criticalEventsQuery.getCount();

    // Get recent activity count (last 24 hours)
    const recentActivityQuery = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(recentActivityQuery, filters);
    recentActivityQuery.andWhere('audit.timestamp >= :since', {
      since: new Date(Date.now() - 24 * 60 * 60 * 1000),
    });
    const recentActivityCount = await recentActivityQuery.getCount();

    return {
      totalLogs,
      totalSchools: parseInt(uniqueSchools.count) || 0,
      totalUsers: parseInt(uniqueUsers.count) || 0,
      averageLogsPerDay: Math.round(averageLogsPerDay * 100) / 100,
      criticalEventsCount,
      recentActivityCount,
    };
  }

  /**
   * Get severity breakdown
   */
  async getSeverityBreakdown(filters: AuditMetricsFiltersDto): Promise<AuditDashboardDto['severityBreakdown']> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    const severityStats = await queryBuilder
      .select('audit.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.severity')
      .getRawMany();

    return severityStats.reduce((acc, stat) => {
      acc[stat.severity] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get action breakdown
   */
  async getActionBreakdown(filters: AuditMetricsFiltersDto): Promise<AuditDashboardDto['actionBreakdown']> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    const actionStats = await queryBuilder
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    return actionStats.reduce((acc, stat) => {
      acc[stat.action] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get resource breakdown
   */
  async getResourceBreakdown(filters: AuditMetricsFiltersDto): Promise<AuditDashboardDto['resourceBreakdown']> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    const resourceStats = await queryBuilder
      .select('audit.resource', 'resource')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.resource')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    return resourceStats.reduce((acc, stat) => {
      acc[stat.resource] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Get top users by activity
   */
  async getTopUsers(filters: AuditMetricsFiltersDto): Promise<AuditDashboardDto['topUsers']> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    const userStats = await queryBuilder
      .select('audit.userId', 'userId')
      .addSelect('COUNT(*)', 'logCount')
      .addSelect('MAX(audit.timestamp)', 'lastActivity')
      .groupBy('audit.userId')
      .orderBy('logCount', 'DESC')
      .limit(10)
      .getRawMany();

    // Note: In a real implementation, you'd join with user and school tables to get names
    return userStats.map(stat => ({
      userId: stat.userId,
      userName: `User ${stat.userId.substring(0, 8)}`, // Placeholder
      schoolName: 'School Name', // Placeholder - would need school lookup
      logCount: parseInt(stat.logCount),
      lastActivity: new Date(stat.lastActivity),
    }));
  }

  /**
   * Get top schools by activity
   */
  async getTopSchools(filters: AuditMetricsFiltersDto): Promise<AuditDashboardDto['topSchools']> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    const schoolStats = await queryBuilder
      .select('audit.schoolId', 'schoolId')
      .addSelect('COUNT(*)', 'logCount')
      .addSelect('COUNT(DISTINCT audit.userId)', 'userCount')
      .addSelect('AVG(CASE WHEN audit.severity = \'critical\' THEN 3 WHEN audit.severity = \'high\' THEN 2 WHEN audit.severity = \'medium\' THEN 1 ELSE 0 END)', 'avgSeverity')
      .groupBy('audit.schoolId')
      .orderBy('logCount', 'DESC')
      .limit(10)
      .getRawMany();

    return schoolStats.map(stat => ({
      schoolId: stat.schoolId,
      schoolName: `School ${stat.schoolId?.substring(0, 8) || 'System'}`, // Placeholder
      logCount: parseInt(stat.logCount),
      userCount: parseInt(stat.userCount),
      averageSeverity: this.mapSeverityScore(parseFloat(stat.avgSeverity)),
    }));
  }

  /**
   * Get recent critical events
   */
  async getRecentCriticalEvents(filters: AuditMetricsFiltersDto): Promise<AuditDashboardDto['recentCriticalEvents']> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    queryBuilder
      .andWhere('audit.severity = :severity', { severity: AuditSeverity.CRITICAL })
      .orderBy('audit.timestamp', 'DESC')
      .limit(10);

    const events = await queryBuilder.getMany();

    return events.map(event => ({
      id: event.id,
      timestamp: event.timestamp,
      userId: event.userId,
      userName: `User ${event.userId.substring(0, 8)}`, // Placeholder
      action: event.action,
      resource: event.resource,
      severity: event.severity,
      details: event.details,
    }));
  }

  /**
   * Get dashboard trends
   */
  private async getDashboardTrends(filters: AuditMetricsFiltersDto): Promise<AuditDashboardDto['trends']> {
    const groupBy = filters.groupBy || 'day';
    const periods = 30;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    // Generate date series for the last 30 periods
    const dateFormat = this.getDateFormatForGrouping(groupBy);
    const periodsData = [];

    for (let i = periods - 1; i >= 0; i--) {
      const periodStart = this.getPeriodStart(groupBy, i);
      const periodEnd = this.getPeriodEnd(groupBy, i);

      const periodQuery = this.auditLogRepository.createQueryBuilder('audit');
      this.applyMetricsFilters(periodQuery, filters);
      periodQuery.andWhere('audit.timestamp >= :start AND audit.timestamp < :end', {
        start: periodStart,
        end: periodEnd,
      });

      const count = await periodQuery.getCount();
      const severityBreakdown = await this.getSeverityBreakdownForPeriod(filters, periodStart, periodEnd);

      periodsData.push({
        date: periodStart.toISOString().split('T')[0],
        count,
        severityBreakdown,
      });
    }

    // Calculate trends
    const dailyActivity = periodsData;
    const weeklyActivity = this.aggregatePeriods(periodsData, 7);
    const monthlyActivity = this.aggregatePeriods(periodsData, 30);

    return {
      dailyActivity,
      weeklyActivity,
      monthlyActivity,
    };
  }

  /**
   * Detect anomalies in audit data
   */
  async detectAnomalies(filters: AuditAnomaliesDto): Promise<AuditDashboardDto['anomalies']> {
    const anomalies: AuditDashboardDto['anomalies'] = [];
    const sensitivity = filters.sensitivity || 2.0;
    const lookbackDays = filters.lookbackDays || 30;

    // Detect spike in activity
    const activitySpike = await this.detectActivitySpike(filters, sensitivity, lookbackDays);
    if (activitySpike) {
      anomalies.push(activitySpike);
    }

    // Detect unusual login times
    const unusualLogins = await this.detectUnusualLoginTimes(filters, sensitivity, lookbackDays);
    if (unusualLogins) {
      anomalies.push(unusualLogins);
    }

    // Detect suspicious IP addresses
    const suspiciousIPs = await this.detectSuspiciousIPs(filters, sensitivity, lookbackDays);
    if (suspiciousIPs) {
      anomalies.push(suspiciousIPs);
    }

    // Detect repeated failed actions
    const failedActions = await this.detectRepeatedFailedActions(filters, sensitivity, lookbackDays);
    if (failedActions) {
      anomalies.push(failedActions);
    }

    return anomalies;
  }

  /**
   * Get compliance metrics
   */
  async getComplianceMetrics(filters: AuditMetricsFiltersDto): Promise<AuditDashboardDto['compliance']> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    const totalLogs = await queryBuilder.getCount();

    // GDPR compliance
    const gdprCompliant = await queryBuilder
      .andWhere('audit.details->>\'gdprCompliant\' = :gdprCompliant', { gdprCompliant: 'true' })
      .getCount();

    const gdprViolations = totalLogs - gdprCompliant;

    // Parent consent metrics
    const parentConsentRequired = await queryBuilder
      .andWhere('audit.details->>\'requiresParentConsent\' = :requiresParentConsent', { requiresParentConsent: 'true' })
      .getCount();

    const parentConsentObtained = await queryBuilder
      .andWhere('audit.details->>\'parentConsentObtained\' = :parentConsentObtained', { parentConsentObtained: 'true' })
      .getCount();

    // Data retention compliance (placeholder - would need actual retention policy logic)
    const dataRetentionCompliant = totalLogs; // Placeholder
    const dataRetentionViolations = 0; // Placeholder

    return {
      gdprCompliant,
      gdprViolations,
      dataRetentionCompliant,
      dataRetentionViolations,
      parentConsentRequired,
      parentConsentObtained,
    };
  }

  /**
   * Generate detailed metrics response with caching
   */
  async generateMetrics(filters: AuditMetricsFiltersDto): Promise<AuditMetricsResponseDto> {
    const cacheKey = `metrics_${JSON.stringify(filters)}`;

    // Try to get from cache first
    const cached = await this.cacheService.get<AuditMetricsResponseDto>(cacheKey, this.cachePrefix);
    if (cached) {
      this.logger.debug('Metrics data retrieved from cache');
      return cached;
    }

    this.logger.debug('Generating fresh metrics data');

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    const totalLogs = await queryBuilder.getCount();

    // Calculate various metrics
    const uniqueUsers = await queryBuilder
      .select('COUNT(DISTINCT audit.userId)', 'count')
      .getRawOne();

    const uniqueSchools = await queryBuilder
      .select('COUNT(DISTINCT audit.schoolId)', 'count')
      .getRawOne();

    const uniqueResources = await queryBuilder
      .select('COUNT(DISTINCT audit.resource)', 'count')
      .getRawOne();

    const averageLogsPerUser = totalLogs / Math.max(parseInt(uniqueUsers.count) || 1, 1);
    const averageLogsPerSchool = totalLogs / Math.max(parseInt(uniqueSchools.count) || 1, 1);

    // Get severity counts
    const criticalEvents = await queryBuilder
      .andWhere('audit.severity = :severity', { severity: AuditSeverity.CRITICAL })
      .getCount();

    const highSeverityEvents = await queryBuilder
      .andWhere('audit.severity = :severity', { severity: AuditSeverity.HIGH })
      .getCount();

    // Get authentication events
    const failedAuthentications = await queryBuilder
      .andWhere('audit.action = :action', { action: 'authentication_failed' })
      .getCount();

    const successfulAuthentications = await queryBuilder
      .andWhere('audit.action = :action', { action: 'authentication_success' })
      .getCount();

    // Get data access events
    const dataAccessEvents = await queryBuilder
      .andWhere('audit.action LIKE :pattern', { pattern: '%data_%' })
      .getCount();

    // Get security events
    const securityEvents = await queryBuilder
      .andWhere('audit.resource = :resource', { resource: 'security' })
      .getCount();

    // Get system events
    const systemEvents = await queryBuilder
      .andWhere('audit.userId = :userId', { userId: 'system' })
      .getCount();

    // Get API calls (placeholder - would need to identify API actions)
    const apiCalls = await queryBuilder
      .andWhere('audit.resource LIKE :pattern', { pattern: '%api%' })
      .getCount();

    // Calculate error rate
    const errorRate = failedAuthentications / Math.max(successfulAuthentications + failedAuthentications, 1);

    // Get top actions and resources
    const topActions = await this.getTopActions(filters, 10);
    const topResources = await this.getTopResources(filters, 10);

    // Get geographic distribution (placeholder)
    const geographicDistribution = await this.getGeographicDistribution(filters);

    // Get device types (placeholder)
    const deviceTypes = await this.getDeviceTypes(filters);

    const metricsResponse = {
      timestamp: new Date(),
      period: `${filters.startDate || '30d'} to ${filters.endDate || 'now'}`,
      metrics: {
        totalLogs,
        uniqueUsers: parseInt(uniqueUsers.count) || 0,
        uniqueSchools: parseInt(uniqueSchools.count) || 0,
        uniqueResources: parseInt(uniqueResources.count) || 0,
        averageLogsPerUser: Math.round(averageLogsPerUser * 100) / 100,
        averageLogsPerSchool: Math.round(averageLogsPerSchool * 100) / 100,
        criticalEvents,
        highSeverityEvents,
        failedAuthentications,
        successfulAuthentications,
        dataAccessEvents,
        securityEvents,
        systemEvents,
        apiCalls,
        errorRate: Math.round(errorRate * 10000) / 100, // Percentage with 2 decimal places
        responseTimeAvg: 0, // Placeholder - would need actual response time tracking
        topActions,
        topResources,
        geographicDistribution,
        deviceTypes,
      },
      trends: {
        growth: 0, // Would need historical comparison
        trend: 'stable' as const,
        confidence: 0,
      },
      alerts: [], // Would be populated based on thresholds
    };

    // Cache the result
    await this.cacheService.set(cacheKey, metricsResponse, {
      keyPrefix: this.cachePrefix,
      ttl: this.cacheTtl
    });

    return metricsResponse;
  }

  // Helper methods

  private applyMetricsFilters(queryBuilder: any, filters: AuditMetricsFiltersDto): void {
    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate),
      });
    } else if (filters.startDate) {
      queryBuilder.andWhere('audit.timestamp >= :startDate', { startDate: new Date(filters.startDate) });
    } else if (filters.endDate) {
      queryBuilder.andWhere('audit.timestamp <= :endDate', { endDate: new Date(filters.endDate) });
    }

    if (filters.schoolId) {
      queryBuilder.andWhere('audit.schoolId = :schoolId', { schoolId: filters.schoolId });
    }

    if (filters.userId) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters.resource) {
      queryBuilder.andWhere('audit.resource = :resource', { resource: filters.resource });
    }

    if (filters.severity) {
      queryBuilder.andWhere('audit.severity = :severity', { severity: filters.severity });
    }
  }

  private calculateDateRange(filters: AuditMetricsFiltersDto): number {
    if (filters.startDate && filters.endDate) {
      return (new Date(filters.endDate).getTime() - new Date(filters.startDate).getTime()) / (1000 * 60 * 60 * 24);
    }
    return filters.timeRange || 30;
  }

  private mapSeverityScore(score: number): string {
    if (score >= 2.5) return 'critical';
    if (score >= 1.5) return 'high';
    if (score >= 0.5) return 'medium';
    return 'low';
  }

  private getDateFormatForGrouping(groupBy: string): string {
    switch (groupBy) {
      case 'hour': return 'YYYY-MM-DD HH24';
      case 'day': return 'YYYY-MM-DD';
      case 'week': return 'YYYY-WW';
      case 'month': return 'YYYY-MM';
      default: return 'YYYY-MM-DD';
    }
  }

  private getPeriodStart(groupBy: string, periodsAgo: number): Date {
    const now = new Date();
    switch (groupBy) {
      case 'hour': return new Date(now.getTime() - periodsAgo * 60 * 60 * 1000);
      case 'day': return new Date(now.getTime() - periodsAgo * 24 * 60 * 60 * 1000);
      case 'week': return new Date(now.getTime() - periodsAgo * 7 * 24 * 60 * 60 * 1000);
      case 'month': return new Date(now.getFullYear(), now.getMonth() - periodsAgo, 1);
      default: return new Date(now.getTime() - periodsAgo * 24 * 60 * 60 * 1000);
    }
  }

  private getPeriodEnd(groupBy: string, periodsAgo: number): Date {
    const start = this.getPeriodStart(groupBy, periodsAgo);
    switch (groupBy) {
      case 'hour': return new Date(start.getTime() + 60 * 60 * 1000);
      case 'day': return new Date(start.getTime() + 24 * 60 * 60 * 1000);
      case 'week': return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'month': return new Date(start.getFullYear(), start.getMonth() + 1, 1);
      default: return new Date(start.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  private aggregatePeriods(data: any[], periodSize: number): any[] {
    const aggregated = [];
    for (let i = 0; i < data.length; i += periodSize) {
      const periodData = data.slice(i, i + periodSize);
      const totalCount = periodData.reduce((sum, item) => sum + item.count, 0);
      const growth = i > 0 ? ((totalCount - aggregated[aggregated.length - 1]?.count || 0) / (aggregated[aggregated.length - 1]?.count || 1)) * 100 : 0;

      aggregated.push({
        week: periodData[0]?.date,
        count: totalCount,
        growth: Math.round(growth * 100) / 100,
      });
    }
    return aggregated;
  }

  private async getSeverityBreakdownForPeriod(filters: AuditMetricsFiltersDto, start: Date, end: Date): Promise<Record<string, number>> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);
    queryBuilder.andWhere('audit.timestamp >= :start AND audit.timestamp < :end', { start, end });

    const severityStats = await queryBuilder
      .select('audit.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.severity')
      .getRawMany();

    return severityStats.reduce((acc, stat) => {
      acc[stat.severity] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);
  }

  // Anomaly detection methods
  private async detectActivitySpike(filters: AuditAnomaliesDto, sensitivity: number, lookbackDays: number): Promise<AuditDashboardDto['anomalies'][0] | null> {
    const lookbackDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    // Get daily activity counts for the lookback period
    const dailyActivity = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select("DATE(audit.timestamp)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('audit.timestamp >= :lookbackDate', { lookbackDate })
      .groupBy("DATE(audit.timestamp)")
      .orderBy("DATE(audit.timestamp)", 'ASC')
      .getRawMany();

    if (dailyActivity.length < 7) return null; // Need at least a week of data

    // Calculate mean and standard deviation
    const counts = dailyActivity.map(d => parseInt(d.count));
    const mean = counts.reduce((sum, count) => sum + count, 0) / counts.length;
    const variance = counts.reduce((sum, count) => sum + Math.pow(count - mean, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);

    // Check the last day's activity
    const lastDay = counts[counts.length - 1];
    const threshold = mean + (sensitivity * stdDev);

    if (lastDay > threshold) {
      return {
        type: 'activity_spike',
        description: `Unusual spike in activity: ${lastDay} events (threshold: ${Math.round(threshold)})`,
        severity: lastDay > mean + (sensitivity * 2 * stdDev) ? 'high' : 'medium',
        detectedAt: new Date(),
        affectedEntities: ['system'],
        recommendedActions: ['Review recent activity logs', 'Check for potential security incidents']
      };
    }

    return null;
  }

  private async detectUnusualLoginTimes(filters: AuditAnomaliesDto, sensitivity: number, lookbackDays: number): Promise<AuditDashboardDto['anomalies'][0] | null> {
    const lookbackDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    // Get login times for authentication events
    const loginTimes = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select("EXTRACT(HOUR FROM audit.timestamp)", 'hour')
      .addSelect('COUNT(*)', 'count')
      .where('audit.timestamp >= :lookbackDate', { lookbackDate })
      .andWhere('audit.action IN (:...actions)', { actions: ['authentication_success', 'authentication_failed'] })
      .groupBy("EXTRACT(HOUR FROM audit.timestamp)")
      .orderBy("EXTRACT(HOUR FROM audit.timestamp)", 'ASC')
      .getRawMany();

    if (loginTimes.length === 0) return null;

    // Define normal business hours (8 AM - 6 PM)
    const normalHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
    const currentHour = new Date().getHours();

    // Check if current hour has unusual activity
    const currentHourData = loginTimes.find(lt => parseInt(lt.hour) === currentHour);
    if (!currentHourData) return null;

    const currentCount = parseInt(currentHourData.count);
    const isNormalHour = normalHours.includes(currentHour);

    // Calculate expected activity for this hour
    const normalHourAvg = loginTimes
      .filter(lt => normalHours.includes(parseInt(lt.hour)))
      .reduce((sum, lt) => sum + parseInt(lt.count), 0) / normalHours.length;

    const offHourAvg = loginTimes
      .filter(lt => !normalHours.includes(parseInt(lt.hour)))
      .reduce((sum, lt) => sum + parseInt(lt.count), 0) / (24 - normalHours.length);

    const expectedCount = isNormalHour ? normalHourAvg : offHourAvg;
    const threshold = expectedCount * (1 + sensitivity);

    if (currentCount > threshold && !isNormalHour) {
      return {
        type: 'unusual_login_times',
        description: `Unusual login activity at ${currentHour}:00: ${currentCount} logins (expected: ${Math.round(expectedCount)})`,
        severity: 'medium',
        detectedAt: new Date(),
        affectedEntities: ['authentication_system'],
        recommendedActions: ['Verify login locations', 'Check for unauthorized access attempts']
      };
    }

    return null;
  }

  private async detectSuspiciousIPs(filters: AuditAnomaliesDto, sensitivity: number, lookbackDays: number): Promise<AuditDashboardDto['anomalies'][0] | null> {
    const lookbackDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    // Get IP addresses with failed authentication attempts
    const ipFailures = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.details->>\'ipAddress\'', 'ipAddress')
      .addSelect('COUNT(*)', 'failureCount')
      .where('audit.timestamp >= :lookbackDate', { lookbackDate })
      .andWhere('audit.action = :action', { action: 'authentication_failed' })
      .andWhere('audit.details->>\'ipAddress\' IS NOT NULL')
      .groupBy('audit.details->>\'ipAddress\'')
      .having('COUNT(*) > :threshold', { threshold: 5 })
      .orderBy('COUNT(*)', 'DESC')
      .limit(10)
      .getRawMany();

    if (ipFailures.length === 0) return null;

    // Check for IPs with high failure rates
    const suspiciousIPs = ipFailures.filter(ip => parseInt(ip.failureCount) > 10);

    if (suspiciousIPs.length > 0) {
      const topSuspiciousIP = suspiciousIPs[0];
      return {
        type: 'suspicious_ip_addresses',
        description: `High authentication failure rate from IP ${topSuspiciousIP.ipAddress}: ${topSuspiciousIP.failureCount} failures`,
        severity: parseInt(topSuspiciousIP.failureCount) > 20 ? 'high' : 'medium',
        detectedAt: new Date(),
        affectedEntities: [topSuspiciousIP.ipAddress],
        recommendedActions: ['Block suspicious IP', 'Review authentication logs', 'Implement rate limiting']
      };
    }

    return null;
  }

  private async detectRepeatedFailedActions(filters: AuditAnomaliesDto, sensitivity: number, lookbackDays: number): Promise<AuditDashboardDto['anomalies'][0] | null> {
    const lookbackDate = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

    // Get users with repeated failed actions
    const userFailures = await this.auditLogRepository
      .createQueryBuilder('audit')
      .select('audit.userId', 'userId')
      .addSelect('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .where('audit.timestamp >= :lookbackDate', { lookbackDate })
      .andWhere('audit.action LIKE :pattern', { pattern: '%failed%' })
      .groupBy('audit.userId, audit.action')
      .having('COUNT(*) > :threshold', { threshold: 3 })
      .orderBy('COUNT(*)', 'DESC')
      .limit(5)
      .getRawMany();

    if (userFailures.length === 0) return null;

    const topFailure = userFailures[0];
    return {
      type: 'repeated_failed_actions',
      description: `User ${topFailure.userId} has ${topFailure.count} failed ${topFailure.action} attempts`,
      severity: parseInt(topFailure.count) > 10 ? 'high' : 'medium',
      detectedAt: new Date(),
      affectedEntities: [topFailure.userId],
      recommendedActions: ['Review user access', 'Check account status', 'Implement additional authentication']
    };
  }

  // Additional helper methods
  private async getTopActions(filters: AuditMetricsFiltersDto, limit: number): Promise<Array<{ action: string; count: number; percentage: number }>> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    const totalLogs = await queryBuilder.getCount();

    const actions = await queryBuilder
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return actions.map(action => ({
      action: action.action,
      count: parseInt(action.count),
      percentage: Math.round((parseInt(action.count) / totalLogs) * 10000) / 100,
    }));
  }

  private async getTopResources(filters: AuditMetricsFiltersDto, limit: number): Promise<Array<{ resource: string; count: number; percentage: number }>> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    const totalLogs = await queryBuilder.getCount();

    const resources = await queryBuilder
      .select('audit.resource', 'resource')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.resource')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    return resources.map(resource => ({
      resource: resource.resource,
      count: parseInt(resource.count),
      percentage: Math.round((parseInt(resource.count) / totalLogs) * 10000) / 100,
    }));
  }

  async getGeographicDistribution(filters: AuditMetricsFiltersDto): Promise<Array<{ country: string; region: string; count: number }>> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    const geoData = await queryBuilder
      .select('audit.details->>\'country\'', 'country')
      .addSelect('audit.details->>\'region\'', 'region')
      .addSelect('COUNT(*)', 'count')
      .where('audit.details->>\'country\' IS NOT NULL')
      .groupBy('audit.details->>\'country\', audit.details->>\'region\'')
      .orderBy('count', 'DESC')
      .limit(20)
      .getRawMany();

    return geoData.map(item => ({
      country: item.country || 'Unknown',
      region: item.region || 'Unknown',
      count: parseInt(item.count)
    }));
  }

  async getDeviceTypes(filters: AuditMetricsFiltersDto): Promise<Array<{ type: string; count: number; percentage: number }>> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    const totalLogs = await queryBuilder.getCount();

    const deviceData = await queryBuilder
      .select('audit.details->>\'deviceType\'', 'deviceType')
      .addSelect('COUNT(*)', 'count')
      .where('audit.details->>\'deviceType\' IS NOT NULL')
      .groupBy('audit.details->>\'deviceType\'')
      .orderBy('count', 'DESC')
      .getRawMany();

    return deviceData.map(item => ({
      type: item.deviceType || 'Unknown',
      count: parseInt(item.count),
      percentage: Math.round((parseInt(item.count) / totalLogs) * 10000) / 100
    }));
  }

  /**
   * Get real-time metrics for live dashboard updates
   */
  async getRealtimeMetrics(): Promise<{
    totalLogs: number;
    criticalEvents: number;
    recentActivity: number;
    lastUpdated: Date;
    activeUsers: number;
  }> {
    // Try to get from cache first
    const cached = await this.cacheService.get<{
      totalLogs: number;
      criticalEvents: number;
      recentActivity: number;
      lastUpdated: Date;
      activeUsers: number;
    }>('realtime', this.cachePrefix);

    if (cached) {
      return cached;
    }

    // Calculate real-time metrics
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [totalLogs, criticalEvents, recentActivity, activeUsers] = await Promise.all([
      this.auditLogRepository.count(),
      this.auditLogRepository.count({
        where: {
          severity: AuditSeverity.CRITICAL,
          timestamp: MoreThan(oneHourAgo)
        }
      }),
      this.auditLogRepository.count({
        where: { timestamp: MoreThan(oneHourAgo) }
      }),
      this.auditLogRepository
        .createQueryBuilder('audit')
        .select('COUNT(DISTINCT audit.userId)', 'count')
        .where('audit.timestamp >= :oneHourAgo', { oneHourAgo })
        .getRawOne()
    ]);

    const metrics = {
      totalLogs,
      criticalEvents,
      recentActivity,
      lastUpdated: now,
      activeUsers: parseInt(activeUsers?.count || '0')
    };

    // Cache for 1 minute
    await this.cacheService.set('realtime', metrics, {
      keyPrefix: this.cachePrefix,
      ttl: 60
    });

    return metrics;
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(filters: AuditMetricsFiltersDto): Promise<{
    responseTimeAvg: number;
    apiCallCount: number;
    databaseQueryCount: number;
    errorRate: number;
    throughput: number;
  }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    // Get API performance data
    const apiLogs = await queryBuilder
      .select('audit.details->>\'responseTime\'', 'responseTime')
      .addSelect('audit.details->>\'method\'', 'method')
      .addSelect('audit.details->>\'statusCode\'', 'statusCode')
      .where('audit.resource = :resource', { resource: 'api' })
      .andWhere('audit.details->>\'responseTime\' IS NOT NULL')
      .getRawMany();

    const responseTimes = apiLogs
      .map(log => parseFloat(log.responseTime))
      .filter(time => !isNaN(time));

    const responseTimeAvg = responseTimes.length > 0
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;

    const apiCallCount = apiLogs.length;

    // Get database query metrics
    const dbLogs = await queryBuilder
      .select('audit.details->>\'queryTime\'', 'queryTime')
      .where('audit.resource = :resource', { resource: 'database' })
      .andWhere('audit.details->>\'queryTime\' IS NOT NULL')
      .getRawMany();

    const queryTimes = dbLogs
      .map(log => parseFloat(log.queryTime))
      .filter(time => !isNaN(time));

    const databaseQueryCount = dbLogs.length;

    // Calculate error rate
    const totalAPICalls = await queryBuilder
      .where('audit.resource = :resource', { resource: 'api' })
      .getCount();

    const errorCalls = await queryBuilder
      .where('audit.resource = :resource', { resource: 'api' })
      .andWhere('audit.details->>\'statusCode\' LIKE :errorPattern', { errorPattern: '5%' })
      .getCount();

    const errorRate = totalAPICalls > 0 ? (errorCalls / totalAPICalls) * 100 : 0;

    // Calculate throughput (requests per minute)
    const dateRange = this.calculateDateRange(filters);
    const throughput = totalAPICalls / Math.max(dateRange, 1);

    return {
      responseTimeAvg: Math.round(responseTimeAvg * 100) / 100,
      apiCallCount,
      databaseQueryCount,
      errorRate: Math.round(errorRate * 100) / 100,
      throughput: Math.round(throughput * 100) / 100
    };
  }

  /**
   * Enhanced compliance metrics with SOX and FERPA
   */
  async getEnhancedComplianceMetrics(filters: AuditMetricsFiltersDto): Promise<{
    gdpr: {
      compliant: number;
      violations: number;
      dataProcessingActivities: number;
      consentRecords: number;
    };
    sox: {
      accessControls: number;
      changeManagement: number;
      segregationOfDuties: number;
      auditTrailIntegrity: number;
    };
    ferpa: {
      studentDataAccess: number;
      unauthorizedAccess: number;
      dataRetentionCompliance: number;
      privacyPolicyAdherence: number;
    };
  }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');
    this.applyMetricsFilters(queryBuilder, filters);

    // GDPR metrics
    const gdprCompliant = await queryBuilder
      .andWhere('audit.details->>\'gdprCompliant\' = :compliant', { compliant: 'true' })
      .getCount();

    const gdprViolations = await queryBuilder
      .andWhere('audit.details->>\'gdprViolation\' = :violation', { violation: 'true' })
      .getCount();

    const dataProcessingActivities = await queryBuilder
      .andWhere('audit.action = :action', { action: 'data_processing' })
      .getCount();

    const consentRecords = await queryBuilder
      .andWhere('audit.details->>\'consentObtained\' = :consent', { consent: 'true' })
      .getCount();

    // SOX metrics
    const accessControls = await queryBuilder
      .andWhere('audit.action IN (:...actions)', {
        actions: ['access_granted', 'access_revoked', 'permission_changed']
      })
      .getCount();

    const changeManagement = await queryBuilder
      .andWhere('audit.action = :action', { action: 'system_change' })
      .getCount();

    const segregationOfDuties = await queryBuilder
      .andWhere('audit.details->>\'segregationCheck\' = :check', { check: 'passed' })
      .getCount();

    const auditTrailIntegrity = await queryBuilder
      .andWhere('audit.details->>\'auditTrailIntact\' = :intact', { intact: 'true' })
      .getCount();

    // FERPA metrics
    const studentDataAccess = await queryBuilder
      .andWhere('audit.resource = :resource', { resource: 'student_data' })
      .getCount();

    const unauthorizedAccess = await queryBuilder
      .andWhere('audit.action = :action', { action: 'unauthorized_access' })
      .andWhere('audit.resource = :resource', { resource: 'student_data' })
      .getCount();

    const dataRetentionCompliance = await queryBuilder
      .andWhere('audit.details->>\'retentionCompliant\' = :compliant', { compliant: 'true' })
      .getCount();

    const privacyPolicyAdherence = await queryBuilder
      .andWhere('audit.details->>\'privacyPolicyCompliant\' = :compliant', { compliant: 'true' })
      .getCount();

    return {
      gdpr: {
        compliant: gdprCompliant,
        violations: gdprViolations,
        dataProcessingActivities,
        consentRecords
      },
      sox: {
        accessControls,
        changeManagement,
        segregationOfDuties,
        auditTrailIntegrity
      },
      ferpa: {
        studentDataAccess,
        unauthorizedAccess,
        dataRetentionCompliance,
        privacyPolicyAdherence
      }
    };
  }
}