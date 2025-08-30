// Academia Pro - Route Service
// Service for managing transportation routes

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TransportRoute, RouteType, RouteStatus } from '../entities/route.entity';
import { TransportStop } from '../entities/transport-stop.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Driver } from '../entities/driver.entity';

export interface RouteOptimizationRequest {
  schoolId: string;
  stops: Array<{
    latitude: number;
    longitude: number;
    address: string;
    estimatedStudents: number;
  }>;
  constraints: {
    maxDistance?: number;
    maxDuration?: number;
    maxCapacity?: number;
    vehicleType?: string;
  };
}

export interface RouteAssignmentRequest {
  routeId: string;
  vehicleId?: string;
  driverId?: string;
}

@Injectable()
export class RouteService {
  private readonly logger = new Logger(RouteService.name);

  constructor(
    @InjectRepository(TransportRoute)
    private routeRepository: Repository<TransportRoute>,
    @InjectRepository(TransportStop)
    private stopRepository: Repository<TransportStop>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    private dataSource: DataSource,
  ) {}

  async createRoute(schoolId: string, routeData: Partial<TransportRoute>): Promise<TransportRoute> {
    this.logger.log(`Creating route for school: ${schoolId}`);

    // Validate route data
    if (!routeData.routeName || !routeData.startLocation || !routeData.endLocation) {
      throw new BadRequestException('Route name, start location, and end location are required');
    }

    // Check for duplicate route code
    if (routeData.routeCode) {
      const existingRoute = await this.routeRepository.findOne({
        where: { schoolId, routeCode: routeData.routeCode },
      });
      if (existingRoute) {
        throw new BadRequestException('Route code already exists');
      }
    }

    const route = this.routeRepository.create({
      ...routeData,
      schoolId,
      status: RouteStatus.ACTIVE,
    });

    return this.routeRepository.save(route);
  }

