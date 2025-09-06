// Academia Pro - Driver Service
// Service for managing transportation drivers

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Driver, DriverStatus, LicenseType } from '../entities/driver.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { TransportRoute } from '../entities/route.entity';

export interface DriverAssignmentRequest {
  driverId: string;
  vehicleId?: string;
  routeId?: string;
}

export interface DriverTrainingRequest {
  driverId: string;
  trainingName: string;
  trainingDate: Date;
  completionDate?: Date;
  trainer: string;
  score?: number;
}

@Injectable()
export class DriverService {
  private readonly logger = new Logger(DriverService.name);

  constructor(
    @InjectRepository(Driver)
    private driverRepository: Repository<Driver>,
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(TransportRoute)
    private routeRepository: Repository<TransportRoute>,
    private dataSource: DataSource,
  ) {}

  async createDriver(schoolId: string, driverData: Partial<Driver>): Promise<Driver> {
    this.logger.log(`Creating driver for school: ${schoolId}`);

    // Validate driver data
    if (!driverData.driverCode || !driverData.firstName || !driverData.lastName || !driverData.licenseNumber) {
      throw new BadRequestException('Driver code, name, and license number are required');
    }

    // Check for duplicate codes and license
    const existingCode = await this.driverRepository.findOne({
      where: { schoolId, driverCode: driverData.driverCode },
    });
    if (existingCode) {
      throw new BadRequestException('Driver code already exists');
    }

    const existingLicense = await this.driverRepository.findOne({
      where: { schoolId, licenseNumber: driverData.licenseNumber },
    });
    if (existingLicense) {
      throw new BadRequestException('License number already exists');
    }

    const driver = this.driverRepository.create({
      ...driverData,
      schoolId,
      fullName: `${driverData.firstName} ${driverData.middleName ? driverData.middleName + ' ' : ''}${driverData.lastName}`,
      status: DriverStatus.ACTIVE,
    });

    return this.driverRepository.save(driver);
  }

  async getDrivers(schoolId: string, filters?: {
    status?: DriverStatus;
    licenseType?: LicenseType;
    assignedVehicle?: string;
    assignedRoute?: string;
  }): Promise<Driver[]> {
    this.logger.log(`Getting drivers for school: ${schoolId}`);

    const query = this.driverRepository.createQueryBuilder('driver')
      .where('driver.schoolId = :schoolId', { schoolId });

    if (filters?.status) {
      query.andWhere('driver.status = :status', { status: filters.status });
    }

    if (filters?.licenseType) {
      query.andWhere('driver.licenseType = :licenseType', { licenseType: filters.licenseType });
    }

    if (filters?.assignedVehicle) {
      query.andWhere('driver.assignedVehicleId = :vehicleId', { vehicleId: filters.assignedVehicle });
    }

    if (filters?.assignedRoute) {
      query.andWhere('driver.assignedRouteId = :routeId', { routeId: filters.assignedRoute });
    }

    return query.getMany();
  }

