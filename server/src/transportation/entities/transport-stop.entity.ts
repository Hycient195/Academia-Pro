// Academia Pro - Transport Stop Entity
// Entity for managing transportation stops and waypoints

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Index } from 'typeorm';

export enum StopType {
  PICKUP = 'pickup',
  DROPOFF = 'dropoff',
  WAYPOINT = 'waypoint',
  EMERGENCY = 'emergency',
}

export enum StopStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TEMPORARILY_CLOSED = 'temporarily_closed',
  PERMANENTLY_CLOSED = 'permanently_closed',
}

@Entity('transport_stops')
@Index(['schoolId', 'stopType'])
@Index(['schoolId', 'status'])
@Index(['latitude', 'longitude'])
export class TransportStop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'stop_code', type: 'varchar', length: 20, unique: true })
  stopCode: string;

  @Column({ name: 'stop_name', type: 'varchar', length: 100 })
  stopName: string;

  @Column({
    name: 'stop_type',
    type: 'enum',
    enum: StopType,
    default: StopType.PICKUP,
  })
  stopType: StopType;

  @Column({
    type: 'enum',
    enum: StopStatus,
    default: StopStatus.ACTIVE,
  })
  status: StopStatus;

  @Column({ name: 'latitude', type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ name: 'longitude', type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ name: 'address', type: 'varchar', length: 300 })
  address: string;

  @Column({ name: 'city', type: 'varchar', length: 100 })
  city: string;

  @Column({ name: 'state', type: 'varchar', length: 100, nullable: true })
  state: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  postalCode: string;

  @Column({ name: 'country', type: 'varchar', length: 100, default: 'Nigeria' })
  country: string;

  @Column({ name: 'landmark', type: 'varchar', length: 200, nullable: true })
  landmark: string;

  @Column({ name: 'contact_person', type: 'varchar', length: 100, nullable: true })
  contactPerson: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 20, nullable: true })
  contactPhone: string;

  @Column({ name: 'estimated_students', type: 'int', default: 0 })
  estimatedStudents: number;

  @Column({ name: 'current_students', type: 'int', default: 0 })
  currentStudents: number;

  @Column({ name: 'stop_order', type: 'int', nullable: true })
  stopOrder: number;

  @Column({ name: 'estimated_arrival_time', type: 'time', nullable: true })
  estimatedArrivalTime: string;

  @Column({ name: 'estimated_departure_time', type: 'time', nullable: true })
  estimatedDepartureTime: string;

  @Column({ name: 'safety_rating', type: 'int', nullable: true })
  safetyRating: number; // 1-5 scale

  @Column({ name: 'traffic_conditions', type: 'jsonb', nullable: true })
  trafficConditions: {
    peakHours: string[];
    averageDelayMinutes: number;
    congestionLevel: 'low' | 'medium' | 'high';
    alternativeRoutes: string[];
  };

  @Column({ name: 'accessibility_features', type: 'jsonb', nullable: true })
  accessibilityFeatures: {
    wheelchairAccessible: boolean;
    visualAids: boolean;
    audioAnnouncements: boolean;
    stepAssistance: boolean;
    specialNeedsSupport: boolean;
  };

  @Column({ name: 'historical_data', type: 'jsonb', nullable: true })
  historicalData: {
    averagePickupTime: string;
    averageDropoffTime: string;
    onTimePerformance: number; // percentage
    commonDelays: string[];
    studentAttendance: number; // average count
  };

  @Column({ name: 'emergency_contacts', type: 'jsonb', nullable: true })
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    priority: number;
  }>;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations (to be added when other entities are created)
  // @ManyToOne(() => TransportRoute)
  // @JoinColumn({ name: 'route_id' })
  // route: TransportRoute;

  // @OneToMany(() => StudentTransport, transport => transport.pickupStop)
  // pickupTransports: StudentTransport[];

  // @OneToMany(() => StudentTransport, transport => transport.dropoffStop)
  // dropoffTransports: StudentTransport[];
}