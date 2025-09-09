import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, Brackets } from 'typeorm';
import { AuditLog } from '../../security/entities/audit-log.entity';
import { StudentAuditLog } from '../../students/entities/student-audit-log.entity';
import { AuditService } from '../../security/services/audit.service';
import { AuditFiltersDto, AuditTimelineFiltersDto, AuditSearchDto } from './audit-filters.dto';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';
import { SYSTEM_USER_ID } from '../../security/entities/audit-log.entity';
import { AuditAction as StudentAuditAction, AuditEntityType, AuditSeverity as StudentAuditSeverity } from '../../students/entities/student-audit-log.entity';
import { AuditMetricsService } from '../../common/audit/audit-metrics.service';

@Injectable()
export class AuditManagementService {
  private readonly logger = new Logger(AuditManagementService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
    @InjectRepository(StudentAuditLog)
    private readonly studentAuditLogRepository: Repository<StudentAuditLog>,
    private readonly auditService: AuditService,
    private readonly auditMetricsService: AuditMetricsService,
  ) {}

  /**
   * Get audit logs with advanced filtering and pagination
   */
  async getAuditLogs(filters: AuditFiltersDto): Promise<{
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    // Apply filters
    this.applyAuditFilters(queryBuilder, filters);

    // Apply sorting
    const sortBy = filters.sortBy || 'timestamp';
    const sortOrder = filters.sortOrder || 'DESC';
    queryBuilder.orderBy(`audit.${sortBy}`, sortOrder);

    // Apply pagination
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 1000); // Max 1000 records per page
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    // Execute query
    this.logger.debug(`Executing audit logs query with page: ${page}, limit: ${limit}`);
    const [logs, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    this.logger.debug(`Query executed successfully - found ${total} total logs, returning ${logs.length} logs for page ${page}`);

    return {
      logs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get a specific audit log by ID
   */
  async getAuditLogById(id: string): Promise<AuditLog> {
    const log = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['school'], // If school relation exists
    });

    if (!log) {
      throw new NotFoundException(`Audit log with ID ${id} not found`);
    }

    // Log the access for audit trail
    await this.auditService.logActivity({
      userId: SYSTEM_USER_ID, // This should be the current user ID
      action: AuditAction.AUDIT_LOG_ACCESSED,
      resource: 'audit_log',
      resourceId: id,
      details: { accessedBy: 'super_admin' },
      severity: AuditSeverity.LOW,
    });

    return log;
  }

  /**
   * Search audit logs with full-text search capabilities
   */
  async searchAuditLogs(searchDto: AuditSearchDto, filters: AuditFiltersDto): Promise<{
    logs: AuditLog[];
    total: number;
    highlights: Record<string, any>[];
  }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    // Apply base filters
    this.applyAuditFilters(queryBuilder, filters);

    // Apply search query
    if (searchDto.query && searchDto.query.trim()) {
      const searchFields = searchDto.fields || ['userId', 'resource', 'resourceId', 'details', 'ipAddress'];
      const searchConditions = [];

      for (const field of searchFields) {
        if (field === 'details') {
          // Search in JSON details field
          searchConditions.push(`audit.details::text ILIKE :search`);
        } else {
          searchConditions.push(`audit.${field} ILIKE :search`);
        }
      }

      queryBuilder.andWhere(`(${searchConditions.join(' OR ')})`, {
        search: searchDto.exactMatch ? searchDto.query : `%${searchDto.query}%`,
      });
    }

    // Apply pagination
    const limit = Math.min(searchDto.limit || 100, 1000);
    queryBuilder.take(limit);

    queryBuilder.orderBy('audit.timestamp', 'DESC');

    const logs = await queryBuilder.getMany();

    // Generate highlights for search results
    const highlights = logs.map(log => this.generateHighlights(log, searchDto));

