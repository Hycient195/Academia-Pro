import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsNumber, IsDateString, IsObject, IsBoolean, ValidateNested, Min, Max, IsLatitude, IsLongitude } from 'class-validator';

// Enums
export enum TransportationMode {
  BUS = 'bus',
  VAN = 'van',
  CAR = 'car',
  WALK = 'walk',
  PUBLIC_TRANSPORT = 'public_transport',
}

export enum BusStatus {
  ON_TIME = 'on_time',
  DELAYED = 'delayed',
  EARLY = 'early',
  AT_STOP = 'at_stop',
  IN_TRANSIT = 'in_transit',
  OUT_OF_SERVICE = 'out_of_service',
  EMERGENCY = 'emergency',
}

export enum SafetyAlertType {
  DELAY = 'delay',
  EMERGENCY = 'emergency',
  WEATHER = 'weather',
  ROAD_CLOSURE = 'road_closure',
  VEHICLE_ISSUE = 'vehicle_issue',
  MEDICAL_EMERGENCY = 'medical_emergency',
  BEHAVIOR_ISSUE = 'behavior_issue',
  OTHER = 'other',
}

export enum SafetyAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum EmergencyContactType {
  SCHOOL_ADMIN = 'school_admin',
  TRANSPORTATION_COORDINATOR = 'transportation_coordinator',
  SCHOOL_NURSE = 'school_nurse',
  SECURITY = 'security',
  POLICE = 'police',
  HOSPITAL = 'hospital',
  PARENT = 'parent',
}

// Response DTOs
export class TransportationInfoResponseDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-123',
  })
  studentId: string;

  @ApiProperty({
    description: 'Transportation mode',
    enum: TransportationMode,
  })
  transportationMode: TransportationMode;

  @ApiProperty({
    description: 'Bus information',
  })
  busInfo: {
    busId: string;
    busNumber: string;
    licensePlate: string;
    capacity: number;
    currentPassengers: number;
    driverName: string;
    driverPhone: string;
    driverPhoto?: string;
  };

  @ApiProperty({
    description: 'Route information',
  })
  routeInfo: {
    routeId: string;
    routeName: string;
    pickupStop: {
      stopId: string;
      stopName: string;
      address: string;
      latitude: number;
      longitude: number;
      scheduledPickupTime: Date;
    };
    dropoffStop: {
      stopId: string;
      stopName: string;
      address: string;
      latitude: number;
      longitude: number;
      scheduledDropoffTime: Date;
    };
  };

  @ApiProperty({
    description: 'Safety features',
  })
  safetyFeatures: {
    gpsTracking: boolean;
    emergencyButton: boolean;
    cameraSurveillance: boolean;
    firstAidKit: boolean;
    fireExtinguisher: boolean;
    seatBelts: boolean;
    speedMonitoring: boolean;
  };

  @ApiProperty({
    description: 'Emergency contacts',
    type: [Object],
  })
  emergencyContacts: Array<{
    contactId: string;
    name: string;
    type: EmergencyContactType;
    phone: string;
    email?: string;
    priority: number;
    availableHours: string;
  }>;

  @ApiProperty({
    description: 'Transportation fee information',
  })
  feeInfo: {
    monthlyFee: number;
    annualFee: number;
    paymentStatus: 'paid' | 'pending' | 'overdue';
    nextPaymentDate: Date;
    discountApplied?: number;
  };

  @ApiProperty({
    description: 'Transportation statistics',
  })
  statistics: {
    totalTripsThisMonth: number;
    onTimePercentage: number;
    averageDelayMinutes: number;
    safetyIncidents: number;
  };
}

export class BusLocationResponseDto {
  @ApiProperty({
    description: 'Bus ID',
    example: 'bus-001',
  })
  busId: string;

