// Academia Pro - Driver Controller
// REST API endpoints for driver management

import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { DriverService, DriverAssignmentRequest, DriverTrainingRequest } from '../services/driver.service';
import { StudentPortalGuard } from '../../student-portal/guards/student-portal.guard';

@ApiTags('Transportation - Drivers')
@Controller('transportation/drivers')
@UseGuards(StudentPortalGuard)
export class DriverController {
  private readonly logger = new Logger(DriverController.name);

  constructor(private readonly driverService: DriverService) {}

  @Post()
  @ApiOperation({
    summary: 'Create driver',
    description: 'Create a new transportation driver',
  })
  @ApiBody({
    description: 'Driver creation data',
    schema: {
      type: 'object',
      required: ['schoolId', 'driverCode', 'firstName', 'lastName', 'licenseNumber'],
      properties: {
        schoolId: { type: 'string', description: 'School identifier' },
        driverCode: { type: 'string', description: 'Unique driver code' },
        firstName: { type: 'string', description: 'Driver first name' },
        lastName: { type: 'string', description: 'Driver last name' },
        licenseNumber: { type: 'string', description: 'Driver license number' },
        phoneNumber: { type: 'string', description: 'Driver phone number' },
        licenseType: { type: 'string', enum: ['commercial', 'private', 'public_service', 'heavy_duty'] },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Driver created successfully',
  })
  async createDriver(@Body() driverData: any) {
    this.logger.log(`Creating driver for school: ${driverData.schoolId}`);
    return this.driverService.createDriver(driverData.schoolId, driverData);
  }

  @Get()
  @ApiOperation({
    summary: 'Get drivers',
    description: 'Retrieve transportation drivers with optional filtering',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'suspended', 'terminated', 'on_leave'] })
  @ApiResponse({
    status: 200,
    description: 'Drivers retrieved successfully',
  })
  async getDrivers(
    @Query('schoolId') schoolId: string,
    @Query() filters: any,
  ) {
    this.logger.log(`Getting drivers for school: ${schoolId}`);
    return this.driverService.getDrivers(schoolId, filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get driver by ID',
    description: 'Retrieve a specific transportation driver',
  })
  @ApiParam({ name: 'id', description: 'Driver identifier' })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Driver retrieved successfully',
  })
  async getDriverById(
    @Param('id') driverId: string,
    @Query('schoolId') schoolId: string,
  ) {
    this.logger.log(`Getting driver ${driverId} for school: ${schoolId}`);
    return this.driverService.getDriverById(schoolId, driverId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update driver',
    description: 'Update an existing transportation driver',
  })
  @ApiParam({ name: 'id', description: 'Driver identifier' })
  @ApiBody({
    description: 'Driver update data',
    schema: {
      type: 'object',
      properties: {
        firstName: { type: 'string', description: 'Driver first name' },
        lastName: { type: 'string', description: 'Driver last name' },
        phoneNumber: { type: 'string', description: 'Driver phone number' },
        status: { type: 'string', enum: ['active', 'inactive', 'suspended', 'terminated', 'on_leave'] },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Driver updated successfully',
  })
  async updateDriver(
    @Param('id') driverId: string,
    @Body() updateData: any,
  ) {
    this.logger.log(`Updating driver ${driverId}`);
    return this.driverService.updateDriver(updateData.schoolId, driverId, updateData);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete driver',
    description: 'Delete a transportation driver',
  })
  @ApiParam({ name: 'id', description: 'Driver identifier' })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Driver deleted successfully',
  })
  async deleteDriver(
    @Param('id') driverId: string,
    @Query('schoolId') schoolId: string,
  ) {
    this.logger.log(`Deleting driver ${driverId} for school: ${schoolId}`);
    await this.driverService.deleteDriver(schoolId, driverId);
    return { message: 'Driver deleted successfully' };
  }

  @Post(':id/assign')
  @ApiOperation({
    summary: 'Assign driver to vehicle/route',
    description: 'Assign a driver to a vehicle and/or route',
  })
  @ApiParam({ name: 'id', description: 'Driver identifier' })
  @ApiBody({
    description: 'Assignment data',
    schema: {
      type: 'object',
      properties: {
        vehicleId: { type: 'string', description: 'Vehicle identifier' },
        routeId: { type: 'string', description: 'Route identifier' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Driver assigned successfully',
  })
  async assignDriver(
    @Param('id') driverId: string,
    @Body() assignment: DriverAssignmentRequest,
  ) {
    this.logger.log(`Assigning driver ${driverId}`);
    assignment.driverId = driverId;
    return this.driverService.assignDriver(assignment);
  }

  @Post(':id/training')
  @ApiOperation({
    summary: 'Add driver training record',
    description: 'Add a training record for a transportation driver',
  })
  @ApiParam({ name: 'id', description: 'Driver identifier' })
  @ApiBody({
    description: 'Training data',
    schema: {
      type: 'object',
      required: ['trainingName', 'trainingDate', 'trainer'],
      properties: {
        trainingName: { type: 'string', description: 'Training name' },
        trainingDate: { type: 'string', format: 'date', description: 'Training date' },
        completionDate: { type: 'string', format: 'date', description: 'Completion date' },
        trainer: { type: 'string', description: 'Trainer name' },
        score: { type: 'number', description: 'Training score' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Training record added successfully',
  })
  async addTrainingRecord(
    @Param('id') driverId: string,
    @Body() trainingData: DriverTrainingRequest,
  ) {
    this.logger.log(`Adding training record for driver ${driverId}`);
    trainingData.driverId = driverId;
    return this.driverService.addTrainingRecord(trainingData);
  }

  @Get(':id/analytics')
  @ApiOperation({
    summary: 'Get driver analytics',
    description: 'Retrieve analytics and performance metrics for a driver',
  })
  @ApiParam({ name: 'id', description: 'Driver identifier' })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Driver analytics retrieved successfully',
  })
  async getDriverAnalytics(
    @Param('id') driverId: string,
    @Query('schoolId') schoolId: string,
  ) {
    this.logger.log(`Getting analytics for driver ${driverId}`);
    return this.driverService.getDriverAnalytics(schoolId, driverId);
  }

  @Get('fleet/analytics')
  @ApiOperation({
    summary: 'Get driver fleet analytics',
    description: 'Retrieve analytics for the entire driver fleet',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Driver fleet analytics retrieved successfully',
  })
  async getDriverFleetAnalytics(@Query('schoolId') schoolId: string) {
    this.logger.log(`Getting driver fleet analytics for school: ${schoolId}`);
    return this.driverService.getDriverFleetAnalytics(schoolId);
  }
}