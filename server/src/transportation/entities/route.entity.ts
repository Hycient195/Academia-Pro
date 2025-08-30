// Academia Pro - Route Entity
// Entity for managing transportation routes

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Index } from 'typeorm';

export enum RouteType {
  SCHOOL_PICKUP = 'school_pickup',
  SCHOOL_DROPOFF = 'school_dropoff',
  ROUND_TRIP = 'round_trip',
  SPECIAL_NEEDS = 'special_needs',
  EMERGENCY = 'emergency',
}

export enum RouteStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  SUSPENDED = 'suspended',
}

@Entity('transport_routes')
@Index(['schoolId', 'routeType'])
@Index(['schoolId', 'status'])
export class TransportRoute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'route_code', type: 'varchar', length: 20, unique: true })
  routeCode: string;

  @Column({ name: 'route_name', type: 'varchar', length: 100 })
  routeName: string;

  @Column({
    name: 'route_type',
    type: 'enum',
    enum: RouteType,
    default: RouteType.ROUND_TRIP,
  })
  routeType: RouteType;

  @Column({
    type: 'enum',
    enum: RouteStatus,
    default: RouteStatus.ACTIVE,
  })
  status: RouteStatus;

  @Column({ name: 'start_location', type: 'varchar', length: 200 })
  startLocation: string;

  @Column({ name: 'end_location', type: 'varchar', length: 200 })
  endLocation: string;

  @Column({ name: 'distance_km', type: 'decimal', precision: 8, scale: 2 })
  distanceKm: number;

  @Column({ name: 'estimated_duration_minutes', type: 'int' })
  estimatedDurationMinutes: number;

  @Column({ name: 'pickup_time', type: 'time' })
  pickupTime: string;

  @Column({ name: 'dropoff_time', type: 'time' })
  dropoffTime: string;

  @Column({ name: 'capacity', type: 'int' })
  capacity: number;

  @Column({ name: 'current_occupancy', type: 'int', default: 0 })
  currentOccupancy: number;

  @Column({ name: 'assigned_vehicle_id', type: 'uuid', nullable: true })
  assignedVehicleId: string;

  @Column({ name: 'assigned_driver_id', type: 'uuid', nullable: true })
  assignedDriverId: string;

  @Column({ name: 'route_coordinates', type: 'jsonb', nullable: true })
  routeCoordinates: {
    waypoints: Array<{
      latitude: number;
      longitude: number;
      address: string;
      stopOrder: number;
      estimatedArrival: string;
    }>;
  };

  @Column({ name: 'route_stops', type: 'jsonb', nullable: true })
  routeStops: Array<{
    stopId: string;
    stopName: string;
    latitude: number;
    longitude: number;
    pickupTime: string;
    dropoffTime: string;
    studentCount: number;
  }>;

  @Column({ name: 'route_schedule', type: 'jsonb', nullable: true })
  routeSchedule: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
    holidays: boolean;
  };

  @Column({ name: 'route_fees', type: 'jsonb', nullable: true })
  routeFees: {
    baseFee: number;
    distanceFee: number;
    specialNeedsFee: number;
    emergencyFee: number;
    currency: string;
  };

  @Column({ name: 'safety_features', type: 'jsonb', nullable: true })
  safetyFeatures: {
    gpsTracking: boolean;
    emergencyButton: boolean;
    speedMonitoring: boolean;
    driverMonitoring: boolean;
    cameraSurveillance: boolean;
    firstAidKit: boolean;
    fireExtinguisher: boolean;
  };

  @Column({ name: 'performance_metrics', type: 'jsonb', nullable: true })
  performanceMetrics: {
    onTimePickupRate: number;
    onTimeDropoffRate: number;
    averageDelayMinutes: number;
    safetyIncidents: number;
    parentSatisfaction: number;
  };

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations (to be added when other entities are created)
  // @ManyToOne(() => Vehicle)
  // @JoinColumn({ name: 'assigned_vehicle_id' })
  // assignedVehicle: Vehicle;

  // @ManyToOne(() => Driver)
  // @JoinColumn({ name: 'assigned_driver_id' })
  // assignedDriver: Driver;

  // @OneToMany(() => StudentTransport, transport => transport.route)
  // studentTransports: StudentTransport[];
}