  @ApiProperty({
    description: 'Current location',
  })
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdated: Date;
    accuracy: number; // meters
  };

  @ApiProperty({
    description: 'Bus status',
    enum: BusStatus,
  })
  status: BusStatus;

  @ApiProperty({
    description: 'Current speed in km/h',
    example: 45.5,
  })
  speed: number;

  @ApiProperty({
    description: 'Current route information',
  })
  routeInfo: {
    routeId: string;
    routeName: string;
    nextStop: {
      stopId: string;
      stopName: string;
      estimatedArrival: Date;
      distance: number; // meters
    };
    progress: {
      completedStops: number;
      totalStops: number;
      percentage: number;
    };
  };

  @ApiProperty({
    description: 'Passenger information',
  })
  passengerInfo: {
    currentPassengers: number;
    capacity: number;
    studentsOnBoard: number;
    adultsOnBoard: number;
  };

  @ApiProperty({
    description: 'Driver information',
  })
  driverInfo: {
    name: string;
    phone: string;
    experience: string;
    rating: number;
  };

  @ApiProperty({
    description: 'Vehicle information',
  })
  vehicleInfo: {
    licensePlate: string;
    lastMaintenance: Date;
    nextMaintenance: Date;
    fuelLevel: number;
  };

  @ApiProperty({
    description: 'ETA to destination',
    example: 15,
  })
  etaMinutes: number;

  @ApiProperty({
    description: 'Delay information',
  })
  delayInfo?: {
    isDelayed: boolean;
    delayMinutes: number;
    reason: string;
    estimatedRecoveryTime: Date;
  };
}

export class BusRouteResponseDto {
  @ApiProperty({
    description: 'Route ID',
    example: 'route-001',
  })
  routeId: string;

  @ApiProperty({
    description: 'Route name',
    example: 'Downtown Route A',
  })
  routeName: string;

  @ApiProperty({
    description: 'Route description',
    example: 'Morning pickup route covering downtown area',
  })
  description: string;

  @ApiProperty({
    description: 'Route distance in kilometers',
    example: 25.5,
  })
  distance: number;

  @ApiProperty({
    description: 'Estimated duration in minutes',
    example: 45,
  })
  estimatedDuration: number;

  @ApiProperty({
    description: 'Route stops',
    type: [Object],
  })
  stops: Array<{
    stopId: string;
    stopName: string;
    address: string;
    latitude: number;
    longitude: number;
    sequence: number;
    estimatedArrival: Date;
    pickupCount: number;
    dropoffCount: number;
    isActive: boolean;
  }>;

  @ApiProperty({
    description: 'Route landmarks',
    type: [Object],
  })
  landmarks: Array<{
    landmarkId: string;
    name: string;
    type: 'school' | 'hospital' | 'police_station' | 'fire_station' | 'landmark';
    latitude: number;
    longitude: number;
    distance: number; // meters from route
    contactInfo?: {
      phone: string;
      address: string;
    };
  }>;

  @ApiProperty({
    description: 'Route schedule',
    type: [Object],
  })
  schedule: Array<{
    dayOfWeek: number; // 0-6, 0 = Sunday
    startTime: string; // HH:mm format
    endTime: string; // HH:mm format
    frequency: 'daily' | 'weekdays' | 'weekends';
    isActive: boolean;
  }>;

  @ApiProperty({
    description: 'Route statistics',
  })
  statistics: {
    totalStudents: number;
    averageOnTimePercentage: number;
    totalTripsThisMonth: number;
    averageDelayMinutes: number;
    safetyRating: number;
  };

  @ApiProperty({
    description: 'Alternative routes',
    type: [Object],
  })
  alternativeRoutes: Array<{
    routeId: string;
    routeName: string;
    reason: string;
    additionalTime: number; // minutes
    isRecommended: boolean;
  }>;
}

