// Academia Pro - Super Admin Controller
// Handles multi-school administration, school management, and cross-school operations

import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { SchoolContextService, SchoolContext } from './school-context.service';
import { CrossSchoolReportingService } from './cross-school-reporting.service';
import { School } from './school.entity';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/user.entity';
import { SchoolContextGuard } from 'src/common/guards/school-context.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@ApiTags('Super Admin - Multi-School Management')
@Controller('super-admin')
@UseGuards(SchoolContextGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
export class SuperAdminController {
  private readonly logger = new Logger(SuperAdminController.name);

  constructor(
    private readonly schoolContextService: SchoolContextService,
    private readonly crossSchoolReportingService: CrossSchoolReportingService,
  ) {}

  // ==================== SCHOOL MANAGEMENT ====================

  @Get('schools')
  @ApiOperation({
    summary: 'Get all schools',
    description: 'Returns a list of all schools in the system with their statistics.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'inactive', 'suspended', 'under_maintenance', 'closed'],
    description: 'Filter by school status',
  })
  @ApiQuery({
    name: 'subscription',
    required: false,
    enum: ['active', 'expired', 'expiring_soon'],
    description: 'Filter by subscription status',
  })
  @ApiResponse({
    status: 200,
    description: 'Schools retrieved successfully',
  })
  async getAllSchools(
    @Query('status') status?: string,
    @Query('subscription') subscription?: string,
  ): Promise<any[]> {
    this.logger.log('Getting all schools');

    const schools = await this.schoolContextService.getAllSchools();

    // Apply filters
    let filteredSchools = schools;

    if (status) {
      filteredSchools = filteredSchools.filter(school => school.status === status);
    }

    if (subscription) {
      filteredSchools = filteredSchools.filter(school => {
        if (subscription === 'active') return school.isSubscriptionActive;
        if (subscription === 'expired') return !school.isSubscriptionActive;
        if (subscription === 'expiring_soon') return school.daysUntilSubscriptionExpiry <= 30;
        return true;
      });
    }

    // Get statistics for each school
    const schoolsWithStats = await Promise.all(
      filteredSchools.map(async (school) => {
        const stats = await this.schoolContextService.getSchoolStatistics(school.id);
        return {
          ...school,
          statistics: stats,
        };
      })
    );

    return schoolsWithStats;
  }

  @Post('schools')
  @ApiOperation({
    summary: 'Create new school',
    description: 'Creates a new school in the multi-school system.',
  })
  @ApiBody({
    description: 'School creation data',
    schema: {
      type: 'object',
      required: ['name', 'type', 'address', 'city', 'country'],
      properties: {
        name: { type: 'string', description: 'School name' },
        type: {
          type: 'string',
          enum: ['preschool', 'elementary', 'middle_school', 'high_school', 'senior_secondary', 'university', 'college', 'institute', 'training_center'],
          description: 'School type'
        },
        address: { type: 'string', description: 'School address' },
        city: { type: 'string', description: 'City' },
        state: { type: 'string', description: 'State/Province' },
        zipCode: { type: 'string', description: 'ZIP/Postal code' },
        country: { type: 'string', description: 'Country' },
        phone: { type: 'string', description: 'Contact phone' },
        email: { type: 'string', description: 'Contact email' },
        website: { type: 'string', description: 'School website' },
        principalName: { type: 'string', description: 'Principal name' },
        principalPhone: { type: 'string', description: 'Principal phone' },
        principalEmail: { type: 'string', description: 'Principal email' },
        maxStudents: { type: 'number', description: 'Maximum student capacity' },
        maxStaff: { type: 'number', description: 'Maximum staff capacity' },
        subscriptionPlan: {
          type: 'string',
          enum: ['basic', 'standard', 'premium', 'enterprise'],
          description: 'Subscription plan'
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'School created successfully',
  })
  async createSchool(
    @Body() schoolData: Partial<School>,
    // Note: createdBy will be extracted from JWT token in service
  ): Promise<School> {
    this.logger.log(`Creating new school: ${schoolData.name}`);

    // In a real implementation, you'd extract the user ID from the JWT token
    const createdBy = 'system'; // This should come from JWT

    return this.schoolContextService.createSchoolContext(schoolData, createdBy);
  }

  @Get('schools/:schoolId')
  @ApiOperation({
    summary: 'Get school details',
    description: 'Returns detailed information about a specific school including statistics.',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'Unique identifier of the school',
  })
  @ApiResponse({
    status: 200,
    description: 'School details retrieved successfully',
  })
  async getSchoolDetails(@Param('schoolId') schoolId: string): Promise<any> {
    this.logger.log(`Getting details for school: ${schoolId}`);

    const school = await this.schoolContextService.getAllSchools()
      .then(schools => schools.find(s => s.id === schoolId));

    if (!school) {
      throw new Error('School not found');
    }

    const statistics = await this.schoolContextService.getSchoolStatistics(schoolId);

    return {
      ...school,
      statistics,
    };
  }

  @Put('schools/:schoolId')
  @ApiOperation({
    summary: 'Update school',
    description: 'Updates school information and settings.',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'Unique identifier of the school',
  })
  @ApiBody({
    description: 'School update data',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'School name' },
        status: {
          type: 'string',
          enum: ['active', 'inactive', 'suspended', 'under_maintenance', 'closed'],
          description: 'School status'
        },
        address: { type: 'string', description: 'School address' },
        phone: { type: 'string', description: 'Contact phone' },
        email: { type: 'string', description: 'Contact email' },
        maxStudents: { type: 'number', description: 'Maximum student capacity' },
        maxStaff: { type: 'number', description: 'Maximum staff capacity' },
        settings: { type: 'object', description: 'School settings and configuration' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'School updated successfully',
  })
  async updateSchool(
    @Param('schoolId') schoolId: string,
    @Body() updates: Partial<School>,
  ): Promise<School> {
    this.logger.log(`Updating school: ${schoolId}`);

    // In a real implementation, you'd extract the user ID from the JWT token
    const updatedBy = 'system'; // This should come from JWT

    return this.schoolContextService.updateSchoolContext(schoolId, updates, updatedBy);
  }

  @Delete('schools/:schoolId')
  @ApiOperation({
    summary: 'Deactivate school',
    description: 'Deactivates a school (soft delete - sets status to inactive).',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'Unique identifier of the school',
  })
  @ApiResponse({
    status: 200,
    description: 'School deactivated successfully',
  })
  async deactivateSchool(@Param('schoolId') schoolId: string): Promise<void> {
    this.logger.log(`Deactivating school: ${schoolId}`);

    await this.schoolContextService.updateSchoolContext(
      schoolId,
      { status: 'inactive' as any },
      'system' // This should come from JWT
    );
  }

  // ==================== CROSS-SCHOOL REPORTING ====================

  @Get('reports/overview')
  @ApiOperation({
    summary: 'Get system overview',
    description: 'Returns a comprehensive overview of all schools in the system.',
  })
  @ApiResponse({
    status: 200,
    description: 'System overview retrieved successfully',
  })
  async getSystemOverview(): Promise<any> {
    this.logger.log('Getting system overview');

    // Use the comprehensive cross-school analytics service
    const analytics = await this.crossSchoolReportingService.generateCrossSchoolAnalytics();

    return {
      summary: {
        totalSchools: analytics.totalSchools,
        activeSchools: analytics.activeSchools,
        inactiveSchools: analytics.totalSchools - analytics.activeSchools,
        totalStudents: analytics.totalStudents,
        totalStaff: analytics.totalStaff,
        totalCapacity: analytics.totalSchools * 1000, // Approximate based on school count
        occupancyRate: analytics.averageOccupancyRate,
      },
      subscriptionMetrics: analytics.subscriptionMetrics,
      distributions: {
        schoolTypes: analytics.schoolTypeDistribution,
        geographic: analytics.geographicDistribution,
      },
      performance: {
        averageUsersPerSchool: analytics.performanceMetrics.averageUsersPerSchool,
        averageStudentsPerSchool: analytics.performanceMetrics.averageStudentsPerSchool,
        topPerformingSchools: analytics.performanceMetrics.topPerformingSchools.slice(0, 5),
      },
      generatedAt: new Date(),
    };
  }

  @Get('reports/subscription')
  @ApiOperation({
    summary: 'Get subscription analytics',
    description: 'Returns subscription and billing analytics across all schools.',
  })
  @ApiResponse({
    status: 200,
    description: 'Subscription analytics retrieved successfully',
  })
  async getSubscriptionAnalytics(): Promise<any> {
    this.logger.log('Getting subscription analytics');

    // Use the comprehensive subscription reporting service
    const subscriptionReport = await this.crossSchoolReportingService.generateSubscriptionReport();

    return {
      subscriptionStatus: {
        active: subscriptionReport.summary.activeSubscriptions,
        expired: subscriptionReport.summary.expiredSubscriptions,
        expiringSoon: subscriptionReport.summary.expiringSoon,
        total: subscriptionReport.summary.totalSchools,
      },
      planDistribution: subscriptionReport.revenueByPlan,
      revenue: {
        monthly: subscriptionReport.summary.totalMonthlyRevenue,
        annual: subscriptionReport.summary.totalAnnualRevenue,
      },
      atRiskSchools: subscriptionReport.expiringSchools,
      expiredSchools: subscriptionReport.expiredSchools,
      generatedAt: new Date(),
    };
  }

  // ==================== CROSS-SCHOOL COMPARISON ====================

  @Get('comparison')
  @ApiOperation({
    summary: 'Get school comparison report',
    description: 'Returns a detailed comparison of schools based on performance metrics.',
  })
  @ApiQuery({
    name: 'schoolIds',
    required: false,
    description: 'Comma-separated list of school IDs to compare (optional - compares all if not provided)',
  })
  @ApiResponse({
    status: 200,
    description: 'School comparison report retrieved successfully',
  })
  async getSchoolComparison(@Query('schoolIds') schoolIds?: string): Promise<any> {
    this.logger.log('Getting school comparison report');

    const ids = schoolIds ? schoolIds.split(',').map(id => id.trim()) : undefined;
    const comparisonReport = await this.crossSchoolReportingService.generateSchoolComparisonReport(ids);

    return {
      schools: comparisonReport,
      summary: {
        totalSchools: comparisonReport.length,
        averagePerformanceScore: comparisonReport.reduce((sum, school) => sum + school.metrics.performanceScore, 0) / comparisonReport.length,
        topPerformer: comparisonReport[0],
        needsAttention: comparisonReport.filter(school => school.metrics.performanceScore < 50),
      },
      generatedAt: new Date(),
    };
  }

  // ==================== GEOGRAPHIC REPORTING ====================

  @Get('geographic')
  @ApiOperation({
    summary: 'Get geographic distribution report',
    description: 'Returns geographic distribution and regional analytics of schools.',
  })
  @ApiResponse({
    status: 200,
    description: 'Geographic report retrieved successfully',
  })
  async getGeographicReport(): Promise<any> {
    this.logger.log('Getting geographic report');

    const geographicReport = await this.crossSchoolReportingService.generateGeographicReport();

    return {
      distributions: {
        countries: geographicReport.countryDistribution,
        cities: geographicReport.cityDistribution,
      },
      topLocations: {
        countries: geographicReport.topCountries,
        cities: geographicReport.topCities,
      },
      regionalBreakdown: geographicReport.schoolsByRegion,
      generatedAt: new Date(),
    };
  }

  // ==================== SYSTEM HEALTH ====================

  @Get('health')
  @ApiOperation({
    summary: 'Get system health',
    description: 'Returns the overall health status of the multi-school system.',
  })
  @ApiResponse({
    status: 200,
    description: 'System health retrieved successfully',
  })
  async getSystemHealth(): Promise<any> {
    this.logger.log('Getting system health');

    const schools = await this.schoolContextService.getAllSchools();
    const analytics = await this.crossSchoolReportingService.generateCrossSchoolAnalytics();

    const healthySchools = schools.filter(s =>
      s.status === 'active' &&
      s.isSubscriptionActive &&
      s.occupancyRate <= 100
    ).length;

    const issues = [];

    // Check for schools near capacity
    const nearCapacity = schools.filter(s => s.occupancyRate > 90);
    if (nearCapacity.length > 0) {
      issues.push({
        type: 'capacity_warning',
        severity: 'medium',
        message: `${nearCapacity.length} schools are near capacity`,
        affectedSchools: nearCapacity.map(s => ({ id: s.id, name: s.name, occupancyRate: s.occupancyRate })),
      });
    }

    // Check for expired subscriptions
    const expiredSubscriptions = schools.filter(s => !s.isSubscriptionActive);
    if (expiredSubscriptions.length > 0) {
      issues.push({
        type: 'subscription_expired',
        severity: 'high',
        message: `${expiredSubscriptions.length} schools have expired subscriptions`,
        affectedSchools: expiredSubscriptions.map(s => ({ id: s.id, name: s.name })),
      });
    }

    // Check for schools expiring soon
    const expiringSoon = schools.filter(s => s.daysUntilSubscriptionExpiry <= 7 && s.daysUntilSubscriptionExpiry > 0);
    if (expiringSoon.length > 0) {
      issues.push({
        type: 'subscription_expiring',
        severity: 'medium',
        message: `${expiringSoon.length} schools have subscriptions expiring within 7 days`,
        affectedSchools: expiringSoon.map(s => ({ id: s.id, name: s.name, daysUntilExpiry: s.daysUntilSubscriptionExpiry })),
      });
    }

    // Check for low performance schools
    const lowPerformanceSchools = schools.filter(s => {
      const schoolAnalytics = analytics.performanceMetrics.topPerformingSchools.find(p => p.schoolId === s.id);
      return schoolAnalytics && schoolAnalytics.occupancyRate < 30;
    });
    if (lowPerformanceSchools.length > 0) {
      issues.push({
        type: 'performance_warning',
        severity: 'low',
        message: `${lowPerformanceSchools.length} schools have low occupancy rates`,
        affectedSchools: lowPerformanceSchools.map(s => ({ id: s.id, name: s.name, occupancyRate: s.occupancyRate })),
      });
    }

    return {
      overallHealth: issues.length === 0 ? 'healthy' : issues.some(i => i.severity === 'high') ? 'critical' : 'warning',
      summary: {
        totalSchools: schools.length,
        healthySchools,
        schoolsWithIssues: schools.length - healthySchools,
        systemUtilization: analytics.averageOccupancyRate,
      },
      performance: {
        averageOccupancyRate: analytics.averageOccupancyRate,
        totalActiveUsers: analytics.totalUsers,
        totalActiveStudents: analytics.totalStudents,
      },
      issues,
      recommendations: this.generateHealthRecommendations(issues),
      timestamp: new Date().toISOString(),
    };
  }

  // ==================== PRIVATE METHODS ====================

  private generateHealthRecommendations(issues: any[]): string[] {
    const recommendations = [];

    const hasCapacityIssues = issues.some(issue => issue.type === 'capacity_warning');
    const hasSubscriptionIssues = issues.some(issue => issue.type.includes('subscription'));
    const hasPerformanceIssues = issues.some(issue => issue.type === 'performance_warning');

    if (hasCapacityIssues) {
      recommendations.push('Consider expanding capacity for high-occupancy schools');
      recommendations.push('Review enrollment policies for capacity management');
    }

    if (hasSubscriptionIssues) {
      recommendations.push('Contact schools with expired subscriptions to renew');
      recommendations.push('Implement proactive renewal reminders for expiring subscriptions');
    }

    if (hasPerformanceIssues) {
      recommendations.push('Analyze low-occupancy schools for operational improvements');
      recommendations.push('Consider marketing strategies to increase enrollment');
    }

    if (recommendations.length === 0) {
      recommendations.push('System is operating optimally - continue monitoring');
    }

    return recommendations;
  }
}