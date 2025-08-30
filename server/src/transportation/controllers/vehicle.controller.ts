// Academia Pro - Vehicle Controller
// REST API endpoints for vehicle management

import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { VehicleService, VehicleMaintenanceRequest, FuelLogRequest } from '../services/vehicle.service';
import { StudentPortalGuard } from '../../student-portal/guards/student-portal.guard';

@ApiTags('Transportation - Vehicles')
@Controller('transportation/vehicles')
@UseGuards(StudentPortalGuard)
export class VehicleController {
  private readonly logger = new Logger(VehicleController.name);

  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  @ApiOperation({
    summary: 'Create vehicle',
    description: 'Create a new transportation vehicle',
  })
  @ApiBody({
    description: 'Vehicle creation data',
    schema: {
      type: 'object',
      required: ['schoolId', 'vehicleCode', 'registrationNumber', 'vehicleName'],
      properties: {
        schoolId: { type: 'string', description: 'School identifier' },
        vehicleCode: { type: 'string', description: 'Unique vehicle code' },
        registrationNumber: { type: 'string', description: 'Vehicle registration number' },
        vehicleName: { type: 'string', description: 'Vehicle name' },
        vehicleType: { type: 'string', enum: ['bus', 'van', 'car', 'suv', 'special_needs_vehicle', 'emergency_vehicle'] },
        capacity: { type: 'number', description: 'Passenger capacity' },
        fuelType: { type: 'string', enum: ['diesel', 'petrol', 'cng', 'electric', 'hybrid'] },
        fuelCapacity: { type: 'number', description: 'Fuel capacity in liters' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
  })
  async createVehicle(@Body() vehicleData: any) {
    this.logger.log(`Creating vehicle for school: ${vehicleData.schoolId}`);
    return this.vehicleService.createVehicle(vehicleData.schoolId, vehicleData);
  }

  @Get()
  @ApiOperation({
    summary: 'Get vehicles',
    description: 'Retrieve transportation vehicles with optional filtering',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'inactive', 'maintenance', 'out_of_service', 'decommissioned'] })
  @ApiQuery({ name: 'type', required: false, enum: ['bus', 'van', 'car', 'suv', 'special_needs_vehicle', 'emergency_vehicle'] })
  @ApiResponse({
    status: 200,
    description: 'Vehicles retrieved successfully',
  })
  async getVehicles(
    @Query('schoolId') schoolId: string,
    @Query() filters: any,
  ) {
    this.logger.log(`Getting vehicles for school: ${schoolId}`);
    return this.vehicleService.getVehicles(schoolId, filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get vehicle by ID',
    description: 'Retrieve a specific transportation vehicle',
  })
  @ApiParam({ name: 'id', description: 'Vehicle identifier' })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle retrieved successfully',
  })
  async getVehicleById(
    @Param('id') vehicleId: string,
    @Query('schoolId') schoolId: string,
  ) {
    this.logger.log(`Getting vehicle ${vehicleId} for school: ${schoolId}`);
    return this.vehicleService.getVehicleById(schoolId, vehicleId);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update vehicle',
    description: 'Update an existing transportation vehicle',
  })
  @ApiParam({ name: 'id', description: 'Vehicle identifier' })
  @ApiBody({
    description: 'Vehicle update data',
    schema: {
      type: 'object',
      properties: {
        vehicleName: { type: 'string', description: 'Vehicle name' },
        status: { type: 'string', enum: ['active', 'inactive', 'maintenance', 'out_of_service', 'decommissioned'] },
        capacity: { type: 'number', description: 'Passenger capacity' },
        mileage: { type: 'number', description: 'Current mileage' },
        insuranceExpiry: { type: 'string', format: 'date', description: 'Insurance expiry date' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle updated successfully',
  })
  async updateVehicle(
    @Param('id') vehicleId: string,
    @Body() updateData: any,
  ) {
    this.logger.log(`Updating vehicle ${vehicleId}`);
    return this.vehicleService.updateVehicle(updateData.schoolId, vehicleId, updateData);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete vehicle',
    description: 'Delete a transportation vehicle',
  })
  @ApiParam({ name: 'id', description: 'Vehicle identifier' })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle deleted successfully',
  })
  async deleteVehicle(
    @Param('id') vehicleId: string,
    @Query('schoolId') schoolId: string,
  ) {
    this.logger.log(`Deleting vehicle ${vehicleId} for school: ${schoolId}`);
    await this.vehicleService.deleteVehicle(schoolId, vehicleId);
    return { message: 'Vehicle deleted successfully' };
  }

  @Post(':id/assign')
  @ApiOperation({
    summary: 'Assign vehicle to driver/route',
    description: 'Assign a vehicle to a driver and/or route',
  })
  @ApiParam({ name: 'id', description: 'Vehicle identifier' })
  @ApiBody({
    description: 'Assignment data',
    schema: {
      type: 'object',
      properties: {
        driverId: { type: 'string', description: 'Driver identifier' },
        routeId: { type: 'string', description: 'Route identifier' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle assigned successfully',
  })
  async assignVehicle(
    @Param('id') vehicleId: string,
    @Body() assignment: any,
  ) {
    this.logger.log(`Assigning vehicle ${vehicleId}`);
    return this.vehicleService.assignVehicle(vehicleId, assignment);
  }

  @Post(':id/location')
  @ApiOperation({
    summary: 'Update vehicle location',
    description: 'Update the current location and status of a vehicle',
  })
  @ApiParam({ name: 'id', description: 'Vehicle identifier' })
  @ApiBody({
    description: 'Location data',
    schema: {
      type: 'object',
      required: ['latitude', 'longitude', 'address'],
      properties: {
        latitude: { type: 'number', description: 'Latitude coordinate' },
        longitude: { type: 'number', description: 'Longitude coordinate' },
        address: { type: 'string', description: 'Location address' },
        speed: { type: 'number', description: 'Current speed in km/h' },
        heading: { type: 'number', description: 'Direction heading in degrees' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle location updated successfully',
  })
  async updateVehicleLocation(
    @Param('id') vehicleId: string,
    @Body() location: any,
  ) {
    this.logger.log(`Updating location for vehicle ${vehicleId}`);
    return this.vehicleService.updateVehicleLocation(vehicleId, location);
  }

  @Post(':id/fuel')
  @ApiOperation({
    summary: 'Log fuel consumption',
    description: 'Record fuel consumption and update vehicle fuel levels',
  })
  @ApiParam({ name: 'id', description: 'Vehicle identifier' })
  @ApiBody({
    description: 'Fuel log data',
    schema: {
      type: 'object',
      required: ['liters', 'cost', 'fuelStation', 'driverId', 'mileage'],
      properties: {
        liters: { type: 'number', description: 'Fuel quantity in liters' },
        cost: { type: 'number', description: 'Fuel cost' },
        fuelStation: { type: 'string', description: 'Fuel station name' },
        driverId: { type: 'string', description: 'Driver identifier' },
        mileage: { type: 'number', description: 'Current mileage' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Fuel consumption logged successfully',
  })
  async logFuelConsumption(
    @Param('id') vehicleId: string,
    @Body() fuelData: FuelLogRequest,
  ) {
    this.logger.log(`Logging fuel consumption for vehicle ${vehicleId}`);
    fuelData.vehicleId = vehicleId;
    return this.vehicleService.logFuelConsumption(fuelData);
  }

  @Post(':id/maintenance')
  @ApiOperation({
    summary: 'Schedule vehicle maintenance',
    description: 'Schedule maintenance for a transportation vehicle',
  })
  @ApiParam({ name: 'id', description: 'Vehicle identifier' })
  @ApiBody({
    description: 'Maintenance data',
    schema: {
      type: 'object',
      required: ['maintenanceType', 'description', 'estimatedCost', 'scheduledDate'],
      properties: {
        maintenanceType: { type: 'string', description: 'Type of maintenance' },
        description: { type: 'string', description: 'Maintenance description' },
        estimatedCost: { type: 'number', description: 'Estimated cost' },
        scheduledDate: { type: 'string', format: 'date', description: 'Scheduled date' },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'], description: 'Maintenance priority' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Maintenance scheduled successfully',
  })
  async scheduleMaintenance(
    @Param('id') vehicleId: string,
    @Body() maintenanceData: VehicleMaintenanceRequest,
  ) {
    this.logger.log(`Scheduling maintenance for vehicle ${vehicleId}`);
    maintenanceData.vehicleId = vehicleId;
    return this.vehicleService.scheduleMaintenance(maintenanceData);
  }

  @Get(':id/analytics')
  @ApiOperation({
    summary: 'Get vehicle analytics',
    description: 'Retrieve analytics and performance metrics for a vehicle',
  })
  @ApiParam({ name: 'id', description: 'Vehicle identifier' })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Vehicle analytics retrieved successfully',
  })
  async getVehicleAnalytics(
    @Param('id') vehicleId: string,
    @Query('schoolId') schoolId: string,
  ) {
    this.logger.log(`Getting analytics for vehicle ${vehicleId}`);
    return this.vehicleService.getVehicleAnalytics(schoolId, vehicleId);
  }

  @Get('fleet/analytics')
  @ApiOperation({
    summary: 'Get fleet analytics',
    description: 'Retrieve analytics for the entire vehicle fleet',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Fleet analytics retrieved successfully',
  })
  async getFleetAnalytics(@Query('schoolId') schoolId: string) {
    this.logger.log(`Getting fleet analytics for school: ${schoolId}`);
    return this.vehicleService.getFleetAnalytics(schoolId);
  }
}