export class TransportationScheduleResponseDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-123',
  })
  studentId: string;

  @ApiProperty({
    description: 'Date for the schedule',
  })
  date: Date;

  @ApiProperty({
    description: 'Morning pickup information',
  })
  morningPickup: {
    scheduledTime: Date;
    actualTime?: Date;
    busId: string;
    busNumber: string;
    driverName: string;
    pickupLocation: {
      address: string;
      latitude: number;
      longitude: number;
    };
    status: 'scheduled' | 'completed' | 'cancelled' | 'delayed';
    delayMinutes?: number;
    delayReason?: string;
  };

  @ApiProperty({
    description: 'Afternoon drop-off information',
  })
  afternoonDropoff: {
    scheduledTime: Date;
    actualTime?: Date;
    busId: string;
    busNumber: string;
    driverName: string;
    dropoffLocation: {
      address: string;
      latitude: number;
      longitude: number;
    };
    status: 'scheduled' | 'completed' | 'cancelled' | 'delayed';
    delayMinutes?: number;
    delayReason?: string;
  };

  @ApiProperty({
    description: 'Schedule exceptions',
    type: [Object],
  })
  exceptions: Array<{
    exceptionId: string;
    type: 'holiday' | 'early_dismissal' | 'late_start' | 'field_trip' | 'other';
    title: string;
    description: string;
    originalTime: Date;
    adjustedTime: Date;
    reason: string;
  }>;

  @ApiProperty({
    description: 'Weather impact information',
  })
  weatherImpact?: {
    hasImpact: boolean;
    severity: 'minor' | 'moderate' | 'severe';
    description: string;
    estimatedDelay: number;
    alternativeArrangement?: string;
  };

  @ApiProperty({
    description: 'Contact information',
  })
  contacts: {
    transportationCoordinator: {
      name: string;
      phone: string;
      email: string;
    };
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
}

export class SafetyAlertResponseDto {
  @ApiProperty({
    description: 'Alert ID',
    example: 'alert-001',
  })
  alertId: string;

  @ApiProperty({
    description: 'Alert type',
    enum: SafetyAlertType,
  })
  type: SafetyAlertType;

  @ApiProperty({
    description: 'Alert severity',
    enum: SafetyAlertSeverity,
  })
  severity: SafetyAlertSeverity;

  @ApiProperty({
    description: 'Alert title',
    example: 'Bus Delay Alert',
  })
  title: string;

  @ApiProperty({
    description: 'Alert message',
    example: 'Bus #123 is running 15 minutes late due to traffic congestion.',
  })
  message: string;

  @ApiProperty({
    description: 'Affected students',
    type: [Object],
  })
  affectedStudents: Array<{
    studentId: string;
    studentName: string;
    busId: string;
    estimatedDelay: number;
  }>;

  @ApiProperty({
    description: 'Alert location',
  })
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };

  @ApiProperty({
    description: 'Bus information',
  })
  busInfo?: {
    busId: string;
    busNumber: string;
    driverName: string;
    currentLocation: {
      latitude: number;
      longitude: number;
    };
  };

  @ApiProperty({
    description: 'Recommended actions',
    type: [String],
  })
  recommendedActions: string[];

  @ApiProperty({
    description: 'Emergency contacts',
    type: [Object],
  })
  emergencyContacts: Array<{
    name: string;
    phone: string;
    type: EmergencyContactType;
  }>;

  @ApiProperty({
    description: 'Alert creation time',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Alert expiration time',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Whether alert has been acknowledged',
    example: false,
  })
  acknowledged: boolean;

  @ApiProperty({
    description: 'Acknowledgment time',
  })
  acknowledgedAt?: Date;

  @ApiProperty({
    description: 'Resolution information',
  })
  resolution?: {
    resolved: boolean;
    resolvedAt: Date;
    resolution: string;
    resolvedBy: string;
  };
}

export class EmergencyContactResponseDto {
  @ApiProperty({
    description: 'Emergency contact ID',
    example: 'contact-001',
  })
  contactId: string;

  @ApiProperty({
    description: 'Contact name',
    example: 'Mrs. Johnson',
  })
  name: string;

  @ApiProperty({
    description: 'Contact type',
    enum: EmergencyContactType,
  })
  type: EmergencyContactType;

  @ApiProperty({
    description: 'Contact title/role',
    example: 'School Nurse',
  })
  title: string;

  @ApiProperty({
    description: 'Primary phone number',
    example: '+1-555-0123',
  })
  phone: string;

  @ApiProperty({
    description: 'Secondary phone number',
  })
  secondaryPhone?: string;