  async getDriverById(schoolId: string, driverId: string): Promise<Driver> {
    this.logger.log(`Getting driver ${driverId} for school: ${schoolId}`);

    const driver = await this.driverRepository.findOne({
      where: { id: driverId, schoolId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    return driver;
  }

  async updateDriver(schoolId: string, driverId: string, updateData: Partial<Driver>): Promise<Driver> {
    this.logger.log(`Updating driver ${driverId} for school: ${schoolId}`);

    const driver = await this.getDriverById(schoolId, driverId);

    // Check for duplicate codes if updating
    if (updateData.driverCode && updateData.driverCode !== driver.driverCode) {
      const existingCode = await this.driverRepository.findOne({
        where: { schoolId, driverCode: updateData.driverCode },
      });
      if (existingCode) {
        throw new BadRequestException('Driver code already exists');
      }
    }

    if (updateData.licenseNumber && updateData.licenseNumber !== driver.licenseNumber) {
      const existingLicense = await this.driverRepository.findOne({
        where: { schoolId, licenseNumber: updateData.licenseNumber },
      });
      if (existingLicense) {
        throw new BadRequestException('License number already exists');
      }
    }

    // Update full name if first/last/middle name changed
    if (updateData.firstName || updateData.lastName || updateData.middleName !== undefined) {
      const firstName = updateData.firstName || driver.firstName;
      const lastName = updateData.lastName || driver.lastName;
      const middleName = updateData.middleName !== undefined ? updateData.middleName : driver.middleName;
      updateData.fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`;
    }

    Object.assign(driver, updateData);
    return this.driverRepository.save(driver);
  }

  async deleteDriver(schoolId: string, driverId: string): Promise<void> {
    this.logger.log(`Deleting driver ${driverId} for school: ${schoolId}`);

    const driver = await this.getDriverById(schoolId, driverId);

    // Check if driver has active assignments
    if (driver.assignedVehicleId || driver.assignedRouteId) {
      throw new BadRequestException('Cannot delete driver with active assignments');
    }

    await this.driverRepository.remove(driver);
  }

  async assignDriver(request: DriverAssignmentRequest): Promise<Driver> {
    this.logger.log(`Assigning driver ${request.driverId}`);

    const driver = await this.driverRepository.findOne({
      where: { id: request.driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
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

    // Validate route assignment
    if (request.routeId) {
      const route = await this.routeRepository.findOne({
        where: { id: request.routeId },
      });
      if (!route) {
        throw new NotFoundException('Route not found');
      }
      if (route.status !== 'active') {
        throw new BadRequestException('Route is not active');
      }
    }

    driver.assignedVehicleId = request.vehicleId || driver.assignedVehicleId;
    driver.assignedRouteId = request.routeId || driver.assignedRouteId;

    return this.driverRepository.save(driver);
  }

  async updateDriverLocation(driverId: string, location: {
    latitude: number;
    longitude: number;
    address: string;
    status: 'on_duty' | 'off_duty' | 'on_break';
  }): Promise<Driver> {
    this.logger.log(`Updating location for driver ${driverId}`);

    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    driver.currentLocation = {
      ...location,
      lastUpdated: new Date(),
    };

    return this.driverRepository.save(driver);
  }

  async addTrainingRecord(request: DriverTrainingRequest): Promise<Driver> {
    this.logger.log(`Adding training record for driver ${request.driverId}`);

    const driver = await this.driverRepository.findOne({
      where: { id: request.driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const trainingRecord = {
      trainingName: request.trainingName,
      trainingDate: request.trainingDate,
      completionDate: request.completionDate,
      trainer: request.trainer,
      status: (request.completionDate ? 'completed' : 'in_progress') as 'completed' | 'in_progress' | 'failed',
      score: request.score,
    };

    driver.trainingRecords = driver.trainingRecords || [];
    driver.trainingRecords.push(trainingRecord);

    return this.driverRepository.save(driver);
  }

  async updateMedicalCheck(driverId: string, medicalData: {
    lastMedicalCheck: Date;
    nextMedicalCheck: Date;
    medicalConditions?: string[];
    allergies?: string[];
    medications?: string[];
    fitnessToDrive: boolean;
    restrictions?: string[];
  }): Promise<Driver> {
    this.logger.log(`Updating medical check for driver ${driverId}`);

    const driver = await this.driverRepository.findOne({
      where: { id: driverId },
    });

    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    driver.medicalRecords = {
      ...driver.medicalRecords,
      ...medicalData,
    };

    return this.driverRepository.save(driver);
  }

  async getDriverAnalytics(schoolId: string, driverId: string): Promise<any> {
    this.logger.log(`Getting analytics for driver ${driverId}`);

    const driver = await this.getDriverById(schoolId, driverId);

    // Calculate analytics from performance metrics
    const metrics = driver.performanceMetrics || {
      totalTrips: 0,
      completedTrips: 0,
      onTimeRate: 0,
      averageRating: 0,
      safetyIncidents: 0,
      fuelEfficiency: 0,
      totalDistance: 0,
    };

    const trainingRecords = driver.trainingRecords || [];
    const completedTrainings = trainingRecords.filter(t => t.status === 'completed').length;

    return {
      driverId,
      driverName: driver.fullName,
      totalTrips: metrics.totalTrips,
      completedTrips: metrics.completedTrips,
      onTimeRate: metrics.onTimeRate,
      averageRating: metrics.averageRating,
      safetyIncidents: metrics.safetyIncidents,
      fuelEfficiency: metrics.fuelEfficiency,
      totalDistance: metrics.totalDistance,
      completedTrainings,
      totalTrainings: trainingRecords.length,
      licenseExpiry: driver.licenseExpiry,
      nextMedicalCheck: driver.medicalRecords?.nextMedicalCheck,
      fitnessToDrive: driver.medicalRecords?.fitnessToDrive,
    };
  }

  async getDriverFleetAnalytics(schoolId: string): Promise<any> {
    this.logger.log(`Getting driver fleet analytics for school: ${schoolId}`);

    const drivers = await this.getDrivers(schoolId);

    const totalDrivers = drivers.length;
    const activeDrivers = drivers.filter(d => d.status === DriverStatus.ACTIVE).length;
    const licensedDrivers = drivers.filter(d => new Date(d.licenseExpiry) > new Date()).length;

    const averageRating = drivers.reduce((sum, d) => sum + (d.performanceMetrics?.averageRating || 0), 0) / totalDrivers;
    const totalSafetyIncidents = drivers.reduce((sum, d) => sum + (d.performanceMetrics?.safetyIncidents || 0), 0);

    return {
      totalDrivers,
      activeDrivers,
      licensedDrivers,
      averageRating: isNaN(averageRating) ? 0 : averageRating,
      totalSafetyIncidents,
      licenseCompliance: totalDrivers > 0 ? (licensedDrivers / totalDrivers) * 100 : 0,
      driverTypes: drivers.reduce((acc, d) => {
        acc[d.licenseType] = (acc[d.licenseType] || 0) + 1;
        return acc;
      }, {}),
      expiringLicenses: drivers.filter(d => {
        const daysUntilExpiry = (new Date(d.licenseExpiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry <= 30;
      }).length,
    };
  }

  async getDriversByLicenseExpiry(schoolId: string, daysAhead: number = 30): Promise<Driver[]> {
    this.logger.log(`Getting drivers with expiring licenses for school: ${schoolId}`);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.driverRepository.createQueryBuilder('driver')
      .where('driver.schoolId = :schoolId', { schoolId })
      .andWhere('driver.licenseExpiry <= :futureDate', { futureDate })
      .andWhere('driver.status = :status', { status: DriverStatus.ACTIVE })
      .getMany();
  }

  async getDriversByMedicalCheck(schoolId: string, daysAhead: number = 30): Promise<Driver[]> {
    this.logger.log(`Getting drivers needing medical checks for school: ${schoolId}`);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.driverRepository.createQueryBuilder('driver')
      .where('driver.schoolId = :schoolId', { schoolId })
      .andWhere('driver.medicalRecords->>\'nextMedicalCheck\' <= :futureDate', { futureDate })
      .andWhere('driver.status = :status', { status: DriverStatus.ACTIVE })
      .getMany();
  }
}