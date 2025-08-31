import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { SecurityService } from '../services/security.service';
import { PolicyService, PolicyEvaluationContext, PolicyEvaluationResult } from '../services/policy.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { SecurityPolicy, PolicyType, PolicyStatus } from '../entities/security-policy.entity';
import { AuditAction, AuditSeverity } from '../services/audit.service';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Security - Authorization & Policies')
@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class SecurityController {
  private readonly logger = new Logger(SecurityController.name);

  constructor(
    private readonly securityService: SecurityService,
    private readonly policyService: PolicyService,
  ) {}

  @Get('dashboard')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get security dashboard',
    description: 'Retrieve comprehensive security dashboard with metrics and alerts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Security dashboard data retrieved successfully',
  })
  async getSecurityDashboard(@Request() req: any): Promise<any> {
    this.logger.log(`Security dashboard request by user: ${req.user.userId}`);

    return this.securityService.getSecurityDashboard();
  }

  @Get('metrics')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get security metrics',
    description: 'Retrieve security metrics for specified time range.',
  })
  @ApiQuery({
    name: 'timeRange',
    enum: ['24h', '7d', '30d'],
    required: false,
    description: 'Time range for metrics',
  })
  @ApiResponse({
    status: 200,
    description: 'Security metrics retrieved successfully',
  })
  async getSecurityMetrics(
    @Query('timeRange') timeRange: '24h' | '7d' | '30d' = '7d',
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`Security metrics request by user: ${req.user.userId}, range: ${timeRange}`);

    return this.securityService.getSecurityMetrics(timeRange);
  }

  @Post('evaluate-policy')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Evaluate access policy',
    description: 'Evaluate access control policy for specific context.',
  })
  @ApiBody({
    description: 'Policy evaluation context',
    schema: {
      type: 'object',
      required: ['user', 'resource', 'action', 'environment'],
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
            schoolId: { type: 'string' },
            attributes: { type: 'object' },
          },
        },
        resource: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            id: { type: 'string' },
            ownerId: { type: 'string' },
            attributes: { type: 'object' },
          },
        },
        action: { type: 'string' },
        environment: {
          type: 'object',
          properties: {
            ipAddress: { type: 'string' },
            userAgent: { type: 'string' },
            timestamp: { type: 'string', format: 'date-time' },
            sessionId: { type: 'string' },
            attributes: { type: 'object' },
          },
        },
        request: {
          type: 'object',
          properties: {
            method: { type: 'string' },
            path: { type: 'string' },
            parameters: { type: 'object' },
            body: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Policy evaluation completed',
  })
  async evaluatePolicy(
    @Body() context: PolicyEvaluationContext,
    @Request() req: any,
  ): Promise<PolicyEvaluationResult> {
    this.logger.log(`Policy evaluation request by user: ${req.user.userId}`);

    return this.policyService.evaluateAccess(context);
  }

  @Get('policies')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get security policies',
    description: 'Retrieve list of security policies with optional filtering.',
  })
  @ApiQuery({ name: 'type', enum: PolicyType, required: false })
  @ApiQuery({ name: 'status', enum: PolicyStatus, required: false })
  @ApiQuery({ name: 'scope', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiResponse({
    status: 200,
    description: 'Security policies retrieved successfully',
  })
  async getPolicies(
    @Query() filters: {
      type?: PolicyType;
      status?: PolicyStatus;
      scope?: string;
      limit?: number;
      offset?: number;
    },
    @Request() req: any,
  ): Promise<{ policies: SecurityPolicy[]; total: number }> {
    this.logger.log(`Policies list request by user: ${req.user.userId}`);

    return this.policyService.getPolicies(filters);
  }

  @Post('policies')
  @Roles('super-admin', 'security-admin')
  @ApiOperation({
    summary: 'Create security policy',
    description: 'Create a new security policy.',
  })
  @ApiBody({
    description: 'Security policy data',
    schema: {
      type: 'object',
      required: ['name', 'type', 'rules', 'createdBy'],
      properties: {
        name: { type: 'string' },
        displayName: { type: 'string' },
        description: { type: 'string' },
        type: { type: 'string', enum: Object.values(PolicyType) },
        scope: { type: 'string', enum: ['global', 'school', 'user_group', 'department', 'individual'] },
        scopeId: { type: 'string' },
        enforcementLevel: { type: 'string', enum: ['permissive', 'strict', 'audit_only', 'disabled'] },
        priority: { type: 'number' },
        effectiveFrom: { type: 'string', format: 'date-time' },
        effectiveUntil: { type: 'string', format: 'date-time' },
        rules: { type: 'object' },
        createdBy: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Security policy created successfully',
  })
  async createPolicy(
    @Body() policyData: Partial<SecurityPolicy>,
    @Request() req: any,
  ): Promise<SecurityPolicy> {
    this.logger.log(`Policy creation request by user: ${req.user.userId}`);

    return this.policyService.createPolicy({
      ...policyData,
      createdBy: req.user.userId,
    });
  }

  @Put('policies/:id')
  @Roles('super-admin', 'security-admin')
  @ApiOperation({
    summary: 'Update security policy',
    description: 'Update an existing security policy.',
  })
  @ApiParam({ name: 'id', description: 'Policy ID' })
  @ApiBody({
    description: 'Policy update data',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        displayName: { type: 'string' },
        description: { type: 'string' },
        status: { type: 'string', enum: Object.values(PolicyStatus) },
        enforcementLevel: { type: 'string', enum: ['permissive', 'strict', 'audit_only', 'disabled'] },
        priority: { type: 'number' },
        effectiveFrom: { type: 'string', format: 'date-time' },
        effectiveUntil: { type: 'string', format: 'date-time' },
        rules: { type: 'object' },
        updatedBy: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Security policy updated successfully',
  })
  async updatePolicy(
    @Param('id') id: string,
    @Body() updates: Partial<SecurityPolicy>,
    @Request() req: any,
  ): Promise<SecurityPolicy> {
    this.logger.log(`Policy update request by user: ${req.user.userId}, policy: ${id}`);

    return this.policyService.updatePolicy(id, {
      ...updates,
      updatedBy: req.user.userId,
    });
  }

  @Delete('policies/:id')
  @Roles('super-admin', 'security-admin')
  @ApiOperation({
    summary: 'Delete security policy',
    description: 'Delete a security policy.',
  })
  @ApiParam({ name: 'id', description: 'Policy ID' })
  @ApiResponse({
    status: 200,
    description: 'Security policy deleted successfully',
  })
  async deletePolicy(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<void> {
    this.logger.log(`Policy deletion request by user: ${req.user.userId}, policy: ${id}`);

    await this.policyService.deletePolicy(id, req.user.userId);
  }

  @Get('policies/templates')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get policy templates',
    description: 'Retrieve available security policy templates.',
  })
  @ApiResponse({
    status: 200,
    description: 'Policy templates retrieved successfully',
  })
  async getPolicyTemplates(@Request() req: any): Promise<any> {
    this.logger.log(`Policy templates request by user: ${req.user.userId}`);

    return this.policyService.getPolicyTemplates();
  }

  @Post('policies/validate')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Validate policy syntax',
    description: 'Validate security policy syntax and structure.',
  })
  @ApiBody({
    description: 'Policy to validate',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string' },
        rules: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Policy validation completed',
  })
  async validatePolicy(
    @Body() policy: Partial<SecurityPolicy>,
    @Request() req: any,
  ): Promise<{ valid: boolean; errors: string[] }> {
    this.logger.log(`Policy validation request by user: ${req.user.userId}`);

    return this.policyService.validatePolicySyntax(policy);
  }

  @Get('events')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get security events',
    description: 'Retrieve security events with optional filtering.',
  })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'eventType', required: false })
  @ApiQuery({ name: 'severity', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'limit', type: 'number', required: false })
  @ApiQuery({ name: 'offset', type: 'number', required: false })
  @ApiResponse({
    status: 200,
    description: 'Security events retrieved successfully',
  })
  async getSecurityEvents(
    @Query() filters: {
      userId?: string;
      eventType?: string;
      severity?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
    },
    @Request() req: any,
  ): Promise<{ events: any[]; total: number }> {
    this.logger.log(`Security events request by user: ${req.user.userId}`);

    return this.securityService.getSecurityEvents({
      ...filters,
      action: filters.eventType as AuditAction,
      severity: filters.severity as AuditSeverity,
      startDate: filters.startDate ? new Date(filters.startDate) : undefined,
      endDate: filters.endDate ? new Date(filters.endDate) : undefined,
    });
  }

  @Get('compliance/status')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get compliance status',
    description: 'Retrieve current compliance status and metrics.',
  })
  @ApiResponse({
    status: 200,
    description: 'Compliance status retrieved successfully',
  })
  async getComplianceStatus(@Request() req: any): Promise<any> {
    this.logger.log(`Compliance status request by user: ${req.user.userId}`);

    return this.securityService.getComplianceStatus();
  }

  @Post('incidents')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Create security incident',
    description: 'Create and log a security incident.',
  })
  @ApiBody({
    description: 'Incident data',
    schema: {
      type: 'object',
      required: ['title', 'description', 'severity', 'reportedBy'],
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        severity: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
        reportedBy: { type: 'string' },
        affectedUsers: { type: 'array', items: { type: 'string' } },
        metadata: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Security incident created successfully',
  })
  async createSecurityIncident(
    @Body() incidentData: {
      title: string;
      description: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      reportedBy: string;
      affectedUsers?: string[];
      metadata?: any;
    },
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`Security incident creation by user: ${req.user.userId}`);

    const severityMap = {
      'low': AuditSeverity.LOW,
      'medium': AuditSeverity.MEDIUM,
      'high': AuditSeverity.HIGH,
      'critical': AuditSeverity.CRITICAL,
    };

    return this.securityService.createSecurityIncident(
      incidentData.title,
      incidentData.description,
      severityMap[incidentData.severity] || AuditSeverity.MEDIUM,
      incidentData.reportedBy,
      incidentData.affectedUsers,
      incidentData.metadata,
    );
  }

  @Get('permissions/check')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Check user permissions',
    description: 'Check if user has specific permissions for resource.',
  })
  @ApiQuery({ name: 'userId', required: true })
  @ApiQuery({ name: 'permissions', required: true, isArray: true })
  @ApiQuery({ name: 'resourceType', required: false })
  @ApiQuery({ name: 'resourceId', required: false })
  @ApiResponse({
    status: 200,
    description: 'Permission check completed',
  })
  async checkPermissions(
    @Query() query: {
      userId: string;
      permissions: string[];
      resourceType?: string;
      resourceId?: string;
    },
    @Request() req: any,
  ): Promise<{ hasPermissions: boolean; missingPermissions: string[] }> {
    this.logger.log(`Permission check request by user: ${req.user.userId} for user: ${query.userId}`);

    // Mock permission check - in real implementation, this would validate against database
    const mockUserPermissions = {
      'user-001': ['users:*', 'schools:*', 'reports:*'],
      'user-002': ['academic:*', 'students:read', 'reports:read'],
      'user-003': ['profile:read', 'profile:write'],
    };

    const userPermissions = mockUserPermissions[query.userId] || [];
    const missingPermissions = query.permissions.filter(permission => {
      // Check exact match
      if (userPermissions.includes(permission)) return false;

      // Check wildcard match
      const [resource, action] = permission.split(':');
      return !userPermissions.includes(`${resource}:*`);
    });

    return {
      hasPermissions: missingPermissions.length === 0,
      missingPermissions,
    };
  }

  @Get('roles/hierarchy')
  @Roles('super-admin', 'school-admin', 'security-admin')
  @ApiOperation({
    summary: 'Get role hierarchy',
    description: 'Retrieve the role hierarchy and inheritance structure.',
  })
  @ApiResponse({
    status: 200,
    description: 'Role hierarchy retrieved successfully',
  })
  async getRoleHierarchy(@Request() req: any): Promise<any> {
    this.logger.log(`Role hierarchy request by user: ${req.user.userId}`);

    return {
      hierarchy: {
        'super-admin': ['admin', 'school-admin', 'teacher', 'student', 'parent'],
        'admin': ['school-admin', 'teacher', 'student', 'parent'],
        'school-admin': ['teacher', 'student', 'parent'],
        'teacher': ['student'],
      },
      permissions: {
        'super-admin': ['*'],
        'admin': ['users:*', 'schools:*', 'reports:*', 'academic:*'],
        'school-admin': ['users:read', 'schools:read', 'reports:*', 'academic:*', 'students:*'],
        'teacher': ['academic:*', 'students:read', 'reports:read', 'attendance:*'],
        'student': ['academic:read', 'reports:read', 'profile:*'],
        'parent': ['children:*', 'academic:read', 'reports:read', 'communication:*'],
      },
    };
  }
}