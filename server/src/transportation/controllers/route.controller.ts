// Academia Pro - Route Controller
// REST API endpoints for transportation route management

import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { RouteService, RouteOptimizationRequest, RouteAssignmentRequest } from '../services/route.service';
import { StudentPortalGuard } from '../../student-portal/guards/student-portal.guard';

@ApiTags('Transportation - Routes')
@Controller('transportation/routes')
@UseGuards(StudentPortalGuard)
export class RouteController {
  private readonly logger = new Logger(RouteController.name);

  constructor(private readonly routeService: RouteService) {}

  @Post()
  @ApiOperation({
    summary: 'Create transportation route',
    description: 'Create a new transportation route for student pickup/dropoff',
  })
  @ApiBody({
    description: 'Route creation data',
    schema: {
      type: 'object',
      required: ['schoolId', 'routeName', 'startLocation', 'endLocation'],
      properties: {
        schoolId: { type: 'string', description: 'School identifier' },
        routeCode: { type: 'string', description: 'Unique route code' },
        routeName: { type: 'string', description: 'Route name' },
        routeType: { type: 'string', enum: ['school_pickup', 'school_dropoff', 'round_trip', 'special_needs', 'emergency'] },
        startLocation: { type: 'string', description: 'Starting location' },
        endLocation: { type: 'string', description: 'Ending location' },
        distanceKm: { type: 'number', description: 'Distance in kilometers' },
        capacity: { type: 'number', description: 'Maximum capacity' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Route created successfully',
  })
  async createRoute(@Body() routeData: any) {
    this.logger.log(`Creating route for school: ${routeData.schoolId}`);
    return this.routeService.createRoute(routeData.schoolId, routeData);
  }

  @Get()
  @ApiOperation({
    summary: 'Get transportation routes',
    description: 'Retrieve transportation routes with optional filtering',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'maintenance', 'suspended'] })
  @ApiQuery({ name: 'type', required: false, enum: ['school_pickup', 'school_dropoff', 'round_trip', 'special_needs', 'emergency'] })
  @ApiResponse({
    status: 200,
    description: 'Routes retrieved successfully',
  })
  async getRoutes(
    @Query('schoolId') schoolId: string,
    @Query() filters: any,
  ) {
    this.logger.log(`Getting routes for school: ${schoolId}`);
    return this.routeService.getRoutes(schoolId, filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get route by ID',
    description: 'Retrieve a specific transportation route',
  })
  @ApiParam({ name: 'id', description: 'Route identifier' })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Route retrieved successfully',
  })
  async getRouteById(
    @Param('id') routeId: string,
    @Query('schoolId') schoolId: string,
  ) {
    this.logger.log(`Getting route ${routeId} for school: ${schoolId}`);
    return this.routeService.getRouteById(schoolId, routeId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update transportation route',
    description: 'Update an existing transportation route',
  })
  @ApiParam({ name: 'id', description: 'Route identifier' })
  @ApiBody({
    description: 'Route update data',
    schema: {
      type: 'object',
      properties: {
        routeName: { type: 'string', description: 'Route name' },
        status: { type: 'string', enum: ['active', 'inactive', 'maintenance', 'suspended'] },
        capacity: { type: 'number', description: 'Maximum capacity' },
        pickupTime: { type: 'string', description: 'Pickup time' },
        dropoffTime: { type: 'string', description: 'Dropoff time' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Route updated successfully',
  })
  async updateRoute(
    @Param('id') routeId: string,
    @Body() updateData: any,
  ) {
    this.logger.log(`Updating route ${routeId}`);
    return this.routeService.updateRoute(updateData.schoolId, routeId, updateData);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete transportation route',
    description: 'Delete a transportation route',
  })
  @ApiParam({ name: 'id', description: 'Route identifier' })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Route deleted successfully',
  })
  async deleteRoute(
    @Param('id') routeId: string,
    @Query('schoolId') schoolId: string,
  ) {
    this.logger.log(`Deleting route ${routeId} for school: ${schoolId}`);
    await this.routeService.deleteRoute(schoolId, routeId);
    return { message: 'Route deleted successfully' };
  }

  @Post(':id/assign')
  @ApiOperation({
    summary: 'Assign route to vehicle/driver',
    description: 'Assign a vehicle and/or driver to a transportation route',
  })
  @ApiParam({ name: 'id', description: 'Route identifier' })
  @ApiBody({
    description: 'Assignment data',
    schema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'Vehicle identifier' },
        driverId: { type: 'string', description: 'Driver identifier' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Route assigned successfully',
  })
  async assignRoute(
    @Param('id') routeId: string,
    @Body() assignment: RouteAssignmentRequest,
  ) {
    this.logger.log(`Assigning route ${routeId}`);
    assignment.routeId = routeId;
    return this.routeService.assignRoute(assignment);
  }

  @Post('optimize')
  @ApiOperation({
    summary: 'Optimize route creation',
    description: 'Create an optimized transportation route based on stops and constraints',
  })
  @ApiBody({
    description: 'Route optimization data',
    schema: {
      type: 'object',
      required: ['schoolId', 'stops'],
      properties: {
        schoolId: { type: 'string', description: 'School identifier' },
        stops: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              latitude: { type: 'number' },
              longitude: { type: 'number' },
              address: { type: 'string' },
              estimatedStudents: { type: 'number' },
            },
          },
        },
        constraints: {
          type: 'object',
          properties: {
            maxDistance: { type: 'number' },
            maxDuration: { type: 'number' },
            maxCapacity: { type: 'number' },
            vehicleType: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Optimized route created successfully',
  })
  async optimizeRoute(@Body() request: RouteOptimizationRequest) {
    this.logger.log(`Optimizing route for school: ${request.schoolId}`);
    return this.routeService.optimizeRoute(request);
  }

  @Get(':id/analytics')
  @ApiOperation({
    summary: 'Get route analytics',
    description: 'Retrieve analytics and performance metrics for a transportation route',
  })
  @ApiParam({ name: 'id', description: 'Route identifier' })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Route analytics retrieved successfully',
  })
  async getRouteAnalytics(
    @Param('id') routeId: string,
    @Query('schoolId') schoolId: string,
  ) {
    this.logger.log(`Getting analytics for route ${routeId}`);
    return this.routeService.getRouteAnalytics(schoolId, routeId);
  }
}