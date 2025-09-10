import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { AuditAggregationService } from './audit-aggregation.service';
import { AuditService } from '../../security/services/audit.service';
import { AuditMetricsFiltersDto, AuditTrendsDto, AuditAnomaliesDto } from './audit-metrics.dto';
import { AuditSeverity, AuditAction } from '../../security/types/audit.types';
import { SYSTEM_USER_ID } from '../../security/entities/audit-log.entity';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { EUserRole } from '@academia-pro/types/users';

@Controller('super-admin/audit/metrics')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(EUserRole.SUPER_ADMIN)
export class AuditMetricsController {
  private readonly logger = new Logger(AuditMetricsController.name);

  constructor(
    private readonly auditAggregationService: AuditAggregationService,
    private readonly auditService: AuditService,
  ) {}

  /**
   * GET /super-admin/audit/metrics
   * Get audit metrics for dashboard (client-compatible format)
   */
  @Get()
  async getAuditMetrics(@Query('period') period?: string, @Query('timeRange') timeRange?: number) {
    console.log("🚀🚀🚀 AUDIT METRICS CONTROLLER CALLED with period:", period, "timeRange:", timeRange)

    try {
      // Create filters object from query parameters
      const filters: AuditMetricsFiltersDto = {
        timeRange: timeRange || 30, // Default to 30 days
      };

      // Parse period parameter if provided
      if (period) {
        const dateRange = this.parsePeriodToDateRange(period);
        filters.startDate = dateRange.startDate;
        filters.endDate = dateRange.endDate;
      }

      console.log("Final filters:", filters);
      const metrics = await this.auditAggregationService.generateMetrics(filters);

      // Transform the response to match client expectations (IAuditMetrics interface)
      const clientMetrics = {
        totalActivities: metrics.metrics.totalLogs,
        activitiesGrowth: metrics.trends.growth,
        activeUsers: metrics.metrics.uniqueUsers,
        usersGrowth: 0, // Would need historical comparison
        apiRequests: metrics.metrics.apiCalls,
        apiGrowth: 0, // Would need historical comparison
        securityEvents: metrics.metrics.securityEvents,
        securityGrowth: 0, // Would need historical comparison
        period: filters.timeRange ? `${filters.timeRange}d` : '30d',
      };


      // Log the access
      await this.auditService.logActivity({
        userId: SYSTEM_USER_ID, // This should be the current user ID
        action: AuditAction.AUDIT_LOGS_ACCESSED,
        resource: 'audit_metrics',
        details: {
          filters: filters,
          period: clientMetrics.period,
        },
        severity: AuditSeverity.LOW,
      });

      return clientMetrics;
    } catch (error) {
      this.logger.error('Error fetching audit metrics:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch audit metrics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/dashboard
   * Get audit dashboard data
   */
  @Get('dashboard')
  async getAuditDashboard(@Query() filters: AuditMetricsFiltersDto) {
          console.log("wee")

    try {
      const dashboard = await this.auditAggregationService.generateDashboard(filters);

      // Log the access
      await this.auditService.logActivity({
        userId: SYSTEM_USER_ID,
        action: 'audit_dashboard_accessed',
        resource: 'audit_dashboard',
        details: {
          filters: filters,
          totalLogs: dashboard.summary.totalLogs,
        },
        severity: AuditSeverity.LOW,
      });

      return {
        success: true,
        data: dashboard,
      };
    } catch (error) {
      this.logger.error('Error fetching audit dashboard:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch audit dashboard',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/trends
   * Get audit trends data
   */
  @Get('trends')
  async getAuditTrends(@Query() trendsDto: AuditTrendsDto, @Query() filters: AuditMetricsFiltersDto) {
    try {
      // For trends, we need to get historical data
      const trendsData = await this.auditAggregationService.generateDashboard({
        ...filters,
        timeRange: trendsDto.periods || 30,
      });

      // Log the access
      await this.auditService.logActivity({
        userId: SYSTEM_USER_ID,
        action: 'audit_trends_accessed',
        resource: 'audit_trends',
        details: {
          period: trendsDto.period,
          periods: trendsDto.periods,
          metrics: trendsDto.metrics,
        },
        severity: AuditSeverity.LOW,
      });

      return {
        success: true,
        data: {
          period: trendsDto.period,
          periods: trendsDto.periods,
          trends: trendsData.trends,
          summary: trendsData.summary,
        },
      };
    } catch (error) {
      this.logger.error('Error fetching audit trends:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch audit trends',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/anomalies
   * Detect and get audit anomalies
   */
  @Get('anomalies')
  async getAuditAnomalies(@Query() anomaliesDto: AuditAnomaliesDto, @Query() filters: AuditMetricsFiltersDto) {
    try {
      const anomalies = await this.auditAggregationService.detectAnomalies(anomaliesDto);

      // Log the access
      await this.auditService.logActivity({
        userId: SYSTEM_USER_ID,
        action: 'audit_anomalies_accessed',
        resource: 'audit_anomalies',
        details: {
          detectionMode: anomaliesDto.detectionMode,
          anomalyTypes: anomaliesDto.anomalyTypes,
          anomalyCount: anomalies.length,
        },
        severity: AuditSeverity.MEDIUM,
      });

      return {
        success: true,
        data: anomalies,
        count: anomalies.length,
      };
    } catch (error) {
      this.logger.error('Error detecting audit anomalies:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to detect audit anomalies',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/severity-breakdown
   * Get severity breakdown metrics
   */
  @Get('severity-breakdown')
  async getSeverityBreakdown(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const breakdown = await this.auditAggregationService.getSeverityBreakdown(filters);

      return {
        success: true,
        data: breakdown,
      };
    } catch (error) {
      this.logger.error('Error fetching severity breakdown:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch severity breakdown',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/action-breakdown
   * Get action breakdown metrics
   */
  @Get('action-breakdown')
  async getActionBreakdown(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const breakdown = await this.auditAggregationService.getActionBreakdown(filters);

      return {
        success: true,
        data: breakdown,
      };
    } catch (error) {
      this.logger.error('Error fetching action breakdown:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch action breakdown',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/resource-breakdown
   * Get resource breakdown metrics
   */
  @Get('resource-breakdown')
  async getResourceBreakdown(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const breakdown = await this.auditAggregationService.getResourceBreakdown(filters);

      return {
        success: true,
        data: breakdown,
      };
    } catch (error) {
      this.logger.error('Error fetching resource breakdown:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch resource breakdown',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/top-users
   * Get top users by activity
   */
  @Get('top-users')
  async getTopUsers(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const topUsers = await this.auditAggregationService.getTopUsers(filters);

      return {
        success: true,
        data: topUsers,
      };
    } catch (error) {
      this.logger.error('Error fetching top users:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch top users',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/top-schools
   * Get top schools by activity
   */
  @Get('top-schools')
  async getTopSchools(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const topSchools = await this.auditAggregationService.getTopSchools(filters);

      return {
        success: true,
        data: topSchools,
      };
    } catch (error) {
      this.logger.error('Error fetching top schools:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch top schools',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/recent-critical-events
   * Get recent critical events
   */
  @Get('recent-critical-events')
  async getRecentCriticalEvents(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const events = await this.auditAggregationService.getRecentCriticalEvents(filters);

      return {
        success: true,
        data: events,
      };
    } catch (error) {
      this.logger.error('Error fetching recent critical events:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch recent critical events',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/compliance
   * Get compliance metrics
   */
  @Get('compliance')
  async getComplianceMetrics(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const compliance = await this.auditAggregationService.getComplianceMetrics(filters);

      return {
        success: true,
        data: compliance,
      };
    } catch (error) {
      this.logger.error('Error fetching compliance metrics:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch compliance metrics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/geographic-distribution
   * Get geographic distribution of audit events
   */
  @Get('geographic-distribution')
  async getGeographicDistribution(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const distribution = await this.auditAggregationService.getGeographicDistribution(filters);

      return {
        success: true,
        data: distribution,
      };
    } catch (error) {
      this.logger.error('Error fetching geographic distribution:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch geographic distribution',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/device-types
   * Get device type distribution
   */
  @Get('device-types')
  async getDeviceTypes(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const deviceTypes = await this.auditAggregationService.getDeviceTypes(filters);

      return {
        success: true,
        data: deviceTypes,
      };
    } catch (error) {
      this.logger.error('Error fetching device types:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch device types',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/summary
   * Get metrics summary
   */
  @Get('summary')
  async getMetricsSummary(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const dashboard = await this.auditAggregationService.generateDashboard(filters);

      const summary = {
        totalLogs: dashboard.summary.totalLogs,
        totalUsers: dashboard.summary.totalUsers,
        totalSchools: dashboard.summary.totalSchools,
        criticalEvents: dashboard.summary.criticalEventsCount,
        recentActivity: dashboard.summary.recentActivityCount,
        averageLogsPerDay: dashboard.summary.averageLogsPerDay,
        severityDistribution: dashboard.severityBreakdown,
        topActions: Object.entries(dashboard.actionBreakdown)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([action, count]) => ({ action, count })),
        topResources: Object.entries(dashboard.resourceBreakdown)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 5)
          .map(([resource, count]) => ({ resource, count })),
      };

      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      this.logger.error('Error fetching metrics summary:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch metrics summary',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/realtime
   * Get real-time metrics for live dashboard updates
   */
  @Get('realtime')
  async getRealtimeMetrics() {
    try {
      const metrics = await this.auditAggregationService.getRealtimeMetrics();

      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      this.logger.error('Error fetching real-time metrics:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch real-time metrics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/performance
   * Get performance metrics
   */
  @Get('performance')
  async getPerformanceMetrics(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const performance = await this.auditAggregationService.getPerformanceMetrics(filters);

      return {
        success: true,
        data: performance,
      };
    } catch (error) {
      this.logger.error('Error fetching performance metrics:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch performance metrics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/compliance/enhanced
   * Get enhanced compliance metrics (GDPR, SOX, FERPA)
   */
  @Get('compliance/enhanced')
  async getEnhancedComplianceMetrics(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const compliance = await this.auditAggregationService.getEnhancedComplianceMetrics(filters);

      return {
        success: true,
        data: compliance,
      };
    } catch (error) {
      this.logger.error('Error fetching enhanced compliance metrics:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch enhanced compliance metrics',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/cache/clear
   * Clear metrics cache (admin only)
   */
  @Get('cache/clear')
  async clearMetricsCache() {
    try {
      // Note: This would typically require admin authentication
      await this.auditAggregationService.clearMetricsCache();

      return {
        success: true,
        message: 'Metrics cache cleared successfully',
      };
    } catch (error) {
      this.logger.error('Error clearing metrics cache:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to clear metrics cache',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/recent-security-events
   * Get recent security events for dashboard display
   */
  @Get('recent-security-events')
  async getRecentSecurityEvents(@Query() filters: AuditMetricsFiltersDto) {
    console.log('🔥🔥🔥 CONTROLLER: getRecentSecurityEvents called with filters:', filters);
    try {
      const events = await this.auditAggregationService.getRecentSecurityEvents(filters);
      console.log('🔥🔥🔥 CONTROLLER: getRecentSecurityEvents returned events:', events);

      // Log the access
      await this.auditService.logActivity({
        userId: SYSTEM_USER_ID,
        action: AuditAction.AUDIT_LOGS_ACCESSED,
        resource: 'audit_security_events',
        details: {
          filters: filters,
          eventCount: events.length,
        },
        severity: AuditSeverity.LOW,
      });

      return {
        success: true,
        data: events,
      };
    } catch (error) {
      console.log('🔥🔥🔥 CONTROLLER: Error in getRecentSecurityEvents:', error);
      this.logger.error('Error fetching recent security events:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch recent security events',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * GET /super-admin/audit/metrics/activity-timeline
   * Get activity timeline for dashboard display
   */
  @Get('activity-timeline')
  async getActivityTimeline(@Query() filters: AuditMetricsFiltersDto) {
    try {
      const timeline = await this.auditAggregationService.getActivityTimeline(filters);

      // Log the access
      await this.auditService.logActivity({
        userId: SYSTEM_USER_ID,
        action: AuditAction.AUDIT_LOGS_ACCESSED,
        resource: 'audit_activity_timeline',
        details: {
          filters: filters,
          timelineCount: timeline.length,
        },
        severity: AuditSeverity.LOW,
      });

      return {
        success: true,
        data: timeline,
      };
    } catch (error) {
      this.logger.error('Error fetching activity timeline:', error);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch activity timeline',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Parse period string (e.g., "24h", "7d", "30d") to date range
   */
  private parsePeriodToDateRange(period: string): { startDate: string; endDate: string } {
    const now = new Date();
    let hours = 0;

    // Parse period string
    if (period.endsWith('h')) {
      hours = parseInt(period.replace('h', ''));
    } else if (period.endsWith('d')) {
      hours = parseInt(period.replace('d', '')) * 24;
    } else if (period.endsWith('w')) {
      hours = parseInt(period.replace('w', '')) * 24 * 7;
    } else if (period.endsWith('m')) {
      hours = parseInt(period.replace('m', '')) * 24 * 30; // Approximate
    } else {
      // Default to 24 hours if format is unrecognized
      hours = 24;
    }

    const startDate = new Date(now.getTime() - (hours * 60 * 60 * 1000));
    const endDate = now;

    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }
}