    return {
      logs,
      total: logs.length,
      highlights,
    };
  }

  /**
   * Get audit timeline with grouping
   */
  async getAuditTimeline(filters: AuditTimelineFiltersDto): Promise<{
    timeline: Array<{
      period: string;
      count: number;
      logs: AuditLog[];
      severityBreakdown: Record<string, number>;
    }>;
    total: number;
  }> {
    const groupBy = filters.groupBy || 'day';
    const timeRange = filters.timeRange || 30;

    // Calculate date range
    const endDate = filters.endDate ? new Date(filters.endDate) : new Date();
    const startDate = filters.startDate
      ? new Date(filters.startDate)
      : new Date(endDate.getTime() - timeRange * 24 * 60 * 60 * 1000);

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    // Apply filters
    this.applyAuditFilters(queryBuilder, filters);
    queryBuilder.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
      startDate,
      endDate,
    });

    // Group by time period
    let dateFormat: string;
    switch (groupBy) {
      case 'hour':
        dateFormat = 'YYYY-MM-DD HH24:00:00';
        break;
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'YYYY-WW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }

    const rawResults = await queryBuilder
      .select(`TO_CHAR(audit.timestamp, '${dateFormat}')`, 'period')
      .addSelect('COUNT(*)', 'count')
      .addSelect('array_agg(audit.id)', 'logIds')
      .groupBy('period')
      .orderBy('period', 'ASC')
      .getRawMany();

    // Get detailed logs for each period
    const timeline = [];
    for (const result of rawResults) {
      const periodLogs = await this.auditLogRepository
        .createQueryBuilder('audit')
        .where('audit.id = ANY(:ids)', { ids: result.logIds })
        .orderBy('audit.timestamp', 'DESC')
        .take(10) // Limit logs per period
        .getMany();

      // Calculate severity breakdown
      const severityBreakdown = periodLogs.reduce((acc, log) => {
        acc[log.severity] = (acc[log.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      timeline.push({
        period: result.period,
        count: parseInt(result.count),
        logs: periodLogs,
        severityBreakdown,
      });
    }

    return {
      timeline,
      total: timeline.reduce((sum, period) => sum + period.count, 0),
    };
  }

  /**
   * Get student audit logs
   */
  async getStudentAuditLogs(filters: AuditFiltersDto): Promise<{
    logs: StudentAuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const queryBuilder = this.studentAuditLogRepository.createQueryBuilder('studentAudit');

    // Apply student-specific filters
    this.applyStudentAuditFilters(queryBuilder, filters);

    // Apply sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'DESC';
    queryBuilder.orderBy(`studentAudit.${sortBy}`, sortOrder);

    // Apply pagination
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 1000);
    const offset = (page - 1) * limit;

    queryBuilder.skip(offset).take(limit);

    const [logs, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      logs,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Get audit log statistics
   */
  async getAuditStatistics(filters: AuditFiltersDto): Promise<{
    totalLogs: number;
    logsBySeverity: Record<string, number>;
    logsByAction: Record<string, number>;
    logsByResource: Record<string, number>;
    logsBySchool: Record<string, number>;
    recentActivity: AuditLog[];
    topUsers: Array<{ userId: string; count: number }>;
    averageLogsPerDay: number;
  }> {
    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    // Apply filters
    this.applyAuditFilters(queryBuilder, filters);

    // Get total count
    const totalLogs = await queryBuilder.getCount();

    // Get logs by severity
    const severityStats = await queryBuilder
      .select('audit.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.severity')
      .getRawMany();

    const logsBySeverity = severityStats.reduce((acc, stat) => {
      acc[stat.severity] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);

    // Get logs by action
    const actionStats = await queryBuilder
      .select('audit.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.action')
      .getRawMany();

    const logsByAction = actionStats.reduce((acc, stat) => {
      acc[stat.action] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);

    // Get logs by resource
    const resourceStats = await queryBuilder
      .select('audit.resource', 'resource')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.resource')
      .getRawMany();

    const logsByResource = resourceStats.reduce((acc, stat) => {
      acc[stat.resource] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);

    // Get logs by school
    const schoolStats = await queryBuilder
      .select('audit.schoolId', 'schoolId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.schoolId')
      .getRawMany();

    const logsBySchool = schoolStats.reduce((acc, stat) => {
      acc[stat.schoolId || 'system'] = parseInt(stat.count);
      return acc;
    }, {} as Record<string, number>);

    // Get recent activity
    const recentActivity = await this.auditLogRepository.find({
      order: { timestamp: 'DESC' },
      take: 10,
    });

    // Get top users
    const userStats = await queryBuilder
      .select('audit.userId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('audit.userId')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topUsers = userStats.map(stat => ({
      userId: stat.userId,
      count: parseInt(stat.count),
    }));

    // Calculate average logs per day
    const dateRange = filters.endDate && filters.startDate
      ? (new Date(filters.endDate).getTime() - new Date(filters.startDate).getTime()) / (1000 * 60 * 60 * 24)
      : 30; // Default 30 days

    const averageLogsPerDay = totalLogs / Math.max(dateRange, 1);

    // Broadcast metrics update to WebSocket clients using the metrics service
    const metricsUpdate = {
      totalActivities: totalLogs,
      activeUsers: topUsers.length,
      apiRequests: (logsByAction as any)['api_request'] || 0,
      securityEvents: ((logsBySeverity as any)['high'] || 0) + ((logsBySeverity as any)['critical'] || 0),
      recentActivityCount: recentActivity.length,
      criticalEventsCount: (logsBySeverity as any)['critical'] || 0,
      topResources: Object.entries(logsByResource)
        .map(([resource, count]) => ({ resource, count: count as number }))
        .sort((a, b) => (b.count as number) - (a.count as number))
        .slice(0, 5),
      severityBreakdown: logsBySeverity as any,
    };

    // Broadcast the metrics update asynchronously with throttling
    setImmediate(() => {
      this.auditMetricsService.updateMetrics(metricsUpdate, {
        priority: 'medium',
        throttleMs: 5000, // Throttle updates to every 5 seconds
      }).catch(error => {
        this.logger.error(`Failed to broadcast metrics update: ${error.message}`, error.stack);
      });
    });

    return {
      totalLogs,
      logsBySeverity,
      logsByAction,
      logsByResource,
      logsBySchool,
      recentActivity,
      topUsers,
      averageLogsPerDay,
    };
  }

  /**
   * Apply audit log filters to query builder
   */
  private applyAuditFilters(queryBuilder: SelectQueryBuilder<AuditLog>, filters: AuditFiltersDto): void {
    this.logger.debug('Applying audit filters:', filters);

    // Handle period parameter by converting to date range
    if (filters.period && !filters.startDate && !filters.endDate) {
      const { startDate, endDate } = this.parsePeriodToDateRange(filters.period);
      filters.startDate = startDate;
      filters.endDate = endDate;
      this.logger.debug(`Parsed period ${filters.period} to date range: ${startDate} - ${endDate}`);
    }

    if (filters.userId && filters.userId.trim()) {
      queryBuilder.andWhere('audit.userId = :userId', { userId: filters.userId.trim() });
      this.logger.debug(`Applied userId filter: ${filters.userId}`);
    }

    if (filters.schoolId && filters.schoolId.trim()) {
      queryBuilder.andWhere('audit.schoolId = :schoolId', { schoolId: filters.schoolId.trim() });
      this.logger.debug(`Applied schoolId filter: ${filters.schoolId}`);
    }

    if (filters.resource && filters.resource.trim()) {
      queryBuilder.andWhere('audit.resource = :resource', { resource: filters.resource.trim() });
      this.logger.debug(`Applied resource filter: ${filters.resource}`);
    }

    if (filters.resourceId && filters.resourceId.trim()) {
      queryBuilder.andWhere('audit.resourceId = :resourceId', { resourceId: filters.resourceId.trim() });
      this.logger.debug(`Applied resourceId filter: ${filters.resourceId}`);
    }

    if (filters.action && filters.action.trim()) {
      // Use ILIKE for case-insensitive matching of action strings
      queryBuilder.andWhere('audit.action ILIKE :action', { action: filters.action.trim() });
      this.logger.debug(`Applied action filter: ${filters.action}`);
    }

    if (filters.severity && filters.severity.trim()) {
      // Use ILIKE for case-insensitive matching of severity strings
      queryBuilder.andWhere('audit.severity ILIKE :severity', { severity: filters.severity.trim() });
      this.logger.debug(`Applied severity filter: ${filters.severity}`);
    }

    if (filters.startDate && filters.endDate) {
      try {
        const startDate = new Date(filters.startDate);
        const endDate = new Date(filters.endDate);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          queryBuilder.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
            startDate,
            endDate,
          });
          this.logger.debug(`Applied date range filter: ${startDate} - ${endDate}`);
        } else {
          this.logger.warn(`Invalid date range: ${filters.startDate} - ${filters.endDate}`);
        }
      } catch (error) {
        this.logger.error(`Error parsing date range: ${error.message}`);
      }
    } else if (filters.startDate) {
      try {
        const startDate = new Date(filters.startDate);
        if (!isNaN(startDate.getTime())) {
          queryBuilder.andWhere('audit.timestamp >= :startDate', { startDate });
          this.logger.debug(`Applied start date filter: ${startDate}`);
        } else {
          this.logger.warn(`Invalid start date: ${filters.startDate}`);
        }
      } catch (error) {
        this.logger.error(`Error parsing start date: ${error.message}`);
      }
    } else if (filters.endDate) {
      try {
        const endDate = new Date(filters.endDate);
        if (!isNaN(endDate.getTime())) {
          queryBuilder.andWhere('audit.timestamp <= :endDate', { endDate });
          this.logger.debug(`Applied end date filter: ${endDate}`);
        } else {
          this.logger.warn(`Invalid end date: ${filters.endDate}`);
        }
      } catch (error) {
        this.logger.error(`Error parsing end date: ${error.message}`);
      }
    }

    if (filters.ipAddress && filters.ipAddress.trim()) {
      queryBuilder.andWhere('audit.ipAddress = :ipAddress', { ipAddress: filters.ipAddress.trim() });
      this.logger.debug(`Applied ipAddress filter: ${filters.ipAddress}`);
    }

    if (filters.userAgent && filters.userAgent.trim()) {
      queryBuilder.andWhere('audit.userAgent ILIKE :userAgent', { userAgent: `%${filters.userAgent.trim()}%` });
      this.logger.debug(`Applied userAgent filter: ${filters.userAgent}`);
    }

    if (filters.sessionId && filters.sessionId.trim()) {
      queryBuilder.andWhere('audit.sessionId = :sessionId', { sessionId: filters.sessionId.trim() });
      this.logger.debug(`Applied sessionId filter: ${filters.sessionId}`);
    }

    if (filters.correlationId && filters.correlationId.trim()) {
      queryBuilder.andWhere('audit.correlationId = :correlationId', { correlationId: filters.correlationId.trim() });
      this.logger.debug(`Applied correlationId filter: ${filters.correlationId}`);
    }

    if (filters.isArchived !== undefined) {
      queryBuilder.andWhere('audit.isArchived = :isArchived', { isArchived: filters.isArchived });
    }

    if (filters.isConfidential !== undefined) {
      // Assuming we add a confidential field or check in details
      queryBuilder.andWhere('audit.details->>\'isConfidential\' = :isConfidential', {
        isConfidential: filters.isConfidential.toString(),
      });
    }

    // Advanced filters
    if (filters.changedFields && filters.changedFields.length > 0) {
      queryBuilder.andWhere('audit.details->\'changedFields\' ?| array[:changedFields]', {
        changedFields: filters.changedFields,
      });
    }

    if (filters.businessRulesViolated && filters.businessRulesViolated.length > 0) {
      queryBuilder.andWhere('audit.details->\'businessRulesViolated\' ?| array[:businessRulesViolated]', {
        businessRulesViolated: filters.businessRulesViolated,
      });
    }

    if (filters.complianceIssues && filters.complianceIssues.length > 0) {
      queryBuilder.andWhere('audit.details->\'complianceIssues\' ?| array[:complianceIssues]', {
        complianceIssues: filters.complianceIssues,
      });
    }

    if (filters.riskLevel) {
      queryBuilder.andWhere('audit.details->>\'riskLevel\' = :riskLevel', { riskLevel: filters.riskLevel });
    }

    if (filters.gdprCompliant !== undefined) {
      queryBuilder.andWhere('audit.details->>\'gdprCompliant\' = :gdprCompliant', {
        gdprCompliant: filters.gdprCompliant.toString(),
      });
    }

    if (filters.requiresParentConsent !== undefined) {
      queryBuilder.andWhere('audit.details->>\'requiresParentConsent\' = :requiresParentConsent', {
        requiresParentConsent: filters.requiresParentConsent.toString(),
      });
    }

    if (filters.parentConsentObtained !== undefined) {
      queryBuilder.andWhere('audit.details->>\'parentConsentObtained\' = :parentConsentObtained', {
        parentConsentObtained: filters.parentConsentObtained.toString(),
      });
      this.logger.debug(`Applied parentConsentObtained filter: ${filters.parentConsentObtained}`);
    }

    this.logger.debug('Audit filters applied successfully');
  }

  /**
   * Apply student audit log filters to query builder
   */
  private applyStudentAuditFilters(queryBuilder: SelectQueryBuilder<StudentAuditLog>, filters: AuditFiltersDto): void {
    if (filters.studentId) {
      queryBuilder.andWhere('studentAudit.studentId = :studentId', { studentId: filters.studentId });
    }

    if (filters.studentAction) {
      queryBuilder.andWhere('studentAudit.action = :action', { action: filters.studentAction });
    }

    if (filters.entityType) {
      queryBuilder.andWhere('studentAudit.entityType = :entityType', { entityType: filters.entityType });
    }

    if (filters.studentSeverity) {
      queryBuilder.andWhere('studentAudit.severity = :severity', { severity: filters.studentSeverity });
    }

    if (filters.academicYear) {
      queryBuilder.andWhere('studentAudit.academicYear = :academicYear', { academicYear: filters.academicYear });
    }

    if (filters.gradeLevel) {
      queryBuilder.andWhere('studentAudit.gradeLevel = :gradeLevel', { gradeLevel: filters.gradeLevel });
    }

    if (filters.section) {
      queryBuilder.andWhere('studentAudit.section = :section', { section: filters.section });
    }

    if (filters.userRole) {
      queryBuilder.andWhere('studentAudit.userRole = :userRole', { userRole: filters.userRole });
    }

    if (filters.userDepartment) {
      queryBuilder.andWhere('studentAudit.userDepartment = :userDepartment', { userDepartment: filters.userDepartment });
    }

    if (filters.startDate && filters.endDate) {
      queryBuilder.andWhere('studentAudit.createdAt BETWEEN :startDate AND :endDate', {
        startDate: new Date(filters.startDate),
        endDate: new Date(filters.endDate),
      });
    } else if (filters.startDate) {
      queryBuilder.andWhere('studentAudit.createdAt >= :startDate', { startDate: new Date(filters.startDate) });
    } else if (filters.endDate) {
      queryBuilder.andWhere('studentAudit.createdAt <= :endDate', { endDate: new Date(filters.endDate) });
    }

    if (filters.gdprCompliant !== undefined) {
      queryBuilder.andWhere('studentAudit.gdprCompliant = :gdprCompliant', { gdprCompliant: filters.gdprCompliant });
    }

    if (filters.requiresParentConsent !== undefined) {
      queryBuilder.andWhere('studentAudit.requiresParentConsent = :requiresParentConsent', {
        requiresParentConsent: filters.requiresParentConsent,
      });
    }

    if (filters.parentConsentObtained !== undefined) {
      queryBuilder.andWhere('studentAudit.parentConsentObtained = :parentConsentObtained', {
        parentConsentObtained: filters.parentConsentObtained,
      });
    }
  }

  /**
   * Generate highlights for search results
   */
  private generateHighlights(log: AuditLog, searchDto: AuditSearchDto): Record<string, any> {
    const highlights: Record<string, any> = {};

    if (!searchDto.query) return highlights;

    const searchTerm = searchDto.query.toLowerCase();
    const fields = searchDto.fields || ['userId', 'resource', 'resourceId', 'details', 'ipAddress'];

    for (const field of fields) {
      if (field === 'details' && log.details) {
        // Search in JSON details
        const detailsStr = JSON.stringify(log.details).toLowerCase();
        if (detailsStr.includes(searchTerm)) {
          highlights.details = this.highlightText(JSON.stringify(log.details), searchDto.query);
        }
      } else if (log[field as keyof AuditLog]) {
        const fieldValue = String(log[field as keyof AuditLog]).toLowerCase();
        if (fieldValue.includes(searchTerm)) {
          highlights[field] = this.highlightText(String(log[field as keyof AuditLog]), searchDto.query);
        }
      }
    }

    return highlights;
  }

  /**
   * Highlight search terms in text
   */
  private highlightText(text: string, searchTerm: string): string {
    if (!searchTerm) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  /**
   * Parse period string to date range
   */
  private parsePeriodToDateRange(period: string): { startDate: string; endDate: string } {
    const now = new Date();
    let startDate: Date;

    // Parse period (e.g., '24h', '7d', '30d', '1y')
    const match = period.match(/^(\d+)([hdmy])$/);
    if (!match) {
      // Default to 24 hours
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else {
      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case 'h':
          startDate = new Date(now.getTime() - value * 60 * 60 * 1000);
          break;
        case 'd':
          startDate = new Date(now.getTime() - value * 24 * 60 * 60 * 1000);
          break;
        case 'm':
          startDate = new Date(now.getTime() - value * 30 * 24 * 60 * 60 * 1000);
          break;
        case 'y':
          startDate = new Date(now.getTime() - value * 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
    }

    return {
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
    };
  }
}