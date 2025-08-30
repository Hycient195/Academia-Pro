// Academia Pro - Vehicle Entity
// Entity for managing transportation vehicles

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Index } from 'typeorm';

export enum VehicleType {
  BUS = 'bus',
  VAN = 'van',
  CAR = 'car',
  SUV = 'suv',
  SPECIAL_NEEDS_VEHICLE = 'special_needs_vehicle',
  EMERGENCY_VEHICLE = 'emergency_vehicle',
}

export enum VehicleStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  OUT_OF_SERVICE = 'out_of_service',
  DECOMMISSIONED = 'decommissioned',
}

export enum FuelType {
  DIESEL = 'diesel',
  PETROL = 'petrol',
  CNG = 'cng',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
}

@Entity('transport_vehicles')
@Index(['schoolId', 'vehicleType'])
@Index(['schoolId', 'status'])
@Index(['schoolId', 'registrationNumber'], { unique: true })
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'vehicle_code', type: 'varchar', length: 20, unique: true })
  vehicleCode: string;

  @Column({ name: 'registration_number', type: 'varchar', length: 20, unique: true })
  registrationNumber: string;

  @Column({ name: 'vehicle_name', type: 'varchar', length: 100 })
  vehicleName: string;

  @Column({
    name: 'vehicle_type',
    type: 'enum',
    enum: VehicleType,
    default: VehicleType.BUS,
  })
  vehicleType: VehicleType;

  @Column({
    type: 'enum',
    enum: VehicleStatus,
    default: VehicleStatus.ACTIVE,
  })
  status: VehicleStatus;

  @Column({ name: 'make', type: 'varchar', length: 50 })
  make: string;

  @Column({ name: 'model', type: 'varchar', length: 50 })
  model: string;

  @Column({ name: 'year', type: 'int' })
  year: number;

  @Column({ name: 'capacity', type: 'int' })
  capacity: number;

  @Column({ name: 'current_occupancy', type: 'int', default: 0 })
  currentOccupancy: number;

  @Column({
    name: 'fuel_type',
    type: 'enum',
    enum: FuelType,
    default: FuelType.DIESEL,
  })
  fuelType: FuelType;

  @Column({ name: 'fuel_capacity', type: 'decimal', precision: 8, scale: 2 })
  fuelCapacity: number; // liters

  @Column({ name: 'current_fuel_level', type: 'decimal', precision: 5, scale: 2, default: 0 })
  currentFuelLevel: number; // percentage

  @Column({ name: 'mileage', type: 'decimal', precision: 10, scale: 2 })
  mileage: number; // km

  @Column({ name: 'last_service_date', type: 'date', nullable: true })
  lastServiceDate: Date;

  @Column({ name: 'next_service_date', type: 'date', nullable: true })
  nextServiceDate: Date;

  @Column({ name: 'insurance_expiry', type: 'date' })
  insuranceExpiry: Date;

  @Column({ name: 'road_tax_expiry', type: 'date' })
  roadTaxExpiry: Date;

  @Column({ name: 'permit_expiry', type: 'date' })
  permitExpiry: Date;

  @Column({ name: 'assigned_driver_id', type: 'uuid', nullable: true })
  assignedDriverId: string;

  @Column({ name: 'assigned_route_id', type: 'uuid', nullable: true })
  assignedRouteId: string;

  @Column({ name: 'gps_device_id', type: 'varchar', length: 50, nullable: true })
  gpsDeviceId: string;

  @Column({ name: 'current_location', type: 'jsonb', nullable: true })
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdated: Date;
    speed: number;
    heading: number;
  };

  @Column({ name: 'vehicle_features', type: 'jsonb', nullable: true })
  vehicleFeatures: {
    acAvailable: boolean;
    wifiAvailable: boolean;
    usbCharging: boolean;
    entertainmentSystem: boolean;
    wheelchairAccessible: boolean;
    emergencyButton: boolean;
    firstAidKit: boolean;
    fireExtinguisher: boolean;
    seatBelts: boolean;
    speedGovernor: boolean;
  };

  @Column({ name: 'maintenance_history', type: 'jsonb', nullable: true })
  maintenanceHistory: Array<{
    date: Date;
    type: string;
    description: string;
    cost: number;
    mileage: number;
    performedBy: string;
    nextServiceDue: Date;
  }>;

  @Column({ name: 'fuel_history', type: 'jsonb', nullable: true })
  fuelHistory: Array<{
    date: Date;
    liters: number;
    cost: number;
    mileage: number;
    fuelStation: string;
    driverId: string;
  }>;

  @Column({ name: 'performance_metrics', type: 'jsonb', nullable: true })
  performanceMetrics: {
    totalTrips: number;
    totalDistance: number;
    averageFuelEfficiency: number;
    averageSpeed: number;
    onTimeRate: number;
    safetyIncidents: number;
    maintenanceCostPerKm: number;
  };

  @Column({ name: 'safety_compliance', type: 'jsonb', nullable: true })
  safetyCompliance: {
    lastSafetyInspection: Date;
    nextSafetyInspection: Date;
    safetyRating: number; // 1-5 scale
    complianceStatus: 'compliant' | 'warning' | 'non_compliant';
    issues: string[];
  };

  @Column({ name: 'purchase_info', type: 'jsonb', nullable: true })
  purchaseInfo: {
    purchaseDate: Date;
    purchasePrice: number;
    supplier: string;
    warrantyPeriod: number; // months
    depreciationMethod: string;
    salvageValue: number;
  };

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations (to be added when other entities are created)
  // @ManyToOne(() => Driver)
  // @JoinColumn({ name: 'assigned_driver_id' })
  // assignedDriver: Driver;

  // @ManyToOne(() => TransportRoute)
  // @JoinColumn({ name: 'assigned_route_id' })
  // assignedRoute: TransportRoute;

  // @OneToMany(() => TripLog, log => log.vehicle)
  // tripLogs: TripLog[];
}