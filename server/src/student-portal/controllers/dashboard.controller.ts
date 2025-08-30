import { Controller, Get, UseGuards, Request, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { StudentPortalGuard } from '../guards/student-portal.guard';
import { StudentAccessGuard } from '../guards/student-access.guard';
import { StudentPortalDashboardService } from '../services/dashboard.service';

@ApiTags('Student Portal - Dashboard')
@ApiBearerAuth()
@Controller('student-portal/dashboard')
@UseGuards(StudentPortalGuard, StudentAccessGuard)
export class StudentPortalDashboardController {
  constructor(
    private readonly dashboardService: StudentPortalDashboardService,
  ) {}

  @Get('overview')
  @ApiOperation({ summary: 'Get student dashboard overview' })
  @ApiResponse({ status: 200, description: 'Dashboard overview retrieved successfully' })
  async getDashboardOverview(@Request() req: any) {
    const { studentId, schoolId } = req;
    return this.dashboardService.getDashboardOverview(studentId, schoolId);
  }

  @Get('upcoming-events')
  @ApiOperation({ summary: 'Get upcoming events and deadlines' })
  @ApiResponse({ status: 200, description: 'Upcoming events retrieved successfully' })
  async getUpcomingEvents(
    @Request() req: any,
    @Query('limit') limit?: number,
  ) {
    const { studentId, schoolId } = req;
    return this.dashboardService.getUpcomingEvents(studentId, schoolId, limit);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent student activity' })
  @ApiResponse({ status: 200, description: 'Recent activity retrieved successfully' })
  async getRecentActivity(
    @Request() req: any,
    @Query('limit') limit?: number,
  ) {
    const { studentId } = req;
    return this.dashboardService.getRecentActivity(studentId, limit);
  }

  @Get('quick-stats')
  @ApiOperation({ summary: 'Get quick statistics for dashboard' })
  @ApiResponse({ status: 200, description: 'Quick stats retrieved successfully' })
  async getQuickStats(@Request() req: any) {
    const { studentId, schoolId } = req;
    return this.dashboardService.getQuickStats(studentId, schoolId);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get unread notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(
    @Request() req: any,
    @Query('limit') limit?: number,
  ) {
    const { studentId } = req;
    return this.dashboardService.getNotifications(studentId, limit);
  }

  @Get('academic-summary')
  @ApiOperation({ summary: 'Get academic performance summary' })
  @ApiResponse({ status: 200, description: 'Academic summary retrieved successfully' })
  async getAcademicSummary(@Request() req: any) {
    const { studentId, schoolId } = req;
    return this.dashboardService.getAcademicSummary(studentId, schoolId);
  }

  @Get('wellness-summary')
  @ApiOperation({ summary: 'Get wellness status summary' })
  @ApiResponse({ status: 200, description: 'Wellness summary retrieved successfully' })
  async getWellnessSummary(@Request() req: any) {
    const { studentId } = req;
    return this.dashboardService.getWellnessSummary(studentId);
  }
}