  @ApiProperty({
    description: 'Email address',
    example: 'nurse@school.com',
  })
  email: string;

  @ApiProperty({
    description: 'Contact priority (1 = highest)',
    example: 1,
  })
  priority: number;

  @ApiProperty({
    description: 'Available hours',
    example: '8:00 AM - 4:00 PM',
  })
  availableHours: string;

  @ApiProperty({
    description: 'Emergency protocols this contact handles',
    type: [String],
    example: ['Medical emergencies', 'Transportation issues', 'Safety concerns'],
  })
  emergencyProtocols: string[];

  @ApiProperty({
    description: 'Response time expectation',
    example: 'Within 5 minutes',
  })
  responseTime: string;

  @ApiProperty({
    description: 'Location information',
  })
  location?: {
    building: string;
    room: string;
    floor: string;
  };

  @ApiProperty({
    description: 'Special qualifications',
    type: [String],
    example: ['CPR certified', 'First aid trained', 'Emergency response coordinator'],
  })
  qualifications: string[];

  @ApiProperty({
    description: 'Last updated timestamp',
  })
  lastUpdated: Date;
}

export class TransportationStatsResponseDto {
  @ApiProperty({
    description: 'Time range for statistics',
    example: 'month',
  })
  timeRange: string;

  @ApiProperty({
    description: 'Overall statistics',
  })
  overall: {
    totalTrips: number;
    completedTrips: number;
    onTimePercentage: number;
    averageDelayMinutes: number;
    totalDistance: number; // km
    totalStudentsTransported: number;
  };

  @ApiProperty({
    description: 'Safety statistics',
  })
  safety: {
    totalIncidents: number;
    incidentRate: number; // per 1000 trips
    emergencyResponses: number;
    safetyRating: number; // 1-5 scale
    mostCommonIssues: Array<{
      issue: string;
      count: number;
      percentage: number;
    }>;
  };

  @ApiProperty({
    description: 'Performance by route',
    type: [Object],
  })
  routePerformance: Array<{
    routeId: string;
    routeName: string;
    trips: number;
    onTimePercentage: number;
    averageDelay: number;
    safetyIncidents: number;
    studentSatisfaction: number;
  }>;

  @ApiProperty({
    description: 'Bus performance',
    type: [Object],
  })
  busPerformance: Array<{
    busId: string;
    busNumber: string;
    trips: number;
    onTimePercentage: number;
    maintenanceIssues: number;
    fuelEfficiency: number;
    driverRating: number;
  }>;

  @ApiProperty({
    description: 'Student transportation summary',
  })
  studentSummary: {
    totalStudents: number;
    studentsUsingTransportation: number;
    transportationUsageRate: number;
    averageDistance: number;
    mostPopularRoutes: Array<{
      routeId: string;
      routeName: string;
      studentCount: number;
    }>;
  };

  @ApiProperty({
    description: 'Weather impact summary',
  })
  weatherImpact: {
    totalWeatherDelays: number;
    averageWeatherDelay: number;
    mostAffectedRoutes: Array<{
      routeId: string;
      routeName: string;
      weatherDelays: number;
    }>;
  };

  @ApiProperty({
    description: 'Cost efficiency metrics',
  })
  costEfficiency: {
    costPerTrip: number;
    costPerStudent: number;
    fuelCostPerKm: number;
    maintenanceCostPerTrip: number;
  };
}

export class BusTrackingResponseDto {
  @ApiProperty({
    description: 'Bus ID',
    example: 'bus-001',
  })
  busId: string;

  @ApiProperty({
    description: 'Real-time location data',
  })
  realTimeData: {
    currentLocation: {
      latitude: number;
      longitude: number;
      address: string;
      accuracy: number;
    };
    speed: number;
    heading: number; // degrees
    lastUpdated: Date;
    signalStrength: 'excellent' | 'good' | 'fair' | 'poor';
  };

