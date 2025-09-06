// Academia Pro - Driver Entity
// Entity for managing transportation drivers

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, Index } from 'typeorm';

export enum DriverStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  TERMINATED = 'terminated',
  ON_LEAVE = 'on_leave',
}

export enum LicenseType {
  COMMERCIAL = 'commercial',
  PRIVATE = 'private',
  PUBLIC_SERVICE = 'public_service',
  HEAVY_DUTY = 'heavy_duty',
}

@Entity('transport_drivers')
@Index(['schoolId', 'status'])
@Index(['schoolId', 'licenseNumber'], { unique: true })
@Index(['schoolId', 'phoneNumber'])
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'driver_code', type: 'varchar', length: 20, unique: true })
  driverCode: string;

  @Column({ name: 'first_name', type: 'varchar', length: 50 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 50 })
  lastName: string;

  @Column({ name: 'middle_name', type: 'varchar', length: 50, nullable: true })
  middleName?: string;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ name: 'date_of_birth', type: 'date' })
  dateOfBirth: Date;

  @Column({ name: 'gender', type: 'varchar', length: 10 })
  gender: string;

  @Column({ name: 'phone_number', type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ name: 'email', type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ name: 'address', type: 'varchar', length: 300 })
  address: string;

  @Column({
    type: 'enum',
    enum: DriverStatus,
    default: DriverStatus.ACTIVE,
  })
  status: DriverStatus;

  @Column({ name: 'license_number', type: 'varchar', length: 20 })
  licenseNumber: string;

  @Column({
    name: 'license_type',
    type: 'enum',
    enum: LicenseType,
    default: LicenseType.COMMERCIAL,
  })
  licenseType: LicenseType;

  @Column({ name: 'license_expiry', type: 'date' })
  licenseExpiry: Date;

  @Column({ name: 'license_issue_date', type: 'date' })
  licenseIssueDate: Date;

  @Column({ name: 'license_issuing_authority', type: 'varchar', length: 100 })
  licenseIssuingAuthority: string;

  @Column({ name: 'emergency_contact_name', type: 'varchar', length: 100 })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone', type: 'varchar', length: 20 })
  emergencyContactPhone: string;

  @Column({ name: 'emergency_contact_relationship', type: 'varchar', length: 50 })
  emergencyContactRelationship: string;

  @Column({ name: 'assigned_vehicle_id', type: 'uuid', nullable: true })
  assignedVehicleId: string;

  @Column({ name: 'assigned_route_id', type: 'uuid', nullable: true })
  assignedRouteId: string;

  @Column({ name: 'work_schedule', type: 'jsonb', nullable: true })
  workSchedule: {
    monday: { startTime: string; endTime: string; active: boolean };
    tuesday: { startTime: string; endTime: string; active: boolean };
    wednesday: { startTime: string; endTime: string; active: boolean };
    thursday: { startTime: string; endTime: string; active: boolean };
    friday: { startTime: string; endTime: string; active: boolean };
    saturday: { startTime: string; endTime: string; active: boolean };
    sunday: { startTime: string; endTime: string; active: boolean };
  };

  @Column({ name: 'performance_metrics', type: 'jsonb', nullable: true })
  performanceMetrics: {
    totalTrips: number;
    completedTrips: number;
    onTimeRate: number; // percentage
    averageRating: number; // 1-5 scale
    safetyIncidents: number;
    fuelEfficiency: number; // km/l
    totalDistance: number;
  };

  @Column({ name: 'certifications', type: 'jsonb', nullable: true })
  certifications: Array<{
    certificationName: string;
    issuingAuthority: string;
    issueDate: Date;
    expiryDate: Date;
    certificateNumber: string;
  }>;

  @Column({ name: 'training_records', type: 'jsonb', nullable: true })
  trainingRecords: Array<{
    trainingName: string;
    trainingDate: Date;
    completionDate: Date;
    trainer: string;
    status: 'completed' | 'in_progress' | 'failed';
    score?: number;
  }>;

  @Column({ name: 'background_check', type: 'jsonb', nullable: true })
  backgroundCheck: {
    checkDate: Date;
    status: 'passed' | 'failed' | 'pending';
    policeClearance: boolean;
    drivingRecord: 'clean' | 'minor' | 'major';
    referenceChecks: Array<{
      name: string;
      contact: string;
      rating: number;
      comments: string;
    }>;
  };

  @Column({ name: 'medical_records', type: 'jsonb', nullable: true })
  medicalRecords: {
    lastMedicalCheck: Date;
    nextMedicalCheck: Date;
    medicalConditions: string[];
    allergies: string[];
    medications: string[];
    fitnessToDrive: boolean;
    restrictions: string[];
  };

  @Column({ name: 'salary_info', type: 'jsonb', nullable: true })
  salaryInfo: {
    baseSalary: number;
    allowances: {
      transport: number;
      meal: number;
      phone: number;
      other: number;
    };
    deductions: {
      tax: number;
      insurance: number;
      other: number;
    };
    netSalary: number;
    paymentFrequency: 'monthly' | 'weekly' | 'daily';
  };

  @Column({ name: 'current_location', type: 'jsonb', nullable: true })
  currentLocation: {
    latitude: number;
    longitude: number;
    address: string;
    lastUpdated: Date;
    status: 'on_duty' | 'off_duty' | 'on_break';
  };

  @Column({ name: 'communication_preferences', type: 'jsonb', nullable: true })
  communicationPreferences: {
    smsEnabled: boolean;
    emailEnabled: boolean;
    pushEnabled: boolean;
    emergencyContact: boolean;
    scheduleUpdates: boolean;
    performanceReports: boolean;
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

  // @ManyToOne(() => TransportRoute)
  // @JoinColumn({ name: 'assigned_route_id' })
  // assignedRoute: TransportRoute;

  // @OneToMany(() => TripLog, log => log.driver)
  // tripLogs: TripLog[];
}