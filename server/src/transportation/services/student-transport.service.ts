// Academia Pro - Student Transport Service
// Service for managing student transportation assignments

import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StudentTransport, TransportType, TransportStatus, TransportFrequency } from '../entities/student-transport.entity';
import { TransportRoute } from '../entities/route.entity';
import { TransportStop } from '../entities/transport-stop.entity';
import { Vehicle } from '../entities/vehicle.entity';
import { Driver } from '../entities/driver.entity';

export interface TransportAssignmentRequest {
  studentId: string;
  routeId: string;
  pickupStopId: string;
  dropoffStopId: string;
  transportType?: TransportType;
  frequency?: TransportFrequency;
  startDate: Date;
  endDate?: Date;
  specialRequirements?: string;
  medicalConditions?: string;
  emergencyContacts?: Array<{
    name: string;
    relationship: string;
    phone: string;
    priority: number;
  }>;
}

export interface TransportUpdateRequest {
  transportId: string;
  status?: TransportStatus;
  pickupTime?: string;
  dropoffTime?: string;
  notes?: string;
  delayMinutes?: number;
}

@Injectable()
export class StudentTransportService {
  private readonly logger = new Logger(StudentTransportService.name);

  constructor(
    @InjectRepository(StudentTransport)
    private transportRepository: Repository<StudentTransport>,
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

  async assignTransport(schoolId: string, request: TransportAssignmentRequest): Promise<StudentTransport> {
    this.logger.log(`Assigning transport for student ${request.studentId} in school: ${schoolId}`);

    // Validate route
    const route = await this.routeRepository.findOne({
      where: { id: request.routeId, schoolId },
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    if (route.status !== 'active') {
      throw new BadRequestException('Route is not active');
    }

    // Validate stops
    const pickupStop = await this.stopRepository.findOne({
      where: { id: request.pickupStopId, schoolId },
    });
    if (!pickupStop) {
      throw new NotFoundException('Pickup stop not found');
    }

    const dropoffStop = await this.stopRepository.findOne({
      where: { id: request.dropoffStopId, schoolId },
    });
    if (!dropoffStop) {
      throw new NotFoundException('Dropoff stop not found');
    }

    // Check for existing active transport
    const existingTransport = await this.transportRepository.findOne({
      where: {
        schoolId,
        studentId: request.studentId,
        transportStatus: TransportStatus.ACTIVE,
      },
    });

    if (existingTransport) {
      throw new BadRequestException('Student already has an active transport assignment');
    }

    // Calculate transport fee
    const transportFee = this.calculateTransportFee(route, request.transportType || TransportType.REGULAR);

    const transport = this.transportRepository.create({
      schoolId,
      studentId: request.studentId,
      routeId: request.routeId,
      pickupStopId: request.pickupStopId,
      dropoffStopId: request.dropoffStopId,
      transportType: request.transportType || TransportType.REGULAR,
      transportStatus: TransportStatus.ACTIVE,
      frequency: request.frequency || TransportFrequency.DAILY,
      startDate: request.startDate,
      endDate: request.endDate,
      pickupTime: route.pickupTime,
      dropoffTime: route.dropoffTime,
      transportFee,
      finalFee: transportFee, // Will be adjusted for discounts
      specialRequirements: request.specialRequirements,
      medicalConditions: request.medicalConditions,
      emergencyContacts: request.emergencyContacts,
    });

    return this.transportRepository.save(transport);
  }

  async getStudentTransports(schoolId: string, studentId?: string, filters?: {
    status?: TransportStatus;
    type?: TransportType;
    routeId?: string;
    pickupStopId?: string;
    dropoffStopId?: string;
  }): Promise<StudentTransport[]> {
    this.logger.log(`Getting student transports for school: ${schoolId}`);

    const query = this.transportRepository.createQueryBuilder('transport')
      .where('transport.schoolId = :schoolId', { schoolId });

    if (studentId) {
      query.andWhere('transport.studentId = :studentId', { studentId });
    }

    if (filters?.status) {
      query.andWhere('transport.transportStatus = :status', { status: filters.status });
    }

    if (filters?.type) {
      query.andWhere('transport.transportType = :type', { type: filters.type });
    }

    if (filters?.routeId) {
      query.andWhere('transport.routeId = :routeId', { routeId: filters.routeId });
    }

    if (filters?.pickupStopId) {
      query.andWhere('transport.pickupStopId = :pickupStopId', { pickupStopId: filters.pickupStopId });
    }

    if (filters?.dropoffStopId) {
      query.andWhere('transport.dropoffStopId = :dropoffStopId', { dropoffStopId: filters.dropoffStopId });
    }

    return query.getMany();
  }

  async getTransportById(schoolId: string, transportId: string): Promise<StudentTransport> {
    this.logger.log(`Getting transport ${transportId} for school: ${schoolId}`);

    const transport = await this.transportRepository.findOne({
      where: { id: transportId, schoolId },
    });

    if (!transport) {
      throw new NotFoundException('Transport assignment not found');
    }

    return transport;
  }

  async updateTransport(schoolId: string, transportId: string, updateData: Partial<StudentTransport>): Promise<StudentTransport> {
    this.logger.log(`Updating transport ${transportId} for school: ${schoolId}`);

    const transport = await this.getTransportById(schoolId, transportId);

    // Validate route if changing
    if (updateData.routeId && updateData.routeId !== transport.routeId) {
      const route = await this.routeRepository.findOne({
        where: { id: updateData.routeId, schoolId },
      });
      if (!route) {
        throw new NotFoundException('New route not found');
      }
    }

    // Validate stops if changing
    if (updateData.pickupStopId && updateData.pickupStopId !== transport.pickupStopId) {
      const stop = await this.stopRepository.findOne({
        where: { id: updateData.pickupStopId, schoolId },
      });
      if (!stop) {
        throw new NotFoundException('New pickup stop not found');
      }
    }

    if (updateData.dropoffStopId && updateData.dropoffStopId !== transport.dropoffStopId) {
      const stop = await this.stopRepository.findOne({
        where: { id: updateData.dropoffStopId, schoolId },
      });
      if (!stop) {
        throw new NotFoundException('New dropoff stop not found');
      }
    }

    Object.assign(transport, updateData);
    return this.transportRepository.save(transport);
  }

  async cancelTransport(schoolId: string, transportId: string, reason?: string): Promise<StudentTransport> {
    this.logger.log(`Cancelling transport ${transportId} for school: ${schoolId}`);

    const transport = await this.getTransportById(schoolId, transportId);

    if (transport.transportStatus === TransportStatus.CANCELLED) {
      throw new BadRequestException('Transport is already cancelled');
    }

    transport.transportStatus = TransportStatus.CANCELLED;
    transport.endDate = new Date();

    // Add cancellation note to history
    transport.transportHistory = transport.transportHistory || [];
    transport.transportHistory.push({
      date: new Date(),
      pickupTime: transport.pickupTime,
      dropoffTime: transport.dropoffTime,
      status: 'cancelled',
      notes: reason || 'Transport cancelled by administrator',
    });

    return this.transportRepository.save(transport);
  }

  async recordTransportActivity(request: TransportUpdateRequest): Promise<StudentTransport> {
    this.logger.log(`Recording transport activity for transport ${request.transportId}`);

    const transport = await this.transportRepository.findOne({
      where: { id: request.transportId },
    });

    if (!transport) {
      throw new NotFoundException('Transport assignment not found');
    }

    // Update status if provided
    if (request.status) {
      transport.transportStatus = request.status;
    }

    // Record activity in history
    const activityRecord = {
      date: new Date(),
      pickupTime: request.pickupTime || transport.pickupTime,
      dropoffTime: request.dropoffTime || transport.dropoffTime,
      status: (request.status === TransportStatus.COMPLETED ? 'completed' :
               request.status === TransportStatus.CANCELLED ? 'cancelled' : 'completed') as 'completed' | 'missed' | 'delayed' | 'cancelled',
      delayMinutes: request.delayMinutes,
      notes: request.notes,
    };

    transport.transportHistory = transport.transportHistory || [];
    transport.transportHistory.push(activityRecord);

    // Update performance metrics
    transport.performanceMetrics = transport.performanceMetrics || {
      totalTrips: 0,
      completedTrips: 0,
      missedTrips: 0,
      averageDelayMinutes: 0,
      onTimeRate: 0,
      parentSatisfaction: 0,
    };

    transport.performanceMetrics.totalTrips += 1;

    if (request.status === TransportStatus.COMPLETED) {
      transport.performanceMetrics.completedTrips += 1;
    }

    if (request.delayMinutes && request.delayMinutes > 0) {
      transport.performanceMetrics.averageDelayMinutes =
        (transport.performanceMetrics.averageDelayMinutes * (transport.performanceMetrics.totalTrips - 1) + request.delayMinutes) /
        transport.performanceMetrics.totalTrips;
    }

    return this.transportRepository.save(transport);
  }

  async getTransportAnalytics(schoolId: string, transportId?: string, studentId?: string): Promise<any> {
    this.logger.log(`Getting transport analytics for school: ${schoolId}`);

    let transports: StudentTransport[];

    if (transportId) {
      transports = [await this.getTransportById(schoolId, transportId)];
    } else if (studentId) {
      transports = await this.getStudentTransports(schoolId, studentId);
    } else {
      transports = await this.getStudentTransports(schoolId);
    }

    const totalTransports = transports.length;
    const activeTransports = transports.filter(t => t.transportStatus === TransportStatus.ACTIVE).length;
    const completedTransports = transports.filter(t => t.transportStatus === TransportStatus.COMPLETED).length;

    const totalTrips = transports.reduce((sum, t) => sum + (t.performanceMetrics?.totalTrips || 0), 0);
    const completedTrips = transports.reduce((sum, t) => sum + (t.performanceMetrics?.completedTrips || 0), 0);
    const averageDelay = transports.reduce((sum, t) => sum + (t.performanceMetrics?.averageDelayMinutes || 0), 0) / totalTransports;

    return {
      totalTransports,
      activeTransports,
      completedTransports,
      totalTrips,
      completedTrips,
      completionRate: totalTrips > 0 ? (completedTrips / totalTrips) * 100 : 0,
      averageDelayMinutes: isNaN(averageDelay) ? 0 : averageDelay,
      transportTypes: transports.reduce((acc, t) => {
        acc[t.transportType] = (acc[t.transportType] || 0) + 1;
        return acc;
      }, {}),
      routeUtilization: transports.reduce((acc, t) => {
        acc[t.routeId] = (acc[t.routeId] || 0) + 1;
        return acc;
      }, {}),
    };
  }

  async getTransportSchedule(schoolId: string, date: Date, routeId?: string): Promise<any> {
    this.logger.log(`Getting transport schedule for school: ${schoolId} on ${date.toDateString()}`);

    const query = this.transportRepository.createQueryBuilder('transport')
      .where('transport.schoolId = :schoolId', { schoolId })
      .andWhere('transport.startDate <= :date', { date })
      .andWhere('(transport.endDate IS NULL OR transport.endDate >= :date)', { date })
      .andWhere('transport.transportStatus = :status', { status: TransportStatus.ACTIVE });

    if (routeId) {
      query.andWhere('transport.routeId = :routeId', { routeId });
    }

    const transports = await query.getMany();

    // Group by route and time
    const schedule = transports.reduce((acc, transport) => {
      const routeKey = transport.routeId;
      if (!acc[routeKey]) {
        acc[routeKey] = {
          routeId: transport.routeId,
          pickups: [],
          dropoffs: [],
        };
      }

      acc[routeKey].pickups.push({
        transportId: transport.id,
        studentId: transport.studentId,
        pickupTime: transport.pickupTime,
        pickupStopId: transport.pickupStopId,
      });

      acc[routeKey].dropoffs.push({
        transportId: transport.id,
        studentId: transport.studentId,
        dropoffTime: transport.dropoffTime,
        dropoffStopId: transport.dropoffStopId,
      });

      return acc;
    }, {});

    return Object.values(schedule);
  }

  private calculateTransportFee(route: TransportRoute, transportType: TransportType): number {
    let baseFee = route.routeFees?.baseFee || 0;

    // Add type-specific fees
    switch (transportType) {
      case TransportType.SPECIAL_NEEDS:
        baseFee += route.routeFees?.specialNeedsFee || 0;
        break;
      case TransportType.MEDICAL:
        baseFee += route.routeFees?.emergencyFee || 0;
        break;
      case TransportType.EMERGENCY:
        baseFee += route.routeFees?.emergencyFee || 0;
        break;
    }

    // Add distance-based fee
    const distanceFee = (route.distanceKm || 0) * (route.routeFees?.distanceFee || 0);
    baseFee += distanceFee;

    return Math.round(baseFee * 100) / 100; // Round to 2 decimal places
  }
}