  async getRoutes(schoolId: string, filters?: {
    status?: RouteStatus;
    type?: RouteType;
    vehicleId?: string;
    driverId?: string;
  }): Promise<TransportRoute[]> {
    this.logger.log(`Getting routes for school: ${schoolId}`);

    const query = this.routeRepository.createQueryBuilder('route')
      .where('route.schoolId = :schoolId', { schoolId });

    if (filters?.status) {
      query.andWhere('route.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('route.routeType = :type', { type: filters.type });
    }

    if (filters?.vehicleId) {
      query.andWhere('route.assignedVehicleId = :vehicleId', { vehicleId: filters.vehicleId });
    }

    if (filters?.driverId) {
      query.andWhere('route.assignedDriverId = :driverId', { driverId: filters.driverId });
    }

    return query.getMany();
  }

  async getRouteById(schoolId: string, routeId: string): Promise<TransportRoute> {
    this.logger.log(`Getting route ${routeId} for school: ${schoolId}`);

    const route = await this.routeRepository.findOne({
      where: { id: routeId, schoolId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    return route;
  }

  async updateRoute(schoolId: string, routeId: string, updateData: Partial<TransportRoute>): Promise<TransportRoute> {
    this.logger.log(`Updating route ${routeId} for school: ${schoolId}`);

    const route = await this.getRouteById(schoolId, routeId);

    // Check for duplicate route code if updating
    if (updateData.routeCode && updateData.routeCode !== route.routeCode) {
      const existingRoute = await this.routeRepository.findOne({
        where: { schoolId, routeCode: updateData.routeCode },
      });
      if (existingRoute) {
        throw new BadRequestException('Route code already exists');
      }
    }

    Object.assign(route, updateData);
    return this.routeRepository.save(route);
  }

  async deleteRoute(schoolId: string, routeId: string): Promise<void> {
    this.logger.log(`Deleting route ${routeId} for school: ${schoolId}`);

    const route = await this.getRouteById(schoolId, routeId);

    // Check if route has active assignments
    if (route.assignedVehicleId || route.assignedDriverId) {
      throw new BadRequestException('Cannot delete route with active assignments');
    }

    await this.routeRepository.remove(route);
  }

  async assignRoute(request: RouteAssignmentRequest): Promise<TransportRoute> {
    this.logger.log(`Assigning route ${request.routeId}`);

    const route = await this.routeRepository.findOne({
      where: { id: request.routeId },
    });

    if (!route) {
      throw new NotFoundException('Route not found');
    }

    // Validate vehicle assignment
    if (request.vehicleId) {
      const vehicle = await this.vehicleRepository.findOne({
        where: { id: request.vehicleId },
      });
      if (!vehicle) {
        throw new NotFoundException('Vehicle not found');
      }
      if (vehicle.status !== 'active') {
        throw new BadRequestException('Vehicle is not active');
      }
    }

    // Validate driver assignment
    if (request.driverId) {
      const driver = await this.driverRepository.findOne({
        where: { id: request.driverId },
      });
      if (!driver) {
        throw new NotFoundException('Driver not found');
      }
      if (driver.status !== 'active') {
        throw new BadRequestException('Driver is not active');
      }
    }

    route.assignedVehicleId = request.vehicleId || route.assignedVehicleId;
    route.assignedDriverId = request.driverId || route.assignedDriverId;

    return this.routeRepository.save(route);
  }

  async optimizeRoute(request: RouteOptimizationRequest): Promise<TransportRoute> {
    this.logger.log(`Optimizing route for school: ${request.schoolId}`);

    // This would integrate with a routing optimization service
    // For now, we'll create a basic optimized route

    const stops = request.stops;
    if (stops.length < 2) {
      throw new BadRequestException('At least 2 stops are required for route optimization');
    }

    // Calculate basic route metrics
    const totalDistance = this.calculateTotalDistance(stops);
    const estimatedDuration = Math.ceil(totalDistance / 30) * 60; // Assume 30 km/h average speed
    const totalStudents = stops.reduce((sum, stop) => sum + stop.estimatedStudents, 0);

    // Create optimized route
    const routeData = {
      routeCode: `OPT-${Date.now()}`,
      routeName: `Optimized Route - ${stops.length} stops`,
      routeType: RouteType.ROUND_TRIP,
      startLocation: stops[0].address,
      endLocation: stops[stops.length - 1].address,
      distanceKm: totalDistance,
      estimatedDurationMinutes: estimatedDuration,
      capacity: Math.max(totalStudents + 5, 20), // Add buffer capacity
      routeCoordinates: {
        waypoints: stops.map((stop, index) => ({
          latitude: stop.latitude,
          longitude: stop.longitude,
          address: stop.address,
          stopOrder: index + 1,
          estimatedArrival: this.calculateEstimatedArrival(index, estimatedDuration, stops.length),
        })),
      },
    };

    return this.createRoute(request.schoolId, routeData);
  }

  async getRouteAnalytics(schoolId: string, routeId: string): Promise<any> {
    this.logger.log(`Getting analytics for route ${routeId}`);

    const route = await this.getRouteById(schoolId, routeId);

    // This would aggregate data from trip logs, student transports, etc.
    // For now, return basic analytics

    return {
      routeId,
      routeName: route.routeName,
      totalTrips: 0, // Would be calculated from trip logs
      onTimeRate: 0, // Would be calculated from actual vs estimated times
      averageOccupancy: 0, // Would be calculated from student transport data
      fuelEfficiency: 0, // Would be calculated from vehicle fuel data
      safetyIncidents: 0, // Would be tracked from incident reports
      studentSatisfaction: 0, // Would be calculated from feedback
    };
  }

  private calculateTotalDistance(stops: Array<{ latitude: number; longitude: number }>): number {
    let totalDistance = 0;
    for (let i = 0; i < stops.length - 1; i++) {
      totalDistance += this.calculateDistance(
        stops[i].latitude,
        stops[i].longitude,
        stops[i + 1].latitude,
        stops[i + 1].longitude
      );
    }
    return Math.round(totalDistance * 100) / 100; // Round to 2 decimal places
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private calculateEstimatedArrival(stopIndex: number, totalDuration: number, totalStops: number): string {
    const timePerStop = totalDuration / totalStops;
    const estimatedMinutes = stopIndex * timePerStop;
    const hours = Math.floor(estimatedMinutes / 60);
    const minutes = Math.floor(estimatedMinutes % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
  }
}