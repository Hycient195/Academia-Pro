import { Controller, Get, Param, Query, UseGuards, Request, Logger, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ParentPortalTransportationService } from '../services/transportation.service';
import { ParentPortalGuard } from '../guards/parent-portal.guard';
import { ChildAccessGuard } from '../guards/child-access.guard';
import {
  TransportationInfoResponseDto,
  BusLocationResponseDto,
  BusRouteResponseDto,
  TransportationScheduleResponseDto,
  SafetyAlertResponseDto,
  EmergencyContactResponseDto,
  TransportationStatsResponseDto,
  BusTrackingResponseDto,
  TransportationInfoListResponseDto,
  SafetyAlertListResponseDto,
} from '../dtos/transportation.dto';

@ApiTags('Parent Portal - Transportation & Safety')
@Controller('parent-portal/transportation')
@UseGuards(ParentPortalGuard)
@ApiBearerAuth()
export class ParentPortalTransportationController {
  private readonly logger = new Logger(ParentPortalTransportationController.name);

  constructor(
    private readonly transportationService: ParentPortalTransportationService,
  ) {}

  @Get('info/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get transportation information for a student',
    description: 'Retrieve bus route, schedule, driver info, and safety details for a specific student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get transportation info for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Transportation information retrieved successfully',
    type: TransportationInfoResponseDto,
  })
  async getTransportationInfo(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ): Promise<TransportationInfoResponseDto> {
    this.logger.log(`Getting transportation info for student: ${studentId}, parent: ${req.user.userId}`);

    const result = await this.transportationService.getTransportationInfo(
      req.user.parentPortalAccessId,
      studentId,
    );

    this.logger.log(`Transportation info retrieved for student: ${studentId}`);

    return result;
  }

  @Get('bus-location/:busId')
  @ApiOperation({
    summary: 'Get real-time bus location',
    description: 'Retrieve current location and status of a specific bus.',
  })
  @ApiParam({
    name: 'busId',
    description: 'Bus ID to track',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Bus location retrieved successfully',
    type: BusLocationResponseDto,
  })
  async getBusLocation(
    @Param('busId') busId: string,
    @Request() req: any,
  ): Promise<BusLocationResponseDto> {
    this.logger.log(`Getting bus location for bus: ${busId}, parent: ${req.user.userId}`);

    const result = await this.transportationService.getBusLocation(
      req.user.parentPortalAccessId,
      busId,
    );

    this.logger.log(`Bus location retrieved for bus: ${busId}`);

    return result;
  }

  @Get('bus-route/:routeId')
  @ApiOperation({
    summary: 'Get bus route details',
    description: 'Retrieve detailed route information including stops, schedule, and landmarks.',
  })
  @ApiParam({
    name: 'routeId',
    description: 'Route ID to get details for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Bus route details retrieved successfully',
    type: BusRouteResponseDto,
  })
  async getBusRoute(
    @Param('routeId') routeId: string,
    @Request() req: any,
  ): Promise<BusRouteResponseDto> {
    this.logger.log(`Getting bus route details for route: ${routeId}, parent: ${req.user.userId}`);

    const result = await this.transportationService.getBusRoute(
      req.user.parentPortalAccessId,
      routeId,
    );

    this.logger.log(`Bus route details retrieved for route: ${routeId}`);

    return result;
  }

  @Get('schedule/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get transportation schedule for a student',
    description: 'Retrieve pickup/drop-off times and locations for a specific student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get schedule for',
    type: 'string',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Date to get schedule for (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @ApiResponse({
    status: 200,
    description: 'Transportation schedule retrieved successfully',
    type: TransportationScheduleResponseDto,
  })
  async getTransportationSchedule(
    @Param('studentId') studentId: string,
    @Query('date') date: string,
    @Request() req: any,
  ): Promise<TransportationScheduleResponseDto> {
    this.logger.log(`Getting transportation schedule for student: ${studentId}, date: ${date}, parent: ${req.user.userId}`);

    const result = await this.transportationService.getTransportationSchedule(
      req.user.parentPortalAccessId,
      studentId,
      date ? new Date(date) : new Date(),
    );

    this.logger.log(`Transportation schedule retrieved for student: ${studentId}`);

    return result;
  }

  @Get('safety-alerts')
  @ApiOperation({
    summary: 'Get safety alerts and notifications',
    description: 'Retrieve transportation-related safety alerts and emergency notifications.',
  })
  @ApiQuery({
    name: 'severity',
    required: false,
    description: 'Filter by alert severity',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of alerts to retrieve',
    type: 'number',
    minimum: 1,
    maximum: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Safety alerts retrieved successfully',
    type: SafetyAlertListResponseDto,
  })
  async getSafetyAlerts(
    @Query() query: { severity?: string; limit?: number },
    @Request() req: any,
  ): Promise<SafetyAlertListResponseDto> {
    this.logger.log(`Getting safety alerts for parent: ${req.user.userId}, severity: ${query.severity}`);

    const result = await this.transportationService.getSafetyAlerts(
      req.user.parentPortalAccessId,
      query.severity as any,
      query.limit || 20,
    );

    this.logger.log(`Safety alerts retrieved for parent: ${req.user.userId}, count: ${result.alerts.length}`);

    return result;
  }

  @Get('emergency-contacts')
  @ApiOperation({
    summary: 'Get emergency contacts',
    description: 'Retrieve emergency contact information for transportation and safety.',
  })
  @ApiResponse({
    status: 200,
    description: 'Emergency contacts retrieved successfully',
    type: EmergencyContactResponseDto,
    isArray: true,
  })
  async getEmergencyContacts(@Request() req: any): Promise<EmergencyContactResponseDto[]> {
    this.logger.log(`Getting emergency contacts for parent: ${req.user.userId}`);

    const result = await this.transportationService.getEmergencyContacts(
      req.user.parentPortalAccessId,
    );

    this.logger.log(`Emergency contacts retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get transportation statistics',
    description: 'Retrieve transportation usage statistics and safety metrics.',
  })
  @ApiQuery({
    name: 'timeRange',
    required: false,
    description: 'Time range for statistics',
    enum: ['week', 'month', 'quarter', 'year'],
    example: 'month',
  })
  @ApiResponse({
    status: 200,
    description: 'Transportation statistics retrieved successfully',
    type: TransportationStatsResponseDto,
  })
  async getTransportationStats(
    @Query('timeRange') timeRange: string = 'month',
    @Request() req: any,
  ): Promise<TransportationStatsResponseDto> {
    this.logger.log(`Getting transportation stats for parent: ${req.user.userId}, timeRange: ${timeRange}`);

    const result = await this.transportationService.getTransportationStats(
      req.user.parentPortalAccessId,
      timeRange as any,
    );

    this.logger.log(`Transportation stats retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('bus-tracking/:busId')
  @ApiOperation({
    summary: 'Get detailed bus tracking information',
    description: 'Retrieve comprehensive bus tracking data including route progress, ETA, and passenger status.',
  })
  @ApiParam({
    name: 'busId',
    description: 'Bus ID to track',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Bus tracking information retrieved successfully',
    type: BusTrackingResponseDto,
  })
  async getBusTracking(
    @Param('busId') busId: string,
    @Request() req: any,
  ): Promise<BusTrackingResponseDto> {
    this.logger.log(`Getting bus tracking for bus: ${busId}, parent: ${req.user.userId}`);

    const result = await this.transportationService.getBusTracking(
      req.user.parentPortalAccessId,
      busId,
    );

    this.logger.log(`Bus tracking retrieved for bus: ${busId}`);

    return result;
  }

  @Get('route-stops/:routeId')
  @ApiOperation({
    summary: 'Get all stops for a bus route',
    description: 'Retrieve detailed information about all stops on a specific bus route.',
  })
  @ApiParam({
    name: 'routeId',
    description: 'Route ID to get stops for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Route stops retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        routeId: { type: 'string' },
        routeName: { type: 'string' },
        stops: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              stopId: { type: 'string' },
              stopName: { type: 'string' },
              latitude: { type: 'number' },
              longitude: { type: 'number' },
              estimatedArrival: { type: 'string', format: 'date-time' },
              isCompleted: { type: 'boolean' },
              passengersGettingOn: { type: 'number' },
              passengersGettingOff: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getRouteStops(
    @Param('routeId') routeId: string,
    @Request() req: any,
  ): Promise<{
    routeId: string;
    routeName: string;
    stops: Array<{
      stopId: string;
      stopName: string;
      latitude: number;
      longitude: number;
      estimatedArrival: Date;
      isCompleted: boolean;
      passengersGettingOn: number;
      passengersGettingOff: number;
    }>;
  }> {
    this.logger.log(`Getting route stops for route: ${routeId}, parent: ${req.user.userId}`);

    const result = await this.transportationService.getRouteStops(
      req.user.parentPortalAccessId,
      routeId,
    );

    this.logger.log(`Route stops retrieved for route: ${routeId}`);

    return result;
  }

  @Get('safety-protocols')
  @ApiOperation({
    summary: 'Get safety protocols and procedures',
    description: 'Retrieve safety protocols, emergency procedures, and safety guidelines.',
  })
  @ApiResponse({
    status: 200,
    description: 'Safety protocols retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        emergencyProcedures: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              procedureId: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              steps: { type: 'array', items: { type: 'string' } },
              emergencyContacts: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        safetyGuidelines: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              guidelineId: { type: 'string' },
              category: { type: 'string' },
              title: { type: 'string' },
              description: { type: 'string' },
              priority: { type: 'string', enum: ['low', 'medium', 'high'] },
            },
          },
        },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getSafetyProtocols(@Request() req: any): Promise<{
    emergencyProcedures: Array<{
      procedureId: string;
      title: string;
      description: string;
      steps: string[];
      emergencyContacts: string[];
    }>;
    safetyGuidelines: Array<{
      guidelineId: string;
      category: string;
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    lastUpdated: Date;
  }> {
    this.logger.log(`Getting safety protocols for parent: ${req.user.userId}`);

    const result = await this.transportationService.getSafetyProtocols(
      req.user.parentPortalAccessId,
    );

    this.logger.log(`Safety protocols retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('weather-impact')
  @ApiOperation({
    summary: 'Get weather impact on transportation',
    description: 'Retrieve information about weather conditions affecting bus routes and schedules.',
  })
  @ApiResponse({
    status: 200,
    description: 'Weather impact information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        currentConditions: {
          type: 'object',
          properties: {
            temperature: { type: 'number' },
            conditions: { type: 'string' },
            visibility: { type: 'string' },
            windSpeed: { type: 'number' },
            precipitation: { type: 'string' },
          },
        },
        routeImpacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              routeId: { type: 'string' },
              routeName: { type: 'string' },
              impactLevel: { type: 'string', enum: ['none', 'minor', 'moderate', 'severe'] },
              description: { type: 'string' },
              estimatedDelay: { type: 'number' },
              alternativeRoutes: { type: 'array', items: { type: 'string' } },
            },
          },
        },
        lastUpdated: { type: 'string', format: 'date-time' },
      },
    },
  })
  async getWeatherImpact(@Request() req: any): Promise<{
    currentConditions: {
      temperature: number;
      conditions: string;
      visibility: string;
      windSpeed: number;
      precipitation: string;
    };
    routeImpacts: Array<{
      routeId: string;
      routeName: string;
      impactLevel: 'none' | 'minor' | 'moderate' | 'severe';
      description: string;
      estimatedDelay: number;
      alternativeRoutes: string[];
    }>;
    lastUpdated: Date;
  }> {
    this.logger.log(`Getting weather impact for parent: ${req.user.userId}`);

    const result = await this.transportationService.getWeatherImpact(
      req.user.parentPortalAccessId,
    );

    this.logger.log(`Weather impact retrieved for parent: ${req.user.userId}`);

    return result;
  }

  @Get('delay-notifications/:studentId')
  @UseGuards(ChildAccessGuard)
  @ApiOperation({
    summary: 'Get delay notifications for a student',
    description: 'Retrieve delay notifications and updated schedules for a specific student.',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID to get delay notifications for',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Delay notifications retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        studentId: { type: 'string' },
        notifications: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              notificationId: { type: 'string' },
              type: { type: 'string', enum: ['delay', 'early', 'route_change', 'bus_change'] },
              title: { type: 'string' },
              message: { type: 'string' },
              originalTime: { type: 'string', format: 'date-time' },
              updatedTime: { type: 'string', format: 'date-time' },
              delayMinutes: { type: 'number' },
              reason: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              acknowledged: { type: 'boolean' },
            },
          },
        },
        activeDelays: { type: 'number' },
      },
    },
  })
  async getDelayNotifications(
    @Param('studentId') studentId: string,
    @Request() req: any,
  ): Promise<{
    studentId: string;
    notifications: Array<{
      notificationId: string;
      type: 'delay' | 'early' | 'route_change' | 'bus_change';
      title: string;
      message: string;
      originalTime: Date;
      updatedTime: Date;
      delayMinutes: number;
      reason: string;
      createdAt: Date;
      acknowledged: boolean;
    }>;
    activeDelays: number;
  }> {
    this.logger.log(`Getting delay notifications for student: ${studentId}, parent: ${req.user.userId}`);

    const result = await this.transportationService.getDelayNotifications(
      req.user.parentPortalAccessId,
      studentId,
    );

    this.logger.log(`Delay notifications retrieved for student: ${studentId}, active delays: ${result.activeDelays}`);

    return result;
  }
}