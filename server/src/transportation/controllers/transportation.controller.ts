// Academia Pro - Transportation Controller
// Main controller for transportation management system

import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

// Services
import { RouteService } from '../services/route.service';
import { VehicleService } from '../services/vehicle.service';
import { DriverService } from '../services/driver.service';
import { StudentTransportService } from '../services/student-transport.service';

// DTOs
import { Route, RouteType, RouteStatus } from '../entities/route.entity';
import { Vehicle, VehicleStatus, FuelType } from '../entities/vehicle.entity';
import { Driver, DriverStatus, LicenseType } from '../entities/driver.entity';
import { StudentTransport, TransportStatus, TransportType } from '../entities/student-transport.entity';

@ApiTags('Transportation Management')
@Controller('transportation')
export class TransportationController {
  constructor(
    private readonly routeService: RouteService,
    private readonly vehicleService: VehicleService,
    private readonly driverService: DriverService,
    private readonly studentTransportService: StudentTransportService,
  ) {}

  // ==================== DASHBOARD & OVERVIEW ====================

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get transportation dashboard overview',
    description: 'Returns comprehensive overview of transportation system including routes, vehicles, drivers, and active transports.',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data retrieved successfully',
  })
  async getDashboard(@Query('schoolId') schoolId: string) {
    const [
      routes,
      vehicles,
      drivers,
      activeTransports,
      routeAnalytics,
      vehicleAnalytics,
    ] = await Promise.all([
      this.routeService.getRoutesBySchool(schoolId),
      this.vehicleService.getVehiclesBySchool(schoolId),
      this.driverService.getDriversBySchool(schoolId),
      this.studentTransportService.getTransportsByDateRange(
        new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        new Date()
      ),
      this.getRouteAnalytics(schoolId),
      this.getVehicleAnalytics(schoolId),
    ]);

    return {
      overview: {
        totalRoutes: routes.length,
        activeRoutes: routes.filter(r => r.status === 'active').length,
        totalVehicles: vehicles.length,
        activeVehicles: vehicles.filter(v => v.status === 'active').length,
        totalDrivers: drivers.length,
        activeDrivers: drivers.filter(d => d.status === 'active').length,
        activeTransports: activeTransports.length,
      },
      routes: routes.slice(0, 10), // Recent routes
      vehicles: vehicles.slice(0, 10), // Recent vehicles
      drivers: drivers.slice(0, 10), // Recent drivers
      analytics: {
        routes: routeAnalytics,
        vehicles: vehicleAnalytics,
      },
    };
  }

  // ==================== ROUTE MANAGEMENT ====================

  @Post('routes')
  @ApiOperation({
    summary: 'Create new transportation route',
    description: 'Creates a new transportation route with stops and schedule.',
  })
  @ApiBody({
    description: 'Route creation data',
    schema: {
      type: 'object',
      required: ['schoolId', 'routeName', 'routeCode', 'startLocation', 'endLocation'],
      properties: {
        schoolId: { type: 'string' },
        routeName: { type: 'string' },
        routeCode: { type: 'string' },
        routeType: { type: 'string', enum: Object.values(RouteType) },
        startLocation: { type: 'string' },
        endLocation: { type: 'string' },
        capacity: { type: 'number' },
        startTime: { type: 'string' },
        endTime: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Route created successfully',
  })
  async createRoute(@Body() routeData: Partial<Route>) {
    return this.routeService.createRoute(routeData);
  }

  @Get('routes')
  @ApiOperation({
    summary: 'Get routes by school',
    description: 'Returns all transportation routes for a specific school.',
  })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiQuery({ name: 'routeType', required: false, enum: Object.values(RouteType) })
  @ApiQuery({ name: 'status', required: false, enum: Object.values(RouteStatus) })
  @ApiResponse({
    status: 200,
    description: 'Routes retrieved successfully',
  })
  async getRoutes(
    @Query('schoolId') schoolId: string,
    @Query('routeType') routeType?: RouteType,
    @Query('status') status?: RouteStatus,
  ) {
    return this.routeService.getRoutesBySchool(schoolId, { routeType, status });
  }

  @Get('routes/:routeId/analytics')
  @ApiOperation({
    summary: 'Get route analytics',
    description: 'Returns detailed analytics for a specific route.',
  })
  @ApiParam({ name: 'routeId', description: 'Route ID' })
  @ApiResponse({
    status: 200,
    description: 'Route analytics retrieved successfully',
  })
  async getRouteAnalyticsById(@Param('routeId') routeId: string) {
    return this.routeService.getRouteAnalytics(routeId);
  }

  // ==================== VEHICLE MANAGEMENT ====================

  @Post('vehicles')
  @ApiOperation({
    summary: 'Create new vehicle',
    description: 'Creates a new vehicle in the transportation fleet.',
  })
  @ApiBody({
    description: 'Vehicle creation data',
    schema: {
      type: 'object',
      required: ['schoolId', 'vehicleName', 'vehicleCode', 'registrationNumber', 'capacity'],
      properties: {
        schoolId: { type: 'string' },
        vehicleName: { type: 'string' },
        vehicleCode: { type: 'string' },
        registrationNumber: { type: 'string' },
        vehicleType: { type: 'string', enum: ['bus', 'van', 'mini_bus', 'car'] },
        capacity: { type: 'number' },
        fuelType: { type: 'string', enum: Object.values(FuelType) },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Vehicle created successfully',
  })
  async createVehicle(@Body() vehicleData: Partial<Vehicle>) {
    return this.vehicleService.createVehicle(vehicleData);
  }

  @Get('vehicles')
  @ApiOperation({
    summary: 'Get vehicles by school',
    description: 'Returns all vehicles for a specific school.',
  })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiQuery({ name: 'status', required: false, enum: Object.values(VehicleStatus) })
  @ApiResponse({
    status: 200,
    description: 'Vehicles retrieved successfully',
  })
  async getVehicles(
    @Query('schoolId') schoolId: string,
    @Query('status') status?: VehicleStatus,
  ) {
    return this.vehicleService.getVehiclesBySchool(schoolId, { status });
  }

  @Put('vehicles/:vehicleId/status')
  @ApiOperation({
    summary: 'Update vehicle status',
    description: 'Updates the status of a vehicle (active, maintenance, etc.).',
  })
  @ApiParam({ name: 'vehicleId', description: 'Vehicle ID' })
  @ApiBody({
    description: 'Status update data',
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: { type: 'string', enum: Object.values(VehicleStatus) },
        reason: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Vehicle status updated successfully',
  })
  async updateVehicleStatus(
    @Param('vehicleId') vehicleId: string,
    @Body() statusData: { status: VehicleStatus; reason?: string },
  ) {
    return this.vehicleService.updateVehicleStatus(vehicleId, statusData.status, statusData.reason);
  }

  // ==================== DRIVER MANAGEMENT ====================

  @Post('drivers')
  @ApiOperation({
    summary: 'Create new driver',
    description: 'Creates a new driver in the transportation system.',
  })
  @ApiBody({
    description: 'Driver creation data',
    schema: {
      type: 'object',
      required: ['schoolId', 'employeeId', 'firstName', 'lastName', 'phoneNumber', 'licenseNumber'],
      properties: {
        schoolId: { type: 'string' },
        employeeId: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        phoneNumber: { type: 'string' },
        licenseNumber: { type: 'string' },
        licenseType: { type: 'string', enum: Object.values(LicenseType) },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Driver created successfully',
  })
  async createDriver(@Body() driverData: Partial<Driver>) {
    return this.driverService.createDriver(driverData);
  }

  @Get('drivers')
  @ApiOperation({
    summary: 'Get drivers by school',
    description: 'Returns all drivers for a specific school.',
  })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiQuery({ name: 'status', required: false, enum: Object.values(DriverStatus) })
  @ApiResponse({
    status: 200,
    description: 'Drivers retrieved successfully',
  })
  async getDrivers(
    @Query('schoolId') schoolId: string,
    @Query('status') status?: DriverStatus,
  ) {
    return this.driverService.getDriversBySchool(schoolId, { status });
  }

  // ==================== STUDENT TRANSPORT MANAGEMENT ====================

  @Post('student-transports')
  @ApiOperation({
    summary: 'Assign student transport',
    description: 'Assigns transportation to a student with route and stop details.',
  })
  @ApiBody({
    description: 'Student transport assignment data',
    schema: {
      type: 'object',
      required: ['studentId', 'routeId', 'pickupStopId', 'dropoffStopId'],
      properties: {
        studentId: { type: 'string' },
        routeId: { type: 'string' },
        pickupStopId: { type: 'string' },
        dropoffStopId: { type: 'string' },
        transportType: { type: 'string', enum: Object.values(TransportType) },
        specialRequirements: { type: 'string' },
        emergencyContacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              phone: { type: 'string' },
              relationship: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Student transport assigned successfully',
  })
  async assignStudentTransport(@Body() transportData: any) {
    return this.studentTransportService.assignStudentTransport(transportData);
  }

  @Get('student-transports')
  @ApiOperation({
    summary: 'Get student transports',
    description: 'Returns transportation assignments for students.',
  })
  @ApiQuery({ name: 'studentId', required: false })
  @ApiQuery({ name: 'routeId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: Object.values(TransportStatus) })
  @ApiResponse({
    status: 200,
    description: 'Student transports retrieved successfully',
  })
  async getStudentTransports(
    @Query('studentId') studentId?: string,
    @Query('routeId') routeId?: string,
    @Query('status') status?: TransportStatus,
  ) {
    if (studentId) {
      return this.studentTransportService.getStudentTransports(studentId);
    } else if (routeId) {
      return this.studentTransportService.getActiveTransportsByRoute(routeId);
    }
    // Return all active transports if no specific filter
    return this.studentTransportService.getTransportsByDateRange(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      new Date()
    );
  }

  // ==================== ANALYTICS & REPORTING ====================

  @Get('analytics/routes')
  @ApiOperation({
    summary: 'Get route analytics overview',
    description: 'Returns comprehensive analytics for all routes in a school.',
  })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Route analytics retrieved successfully',
  })
  async getRouteAnalytics(@Query('schoolId') schoolId: string) {
    const routes = await this.routeService.getRoutesBySchool(schoolId);
    const analytics = await Promise.all(
      routes.map(route => this.routeService.getRouteAnalytics(route.id))
    );

    return {
      totalRoutes: routes.length,
      activeRoutes: routes.filter(r => r.status === 'active').length,
      totalCapacity: routes.reduce((sum, r) => sum + r.capacity, 0),
      totalOccupancy: routes.reduce((sum, r) => sum + r.currentOccupancy, 0),
      averageOccupancyRate: routes.length > 0
        ? routes.reduce((sum, r) => sum + (r.capacity > 0 ? r.currentOccupancy / r.capacity : 0), 0) / routes.length * 100
        : 0,
      routeDetails: analytics,
    };
  }

  @Get('analytics/vehicles')
  @ApiOperation({
    summary: 'Get vehicle analytics overview',
    description: 'Returns comprehensive analytics for all vehicles in a school.',
  })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Vehicle analytics retrieved successfully',
  })
  async getVehicleAnalytics(@Query('schoolId') schoolId: string) {
    const vehicles = await this.vehicleService.getVehiclesBySchool(schoolId);
    const analytics = await Promise.all(
      vehicles.map(vehicle => this.vehicleService.getVehicleAnalytics(vehicle.id))
    );

    return {
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.status === 'active').length,
      maintenanceVehicles: vehicles.filter(v => v.status === 'maintenance').length,
      totalCapacity: vehicles.reduce((sum, v) => sum + v.capacity, 0),
      totalOccupancy: vehicles.reduce((sum, v) => sum + v.currentOccupancy, 0),
      averageUtilization: vehicles.length > 0
        ? vehicles.reduce((sum, v) => sum + (v.capacity > 0 ? v.currentOccupancy / v.capacity : 0), 0) / vehicles.length * 100
        : 0,
      vehicleDetails: analytics,
    };
  }

  @Get('analytics/drivers')
  @ApiOperation({
    summary: 'Get driver analytics overview',
    description: 'Returns comprehensive analytics for all drivers in a school.',
  })
  @ApiQuery({ name: 'schoolId', required: true })
  @ApiResponse({
    status: 200,
    description: 'Driver analytics retrieved successfully',
  })
  async getDriverAnalytics(@Query('schoolId') schoolId: string) {
    const drivers = await this.driverService.getDriversBySchool(schoolId);
    const analytics = await Promise.all(
      drivers.map(driver => this.driverService.getDriverAnalytics(driver.id))
    );

    return {
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter(d => d.status === 'active').length,
      averageExperience: drivers.length > 0
        ? drivers.reduce((sum, d) => sum + d.yearsOfExperience, 0) / drivers.length
        : 0,
      averageRating: analytics.length > 0
        ? analytics.reduce((sum, a) => sum + a.performanceMetrics.averageRating, 0) / analytics.length
        : 0,
      driverDetails: analytics,
    };
  }
}