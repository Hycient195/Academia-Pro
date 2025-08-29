import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StudentPortalDashboardService } from '../services/dashboard.service';

@ApiTags('Student Portal - Dashboard')
@Controller('student-portal/dashboard')
// @UseGuards(StudentPortalGuard, AgeAppropriateGuard) // Guards will be implemented later
export class StudentPortalDashboardController {
  private readonly logger = new Logger(StudentPortalDashboardController.name);

  constructor(
    private readonly dashboardService: StudentPortalDashboardService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get complete student dashboard',
    description: 'Returns a comprehensive dashboard overview for the authenticated student including profile, activities, stats, and alerts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid authentication',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient access level or parental controls',
  })
  async getDashboard(@Param('studentId') studentId: string) {
    this.logger.log(`Getting dashboard for student ${studentId}`);
    return this.dashboardService.getDashboard(studentId);
  }

  @Get('overview')
  @ApiOperation({
    summary: 'Get dashboard overview',
    description: 'Returns the main dashboard overview with welcome message, schedule, tasks, and achievements.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard overview retrieved successfully',
  })
  async getDashboardOverview(@Param('studentId') studentId: string) {
    this.logger.log(`Getting dashboard overview for student ${studentId}`);
    return this.dashboardService.getDashboardOverview(studentId);
  }

  @Get('quick-stats')
  @ApiOperation({
    summary: 'Get quick statistics',
    description: 'Returns key performance indicators and statistics for the student dashboard.',
  })
  @ApiResponse({
    status: 200,
    description: 'Quick stats retrieved successfully',
  })
  async getQuickStats(@Param('studentId') studentId: string) {
    this.logger.log(`Getting quick stats for student ${studentId}`);
    return this.dashboardService.getQuickStatsPublic(studentId);
  }

  @Get('recent-activity')
  @ApiOperation({
    summary: 'Get recent activity',
    description: 'Returns recent activities and achievements for the student.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of activities to return (default: 20, max: 50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
  })
  async getRecentActivity(
    @Param('studentId') studentId: string,
    @Query('limit') limit?: number,
  ) {
    this.logger.log(`Getting recent activity for student ${studentId}, limit: ${limit}`);
    return this.dashboardService.getRecentActivityPublic(studentId, limit);
  }

  @Get('upcoming-events')
  @ApiOperation({
    summary: 'Get upcoming events',
    description: 'Returns upcoming events, deadlines, and appointments for the student.',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to look ahead (default: 30, max: 90)',
  })
  @ApiResponse({
    status: 200,
    description: 'Upcoming events retrieved successfully',
  })
  async getUpcomingEvents(
    @Param('studentId') studentId: string,
    @Query('days') days?: number,
  ) {
    this.logger.log(`Getting upcoming events for student ${studentId}, days: ${days}`);
    return this.dashboardService.getUpcomingEventsPublic(studentId, days);
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'Get alerts and notifications',
    description: 'Returns active alerts, notifications, and reminders for the student.',
  })
  @ApiResponse({
    status: 200,
    description: 'Alerts retrieved successfully',
  })
  async getAlerts(@Param('studentId') studentId: string) {
    this.logger.log(`Getting alerts for student ${studentId}`);
    return this.dashboardService.getAlerts(studentId);
  }

  @Get('children')
  @ApiOperation({
    summary: 'Get children overview',
    description: 'Returns overview information for the student (used for parental access).',
  })
  @ApiResponse({
    status: 200,
    description: 'Children overview retrieved successfully',
  })
  async getChildrenOverview(@Param('studentId') studentId: string) {
    this.logger.log(`Getting children overview for student ${studentId}`);
    return this.dashboardService.getChildrenOverview(studentId);
  }
}