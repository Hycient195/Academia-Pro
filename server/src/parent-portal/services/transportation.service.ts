import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, LessThan, MoreThan } from 'typeorm';
import { ParentPortalAccess } from '../entities/parent-portal-access.entity';
import { ParentStudentLink, AuthorizationLevel } from '../entities/parent-student-link.entity';
import { PortalActivityLog, PortalActivityType } from '../entities/portal-activity-log.entity';
import {
  TransportationInfoResponseDto,
  BusLocationResponseDto,
  BusRouteResponseDto,
  TransportationScheduleResponseDto,
  SafetyAlertResponseDto,
  EmergencyContactResponseDto,
  TransportationStatsResponseDto,
  BusTrackingResponseDto,
  TransportationInfoListResponseDto,
  SafetyAlertListResponseDto,
  TransportationMode,
  BusStatus,
  SafetyAlertType,
  SafetyAlertSeverity,
  EmergencyContactType,
} from '../dtos/transportation.dto';

@Injectable()
export class ParentPortalTransportationService {
  private readonly logger = new Logger(ParentPortalTransportationService.name);

  constructor(
    @InjectRepository(ParentPortalAccess)
    private parentPortalAccessRepository: Repository<ParentPortalAccess>,
    @InjectRepository(ParentStudentLink)
    private parentStudentLinkRepository: Repository<ParentStudentLink>,
    @InjectRepository(PortalActivityLog)
    private portalActivityLogRepository: Repository<PortalActivityLog>,
    private dataSource: DataSource,
  ) {}

