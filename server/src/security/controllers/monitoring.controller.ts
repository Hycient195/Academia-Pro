import { Controller, Get, Post, Body, Query, Param, UseGuards, Request, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ThreatDetectionService, ThreatIndicator } from '../services/threat-detection.service';
import { SecurityService } from '../services/security.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AuditEventType, AuditSeverity } from '../entities/audit-log.entity';

@ApiTags('Security - Monitoring & Threat Detection')
@Controller('monitoring')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MonitoringController {
  private readonly logger = new Logger(MonitoringController.name);

  constructor(
    private readonly threatDetectionService: ThreatDetectionService,
    private readonly securityService: SecurityService,
  ) {}

  @Get('threats')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get detected threats',
    description: 'Retrieve list of detected security threats with optional time range filtering.',
  })
  @ApiQuery({ name: 'timeRange', enum: ['1h', '24h', '7d', '30d'], required: false, description: 'Time range for threat detection' })
  @ApiQuery({ name: 'severity', enum: ['low', 'medium', 'high', 'critical'], required: false, description: 'Filter by threat severity' })
  @ApiQuery({ name: 'type', enum: ['anomaly', 'pattern', 'behavior', 'external'], required: false, description: 'Filter by threat type' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: 'Maximum number of threats to return' })
  @ApiResponse({
    status: 200,
    description: 'Threats retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        threats: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              severity: { type: 'string' },
              confidence: { type: 'number' },
              description: { type: 'string' },
              indicators: { type: 'array', items: { type: 'string' } },
              affectedUsers: { type: 'array', items: { type: 'string' } },
              affectedResources: { type: 'array', items: { type: 'string' } },
              detectionTime: { type: 'string', format: 'date-time' },
              riskScore: { type: 'number' },
              recommendedActions: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        total: { type: 'number' },
        timeRange: { type: 'string' },
        generatedAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getThreats(
    @Query() filters: {
      timeRange?: '1h' | '24h' | '7d' | '30d';
      severity?: 'low' | 'medium' | 'high' | 'critical';
      type?: 'anomaly' | 'pattern' | 'behavior' | 'external';
      limit?: number;
    },
    @Request() req: any,
  ): Promise<{ threats: ThreatIndicator[]; total: number; timeRange: string; generatedAt: Date }> {
    this.logger.log(`Threat detection request by user: ${req.user.userId}`);

    const timeRange = filters.timeRange || '24h';
    const threats = await this.threatDetectionService.detectThreats(timeRange);

    // Apply filters
    let filteredThreats = threats;

    if (filters.severity) {
      filteredThreats = filteredThreats.filter(t => t.severity === filters.severity);
    }

    if (filters.type) {
      filteredThreats = filteredThreats.filter(t => t.type === filters.type);
    }

    if (filters.limit) {
      filteredThreats = filteredThreats.slice(0, filters.limit);
    }

    // Log monitoring access
    await this.securityService.logSecurityEvent(
      AuditEventType.DATA_ACCESSED,
      req.user.userId,
      AuditSeverity.LOW,
      'Security threats accessed',
      {
        monitoringAccess: true,
        timeRange,
        filters,
        threatsReturned: filteredThreats.length,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return {
      threats: filteredThreats,
      total: threats.length,
      timeRange,
      generatedAt: new Date(),
    };
  }

  @Get('threat-report')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Generate threat report',
    description: 'Generate comprehensive threat detection report for specified time range.',
  })
  @ApiQuery({ name: 'timeRange', enum: ['24h', '7d', '30d'], required: false, description: 'Time range for report' })
  @ApiResponse({
    status: 200,
    description: 'Threat report generated successfully',
  })
  async getThreatReport(
    @Query('timeRange') timeRange: '24h' | '7d' | '30d' = '7d',
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`Threat report request by user: ${req.user.userId}, range: ${timeRange}`);

    const report = await this.threatDetectionService.generateThreatReport(timeRange);

    // Log report generation
    await this.securityService.logSecurityEvent(
      AuditEventType.DATA_ACCESSED,
      req.user.userId,
      AuditSeverity.LOW,
      'Threat report generated',
      {
        reportGeneration: true,
        timeRange,
        threatsInReport: report.threats.length,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return report;
  }

  @Post('analyze-user')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Analyze user behavior',
    description: 'Perform behavioral analysis on specific user for anomaly detection.',
  })
  @ApiBody({
    description: 'User behavior analysis request',
    schema: {
      type: 'object',
      required: ['userId'],
      properties: {
        userId: { type: 'string', example: 'user-001' },
        days: { type: 'number', default: 30, description: 'Number of days to analyze' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User behavior analysis completed',
  })
  async analyzeUserBehavior(
    @Body() data: { userId: string; days?: number },
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`User behavior analysis request by user: ${req.user.userId} for user: ${data.userId}`);

    const analysis = await this.threatDetectionService.analyzeUserBehavior(
      data.userId,
      data.days || 30,
    );

    // Log analysis
    await this.securityService.logSecurityEvent(
      AuditEventType.DATA_ACCESSED,
      req.user.userId,
      analysis.isAnomalous ? AuditSeverity.MEDIUM : AuditSeverity.LOW,
      'User behavior analysis performed',
      {
        behaviorAnalysis: true,
        analyzedUserId: data.userId,
        analysisDays: data.days || 30,
        isAnomalous: analysis.isAnomalous,
        anomalyScore: analysis.anomalyScore,
        riskLevel: analysis.riskLevel,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return {
      userId: data.userId,
      analysisPeriod: `${data.days || 30} days`,
      ...analysis,
      analyzedAt: new Date(),
    };
  }

  @Get('threat-intelligence')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get threat intelligence',
    description: 'Retrieve current threat intelligence and security recommendations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Threat intelligence retrieved successfully',
  })
  async getThreatIntelligence(@Request() req: any): Promise<any> {
    this.logger.log(`Threat intelligence request by user: ${req.user.userId}`);

    const intelligence = await this.threatDetectionService.getThreatIntelligence();

    // Log intelligence access
    await this.securityService.logSecurityEvent(
      AuditEventType.DATA_ACCESSED,
      req.user.userId,
      AuditSeverity.LOW,
      'Threat intelligence accessed',
      {
        intelligenceAccess: true,
        threatLevel: intelligence.globalThreatLevel,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return intelligence;
  }

  @Post('alert-config')
  @Roles('super-admin', 'security-admin')
  @ApiOperation({
    summary: 'Configure security alerts',
    description: 'Configure alerting rules and notification preferences for security events.',
  })
  @ApiBody({
    description: 'Alert configuration',
    schema: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', default: true },
        severityThreshold: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
        alertChannels: {
          type: 'array',
          items: { type: 'string', enum: ['email', 'sms', 'webhook', 'dashboard'] },
          default: ['dashboard'],
        },
        threatTypes: {
          type: 'array',
          items: { type: 'string', enum: ['anomaly', 'pattern', 'behavior', 'external'] },
          default: ['anomaly', 'pattern', 'behavior'],
        },
        notificationRecipients: {
          type: 'array',
          items: { type: 'string' },
          description: 'Email addresses for notifications',
        },
        webhookUrl: { type: 'string', description: 'Webhook URL for external notifications' },
        quietHours: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: false },
            startTime: { type: 'string', example: '22:00' },
            endTime: { type: 'string', example: '08:00' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Alert configuration updated successfully',
  })
  async configureAlerts(
    @Body() config: {
      enabled?: boolean;
      severityThreshold?: 'low' | 'medium' | 'high' | 'critical';
      alertChannels?: string[];
      threatTypes?: string[];
      notificationRecipients?: string[];
      webhookUrl?: string;
      quietHours?: { enabled: boolean; startTime: string; endTime: string };
    },
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`Alert configuration update by user: ${req.user.userId}`);

    // Mock alert configuration update
    const updatedConfig = {
      ...config,
      updatedBy: req.user.userId,
      updatedAt: new Date(),
      id: 'alert-config-001',
    };

    // Log configuration change
    await this.securityService.logSecurityEvent(
      AuditEventType.CONFIGURATION_CHANGE,
      req.user.userId,
      AuditSeverity.MEDIUM,
      'Security alert configuration updated',
      {
        alertConfiguration: true,
        configChanges: Object.keys(config),
        severityThreshold: config.severityThreshold,
        alertChannels: config.alertChannels,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return {
      success: true,
      message: 'Alert configuration updated successfully',
      config: updatedConfig,
    };
  }

  @Get('alert-config')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get alert configuration',
    description: 'Retrieve current security alert configuration.',
  })
  @ApiResponse({
    status: 200,
    description: 'Alert configuration retrieved successfully',
  })
  async getAlertConfiguration(@Request() req: any): Promise<any> {
    this.logger.log(`Alert configuration request by user: ${req.user.userId}`);

    // Mock current configuration
    const currentConfig = {
      id: 'alert-config-001',
      enabled: true,
      severityThreshold: 'high',
      alertChannels: ['dashboard', 'email'],
      threatTypes: ['anomaly', 'pattern', 'behavior'],
      notificationRecipients: ['security@school.com', 'admin@school.com'],
      webhookUrl: 'https://api.security-service.com/webhook',
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
      },
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date(),
      updatedBy: 'system',
    };

    return currentConfig;
  }

  @Post('scan-security')
  @Roles('super-admin', 'security-admin')
  @ApiOperation({
    summary: 'Perform security scan',
    description: 'Initiate comprehensive security scan across the system.',
  })
  @ApiBody({
    description: 'Security scan configuration',
    schema: {
      type: 'object',
      properties: {
        scanType: {
          type: 'string',
          enum: ['quick', 'full', 'targeted'],
          default: 'quick',
        },
        targetModules: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific modules to scan',
        },
        includeVulnerabilityScan: { type: 'boolean', default: true },
        includeConfigurationAudit: { type: 'boolean', default: true },
        includeAccessReview: { type: 'boolean', default: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Security scan initiated successfully',
  })
  async performSecurityScan(
    @Body() scanConfig: {
      scanType?: 'quick' | 'full' | 'targeted';
      targetModules?: string[];
      includeVulnerabilityScan?: boolean;
      includeConfigurationAudit?: boolean;
      includeAccessReview?: boolean;
    },
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`Security scan initiated by user: ${req.user.userId}`);

    const scanId = `scan-${Date.now()}`;
    const startTime = new Date();

    // Mock scan initiation
    const scanJob = {
      id: scanId,
      type: scanConfig.scanType || 'quick',
      status: 'running',
      progress: 0,
      startedAt: startTime,
      estimatedCompletion: new Date(startTime.getTime() + 300000), // 5 minutes
      initiatedBy: req.user.userId,
      configuration: scanConfig,
    };

    // Log scan initiation
    await this.securityService.logSecurityEvent(
      AuditEventType.SECURITY_SCAN,
      req.user.userId,
      AuditSeverity.LOW,
      'Security scan initiated',
      {
        securityScan: true,
        scanId,
        scanType: scanConfig.scanType,
        targetModules: scanConfig.targetModules,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return {
      success: true,
      message: 'Security scan initiated successfully',
      scan: scanJob,
    };
  }

  @Get('scan-status/:scanId')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get scan status',
    description: 'Retrieve status of a security scan.',
  })
  @ApiResponse({
    status: 200,
    description: 'Scan status retrieved successfully',
  })
  async getScanStatus(
    @Param('scanId') scanId: string,
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`Scan status request by user: ${req.user.userId} for scan: ${scanId}`);

    // Mock scan status
    const mockStatus = {
      id: scanId,
      status: 'completed',
      progress: 100,
      startedAt: new Date(Date.now() - 300000),
      completedAt: new Date(),
      findings: {
        vulnerabilities: 3,
        configurationIssues: 2,
        accessViolations: 1,
        total: 6,
      },
      summary: {
        critical: 0,
        high: 1,
        medium: 3,
        low: 2,
      },
      recommendations: [
        'Update authentication policies',
        'Review user access permissions',
        'Enable additional security monitoring',
      ],
    };

    return mockStatus;
  }

  @Get('security-metrics')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get security metrics',
    description: 'Retrieve comprehensive security metrics and KPIs.',
  })
  @ApiQuery({ name: 'period', enum: ['day', 'week', 'month'], required: false, description: 'Metrics period' })
  @ApiResponse({
    status: 200,
    description: 'Security metrics retrieved successfully',
  })
  async getSecurityMetrics(
    @Query('period') period: 'day' | 'week' | 'month' = 'week',
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`Security metrics request by user: ${req.user.userId}, period: ${period}`);

    // Mock security metrics
    const metrics = {
      period,
      generatedAt: new Date(),
      threatMetrics: {
        totalThreats: 47,
        activeThreats: 12,
        resolvedThreats: 35,
        threatTrend: '+15%',
        topThreatTypes: [
          { type: 'brute_force', count: 18 },
          { type: 'unusual_login', count: 12 },
          { type: 'session_anomaly', count: 9 },
          { type: 'data_access', count: 8 },
        ],
      },
      authenticationMetrics: {
        totalLogins: 1250,
        successfulLogins: 1180,
        failedLogins: 70,
        mfaUsage: 85,
        averageSessionDuration: '2.5h',
      },
      systemHealth: {
        uptime: '99.9%',
        responseTime: '245ms',
        errorRate: '0.1%',
        securityScore: 92,
      },
      complianceMetrics: {
        gdprCompliance: 98,
        ferpaCompliance: 96,
        auditCoverage: 95,
        policyAdherence: 94,
      },
      userActivity: {
        activeUsers: 892,
        newUsers: 23,
        suspendedUsers: 3,
        highRiskUsers: 7,
      },
    };

    return metrics;
  }

  @Post('incident-response')
  @Roles('super-admin', 'security-admin')
  @ApiOperation({
    summary: 'Execute incident response',
    description: 'Execute automated incident response actions for security incidents.',
  })
  @ApiBody({
    description: 'Incident response configuration',
    schema: {
      type: 'object',
      required: ['incidentId', 'responseType'],
      properties: {
        incidentId: { type: 'string' },
        responseType: {
          type: 'string',
          enum: ['isolate', 'block', 'notify', 'investigate', 'escalate'],
        },
        parameters: { type: 'object' },
        automated: { type: 'boolean', default: true },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Incident response executed successfully',
  })
  async executeIncidentResponse(
    @Body() responseConfig: {
      incidentId: string;
      responseType: 'isolate' | 'block' | 'notify' | 'investigate' | 'escalate';
      parameters?: any;
      automated?: boolean;
    },
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`Incident response execution by user: ${req.user.userId} for incident: ${responseConfig.incidentId}`);

    // Mock incident response execution
    const response = {
      id: `response-${Date.now()}`,
      incidentId: responseConfig.incidentId,
      responseType: responseConfig.responseType,
      status: 'executed',
      executedAt: new Date(),
      executedBy: req.user.userId,
      automated: responseConfig.automated !== false,
      results: {
        success: true,
        actionsTaken: [
          'User session terminated',
          'IP address blocked temporarily',
          'Security alert sent to administrators',
        ],
        duration: '2.3 seconds',
      },
    };

    // Log incident response
    await this.securityService.logSecurityEvent(
      AuditEventType.INCIDENT_RESPONSE,
      req.user.userId,
      AuditSeverity.HIGH,
      `Incident response executed: ${responseConfig.responseType}`,
      {
        incidentResponse: true,
        incidentId: responseConfig.incidentId,
        responseType: responseConfig.responseType,
        automated: response.automated,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return {
      success: true,
      message: 'Incident response executed successfully',
      response,
    };
  }

  @Get('risk-assessment')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get risk assessment',
    description: 'Retrieve comprehensive security risk assessment for the organization.',
  })
  @ApiResponse({
    status: 200,
    description: 'Risk assessment retrieved successfully',
  })
  async getRiskAssessment(@Request() req: any): Promise<any> {
    this.logger.log(`Risk assessment request by user: ${req.user.userId}`);

    // Mock risk assessment
    const assessment = {
      generatedAt: new Date(),
      overallRiskLevel: 'medium',
      riskScore: 6.2,
      assessmentPeriod: 'Last 30 days',
      riskCategories: [
        {
          category: 'Authentication Security',
          riskLevel: 'low',
          score: 3.1,
          findings: 2,
          recommendations: [
            'Consider implementing adaptive MFA',
            'Review password policies',
          ],
        },
        {
          category: 'Access Control',
          riskLevel: 'medium',
          score: 5.8,
          findings: 4,
          recommendations: [
            'Implement role-based access control',
            'Regular access reviews',
            'Enhanced audit logging',
          ],
        },
        {
          category: 'Data Protection',
          riskLevel: 'low',
          score: 2.9,
          findings: 1,
          recommendations: [
            'Implement data encryption at rest',
            'Regular backup verification',
          ],
        },
        {
          category: 'Network Security',
          riskLevel: 'high',
          score: 8.5,
          findings: 6,
          recommendations: [
            'Implement network segmentation',
            'Deploy intrusion detection systems',
            'Regular vulnerability scanning',
          ],
        },
      ],
      topRisks: [
        'Unpatched software vulnerabilities',
        'Weak password policies',
        'Insufficient access controls',
        'Lack of network monitoring',
        'Inadequate incident response procedures',
      ],
      mitigationPriority: [
        'Critical: Network security improvements',
        'High: Access control enhancements',
        'Medium: Authentication strengthening',
        'Low: Monitoring and logging improvements',
      ],
    };

    return assessment;
  }
}