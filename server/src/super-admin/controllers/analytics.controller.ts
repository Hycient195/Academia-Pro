import { Controller, Get, Query, UseGuards, Logger, Inject } from '@nestjs/common';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { EUserRole } from '@academia-pro/types/users';
import { CrossSchoolReportingService } from '../cross-school-reporting.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../../schools/school.entity';

@Controller('super-admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(EUserRole.SUPER_ADMIN)
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(
    private readonly crossSchoolReportingService: CrossSchoolReportingService,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
  ) {}

  /**
   * GET /super-admin/analytics/dashboard
   * Get analytics dashboard data
   */
  @Get('dashboard')
  async getDashboardAnalytics(@Query('timeRange') timeRange?: string, @Query('schoolId') schoolId?: string) {
    this.logger.log('Getting analytics dashboard data');

    const schools = await this.schoolRepository.find();
    const analytics = await this.crossSchoolReportingService.generateCrossSchoolAnalytics();

    // Mock dashboard data - in real implementation, this would aggregate real data
    const dashboard = {
      summary: {
        totalSchools: schools.length,
        activeSchools: schools.filter(s => s.status === 'active').length,
        totalStudents: schools.reduce((sum, school) => sum + (school.currentStudents || 0), 0),
        totalStaff: schools.reduce((sum, school) => sum + (school.currentStaff || 0), 0),
        totalRevenue: schools.reduce((sum, school) => {
          const planMultiplier = school.subscriptionPlan === 'premium' ? 99 : school.subscriptionPlan === 'enterprise' ? 299 : 49;
          return sum + planMultiplier;
        }, 0),
      },
      charts: {
        schoolGrowth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [12, 19, 15, 25, 22, 30]
        },
        userGrowth: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [65, 89, 80, 81, 96, 105]
        },
        revenue: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          data: [1200, 1900, 1500, 2500, 2200, 3000]
        }
      },
      recentActivity: [
        { type: 'school_created', message: 'New school registered', timestamp: new Date() },
        { type: 'user_login', message: 'Super admin login', timestamp: new Date() },
        { type: 'subscription_updated', message: 'School subscription renewed', timestamp: new Date() }
      ]
    };

    return {
      success: true,
      data: dashboard,
    };
  }

  /**
   * GET /super-admin/analytics/metrics
   * Get analytics metrics
   */
  @Get('metrics')
  async getAnalyticsMetrics(@Query() filters: any) {
    this.logger.log('Getting analytics metrics');

    const schools = await this.schoolRepository.find();
    const analytics = await this.crossSchoolReportingService.generateCrossSchoolAnalytics();

    const metrics = {
      totalSchools: schools.length,
      activeSchools: schools.filter(s => s.status === 'active').length,
      totalStudents: schools.reduce((sum, school) => sum + (school.currentStudents || 0), 0),
      totalStaff: schools.reduce((sum, school) => sum + (school.currentStaff || 0), 0),
      averageStudentsPerSchool: Math.round(schools.reduce((sum, school) => sum + (school.currentStudents || 0), 0) / schools.length),
      averageStaffPerSchool: Math.round(schools.reduce((sum, school) => sum + (school.currentStaff || 0), 0) / schools.length),
      schoolGrowth: 12, // Mock growth percentage
      userGrowth: 8, // Mock growth percentage
      revenueGrowth: 15, // Mock growth percentage
    };

    return {
      success: true,
      data: metrics,
    };
  }

  /**
   * GET /super-admin/analytics/summary
   * Get analytics summary
   */
  @Get('summary')
  async getAnalyticsSummary(@Query('period') period?: string, @Query('schoolId') schoolId?: string) {
    this.logger.log('Getting analytics summary');

    const schools = await this.schoolRepository.find();

    const summary = {
      totalSchools: schools.length,
      activeSchools: schools.filter(s => s.status === 'active').length,
      inactiveSchools: schools.filter(s => s.status === 'inactive').length,
      totalStudents: schools.reduce((sum, school) => sum + (school.currentStudents || 0), 0),
      totalStaff: schools.reduce((sum, school) => sum + (school.currentStaff || 0), 0),
      schoolsByType: schools.reduce((acc, school) => {
        const typeKey = Array.isArray(school.type) ? school.type.join(', ') : (school.type as string) || 'Unknown';
        acc[typeKey] = (acc[typeKey] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      schoolsByRegion: schools.reduce((acc, school) => {
        acc[school.state || 'Unknown'] = (acc[school.state || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageStudentsPerSchool: Math.round(schools.reduce((sum, school) => sum + (school.currentStudents || 0), 0) / schools.length),
      averageStaffPerSchool: Math.round(schools.reduce((sum, school) => sum + (school.currentStaff || 0), 0) / schools.length),
      period: period || '30d',
    };

    return {
      success: true,
      data: summary,
    };
  }

  /**
   * GET /super-admin/analytics/charts/user-growth
   * Get user growth chart data
   */
  @Get('charts/user-growth')
  async getUserGrowthChart(@Query('timeRange') timeRange: string, @Query('schoolId') schoolId?: string) {
    this.logger.log('Getting user growth chart data');

    // Mock chart data - in real implementation, this would query historical data
    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'User Growth',
        data: [120, 150, 180, 200, 250, 280, 320, 350, 380, 420, 450, 480],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      }]
    };

    return {
      success: true,
      data: chartData,
    };
  }

  /**
   * GET /super-admin/analytics/charts/revenue
   * Get revenue chart data
   */
  @Get('charts/revenue')
  async getRevenueChart(@Query('timeRange') timeRange: string, @Query('schoolId') schoolId?: string) {
    this.logger.log('Getting revenue chart data');

    // Mock chart data
    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Revenue',
        data: [12000, 15000, 18000, 20000, 25000, 28000, 32000, 35000, 38000, 42000, 45000, 48000],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      }]
    };

    return {
      success: true,
      data: chartData,
    };
  }

  /**
   * GET /super-admin/analytics/charts/school-performance
   * Get school performance chart data
   */
  @Get('charts/school-performance')
  async getSchoolPerformanceChart(@Query('timeRange') timeRange: string) {
    this.logger.log('Getting school performance chart data');

    // Mock chart data
    const chartData = {
      labels: ['School A', 'School B', 'School C', 'School D', 'School E'],
      datasets: [{
        label: 'Performance Score',
        data: [85, 92, 78, 88, 95],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      }]
    };

    return {
      success: true,
      data: chartData,
    };
  }

  /**
   * GET /super-admin/analytics/realtime
   * Get real-time analytics metrics
   */
  @Get('realtime')
  async getRealtimeMetrics() {
    this.logger.log('Getting real-time analytics metrics');

    const realtimeMetrics = {
      activeUsers: Math.floor(Math.random() * 100) + 50,
      activeSessions: Math.floor(Math.random() * 200) + 100,
      requestsPerMinute: Math.floor(Math.random() * 500) + 200,
      errorRate: Math.random() * 2,
      responseTime: Math.floor(Math.random() * 100) + 20,
      timestamp: new Date().toISOString(),
    };

    return {
      success: true,
      data: realtimeMetrics,
    };
  }
}