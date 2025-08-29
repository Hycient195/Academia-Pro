import { Controller, Get, Post, Body, Query, Param, UseGuards, Request, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { ComplianceService, ComplianceCheck, DataSubjectRequest, ComplianceReport } from '../services/compliance.service';
import { SecurityService } from '../services/security.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { AuditEventType, AuditSeverity } from '../entities/audit-log.entity';

@ApiTags('Security - Compliance & Audit')
@Controller('compliance')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ComplianceController {
  private readonly logger = new Logger(ComplianceController.name);

  constructor(
    private readonly complianceService: ComplianceService,
    private readonly securityService: SecurityService,
  ) {}

  @Post('check')
  @Roles('super-admin', 'school-admin', 'security-admin', 'compliance-officer')
  @ApiOperation({
    summary: 'Perform compliance check',
    description: 'Execute automated compliance check for specified framework.',
  })
  @ApiBody({
    description: 'Compliance check parameters',
    schema: {
      type: 'object',
      required: ['framework'],
      properties: {
        framework: {
          type: 'string',
          enum: ['GDPR', 'FERPA', 'COPPA', 'HIPAA', 'CCPA', 'SOX'],
        },
        scope: {
          type: 'object',
          properties: {
            schoolId: { type: 'string' },
            userId: { type: 'string' },
            dataCategory: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Compliance check completed successfully',
  })
  async performComplianceCheck(
    @Body() data: {
      framework: 'GDPR' | 'FERPA' | 'COPPA' | 'HIPAA' | 'CCPA' | 'SOX';
      scope?: { schoolId?: string; userId?: string; dataCategory?: string };
    },
    @Request() req: any,
  ): Promise<{ checks: ComplianceCheck[]; summary: any }> {
    this.logger.log(`Compliance check request by user: ${req.user.userId} for framework: ${data.framework}`);

    const checks = await this.complianceService.performComplianceCheck(data.framework, data.scope);

    const summary = {
      total: checks.length,
      compliant: checks.filter(c => c.status === 'compliant').length,
      nonCompliant: checks.filter(c => c.status === 'non_compliant').length,
      notApplicable: checks.filter(c => c.status === 'not_applicable').length,
      underReview: checks.filter(c => c.status === 'under_review').length,
    };

    // Log compliance check
    await this.securityService.logSecurityEvent(
      AuditEventType.COMPLIANCE_CHECK,
      req.user.userId,
      summary.nonCompliant > 0 ? AuditSeverity.HIGH : AuditSeverity.LOW,
      `Compliance check completed: ${data.framework}`,
      {
        complianceCheck: true,
        framework: data.framework,
        totalChecks: summary.total,
        compliant: summary.compliant,
        nonCompliant: summary.nonCompliant,
        scope: data.scope,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return { checks, summary };
  }

  @Get('report')
  @Roles('super-admin', 'school-admin', 'security-admin', 'compliance-officer')
  @ApiOperation({
    summary: 'Generate compliance report',
    description: 'Generate comprehensive compliance report for specified framework and period.',
  })
  @ApiQuery({ name: 'framework', enum: ['GDPR', 'FERPA', 'COPPA', 'HIPAA', 'CCPA', 'SOX'], required: true })
  @ApiQuery({ name: 'startDate', required: true, description: 'Report start date (ISO format)' })
  @ApiQuery({ name: 'endDate', required: true, description: 'Report end date (ISO format)' })
  @ApiResponse({
    status: 200,
    description: 'Compliance report generated successfully',
  })
  async generateComplianceReport(
    @Query() query: {
      framework: 'GDPR' | 'FERPA' | 'COPPA' | 'HIPAA' | 'CCPA' | 'SOX';
      startDate: string;
      endDate: string;
    },
    @Request() req: any,
  ): Promise<ComplianceReport> {
    this.logger.log(`Compliance report request by user: ${req.user.userId} for framework: ${query.framework}`);

    const period = {
      start: new Date(query.startDate),
      end: new Date(query.endDate),
    };

    const report = await this.complianceService.generateComplianceReport(
      query.framework,
      period,
      req.user.userId,
    );

    // Log report generation
    await this.securityService.logSecurityEvent(
      AuditEventType.AUDIT_REVIEW,
      req.user.userId,
      report.overallCompliance < 80 ? AuditSeverity.HIGH : AuditSeverity.LOW,
      `Compliance report generated: ${query.framework}`,
      {
        complianceReport: true,
        framework: query.framework,
        overallCompliance: report.overallCompliance,
        totalFindings: report.findings.length,
        period,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return report;
  }

  @Post('data-subject-request')
  @Roles('super-admin', 'school-admin', 'security-admin', 'compliance-officer')
  @ApiOperation({
    summary: 'Handle data subject request',
    description: 'Process GDPR/FERPA data subject access, rectification, erasure, or portability requests.',
  })
  @ApiBody({
    description: 'Data subject request details',
    schema: {
      type: 'object',
      required: ['requestType', 'subjectId', 'subjectType', 'requesterInfo'],
      properties: {
        requestType: {
          type: 'string',
          enum: ['access', 'rectification', 'erasure', 'restriction', 'portability', 'objection'],
        },
        subjectId: { type: 'string' },
        subjectType: { type: 'string', enum: ['student', 'parent', 'staff', 'user'] },
        requesterInfo: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            relationship: { type: 'string' },
            verificationMethod: { type: 'string' },
          },
        },
        scope: {
          type: 'object',
          properties: {
            dataCategories: { type: 'array', items: { type: 'string' } },
            timeRange: {
              type: 'object',
              properties: {
                start: { type: 'string', format: 'date' },
                end: { type: 'string', format: 'date' },
              },
            },
            systems: { type: 'array', items: { type: 'string' } },
          },
        },
        notes: { type: 'array', items: { type: 'string' } },
        assignedTo: { type: 'string' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Data subject request created successfully',
  })
  async handleDataSubjectRequest(
    @Body() requestData: Omit<DataSubjectRequest, 'id' | 'requestedAt' | 'status'>,
    @Request() req: any,
  ): Promise<DataSubjectRequest> {
    this.logger.log(`Data subject request by user: ${req.user.userId} for subject: ${requestData.subjectId}`);

    const dataSubjectRequest = await this.complianceService.handleDataSubjectRequest(requestData);

    // Log data subject request
    await this.securityService.logSecurityEvent(
      AuditEventType.DATA_SUBJECT_REQUEST,
      req.user.userId,
      AuditSeverity.MEDIUM,
      `Data subject request created: ${requestData.requestType}`,
      {
        dataSubjectRequest: true,
        requestType: requestData.requestType,
        subjectId: requestData.subjectId,
        subjectType: requestData.subjectType,
        priority: requestData.priority,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return dataSubjectRequest;
  }

  @Get('data-subject-requests')
  @Roles('super-admin', 'school-admin', 'security-admin', 'compliance-officer')
  @ApiOperation({
    summary: 'Get data subject requests',
    description: 'Retrieve list of data subject requests with optional filtering.',
  })
  @ApiQuery({ name: 'status', enum: ['pending', 'in_progress', 'completed', 'rejected'], required: false })
  @ApiQuery({ name: 'requestType', enum: ['access', 'rectification', 'erasure', 'restriction', 'portability', 'objection'], required: false })
  @ApiQuery({ name: 'subjectType', enum: ['student', 'parent', 'staff', 'user'], required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiResponse({
    status: 200,
    description: 'Data subject requests retrieved successfully',
  })
  async getDataSubjectRequests(
    @Query() filters: {
      status?: 'pending' | 'in_progress' | 'completed' | 'rejected';
      requestType?: 'access' | 'rectification' | 'erasure' | 'restriction' | 'portability' | 'objection';
      subjectType?: 'student' | 'parent' | 'staff' | 'user';
      limit?: number;
      offset?: number;
    },
    @Request() req: any,
  ): Promise<{ requests: DataSubjectRequest[]; total: number }> {
    this.logger.log(`Data subject requests query by user: ${req.user.userId}`);

    // Mock data - in real implementation, this would query the database
    const mockRequests: DataSubjectRequest[] = [
      {
        id: 'dsr-001',
        requestType: 'access',
        subjectId: 'student-001',
        subjectType: 'student',
        status: 'completed',
        requestedAt: new Date('2024-01-15T10:00:00Z'),
        completedAt: new Date('2024-01-20T14:30:00Z'),
        requesterInfo: {
          name: 'John Doe Sr.',
          email: 'john.doe@example.com',
          relationship: 'Parent',
          verificationMethod: 'Government ID',
        },
        scope: {
          dataCategories: ['academic_records', 'attendance'],
          systems: ['student_portal', 'academic_system'],
        },
        evidence: ['Data access report generated', 'Email confirmation sent'],
        notes: ['Request processed within 30 days', 'All data categories included'],
        assignedTo: req.user.userId,
        priority: 'medium',
      },
    ];

    // Apply filters
    let filteredRequests = mockRequests;
    if (filters.status) {
      filteredRequests = filteredRequests.filter(r => r.status === filters.status);
    }
    if (filters.requestType) {
      filteredRequests = filteredRequests.filter(r => r.requestType === filters.requestType);
    }
    if (filters.subjectType) {
      filteredRequests = filteredRequests.filter(r => r.subjectType === filters.subjectType);
    }

    if (filters.limit) {
      filteredRequests = filteredRequests.slice(filters.offset || 0, (filters.offset || 0) + filters.limit);
    }

    return {
      requests: filteredRequests,
      total: mockRequests.length,
    };
  }

  @Post('classify-data')
  @Roles('super-admin', 'school-admin', 'security-admin', 'compliance-officer')
  @ApiOperation({
    summary: 'Classify data sensitivity',
    description: 'Automatically classify data based on content analysis and compliance requirements.',
  })
  @ApiBody({
    description: 'Data classification request',
    schema: {
      type: 'object',
      required: ['data'],
      properties: {
        data: { type: 'object', description: 'Data to classify' },
        context: {
          type: 'object',
          properties: {
            source: { type: 'string' },
            userId: { type: 'string' },
            schoolId: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Data classification completed successfully',
  })
  async classifyData(
    @Body() classificationData: {
      data: any;
      context: { source: string; userId?: string; schoolId?: string };
    },
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`Data classification request by user: ${req.user.userId}`);

    const classification = await this.complianceService.performDataClassification(
      classificationData.data,
      classificationData.context,
    );

    // Log data classification
    await this.securityService.logSecurityEvent(
      AuditEventType.DATA_ACCESSED,
      req.user.userId,
      AuditSeverity.LOW,
      'Data classification performed',
      {
        dataClassification: true,
        classification: classification.classification,
        sensitivity: classification.sensitivity,
        dataCategories: classification.dataCategories,
        source: classificationData.context.source,
        encryptionRequired: classification.encryptionRequired,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return classification;
  }

  @Get('retention-status')
  @Roles('super-admin', 'school-admin', 'security-admin', 'compliance-officer')
  @ApiOperation({
    summary: 'Get data retention status',
    description: 'Check data retention status and identify records eligible for deletion.',
  })
  @ApiQuery({ name: 'dataCategory', required: true, description: 'Data category to check' })
  @ApiQuery({ name: 'olderThanDays', type: 'number', required: true, description: 'Records older than this many days' })
  @ApiResponse({
    status: 200,
    description: 'Data retention status retrieved successfully',
  })
  async getDataRetentionStatus(
    @Query() query: { dataCategory: string; olderThanDays: number },
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`Data retention status request by user: ${req.user.userId} for category: ${query.dataCategory}`);

    const status = await this.complianceService.getDataRetentionStatus(
      query.dataCategory,
      query.olderThanDays,
    );

    // Log retention check
    await this.securityService.logSecurityEvent(
      AuditEventType.AUDIT_REVIEW,
      req.user.userId,
      AuditSeverity.LOW,
      `Data retention status checked: ${query.dataCategory}`,
      {
        retentionCheck: true,
        dataCategory: query.dataCategory,
        olderThanDays: query.olderThanDays,
        eligibleForDeletion: status.eligibleForDeletion,
      },
      req.ip,
      req.headers['user-agent'],
    );

    return status;
  }

  @Get('frameworks')
  @Roles('super-admin', 'school-admin', 'security-admin', 'compliance-officer')
  @ApiOperation({
    summary: 'Get compliance frameworks',
    description: 'Retrieve list of supported compliance frameworks and their requirements.',
  })
  @ApiResponse({
    status: 200,
    description: 'Compliance frameworks retrieved successfully',
  })
  async getComplianceFrameworks(@Request() req: any): Promise<any> {
    this.logger.log(`Compliance frameworks request by user: ${req.user.userId}`);

    const frameworks = {
      GDPR: {
        name: 'General Data Protection Regulation',
        region: 'European Union',
        keyRequirements: [
          'Lawful basis for processing',
          'Data subject rights',
          'Data protection by design',
          'Data breach notification',
          'Data Protection Officer',
        ],
        applicableEntities: ['EU citizens data', 'EU-based processing'],
        lastUpdated: '2024-01-01',
      },
      FERPA: {
        name: 'Family Educational Rights and Privacy Act',
        region: 'United States',
        keyRequirements: [
          'Written consent for disclosure',
          'Directory information rules',
          'Parent/student rights notification',
          'Annual notification requirements',
        ],
        applicableEntities: ['Educational institutions', 'Student records'],
        lastUpdated: '2024-01-01',
      },
      COPPA: {
        name: 'Children\'s Online Privacy Protection Act',
        region: 'United States',
        keyRequirements: [
          'Parental consent for children under 13',
          'Direct notice to parents',
          'No behavioral advertising',
          'Data retention limits',
        ],
        applicableEntities: ['Online services for children', 'Apps/websites'],
        lastUpdated: '2024-01-01',
      },
      HIPAA: {
        name: 'Health Insurance Portability and Accountability Act',
        region: 'United States',
        keyRequirements: [
          'Privacy Rule compliance',
          'Security Rule implementation',
          'Breach notification',
          'Business Associate Agreements',
        ],
        applicableEntities: ['Healthcare providers', 'Health information'],
        lastUpdated: '2024-01-01',
      },
      CCPA: {
        name: 'California Consumer Privacy Act',
        region: 'California, USA',
        keyRequirements: [
          'Right to know about data collection',
          'Right to delete personal information',
          'Right to opt-out of sale',
          'Non-discrimination for privacy rights',
        ],
        applicableEntities: ['Businesses with CA customers', 'Personal information'],
        lastUpdated: '2024-01-01',
      },
      SOX: {
        name: 'Sarbanes-Oxley Act',
        region: 'United States',
        keyRequirements: [
          'Internal controls over financial reporting',
          'CEO/CFO certifications',
          'Audit committee requirements',
          'Whistleblower protections',
        ],
        applicableEntities: ['Public companies', 'Financial reporting'],
        lastUpdated: '2024-01-01',
      },
    };

    return { frameworks };
  }

  @Get('audit-trail')
  @Roles('super-admin', 'school-admin', 'security-admin', 'compliance-officer')
  @ApiOperation({
    summary: 'Get audit trail',
    description: 'Retrieve comprehensive audit trail for compliance and security events.',
  })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date for audit trail' })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date for audit trail' })
  @ApiQuery({ name: 'eventType', required: false, description: 'Filter by event type' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'resourceType', required: false, description: 'Filter by resource type' })
  @ApiQuery({ name: 'limit', type: 'number', required: false, description: 'Maximum records to return' })
  @ApiResponse({
    status: 200,
    description: 'Audit trail retrieved successfully',
  })
  async getAuditTrail(
    @Query() filters: {
      startDate: string;
      endDate: string;
      eventType?: string;
      userId?: string;
      resourceType?: string;
      limit?: number;
    },
    @Request() req: any,
  ): Promise<{ events: any[]; total: number; summary: any }> {
    this.logger.log(`Audit trail request by user: ${req.user.userId}`);

    // Mock audit trail data - in real implementation, this would query the audit log
    const mockEvents = [
      {
        id: 'audit-001',
        timestamp: new Date('2024-01-15T10:30:00Z'),
        eventType: 'LOGIN_SUCCESS',
        userId: 'user-001',
        severity: 'LOW',
        description: 'User successfully logged in',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...',
        resourceType: 'authentication',
        metadata: { loginMethod: 'password' },
      },
      {
        id: 'audit-002',
        timestamp: new Date('2024-01-15T11:00:00Z'),
        eventType: 'DATA_ACCESSED',
        userId: 'user-001',
        severity: 'LOW',
        description: 'Student records accessed',
        ipAddress: '192.168.1.100',
        resourceType: 'student',
        resourceId: 'student-001',
        metadata: { accessReason: 'grade_review' },
      },
    ];

    const summary = {
      totalEvents: mockEvents.length,
      bySeverity: {
        LOW: mockEvents.filter(e => e.severity === 'LOW').length,
        MEDIUM: mockEvents.filter(e => e.severity === 'MEDIUM').length,
        HIGH: mockEvents.filter(e => e.severity === 'HIGH').length,
        CRITICAL: mockEvents.filter(e => e.severity === 'CRITICAL').length,
      },
      byEventType: mockEvents.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
      }, {}),
    };

    // Log audit trail access
    await this.securityService.logSecurityEvent(
      AuditEventType.AUDIT_REVIEW,
      req.user.userId,
      AuditSeverity.LOW,
      'Audit trail accessed',
      {
        auditTrailAccess: true,
        dateRange: `${filters.startDate} to ${filters.endDate}`,
        filters: Object.keys(filters),
      },
      req.ip,
      req.headers['user-agent'],
    );

    return {
      events: mockEvents,
      total: mockEvents.length,
      summary,
    };
  }
}