  @ApiProperty({
    description: 'Route progress',
  })
  routeProgress: {
    routeId: string;
    routeName: string;
    completedStops: number;
    totalStops: number;
    progressPercentage: number;
    nextStop: {
      stopId: string;
      stopName: string;
      estimatedArrival: Date;
      distance: number; // meters
      passengersWaiting: number;
    };
    remainingStops: Array<{
      stopId: string;
      stopName: string;
      scheduledArrival: Date;
      estimatedArrival: Date;
      passengerCount: number;
    }>;
  };

  @ApiProperty({
    description: 'ETA information',
  })
  etaInfo: {
    destinationStop: {
      stopId: string;
      stopName: string;
      estimatedArrival: Date;
      confidence: 'high' | 'medium' | 'low';
    };
    keyStops: Array<{
      stopId: string;
      stopName: string;
      estimatedArrival: Date;
      isStudentStop: boolean;
      studentNames?: string[];
    }>;
  };

  @ApiProperty({
    description: 'Traffic and delay information',
  })
  trafficInfo: {
    currentDelay: number; // minutes
    delayReason: string;
    trafficConditions: 'light' | 'moderate' | 'heavy' | 'severe';
    roadIncidents: Array<{
      type: 'accident' | 'construction' | 'closure' | 'weather';
      description: string;
      impact: 'minor' | 'moderate' | 'severe';
      estimatedDuration: number; // minutes
    }>;
    alternativeRoutes: Array<{
      routeId: string;
      routeName: string;
      additionalTime: number;
      reason: string;
    }>;
  };

  @ApiProperty({
    description: 'Passenger and capacity information',
  })
  passengerInfo: {
    currentPassengers: number;
    capacity: number;
    utilizationRate: number;
    studentsOnBoard: number;
    adultsOnBoard: number;
    specialNeedsPassengers: number;
    nextStopActivity: {
      gettingOff: number;
      gettingOn: number;
      totalChange: number;
    };
  };

  @ApiProperty({
    description: 'Vehicle status',
  })
  vehicleStatus: {
    engineStatus: 'running' | 'stopped' | 'idle';
    fuelLevel: number; // percentage
    temperature: number; // celsius
    tirePressure: 'normal' | 'low' | 'critical';
    maintenanceAlerts: Array<{
      type: 'oil_change' | 'tire_rotation' | 'inspection' | 'repair';
      description: string;
      urgency: 'low' | 'medium' | 'high';
      dueDate: Date;
    }>;
  };

  @ApiProperty({
    description: 'Safety and security information',
  })
  safetyInfo: {
    emergencyButtonStatus: 'normal' | 'pressed' | 'reset';
    cameraStatus: 'online' | 'offline' | 'maintenance';
    driverStatus: 'normal' | 'distracted' | 'fatigued';
    lastSafetyCheck: Date;
    activeAlerts: Array<{
      alertId: string;
      type: SafetyAlertType;
      severity: SafetyAlertSeverity;
      description: string;
      timestamp: Date;
    }>;
  };

  @ApiProperty({
    description: 'Historical tracking data',
    type: [Object],
  })
  historicalData: Array<{
    timestamp: Date;
    latitude: number;
    longitude: number;
    speed: number;
    event?: string;
  }>;
}

// List Response DTOs
export class TransportationInfoListResponseDto {
  @ApiProperty({
    description: 'Transportation information for all children',
    type: [TransportationInfoResponseDto],
  })
  transportationInfo: TransportationInfoResponseDto[];

  @ApiProperty({
    description: 'Summary information',
  })
  summary: {
    totalChildren: number;
    childrenUsingTransportation: number;
    totalRoutes: number;
    totalBuses: number;
    averageOnTimePercentage: number;
  };
}

export class SafetyAlertListResponseDto {
  @ApiProperty({
    description: 'Safety alerts',
    type: [SafetyAlertResponseDto],
  })
  alerts: SafetyAlertResponseDto[];

  @ApiProperty({
    description: 'Total count',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Alert summary by severity',
  })
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    active: number;
    acknowledged: number;
  };

  @ApiProperty({
    description: 'Alert summary by type',
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  byType: Record<string, number>;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Page size',
    example: 20,
  })
  limit: number;
}

// Index export
export * from './transportation.dto';