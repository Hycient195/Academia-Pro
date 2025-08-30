// Academia Pro - Transportation Analytics Controller
// REST API endpoints for transportation analytics and reporting

import { Controller, Get, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RouteService } from '../services/route.service';
import { VehicleService } from '../services/vehicle.service';
import { DriverService } from '../services/driver.service';
import { StudentTransportService } from '../services/student-transport.service';
import { StudentPortalGuard } from '../../student-portal/guards/student-portal.guard';

@ApiTags('Transportation - Analytics')
@Controller('transportation/analytics')
@UseGuards(StudentPortalGuard)
export class TransportationAnalyticsController {
  private readonly logger = new Logger(TransportationAnalyticsController.name);

  constructor(
    private readonly routeService: RouteService,
    private readonly vehicleService: VehicleService,
    private readonly driverService: DriverService,
    private readonly transportService: StudentTransportService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get transportation dashboard',
    description: 'Retrieve comprehensive transportation dashboard data',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Transportation dashboard data retrieved successfully',
  })
  async getTransportationDashboard(@Query('schoolId') schoolId: string) {
    this.logger.log(`Getting transportation dashboard for school: ${schoolId}`);

    // Get all analytics data
    const [routeAnalytics, vehicleAnalytics, driverAnalytics, transportAnalytics] = await Promise.all([
      this.getRouteAnalytics(schoolId),
      this.vehicleService.getFleetAnalytics(schoolId),
      this.driverService.getDriverFleetAnalytics(schoolId),
      this.transportService.getTransportAnalytics(schoolId),
    ]);

    return {
      schoolId,
      generatedAt: new Date(),
      summary: {
        totalRoutes: routeAnalytics.totalRoutes,
        activeRoutes: routeAnalytics.activeRoutes,
        totalVehicles: vehicleAnalytics.totalVehicles,
        activeVehicles: vehicleAnalytics.activeVehicles,
        totalDrivers: driverAnalytics.totalDrivers,
        activeDrivers: driverAnalytics.activeDrivers,
        totalTransports: transportAnalytics.totalTransports,
        activeTransports: transportAnalytics.activeTransports,
      },
      performance: {
        routeUtilization: routeAnalytics.averageUtilization,
        vehicleUtilization: vehicleAnalytics.fleetUtilization,
        driverPerformance: driverAnalytics.averageRating,
        transportEfficiency: transportAnalytics.completionRate,
      },
      alerts: await this.getSystemAlerts(schoolId),
    };
  }

  @Get('routes')
  @ApiOperation({
    summary: 'Get route analytics',
    description: 'Retrieve comprehensive route analytics',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Route analytics retrieved successfully',
  })
  async getRouteAnalytics(schoolId: string) {
    this.logger.log(`Getting route analytics for school: ${schoolId}`);

    const routes = await this.routeService.getRoutes(schoolId);
    const totalRoutes = routes.length;
    const activeRoutes = routes.filter(r => r.status === 'active').length;
    const totalCapacity = routes.reduce((sum, r) => sum + r.capacity, 0);
    const totalOccupancy = routes.reduce((sum, r) => sum + r.currentOccupancy, 0);

    return {
      totalRoutes,
      activeRoutes,
      inactiveRoutes: totalRoutes - activeRoutes,
      totalCapacity,
      totalOccupancy,
      averageUtilization: totalCapacity > 0 ? (totalOccupancy / totalCapacity) * 100 : 0,
      routesByType: routes.reduce((acc, route) => {
        acc[route.routeType] = (acc[route.routeType] || 0) + 1;
        return acc;
      }, {}),
      routesByStatus: routes.reduce((acc, route) => {
        acc[route.status] = (acc[route.status] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  @Get('performance')
  @ApiOperation({
    summary: 'Get transportation performance metrics',
    description: 'Retrieve transportation performance and efficiency metrics',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiQuery({ name: 'period', required: false, description: 'Analysis period (7d, 30d, 90d)', example: '30d' })
  @ApiResponse({
    status: 200,
    description: 'Performance metrics retrieved successfully',
  })
  async getPerformanceMetrics(
    @Query('schoolId') schoolId: string,
    @Query('period') period: string = '30d',
  ) {
    this.logger.log(`Getting performance metrics for school: ${schoolId}, period: ${period}`);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    startDate.setDate(endDate.getDate() - days);

    // Get transport analytics for the period
    const transportAnalytics = await this.transportService.getTransportAnalytics(schoolId);

    return {
      schoolId,
      period,
      dateRange: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      metrics: {
        onTimePerformance: transportAnalytics.completionRate,
        averageDelay: transportAnalytics.averageDelayMinutes,
        transportUtilization: transportAnalytics.activeTransports / transportAnalytics.totalTransports * 100,
        safetyIncidents: 0, // Would be calculated from incident reports
        parentSatisfaction: 0, // Would be calculated from feedback
        costEfficiency: 0, // Would be calculated from cost data
      },
      trends: {
        transportVolume: 'stable', // Would analyze historical data
        performanceTrend: 'improving', // Would analyze historical data
        utilizationTrend: 'increasing', // Would analyze historical data
      },
    };
  }

  @Get('reports/daily')
  @ApiOperation({
    summary: 'Get daily transportation report',
    description: 'Retrieve daily transportation operations report',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiQuery({ name: 'date', required: false, description: 'Report date (YYYY-MM-DD)' })
  @ApiResponse({
    status: 200,
    description: 'Daily report retrieved successfully',
  })
  async getDailyReport(
    @Query('schoolId') schoolId: string,
    @Query('date') dateString?: string,
  ) {
    const reportDate = dateString ? new Date(dateString) : new Date();
    this.logger.log(`Getting daily report for school: ${schoolId} on ${reportDate.toDateString()}`);

    const schedule = await this.transportService.getTransportSchedule(schoolId, reportDate);

    return {
      schoolId,
      reportDate: reportDate.toISOString().split('T')[0],
      summary: {
        totalRoutes: schedule.length,
        totalPickups: schedule.reduce((sum, route: any) => sum + route.pickups.length, 0),
        totalDropoffs: schedule.reduce((sum, route: any) => sum + route.dropoffs.length, 0),
        completedPickups: 0, // Would be calculated from actual data
        completedDropoffs: 0, // Would be calculated from actual data
      },
      routes: schedule,
      issues: [], // Would include delays, no-shows, etc.
      recommendations: [], // Would include optimization suggestions
    };
  }

  @Get('reports/maintenance')
  @ApiOperation({
    summary: 'Get maintenance report',
    description: 'Retrieve vehicle and equipment maintenance report',
  })
  @ApiQuery({ name: 'schoolId', required: true, description: 'School identifier' })
  @ApiResponse({
    status: 200,
    description: 'Maintenance report retrieved successfully',
  })
  async getMaintenanceReport(@Query('schoolId') schoolId: string) {
    this.logger.log(`Getting maintenance report for school: ${schoolId}`);

    const vehicleAnalytics = await this.vehicleService.getFleetAnalytics(schoolId);

    return {
      schoolId,
      generatedAt: new Date(),
      fleetStatus: {
        totalVehicles: vehicleAnalytics.totalVehicles,
        activeVehicles: vehicleAnalytics.activeVehicles,
        maintenanceVehicles: vehicleAnalytics.maintenanceVehicles,
        maintenanceRate: vehicleAnalytics.maintenanceRate,
      },
      upcomingMaintenance: [], // Would list vehicles due for maintenance
      maintenanceHistory: [], // Would include recent maintenance activities
      costAnalysis: {
        averageMaintenanceCost: 0, // Would be calculated from maintenance data
        maintenanceCostPerKm: 0, // Would be calculated from mileage data
        maintenanceFrequency: 0, // Average days between maintenance
      },
    };
  }

  private async getSystemAlerts(schoolId: string): Promise<any[]> {
    const alerts = [];

    // Check for expiring licenses
    try {
      const driversExpiringLicenses = await this.driverService.getDriversByLicenseExpiry(schoolId, 30);
      if (driversExpiringLicenses.length > 0) {
        alerts.push({
          type: 'warning',
          category: 'compliance',
          message: `${driversExpiringLicenses.length} driver licenses expiring within 30 days`,
          count: driversExpiringLicenses.length,
        });
      }
    } catch (error) {
      this.logger.error('Error checking driver licenses:', error);
    }

    // Check for vehicles needing maintenance
    try {
      const vehicleAnalytics = await this.vehicleService.getFleetAnalytics(schoolId);
      if (vehicleAnalytics.maintenanceRate > 20) {
        alerts.push({
          type: 'warning',
          category: 'maintenance',
          message: `${vehicleAnalytics.maintenanceVehicles} vehicles currently under maintenance`,
          count: vehicleAnalytics.maintenanceVehicles,
        });
      }
    } catch (error) {
      this.logger.error('Error checking vehicle maintenance:', error);
    }

    // Check for overdue transports
    try {
      const transportAnalytics = await this.transportService.getTransportAnalytics(schoolId);
      if (transportAnalytics.averageDelayMinutes > 15) {
        alerts.push({
          type: 'error',
          category: 'performance',
          message: `Average transport delay: ${transportAnalytics.averageDelayMinutes} minutes`,
          count: transportAnalytics.averageDelayMinutes,
        });
      }
    } catch (error) {
      this.logger.error('Error checking transport delays:', error);
    }

    return alerts;
  }
}