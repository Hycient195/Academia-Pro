import { Controller, Get, Param, Post, Body, UseGuards, Request, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { ParentPortalDashboardService, DashboardSummary, ChildDashboard } from '../services/dashboard.service';
import { ParentPortalGuard } from '../guards/parent-portal.guard';
import { ChildAccessGuard } from '../guards/child-access.guard';
import { PortalActivityLog, PortalActivityType } from '../entities/portal-activity-log.entity';

@ApiTags('Parent Portal - Dashboard')
@Controller('parent-portal/dashboard')
@UseGuards(ParentPortalGuard)
@ApiBearerAuth()
export class ParentPortalDashboardController {
  private readonly logger = new Logger(ParentPortalDashboardController.name);

  constructor(
    private readonly dashboardService: ParentPortalDashboardService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get parent dashboard summary',
    description: 'Retrieve comprehensive dashboard summary for authenticated parent including children info, quick stats, recent activity, and alerts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        parentInfo: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            accessLevel: { type: 'string' },
            lastLogin: { type: 'string', format: 'date-time' },
            accountStatus: { type: 'string' },
          },
        },
        children: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              studentId: { type: 'string' },
              relationship: { type: 'string' },
              authorizationLevel: { type: 'string' },
              isActive: { type: 'boolean' },
            },
          },
        },
        quickStats: {
          type: 'object',
          properties: {
            unreadMessages: { type: 'number' },
            upcomingAppointments: { type: 'number' },
            overduePayments: { type: 'number' },
            recentActivities: { type: 'number' },
          },
        },
        recentActivity: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              description: { type: 'string' },
              timestamp: { type: 'string', format: 'date-time' },
              studentId: { type: 'string' },
            },
          },
        },
        upcomingEvents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              title: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
              studentId: { type: 'string' },
            },
          },
        },
        alerts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string', enum: ['warning', 'info', 'urgent'] },
              title: { type: 'string' },
              message: { type: 'string' },
              actionRequired: { type: 'boolean' },
              studentId: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getDashboardSummary(@Request() req: any): Promise<DashboardSummary> {
    this.logger.log(`Getting dashboard summary for parent: ${req.user.userId}`);

    const summary = await this.dashboardService.getDashboardSummary(req.user.parentPortalAccessId);

    // Log dashboard access
    this.logger.log(`Dashboard summary retrieved for parent: ${req.user.userId}`);

    return summary;
  }

  @Get('child/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get child-specific dashboard',
    description: 'Retrieve detailed dashboard information for a specific child including academic overview, recent activity, and alerts.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get dashboard for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Child dashboard retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        academicOverview: {
          type: 'object',
          properties: {
            currentGrade: { type: 'string' },
            attendanceRate: { type: 'number' },
            recentGrades: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  subject: { type: 'string' },
                  grade: { type: 'string' },
                  date: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        recentActivity: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              description: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
            },
          },
        },
        upcomingEvents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              title: { type: 'string' },
              date: { type: 'string', format: 'date-time' },
            },
          },
        },
        alerts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              message: { type: 'string' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            },
          },
        },
      },
    },
  })
  async getChildDashboard(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ): Promise<ChildDashboard> {
    this.logger.log(`Getting child dashboard for student: ${studentId}, parent: ${req.user.userId}`);

    const dashboard = await this.dashboardService.getChildDashboard(req.user.parentPortalAccessId, studentId);

    // Log child dashboard access
    this.logger.log(`Child dashboard retrieved for student: ${studentId}, parent: ${req.user.userId}`);

    return dashboard;
  }

  @Get('notifications')
  @ApiOperation({
    summary: 'Get parent notifications',
    description: 'Retrieve notifications for the authenticated parent with optional filtering.',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        notifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              type: { type: 'string' },
              category: { type: 'string' },
              subject: { type: 'string' },
              message: { type: 'string' },
              isRead: { type: 'boolean' },
              timestamp: { type: 'string', format: 'date-time' },
              priority: { type: 'string' },
              senderName: { type: 'string' },
              hasAttachments: { type: 'boolean' },
            },
          },
        },
        total: { type: 'number' },
        unreadCount: { type: 'number' },
      },
    },
  })
  async getNotifications(
    @Request() req: any,
  ): Promise<{
    notifications: any[];
    total: number;
    unreadCount: number;
  }> {
    this.logger.log(`Getting notifications for parent: ${req.user.userId}`);

    const result = await this.dashboardService.getNotifications(req.user.parentPortalAccessId);

    // Log notifications access
    this.logger.log(`Notifications retrieved for parent: ${req.user.userId}, total: ${result.total}, unread: ${result.unreadCount}`);

    return result;
  }

  @Post('notifications/:notificationId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read for the authenticated parent.',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'Notification ID to mark as read',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read successfully',
  })
  async markNotificationAsRead(
    @Param('notificationId') notificationId: string,
    @Request() req: any,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Marking notification as read: ${notificationId}, parent: ${req.user.userId}`);

    await this.dashboardService.markNotificationAsRead(req.user.parentPortalAccessId, notificationId);

    this.logger.log(`Notification marked as read: ${notificationId}, parent: ${req.user.userId}`);

    return {
      success: true,
      message: 'Notification marked as read successfully',
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Retrieve quick statistics for the parent dashboard.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        unreadMessages: { type: 'number' },
        upcomingAppointments: { type: 'number' },
        overduePayments: { type: 'number' },
        recentActivities: { type: 'number' },
        childrenCount: { type: 'number' },
        activeAlerts: { type: 'number' },
      },
    },
  })
  async getDashboardStats(@Request() req: any): Promise<{
    unreadMessages: number;
    upcomingAppointments: number;
    overduePayments: number;
    recentActivities: number;
    childrenCount: number;
    activeAlerts: number;
  }> {
    this.logger.log(`Getting dashboard stats for parent: ${req.user.userId}`);

    // Get quick stats from dashboard service
    const quickStats = await this.dashboardService.getDashboardSummary(req.user.parentPortalAccessId);

    const stats = {
      ...quickStats.quickStats,
      childrenCount: quickStats.children.length,
      activeAlerts: quickStats.alerts.length,
    };

    this.logger.log(`Dashboard stats retrieved for parent: ${req.user.userId}`, stats);

    return stats;
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Get recent activity',
    description: 'Retrieve recent activity for the authenticated parent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent activity retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          description: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          studentId: { type: 'string' },
        },
      },
    },
  })
  async getRecentActivity(@Request() req: any): Promise<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
    studentId?: string;
  }>> {
    this.logger.log(`Getting recent activity for parent: ${req.user.userId}`);

    const summary = await this.dashboardService.getDashboardSummary(req.user.parentPortalAccessId);

    this.logger.log(`Recent activity retrieved for parent: ${req.user.userId}, count: ${summary.recentActivity.length}`);

    return summary.recentActivity;
  }

  @Get('alerts')
  @ApiOperation({
    summary: 'Get active alerts',
    description: 'Retrieve active alerts for the authenticated parent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Active alerts retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string', enum: ['warning', 'info', 'urgent'] },
          title: { type: 'string' },
          message: { type: 'string' },
          actionRequired: { type: 'boolean' },
          studentId: { type: 'string' },
        },
      },
    },
  })
  async getAlerts(@Request() req: any): Promise<Array<{
    id: string;
    type: 'warning' | 'info' | 'urgent';
    title: string;
    message: string;
    actionRequired: boolean;
    studentId?: string;
  }>> {
    this.logger.log(`Getting alerts for parent: ${req.user.userId}`);

    const summary = await this.dashboardService.getDashboardSummary(req.user.parentPortalAccessId);

    this.logger.log(`Alerts retrieved for parent: ${req.user.userId}, count: ${summary.alerts.length}`);

    return summary.alerts;
  }

  @Get('upcoming-events')
  @ApiOperation({
    summary: 'Get upcoming events',
    description: 'Retrieve upcoming events and appointments for the authenticated parent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Upcoming events retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          type: { type: 'string' },
          title: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          studentId: { type: 'string' },
        },
      },
    },
  })
  async getUpcomingEvents(@Request() req: any): Promise<Array<{
    id: string;
    type: string;
    title: string;
    date: Date;
    studentId?: string;
  }>> {
    this.logger.log(`Getting upcoming events for parent: ${req.user.userId}`);

    const summary = await this.dashboardService.getDashboardSummary(req.user.parentPortalAccessId);

    this.logger.log(`Upcoming events retrieved for parent: ${req.user.userId}, count: ${summary.upcomingEvents.length}`);

    return summary.upcomingEvents;
  }

  @Get('children')
  @ApiOperation({
    summary: 'Get children information',
    description: 'Retrieve information about children associated with the authenticated parent.',
  })
  @ApiResponse({
    status: 200,
    description: 'Children information retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          studentId: { type: 'string' },
          relationship: { type: 'string' },
          authorizationLevel: { type: 'string' },
          isActive: { type: 'boolean' },
        },
      },
    },
  })
  async getChildren(@Request() req: any): Promise<Array<{
    studentId: string;
    relationship: string;
    authorizationLevel: string;
    isActive: boolean;
  }>> {
    this.logger.log(`Getting children information for parent: ${req.user.userId}`);

    const summary = await this.dashboardService.getDashboardSummary(req.user.parentPortalAccessId);

    this.logger.log(`Children information retrieved for parent: ${req.user.userId}, count: ${summary.children.length}`);

    return summary.children;
  }
}