  async getTransportationInfo(parentPortalAccessId: string, studentId: string): Promise<TransportationInfoResponseDto> {
    try {
      this.logger.log(`Getting transportation info for student: ${studentId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get transportation information (mock data - would integrate with transportation module)
      const transportationInfo = await this.getStudentTransportationInfo(studentId);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_TRANSPORTATION, `Viewed transportation info for student ${studentId}`, studentId);

      return transportationInfo;
    } catch (error) {
      this.logger.error(`Transportation info error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getBusLocation(parentPortalAccessId: string, busId: string): Promise<BusLocationResponseDto> {
    try {
      this.logger.log(`Getting bus location for bus: ${busId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to buses (through their children)
      await this.verifyBusAccess(parentPortalAccessId, busId);

      // Get bus location (mock data - would integrate with GPS tracking system)
      const busLocation = await this.getBusLocationData(busId);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_TRANSPORTATION, `Viewed location for bus ${busId}`);

      return busLocation;
    } catch (error) {
      this.logger.error(`Bus location error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getBusRoute(parentPortalAccessId: string, routeId: string): Promise<BusRouteResponseDto> {
    try {
      this.logger.log(`Getting bus route details for route: ${routeId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this route (through their children)
      await this.verifyRouteAccess(parentPortalAccessId, routeId);

      // Get route details (mock data - would integrate with route management system)
      const routeDetails = await this.getRouteDetails(routeId);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_TRANSPORTATION, `Viewed route details for route ${routeId}`);

      return routeDetails;
    } catch (error) {
      this.logger.error(`Bus route error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTransportationSchedule(
    parentPortalAccessId: string,
    studentId: string,
    date: Date,
  ): Promise<TransportationScheduleResponseDto> {
    try {
      this.logger.log(`Getting transportation schedule for student: ${studentId}, date: ${date}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get transportation schedule (mock data - would integrate with scheduling system)
      const schedule = await this.getStudentTransportationSchedule(studentId, date);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_TRANSPORTATION, `Viewed transportation schedule for student ${studentId}`, studentId);

      return schedule;
    } catch (error) {
      this.logger.error(`Transportation schedule error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSafetyAlerts(
    parentPortalAccessId: string,
    severity?: SafetyAlertSeverity,
    limit: number = 20,
  ): Promise<SafetyAlertListResponseDto> {
    try {
      this.logger.log(`Getting safety alerts for parent: ${parentPortalAccessId}, severity: ${severity}`);

      // Get safety alerts (mock data - would integrate with safety monitoring system)
      const alerts = await this.getParentSafetyAlerts(parentPortalAccessId, severity, limit);

      // Calculate summary
      const summary = {
        critical: alerts.filter(a => a.severity === SafetyAlertSeverity.CRITICAL).length,
        high: alerts.filter(a => a.severity === SafetyAlertSeverity.HIGH).length,
        medium: alerts.filter(a => a.severity === SafetyAlertSeverity.MEDIUM).length,
        low: alerts.filter(a => a.severity === SafetyAlertSeverity.LOW).length,
        active: alerts.filter(a => !a.acknowledged).length,
        acknowledged: alerts.filter(a => a.acknowledged).length,
      };

      // Group by type
      const byType = alerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_TRANSPORTATION, `Viewed ${alerts.length} safety alerts`);

      return {
        alerts,
        total: alerts.length,
        summary,
        byType,
        page: 1,
        limit,
      };
    } catch (error) {
      this.logger.error(`Safety alerts error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getEmergencyContacts(parentPortalAccessId: string): Promise<EmergencyContactResponseDto[]> {
    try {
      this.logger.log(`Getting emergency contacts for parent: ${parentPortalAccessId}`);

      // Get emergency contacts (mock data - would integrate with contact management system)
      const contacts = await this.getEmergencyContactList(parentPortalAccessId);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.EMERGENCY_CONTACT, `Viewed ${contacts.length} emergency contacts`);

      return contacts;
    } catch (error) {
      this.logger.error(`Emergency contacts error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTransportationStats(
    parentPortalAccessId: string,
    timeRange: string = 'month',
  ): Promise<TransportationStatsResponseDto> {
    try {
      this.logger.log(`Getting transportation stats for parent: ${parentPortalAccessId}, timeRange: ${timeRange}`);

      // Get transportation statistics (mock data - would integrate with analytics system)
      const stats = await this.calculateTransportationStats(parentPortalAccessId, timeRange);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_TRANSPORTATION, `Viewed transportation statistics for ${timeRange}`);

      return stats;
    } catch (error) {
      this.logger.error(`Transportation stats error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getBusTracking(parentPortalAccessId: string, busId: string): Promise<BusTrackingResponseDto> {
    try {
      this.logger.log(`Getting bus tracking for bus: ${busId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this bus
      await this.verifyBusAccess(parentPortalAccessId, busId);

      // Get comprehensive bus tracking data (mock data - would integrate with GPS and telematics systems)
      const trackingData = await this.getComprehensiveBusTracking(busId);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_TRANSPORTATION, `Viewed detailed tracking for bus ${busId}`);

      return trackingData;
    } catch (error) {
      this.logger.error(`Bus tracking error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getRouteStops(parentPortalAccessId: string, routeId: string): Promise<{
    routeId: string;
    routeName: string;
    stops: Array<{
      stopId: string;
      stopName: string;
      latitude: number;
      longitude: number;
      estimatedArrival: Date;
      isCompleted: boolean;
      passengersGettingOn: number;
      passengersGettingOff: number;
    }>;
  }> {
    try {
      this.logger.log(`Getting route stops for route: ${routeId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this route
      await this.verifyRouteAccess(parentPortalAccessId, routeId);

      // Get route stops (mock data - would integrate with route management system)
      const routeStops = await this.getRouteStopsData(routeId);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_TRANSPORTATION, `Viewed stops for route ${routeId}`);

      return routeStops;
    } catch (error) {
      this.logger.error(`Route stops error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getSafetyProtocols(parentPortalAccessId: string): Promise<{
    emergencyProcedures: Array<{
      procedureId: string;
      title: string;
      description: string;
      steps: string[];
      emergencyContacts: string[];
    }>;
    safetyGuidelines: Array<{
      guidelineId: string;
      category: string;
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    lastUpdated: Date;
  }> {
    try {
      this.logger.log(`Getting safety protocols for parent: ${parentPortalAccessId}`);

      // Get safety protocols (mock data - would integrate with safety management system)
      const protocols = await this.getSafetyProtocolData();

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_TRANSPORTATION, 'Viewed safety protocols');

      return protocols;
    } catch (error) {
      this.logger.error(`Safety protocols error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getWeatherImpact(parentPortalAccessId: string): Promise<{
    currentConditions: {
      temperature: number;
      conditions: string;
      visibility: string;
      windSpeed: number;
      precipitation: string;
    };
    routeImpacts: Array<{
      routeId: string;
      routeName: string;
      impactLevel: 'none' | 'minor' | 'moderate' | 'severe';
      description: string;
      estimatedDelay: number;
      alternativeRoutes: string[];
    }>;
    lastUpdated: Date;
  }> {
    try {
      this.logger.log(`Getting weather impact for parent: ${parentPortalAccessId}`);

      // Get weather impact data (mock data - would integrate with weather API)
      const weatherImpact = await this.getWeatherImpactData();

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_TRANSPORTATION, 'Viewed weather impact information');

      return weatherImpact;
    } catch (error) {
      this.logger.error(`Weather impact error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getDelayNotifications(parentPortalAccessId: string, studentId: string): Promise<{
    studentId: string;
    notifications: Array<{
      notificationId: string;
      type: 'delay' | 'early' | 'route_change' | 'bus_change';
      title: string;
      message: string;
      originalTime: Date;
      updatedTime: Date;
      delayMinutes: number;
      reason: string;
      createdAt: Date;
      acknowledged: boolean;
    }>;
    activeDelays: number;
  }> {
    try {
      this.logger.log(`Getting delay notifications for student: ${studentId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get delay notifications (mock data - would integrate with notification system)
      const notifications = await this.getStudentDelayNotifications(studentId);

      const activeDelays = notifications.filter(n => !n.acknowledged).length;

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_TRANSPORTATION, `Viewed ${notifications.length} delay notifications for student ${studentId}`, studentId);

      return {
        studentId,
        notifications,
        activeDelays,
      };
    } catch (error) {
      this.logger.error(`Delay notifications error: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Private helper methods
  private async verifyStudentAccess(
    parentPortalAccessId: string,
    studentId: string,
    requiredLevel: AuthorizationLevel,
  ): Promise<void> {
    const studentLink = await this.parentStudentLinkRepository.findOne({
      where: {
        parentPortalAccessId,
        studentId,
        isActive: true,
      },
    });

    if (!studentLink) {
      throw new NotFoundException('Student not found or access denied');
    }

    if (!studentLink.isAuthorizedFor(requiredLevel)) {
      throw new ForbiddenException(`Insufficient authorization level. Required: ${requiredLevel}`);
    }
  }

  private async verifyBusAccess(parentPortalAccessId: string, busId: string): Promise<void> {
    // Check if any of the parent's students use this bus
    const studentLinks = await this.parentStudentLinkRepository.find({
      where: {
        parentPortalAccessId,
        isActive: true,
      },
    });

    // Mock verification - would check actual bus assignments
    const hasAccess = studentLinks.length > 0;
    if (!hasAccess) {
      throw new ForbiddenException('No access to this bus');
    }
  }

  private async verifyRouteAccess(parentPortalAccessId: string, routeId: string): Promise<void> {
    // Check if any of the parent's students use this route
    const studentLinks = await this.parentStudentLinkRepository.find({
      where: {
        parentPortalAccessId,
        isActive: true,
      },
    });

    // Mock verification - would check actual route assignments
    const hasAccess = studentLinks.length > 0;
    if (!hasAccess) {
      throw new ForbiddenException('No access to this route');
    }
  }

  private async getStudentTransportationInfo(studentId: string): Promise<TransportationInfoResponseDto> {
    // Mock data - would integrate with transportation management system
    return {
      studentId,
      transportationMode: TransportationMode.BUS,
      busInfo: {
        busId: 'bus-001',
        busNumber: 'T-123',
        licensePlate: 'ABC-123',
        capacity: 50,
        currentPassengers: 35,
        driverName: 'John Smith',
        driverPhone: '+1-555-0123',
        driverPhoto: 'https://example.com/drivers/john-smith.jpg',
      },
      routeInfo: {
        routeId: 'route-001',
        routeName: 'Downtown Route A',
        pickupStop: {
          stopId: 'stop-001',
          stopName: 'Main Street & Oak Ave',
          address: '123 Main St, Downtown',
          latitude: 40.7128,
          longitude: -74.0060,
          scheduledPickupTime: new Date('2024-01-15T07:30:00Z'),
        },
        dropoffStop: {
          stopId: 'stop-002',
          stopName: 'School Entrance',
          address: '456 Education Blvd',
          latitude: 40.7589,
          longitude: -73.9851,
          scheduledDropoffTime: new Date('2024-01-15T15:45:00Z'),
        },
      },
      safetyFeatures: {
        gpsTracking: true,
        emergencyButton: true,
        cameraSurveillance: true,
        firstAidKit: true,
        fireExtinguisher: true,
        seatBelts: true,
        speedMonitoring: true,
      },
      emergencyContacts: [
        {
          contactId: 'contact-001',
          name: 'Transportation Coordinator',
          type: EmergencyContactType.TRANSPORTATION_COORDINATOR,
          phone: '+1-555-0124',
          email: 'transport@school.com',
          priority: 1,
          availableHours: '6:00 AM - 6:00 PM',
        },
        {
          contactId: 'contact-002',
          name: 'School Security',
          type: EmergencyContactType.SECURITY,
          phone: '+1-555-0125',
          email: 'security@school.com',
          priority: 2,
          availableHours: '24/7',
        },
      ],
      feeInfo: {
        monthlyFee: 150,
        annualFee: 1800,
        paymentStatus: 'paid' as const,
        nextPaymentDate: new Date('2024-02-01'),
      },
      statistics: {
        totalTripsThisMonth: 22,
        onTimePercentage: 95,
        averageDelayMinutes: 2,
        safetyIncidents: 0,
      },
    };
  }

  private async getBusLocationData(busId: string): Promise<BusLocationResponseDto> {
    // Mock data - would integrate with GPS tracking system
    return {
      busId,
      currentLocation: {
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main St, Downtown',
        lastUpdated: new Date(),
        accuracy: 5,
      },
      status: BusStatus.IN_TRANSIT,
      speed: 35,
      routeInfo: {
        routeId: 'route-001',
        routeName: 'Downtown Route A',
        nextStop: {
          stopId: 'stop-003',
          stopName: 'Elm Street & Pine Ave',
          estimatedArrival: new Date(Date.now() + 10 * 60 * 1000),
          distance: 800,
        },
        progress: {
          completedStops: 3,
          totalStops: 8,
          percentage: 37.5,
        },
      },
      passengerInfo: {
        currentPassengers: 35,
        capacity: 50,
        studentsOnBoard: 28,
        adultsOnBoard: 7,
      },
      driverInfo: {
        name: 'John Smith',
        phone: '+1-555-0123',
        experience: '5 years',
        rating: 4.8,
      },
      vehicleInfo: {
        licensePlate: 'ABC-123',
        lastMaintenance: new Date('2024-01-01'),
        nextMaintenance: new Date('2024-04-01'),
        fuelLevel: 75,
      },
      etaMinutes: 25,
    };
  }

  private async getRouteDetails(routeId: string): Promise<BusRouteResponseDto> {
    // Mock data - would integrate with route management system
    return {
      routeId,
      routeName: 'Downtown Route A',
      description: 'Morning pickup route covering downtown residential area',
      distance: 12.5,
      estimatedDuration: 35,
      stops: [
        {
          stopId: 'stop-001',
          stopName: 'Main Street & Oak Ave',
          address: '123 Main St',
          latitude: 40.7128,
          longitude: -74.0060,
          sequence: 1,
          estimatedArrival: new Date('2024-01-15T07:30:00Z'),
          pickupCount: 5,
          dropoffCount: 0,
          isActive: true,
        },
        {
          stopId: 'stop-002',
          stopName: 'Elm Street & Pine Ave',
          address: '456 Elm St',
          latitude: 40.7150,
          longitude: -74.0080,
          sequence: 2,
          estimatedArrival: new Date('2024-01-15T07:40:00Z'),
          pickupCount: 3,
          dropoffCount: 0,
          isActive: true,
        },
      ],
      landmarks: [
        {
          landmarkId: 'landmark-001',
          name: 'City Hospital',
          type: 'hospital',
          latitude: 40.7180,
          longitude: -74.0100,
          distance: 500,
          contactInfo: {
            phone: '+1-555-0199',
            address: '789 Hospital Ave',
          },
        },
      ],
      schedule: [
        {
          dayOfWeek: 1, // Monday
          startTime: '07:00',
          endTime: '08:30',
          frequency: 'daily',
          isActive: true,
        },
      ],
      statistics: {
        totalStudents: 45,
        averageOnTimePercentage: 94,
        totalTripsThisMonth: 220,
        averageDelayMinutes: 2.5,
        safetyRating: 4.7,
      },
      alternativeRoutes: [
        {
          routeId: 'route-002',
          routeName: 'Downtown Route B',
          additionalTime: 15,
          reason: 'Weather conditions',
          isRecommended: false,
        },
      ],
    };
  }

  private async getStudentTransportationSchedule(studentId: string, date: Date): Promise<TransportationScheduleResponseDto> {
    // Mock data - would integrate with scheduling system
    return {
      studentId,
      date,
      morningPickup: {
        scheduledTime: new Date('2024-01-15T07:30:00Z'),
        actualTime: new Date('2024-01-15T07:32:00Z'),
        busId: 'bus-001',
        busNumber: 'T-123',
        driverName: 'John Smith',
        pickupLocation: {
          address: '123 Main St, Downtown',
          latitude: 40.7128,
          longitude: -74.0060,
        },
        status: 'completed',
        delayMinutes: 2,
        delayReason: 'Light traffic',
      },
      afternoonDropoff: {
        scheduledTime: new Date('2024-01-15T15:45:00Z'),
        actualTime: undefined,
        busId: 'bus-001',
        busNumber: 'T-123',
        driverName: 'John Smith',
        dropoffLocation: {
          address: '456 Education Blvd',
          latitude: 40.7589,
          longitude: -73.9851,
        },
        status: 'scheduled',
      },
      exceptions: [],
      contacts: {
        transportationCoordinator: {
          name: 'Sarah Johnson',
          phone: '+1-555-0124',
          email: 'transport@school.com',
        },
        emergencyContact: {
          name: 'Mary Doe',
          phone: '+1-555-0126',
          relationship: 'Mother',
        },
      },
    };
  }

  private async getParentSafetyAlerts(
    parentPortalAccessId: string,
    severity?: SafetyAlertSeverity,
    limit: number = 20,
  ): Promise<SafetyAlertResponseDto[]> {
    // Mock data - would integrate with safety monitoring system
    const allAlerts: SafetyAlertResponseDto[] = [
      {
        alertId: 'alert-001',
        type: SafetyAlertType.DELAY,
        severity: SafetyAlertSeverity.MEDIUM,
        title: 'Bus Running Late',
        message: 'Bus T-123 is running 10 minutes late due to traffic congestion.',
        affectedStudents: [
          {
            studentId: 'student-001',
            studentName: 'John Doe',
            busId: 'bus-001',
            estimatedDelay: 10,
          },
        ],
        busInfo: {
          busId: 'bus-001',
          busNumber: 'T-123',
          driverName: 'John Smith',
          currentLocation: {
            latitude: 40.7128,
            longitude: -74.0060,
          },
        },
        recommendedActions: [
          'Monitor bus location',
          'Contact transportation coordinator if delay exceeds 20 minutes',
        ],
        emergencyContacts: [
          {
            name: 'Transportation Coordinator',
            phone: '+1-555-0124',
            type: EmergencyContactType.TRANSPORTATION_COORDINATOR,
          },
        ],
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        acknowledged: false,
      },
    ];

    let filteredAlerts = allAlerts;
    if (severity) {
      filteredAlerts = allAlerts.filter(alert => alert.severity === severity);
    }

    return filteredAlerts.slice(0, limit);
  }

  private async getEmergencyContactList(parentPortalAccessId: string): Promise<EmergencyContactResponseDto[]> {
    // Mock data - would integrate with contact management system
    return [
      {
        contactId: 'contact-001',
        name: 'Transportation Coordinator',
        type: EmergencyContactType.TRANSPORTATION_COORDINATOR,
        title: 'Transportation Coordinator',
        phone: '+1-555-0124',
        email: 'transport@school.com',
        priority: 1,
        availableHours: '6:00 AM - 6:00 PM',
        emergencyProtocols: ['Bus delays', 'Route changes', 'Vehicle issues'],
        responseTime: 'Within 15 minutes',
        location: {
          building: 'Administration Building',
          room: 'Room 101',
          floor: '1st Floor',
        },
        qualifications: ['Transportation management', 'Emergency response training'],
        lastUpdated: new Date('2024-01-01'),
      },
      {
        contactId: 'contact-002',
        name: 'School Nurse',
        type: EmergencyContactType.SCHOOL_NURSE,
        title: 'Registered Nurse',
        phone: '+1-555-0127',
        email: 'nurse@school.com',
        priority: 2,
        availableHours: '7:00 AM - 4:00 PM',
        emergencyProtocols: ['Medical emergencies', 'Allergies', 'Injuries'],
        responseTime: 'Within 5 minutes',
        location: {
          building: 'Health Center',
          room: 'Room 201',
          floor: '2nd Floor',
        },
        qualifications: ['RN License', 'CPR certified', 'First aid training'],
        lastUpdated: new Date('2024-01-01'),
      },
    ];
  }

  private async calculateTransportationStats(
    parentPortalAccessId: string,
    timeRange: string,
  ): Promise<TransportationStatsResponseDto> {
    // Mock data - would integrate with analytics system
    return {
      timeRange,
      overall: {
        totalTrips: 220,
        completedTrips: 215,
        onTimePercentage: 94,
        averageDelayMinutes: 2.5,
        totalDistance: 2750,
        totalStudentsTransported: 180,
      },
      safety: {
        totalIncidents: 2,
        incidentRate: 0.9,
        emergencyResponses: 1,
        safetyRating: 4.7,
        mostCommonIssues: [
          {
            issue: 'Minor delays',
            count: 15,
            percentage: 6.8,
          },
          {
            issue: 'Traffic congestion',
            count: 8,
            percentage: 3.6,
          },
        ],
      },
      routePerformance: [
        {
          routeId: 'route-001',
          routeName: 'Downtown Route A',
          trips: 110,
          onTimePercentage: 96,
          averageDelay: 1.8,
          safetyIncidents: 0,
          studentSatisfaction: 4.8,
        },
      ],
      busPerformance: [
        {
          busId: 'bus-001',
          busNumber: 'T-123',
          trips: 55,
          onTimePercentage: 98,
          maintenanceIssues: 0,
          fuelEfficiency: 8.5,
          driverRating: 4.9,
        },
      ],
      studentSummary: {
        totalStudents: 2,
        studentsUsingTransportation: 2,
        transportationUsageRate: 100,
        averageDistance: 6.25,
        mostPopularRoutes: [
          {
            routeId: 'route-001',
            routeName: 'Downtown Route A',
            studentCount: 2,
          },
        ],
      },
      weatherImpact: {
        totalWeatherDelays: 3,
        averageWeatherDelay: 8.5,
        mostAffectedRoutes: [
          {
            routeId: 'route-001',
            routeName: 'Downtown Route A',
            weatherDelays: 3,
          },
        ],
      },
      costEfficiency: {
        costPerTrip: 12.50,
        costPerStudent: 150.00,
        fuelCostPerKm: 0.45,
        maintenanceCostPerTrip: 2.25,
      },
    };
  }

  private async getComprehensiveBusTracking(busId: string): Promise<BusTrackingResponseDto> {
    // Mock data - would integrate with GPS and telematics systems
    return {
      busId,
      realTimeData: {
        currentLocation: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Main St, Downtown',
          accuracy: 3,
        },
        speed: 28,
        heading: 45,
        lastUpdated: new Date(),
        signalStrength: 'excellent',
      },
      routeProgress: {
        routeId: 'route-001',
        routeName: 'Downtown Route A',
        completedStops: 3,
        totalStops: 8,
        progressPercentage: 37.5,
        nextStop: {
          stopId: 'stop-004',
          stopName: 'Oak Street & Maple Ave',
          estimatedArrival: new Date(Date.now() + 12 * 60 * 1000),
          distance: 950,
          passengersWaiting: 4,
        },
        remainingStops: [
          {
            stopId: 'stop-004',
            stopName: 'Oak Street & Maple Ave',
            scheduledArrival: new Date('2024-01-15T08:05:00Z'),
            estimatedArrival: new Date('2024-01-15T08:07:00Z'),
            passengerCount: 4,
          },
        ],
      },
      etaInfo: {
        destinationStop: {
          stopId: 'stop-008',
          stopName: 'School Entrance',
          estimatedArrival: new Date('2024-01-15T08:35:00Z'),
          confidence: 'high',
        },
        keyStops: [
          {
            stopId: 'stop-005',
            stopName: 'Pine Street & Cedar Ave',
            estimatedArrival: new Date('2024-01-15T08:12:00Z'),
            isStudentStop: true,
            studentNames: ['John Doe'],
          },
        ],
      },
      trafficInfo: {
        currentDelay: 2,
        delayReason: 'Light traffic congestion',
        trafficConditions: 'moderate',
        roadIncidents: [],
        alternativeRoutes: [],
      },
      passengerInfo: {
        currentPassengers: 32,
        capacity: 50,
        utilizationRate: 64,
        studentsOnBoard: 28,
        adultsOnBoard: 4,
        specialNeedsPassengers: 1,
        nextStopActivity: {
          gettingOff: 2,
          gettingOn: 4,
          totalChange: 2,
        },
      },
      vehicleStatus: {
        engineStatus: 'running',
        fuelLevel: 78,
        temperature: 85,
        tirePressure: 'normal',
        maintenanceAlerts: [],
      },
      safetyInfo: {
        emergencyButtonStatus: 'normal',
        cameraStatus: 'online',
        driverStatus: 'normal',
        lastSafetyCheck: new Date(Date.now() - 2 * 60 * 60 * 1000),
        activeAlerts: [],
      },
      historicalData: [
        {
          timestamp: new Date(Date.now() - 5 * 60 * 1000),
          latitude: 40.7100,
          longitude: -74.0040,
          speed: 32,
        },
        {
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          latitude: 40.7080,
          longitude: -74.0020,
          speed: 28,
        },
      ],
    };
  }

  private async getRouteStopsData(routeId: string): Promise<{
    routeId: string;
    routeName: string;
    stops: Array<{
      stopId: string;
      stopName: string;
      latitude: number;
      longitude: number;
      estimatedArrival: Date;
      isCompleted: boolean;
      passengersGettingOn: number;
      passengersGettingOff: number;
    }>;
  }> {
    // Mock data - would integrate with route management system
    return {
      routeId,
      routeName: 'Downtown Route A',
      stops: [
        {
          stopId: 'stop-001',
          stopName: 'Main Street & Oak Ave',
          latitude: 40.7128,
          longitude: -74.0060,
          estimatedArrival: new Date('2024-01-15T07:30:00Z'),
          isCompleted: true,
          passengersGettingOn: 5,
          passengersGettingOff: 0,
        },
        {
          stopId: 'stop-002',
          stopName: 'Elm Street & Pine Ave',
          latitude: 40.7150,
          longitude: -74.0080,
          estimatedArrival: new Date('2024-01-15T07:40:00Z'),
          isCompleted: true,
          passengersGettingOn: 3,
          passengersGettingOff: 0,
        },
        {
          stopId: 'stop-003',
          stopName: 'Oak Street & Maple Ave',
          latitude: 40.7170,
          longitude: -74.0100,
          estimatedArrival: new Date('2024-01-15T07:50:00Z'),
          isCompleted: false,
          passengersGettingOn: 4,
          passengersGettingOff: 2,
        },
      ],
    };
  }

  private async getSafetyProtocolData(): Promise<{
    emergencyProcedures: Array<{
      procedureId: string;
      title: string;
      description: string;
      steps: string[];
      emergencyContacts: string[];
    }>;
    safetyGuidelines: Array<{
      guidelineId: string;
      category: string;
      title: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    lastUpdated: Date;
  }> {
    // Mock data - would integrate with safety management system
    return {
      emergencyProcedures: [
        {
          procedureId: 'procedure-001',
          title: 'Bus Emergency Evacuation',
          description: 'Procedure for safely evacuating students from a bus in emergency situations',
          steps: [
            'Driver activates emergency lights and stops bus safely',
            'Driver announces emergency evacuation over PA system',
            'Students exit through rear emergency door in orderly fashion',
            'Driver accounts for all students using manifest',
            'Emergency contacts are notified immediately',
          ],
          emergencyContacts: ['Transportation Coordinator', 'School Security', 'Local Emergency Services'],
        },
        {
          procedureId: 'procedure-002',
          title: 'Medical Emergency Response',
          description: 'Protocol for handling medical emergencies during transportation',
          steps: [
            'Assess the situation and ensure student safety',
            'Contact emergency medical services immediately',
            'Notify parents and school administration',
            'Provide first aid if trained and safe to do so',
            'Document incident and follow-up actions',
          ],
          emergencyContacts: ['School Nurse', 'Emergency Medical Services', 'Parent'],
        },
      ],
      safetyGuidelines: [
        {
          guidelineId: 'guideline-001',
          category: 'Student Safety',
          title: 'Bus Stop Safety',
          description: 'Guidelines for safe behavior at bus stops and during loading/unloading',
          priority: 'high',
        },
        {
          guidelineId: 'guideline-002',
          category: 'Weather Safety',
          title: 'Inclement Weather Procedures',
          description: 'Safety measures during severe weather conditions',
          priority: 'high',
        },
        {
          guidelineId: 'guideline-003',
          category: 'Health Safety',
          title: 'Allergy and Medical Information',
          description: 'Handling of student allergies and medical conditions',
          priority: 'high',
        },
      ],
      lastUpdated: new Date('2024-01-01'),
    };
  }

  private async getWeatherImpactData(): Promise<{
    currentConditions: {
      temperature: number;
      conditions: string;
      visibility: string;
      windSpeed: number;
      precipitation: string;
    };
    routeImpacts: Array<{
      routeId: string;
      routeName: string;
      impactLevel: 'none' | 'minor' | 'moderate' | 'severe';
      description: string;
      estimatedDelay: number;
      alternativeRoutes: string[];
    }>;
    lastUpdated: Date;
  }> {
    // Mock data - would integrate with weather API
    return {
      currentConditions: {
        temperature: 32,
        conditions: 'Light snow',
        visibility: '0.5 miles',
        windSpeed: 15,
        precipitation: 'Light snow showers',
      },
      routeImpacts: [
        {
          routeId: 'route-001',
          routeName: 'Downtown Route A',
          impactLevel: 'minor',
          description: 'Light snow causing minor delays on hilly sections',
          estimatedDelay: 8,
          alternativeRoutes: ['route-002'],
        },
        {
          routeId: 'route-003',
          routeName: 'Suburban Route C',
          impactLevel: 'moderate',
          description: 'Snow accumulation requiring slower speeds',
          estimatedDelay: 15,
          alternativeRoutes: ['route-004', 'route-005'],
        },
      ],
      lastUpdated: new Date(),
    };
  }

  private async getStudentDelayNotifications(studentId: string): Promise<Array<{
    notificationId: string;
    type: 'delay' | 'early' | 'route_change' | 'bus_change';
    title: string;
    message: string;
    originalTime: Date;
    updatedTime: Date;
    delayMinutes: number;
    reason: string;
    createdAt: Date;
    acknowledged: boolean;
  }>> {
    // Mock data - would integrate with notification system
    return [
      {
        notificationId: 'notification-001',
        type: 'delay',
        title: 'Morning Pickup Delay',
        message: 'Your child\'s bus is running 10 minutes late due to traffic congestion.',
        originalTime: new Date('2024-01-15T07:30:00Z'),
        updatedTime: new Date('2024-01-15T07:40:00Z'),
        delayMinutes: 10,
        reason: 'Traffic congestion on Main Street',
        createdAt: new Date(Date.now() - 45 * 60 * 1000),
        acknowledged: false,
      },
      {
        notificationId: 'notification-002',
        type: 'route_change',
        title: 'Route Change Notification',
        message: 'Due to road construction, your child\'s bus will use an alternate route today.',
        originalTime: new Date('2024-01-15T07:30:00Z'),
        updatedTime: new Date('2024-01-15T07:35:00Z'),
        delayMinutes: 5,
        reason: 'Road construction on Oak Street',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        acknowledged: true,
      },
    ];
  }

  private async logActivity(
    parentPortalAccessId: string,
    activityType: PortalActivityType,
    description: string,
    studentId?: string,
  ): Promise<void> {
    try {
      await this.portalActivityLogRepository.save({
        parentPortalAccessId,
        studentId,
        activityType,
        description,
        action: activityType.replace('_', ' '),
        ipAddress: 'system', // Would get from request context
        success: true,
      });
    } catch (error) {
      this.logger.error('Failed to log activity', error);
    }
  }
}