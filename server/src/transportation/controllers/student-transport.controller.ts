// Academia Pro - Student Transport Controller
// REST API endpoints for student transportation assignments

import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { StudentTransportService, TransportAssignmentRequest, TransportUpdateRequest } from '../services/student-transport.service';
import { StudentPortalGuard } from '../../student-portal/guards/student-portal.guard';

@ApiTags('Transportation - Student Transport')
@Controller('transportation/student-transport')
@UseGuards(StudentPortalGuard)
export class StudentTransportController {
  private readonly logger = new Logger(StudentTransportController.name);

  constructor(private readonly transportService: StudentTransportService) {}

  @Post('assign')
  @ApiOperation({
    summary: 'Assign student transport',
    description: 'Assign transportation for a student',
  })
  @ApiBody({
    description: 'Transport assignment data',
    schema: {
      type: 'object',
      required: ['schoolId', 'studentId', 'routeId', 'pickupStopId', 'dropoffStopId', 'startDate'],
      properties: {
        schoolId: { type: 'string', description: 'School identifier' },
        studentId: { type: 'string', description: 'Student identifier' },
        routeId: { type: 'string', description: 'Route identifier' },
        pickupStopId: { type: 'string', description: 'Pickup stop identifier' },
        dropoffStopId: { type: 'string', description: 'Dropoff stop identifier' },
        transportType: { type: 'string', enum: ['regular', 'special_needs', 'medical', 'emergency', 'temporary'] },
        frequency: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'one_time', 'custom'] },
        startDate: { type: 'string', format: 'date', description: 'Transport start date' },
        endDate: { type: 'string', format: 'date', description: 'Transport end date' },
        specialRequirements: { type: 'string', description: 'Special requirements' },
        medicalConditions: { type: 'string', description: 'Medical conditions' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Transport assigned successfully',
  })
  async assignTransport(@Body() request: any) {
    this.logger.log(`Assigning transport for student ${request.studentId}`);
    return this.transportService.assignTransport(request.schoolId, request);
  }

  @Get()
  @ApiOperation({
    summary: 'Get student transports',
    description: 'Retrieve student transportation assignments with optional filtering',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Student identifier' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'suspended', 'completed', 'cancelled'] })
  @ApiResponse({
    status: 200,
    description: 'Student transports retrieved successfully',
  })
  async getStudentTransports(
    @Query('schoolId') schoolId: string,
    @Query() filters: any,
  ) {
    this.logger.log(`Getting student transports for school: ${schoolId}`);
    return this.transportService.getStudentTransports(schoolId, filters.studentId, filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transport by ID',
    description: 'Retrieve a specific student transportation assignment',
  })
  @ApiParam({ name: 'id', description: 'Transport identifier' })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Transport retrieved successfully',
  })
  async getTransportById(
    @Param('id') transportId: string,
    @Query('schoolId') schoolId: string,
  ) {
    this.logger.log(`Getting transport ${transportId} for school: ${schoolId}`);
    return this.transportService.getTransportById(schoolId, transportId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update student transport',
    description: 'Update an existing student transportation assignment',
  })
  @ApiParam({ name: 'id', description: 'Transport identifier' })
  @ApiBody({
    description: 'Transport update data',
    schema: {
      type: 'object',
      properties: {
        routeId: { type: 'string', description: 'New route identifier' },
        pickupStopId: { type: 'string', description: 'New pickup stop identifier' },
        dropoffStopId: { type: 'string', description: 'New dropoff stop identifier' },
        transportType: { type: 'string', enum: ['regular', 'special_needs', 'medical', 'emergency', 'temporary'] },
        status: { type: 'string', enum: ['active', 'inactive', 'suspended', 'completed', 'cancelled'] },
        specialRequirements: { type: 'string', description: 'Special requirements' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Transport updated successfully',
  })
  async updateTransport(
    @Param('id') transportId: string,
    @Body() updateData: any,
  ) {
    this.logger.log(`Updating transport ${transportId}`);
    return this.transportService.updateTransport(updateData.schoolId, transportId, updateData);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancel student transport',
    description: 'Cancel a student transportation assignment',
  })
  @ApiParam({ name: 'id', description: 'Transport identifier' })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiQuery({ name: 'reason', required: false, description: 'Cancellation reason' })
  @ApiResponse({
    status: 200,
    description: 'Transport cancelled successfully',
  })
  async cancelTransport(
    @Param('id') transportId: string,
    @Query('schoolId') schoolId: string,
    @Query('reason') reason?: string,
  ) {
    this.logger.log(`Cancelling transport ${transportId} for school: ${schoolId}`);
    return this.transportService.cancelTransport(schoolId, transportId, reason);
  }

  @Post(':id/activity')
  @ApiOperation({
    summary: 'Record transport activity',
    description: 'Record pickup/dropoff activity for a transportation assignment',
  })
  @ApiParam({ name: 'id', description: 'Transport identifier' })
  @ApiBody({
    description: 'Activity data',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['active', 'inactive', 'suspended', 'completed', 'cancelled'] },
        pickupTime: { type: 'string', description: 'Actual pickup time' },
        dropoffTime: { type: 'string', description: 'Actual dropoff time' },
        delayMinutes: { type: 'number', description: 'Delay in minutes' },
        notes: { type: 'string', description: 'Activity notes' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Transport activity recorded successfully',
  })
  async recordTransportActivity(
    @Param('id') transportId: string,
    @Body() activityData: TransportUpdateRequest,
  ) {
    this.logger.log(`Recording transport activity for transport ${transportId}`);
    activityData.transportId = transportId;
    return this.transportService.recordTransportActivity(activityData);
  }

  @Get('analytics/school')
  @ApiOperation({
    summary: 'Get transport analytics',
    description: 'Retrieve transportation analytics for a school',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiQuery({ name: 'transportId', required: false, description: 'Specific transport identifier' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Specific student identifier' })
  @ApiResponse({
    status: 200,
    description: 'Transport analytics retrieved successfully',
  })
  async getTransportAnalytics(
    @Query('schoolId') schoolId: string,
    @Query('transportId') transportId?: string,
    @Query('studentId') studentId?: string,
  ) {
    this.logger.log(`Getting transport analytics for school: ${schoolId}`);
    return this.transportService.getTransportAnalytics(schoolId, transportId, studentId);
  }

  @Get('schedule/date')
  @ApiOperation({
    summary: 'Get transport schedule',
    description: 'Retrieve transportation schedule for a specific date',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiQuery({ name: 'date', required: true, description: 'Schedule date (YYYY-MM-DD)' })
  @ApiQuery({ name: 'routeId', required: false, description: 'Specific route identifier' })
  @ApiResponse({
    status: 200,
    description: 'Transport schedule retrieved successfully',
  })
  async getTransportSchedule(
    @Query('schoolId') schoolId: string,
    @Query('date') dateString: string,
    @Query('routeId') routeId?: string,
  ) {
    this.logger.log(`Getting transport schedule for school: ${schoolId} on ${dateString}`);
    const date = new Date(dateString);
    return this.transportService.getTransportSchedule(schoolId, date, routeId);
  }
}