// Academia Pro - Vehicle Service
// Service for managing transportation vehicles

import { Injectable, Logger, NotFoundException, BadRequestException, } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Vehicle, VehicleType, VehicleStatus, FuelType } from '../entities/vehicle.entity';
import { TransportRoute } from '../entities/route.entity';
import { Driver } from '../entities/driver.entity';

export interface VehicleMaintenanceRequest {
  vehicleId: string;
  maintenanceType: string;
  description: string;
  estimatedCost: number;
  scheduledDate: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface FuelLogRequest {
  vehicleId: string;
  liters: number;
  cost: number;
  fuelStation: string;
  driverId: string;
  mileage: number;
}

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(TransportRoute)
    private routeRepository: Repository<TransportRoute>,
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    private dataSource: DataSource,
  ) {}

  async createVehicle(schoolId: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    this.logger.log(`Creating vehicle for school: ${schoolId}`);

    // Validate vehicle data
    if (!vehicleData.vehicleCode || !vehicleData.registrationNumber || !vehicleData.vehicleName) {
      throw new BadRequestException('Vehicle code, registration number, and name are required');
    }

    // Check for duplicate codes
    const existingCode = await this.vehicleRepository.findOne({
      where: { schoolId, vehicleCode: vehicleData.vehicleCode },
    });
    if (existingCode) {
      throw new BadRequestException('Vehicle code already exists');
    }

    const existingReg = await this.vehicleRepository.findOne({
      where: { schoolId, registrationNumber: vehicleData.registrationNumber },
    });
    if (existingReg) {
      throw new BadRequestException('Registration number already exists');
    }

    const vehicle = this.vehicleRepository.create({
      ...vehicleData,
      schoolId,
      status: VehicleStatus.ACTIVE,
      currentOccupancy: 0,
      currentFuelLevel: 100, // Assume full tank
    });

    return this.vehicleRepository.save(vehicle);
  }

  async getVehicles(schoolId: string, filters?: {
    status?: VehicleStatus;
    type?: VehicleType;
    assignedRoute?: string;
    assignedDriver?: string;
  }): Promise<Vehicle[]> {
    this.logger.log(`Getting vehicles for school: ${schoolId}`);

    const query = this.vehicleRepository.createQueryBuilder('vehicle')
      .where('vehicle.schoolId = :schoolId', { schoolId });

    if (filters?.status) {
      query.andWhere('vehicle.status = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('vehicle.vehicleType = :type', { type: filters.type });
    }

    if (filters?.assignedRoute) {
      query.andWhere('vehicle.assignedRouteId = :routeId', { routeId: filters.assignedRoute });
    }

    if (filters?.assignedDriver) {
      query.andWhere('vehicle.assignedDriverId = :driverId', { driverId: filters.assignedDriver });
    }

    return query.getMany();
  }

  async getVehicleById(schoolId: string, vehicleId: string): Promise<Vehicle> {
    this.logger.log(`Getting vehicle ${vehicleId} for school: ${schoolId}`);

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, schoolId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  async updateVehicle(schoolId: string, vehicleId: string, updateData: Partial<Vehicle>): Promise<Vehicle> {
    this.logger.log(`Updating vehicle ${vehicleId} for school: ${schoolId}`);

    const vehicle = await this.getVehicleById(schoolId, vehicleId);

    // Check for duplicate codes if updating
    if (updateData.vehicleCode && updateData.vehicleCode !== vehicle.vehicleCode) {
      const existingCode = await this.vehicleRepository.findOne({
        where: { schoolId, vehicleCode: updateData.vehicleCode },
      });
      if (existingCode) {
        throw new BadRequestException('Vehicle code already exists');
      }
    }

    if (updateData.registrationNumber && updateData.registrationNumber !== vehicle.registrationNumber) {
      const existingReg = await this.vehicleRepository.findOne({
        where: { schoolId, registrationNumber: updateData.registrationNumber },
      });
      if (existingReg) {
        throw new BadRequestException('Registration number already exists');
      }
    }

    Object.assign(vehicle, updateData);
    return this.vehicleRepository.save(vehicle);
  }

  async deleteVehicle(schoolId: string, vehicleId: string): Promise<void> {
    this.logger.log(`Deleting vehicle ${vehicleId} for school: ${schoolId}`);

    const vehicle = await this.getVehicleById(schoolId, vehicleId);

    // Check if vehicle has active assignments
    if (vehicle.assignedDriverId || vehicle.assignedRouteId) {
      throw new BadRequestException('Cannot delete vehicle with active assignments');
    }

    await this.vehicleRepository.remove(vehicle);
  }

  async assignVehicle(vehicleId: string, assignment: { driverId?: string; routeId?: string }): Promise<Vehicle> {
    this.logger.log(`Assigning vehicle ${vehicleId}`);

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Validate driver assignment
    if (assignment.driverId) {
      const driver = await this.driverRepository.findOne({
        where: { id: assignment.driverId },
      });
      if (!driver) {
        throw new NotFoundException('Driver not found');
      }
      if (driver.status !== 'active') {
        throw new BadRequestException('Driver is not active');
      }
    }

    // Validate route assignment
    if (assignment.routeId) {
      const route = await this.routeRepository.findOne({
        where: { id: assignment.routeId },
      });
      if (!route) {
        throw new NotFoundException('Route not found');
      }
      if (route.status !== 'active') {
        throw new BadRequestException('Route is not active');
      }
    }

    vehicle.assignedDriverId = assignment.driverId || vehicle.assignedDriverId;
    vehicle.assignedRouteId = assignment.routeId || vehicle.assignedRouteId;

    return this.vehicleRepository.save(vehicle);
  }

  async updateVehicleLocation(vehicleId: string, location: {
    latitude: number;
    longitude: number;
    address: string;
    speed?: number;
    heading?: number;
  }): Promise<Vehicle> {
    this.logger.log(`Updating location for vehicle ${vehicleId}`);

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    vehicle.currentLocation = {
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address,
      lastUpdated: new Date(),
      speed: location.speed || 0,
      heading: location.heading || 0,
    };

    return this.vehicleRepository.save(vehicle);
  }

  async logFuelConsumption(request: FuelLogRequest): Promise<Vehicle> {
    this.logger.log(`Logging fuel consumption for vehicle ${request.vehicleId}`);

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: request.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Update fuel level
    const fuelEfficiency = request.mileage > 0 ? (request.liters / request.mileage) * 100 : 0;
    const newFuelLevel = Math.max(0, vehicle.currentFuelLevel - (request.liters / vehicle.fuelCapacity * 100));

    // Add to fuel history
    const fuelEntry = {
      date: new Date(),
      liters: request.liters,
      cost: request.cost,
      mileage: request.mileage,
      fuelStation: request.fuelStation,
      driverId: request.driverId,
    };

    vehicle.fuelHistory = vehicle.fuelHistory || [];
    vehicle.fuelHistory.push(fuelEntry);
    vehicle.currentFuelLevel = newFuelLevel;
    vehicle.mileage += request.mileage;

    // Update performance metrics
    vehicle.performanceMetrics = vehicle.performanceMetrics || {
      totalTrips: 0,
      totalDistance: 0,
      averageFuelEfficiency: 0,
      averageSpeed: 0,
      onTimeRate: 0,
      safetyIncidents: 0,
      maintenanceCostPerKm: 0,
    };

    vehicle.performanceMetrics.totalDistance += request.mileage;
    vehicle.performanceMetrics.averageFuelEfficiency = fuelEfficiency;

    return this.vehicleRepository.save(vehicle);
  }

  async scheduleMaintenance(request: VehicleMaintenanceRequest): Promise<Vehicle> {
    this.logger.log(`Scheduling maintenance for vehicle ${request.vehicleId}`);

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: request.vehicleId },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Add to maintenance history
    const maintenanceEntry = {
      date: new Date(),
      type: request.maintenanceType,
      description: request.description,
      cost: request.estimatedCost,
      mileage: vehicle.mileage,
      performedBy: 'Scheduled',
      nextServiceDue: request.scheduledDate,
    };

    vehicle.maintenanceHistory = vehicle.maintenanceHistory || [];
    vehicle.maintenanceHistory.push(maintenanceEntry);
    vehicle.nextServiceDate = request.scheduledDate;

    // Update status if critical maintenance
    if (request.priority === 'critical') {
      vehicle.status = VehicleStatus.MAINTENANCE;
    }

    return this.vehicleRepository.save(vehicle);
  }

  async getVehicleAnalytics(schoolId: string, vehicleId: string): Promise<any> {
    this.logger.log(`Getting analytics for vehicle ${vehicleId}`);

    const vehicle = await this.getVehicleById(schoolId, vehicleId);

    // Calculate analytics from maintenance and fuel history
    const maintenanceHistory = vehicle.maintenanceHistory || [];
    const fuelHistory = vehicle.fuelHistory || [];

    const totalMaintenanceCost = maintenanceHistory.reduce((sum, m) => sum + (m.cost || 0), 0);
    const totalFuelCost = fuelHistory.reduce((sum, f) => sum + f.cost, 0);
    const totalDistance = vehicle.performanceMetrics?.totalDistance || 0;

    return {
      vehicleId,
      vehicleName: vehicle.vehicleName,
      totalDistance,
      totalMaintenanceCost,
      totalFuelCost,
      maintenanceCostPerKm: totalDistance > 0 ? totalMaintenanceCost / totalDistance : 0,
      fuelCostPerKm: totalDistance > 0 ? totalFuelCost / totalDistance : 0,
      averageFuelEfficiency: vehicle.performanceMetrics?.averageFuelEfficiency || 0,
      maintenanceFrequency: maintenanceHistory.length,
      nextServiceDue: vehicle.nextServiceDate,
      currentFuelLevel: vehicle.currentFuelLevel,
      utilizationRate: 0, // Would be calculated from trip data
    };
  }

  async getFleetAnalytics(schoolId: string): Promise<any> {
    this.logger.log(`Getting fleet analytics for school: ${schoolId}`);

    const vehicles = await this.getVehicles(schoolId);

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter(v => v.status === VehicleStatus.ACTIVE).length;
    const maintenanceVehicles = vehicles.filter(v => v.status === VehicleStatus.MAINTENANCE).length;

    const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity, 0);
    const totalMileage = vehicles.reduce((sum, v) => sum + v.mileage, 0);

    return {
      totalVehicles,
      activeVehicles,
      maintenanceVehicles,
      totalCapacity,
      averageMileage: totalVehicles > 0 ? totalMileage / totalVehicles : 0,
      fleetUtilization: 0, // Would be calculated from actual usage data
      maintenanceRate: totalVehicles > 0 ? (maintenanceVehicles / totalVehicles) * 100 : 0,
      vehicleTypes: vehicles.reduce((acc, v) => {
        acc[v.vehicleType] = (acc[v.vehicleType] || 0) + 1;
        return acc;
      }, {}),
    };
  }
}