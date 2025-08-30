// Academia Pro - Hostel Entity
// Database entity for managing hostel/dormitory accommodations

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index, Unique } from 'typeorm';

export enum HostelType {
  BOYS = 'boys',
  GIRLS = 'girls',
  MIXED = 'mixed',
  INTERNATIONAL = 'international',
  VIP = 'vip',
  STAFF = 'staff',
  GUEST = 'guest',
}

export enum HostelStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_MAINTENANCE = 'under_maintenance',
  CLOSED = 'closed',
  DECOMMISSIONED = 'decommissioned',
}

export enum RoomType {
  SINGLE = 'single',
  DOUBLE = 'double',
  TRIPLE = 'triple',
  QUADRUPLE = 'quadruple',
  SUITE = 'suite',
  DORMITORY = 'dormitory',
  STUDIO = 'studio',
}

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  UNDER_MAINTENANCE = 'under_maintenance',
  OUT_OF_ORDER = 'out_of_order',
  QUARANTINE = 'quarantine',
}

export enum BedStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  RESERVED = 'reserved',
  OUT_OF_ORDER = 'out_of_order',
  QUARANTINE = 'quarantine',
}

export enum FacilityType {
  WIFI = 'wifi',
  LAUNDRY = 'laundry',
  GYM = 'gym',
  STUDY_ROOM = 'study_room',
  COMMON_ROOM = 'common_room',
  KITCHEN = 'kitchen',
  DINING_HALL = 'dining_hall',
  SECURITY = 'security',
  PARKING = 'parking',
  GARDEN = 'garden',
  SWIMMING_POOL = 'swimming_pool',
  LIBRARY = 'library',
  COMPUTER_LAB = 'computer_lab',
  MEDICAL_ROOM = 'medical_room',
  PRAYER_ROOM = 'prayer_room',
  GAMES_ROOM = 'games_room',
  TV_ROOM = 'tv_room',
  STORE = 'store',
  CAFETERIA = 'cafeteria',
}

export enum MaintenanceType {
  ELECTRICAL = 'electrical',
  PLUMBING = 'plumbing',
  CARPENTRY = 'carpentry',
  PAINTING = 'painting',
  CLEANING = 'cleaning',
  HVAC = 'hvac',
  SECURITY = 'security',
  LANDSCAPING = 'landscaping',
  PEST_CONTROL = 'pest_control',
  OTHER = 'other',
}

export enum MaintenanceStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DEFERRED = 'deferred',
}

export enum AllocationStatus {
  ACTIVE = 'active',
  CHECKED_OUT = 'checked_out',
  TRANSFERRED = 'transferred',
  TERMINATED = 'terminated',
  SUSPENDED = 'suspended',
}

@Entity('hostels')
@Unique(['schoolId', 'hostelCode'])
@Index(['schoolId', 'hostelType'])
@Index(['schoolId', 'status'])
@Index(['schoolId', 'wardenId'])
export class Hostel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'hostel_name', type: 'varchar', length: 200 })
  hostelName: string;

  @Column({ name: 'hostel_code', type: 'varchar', length: 20 })
  hostelCode: string;

  @Column({
    name: 'hostel_type',
    type: 'enum',
    enum: HostelType,
    default: HostelType.MIXED,
  })
  hostelType: HostelType;

  @Column({
    type: 'enum',
    enum: HostelStatus,
    default: HostelStatus.ACTIVE,
  })
  status: HostelStatus;

  // Location Information
  @Column({ name: 'address', type: 'jsonb' })
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  @Column({ name: 'building_number', type: 'varchar', length: 20, nullable: true })
  buildingNumber?: string;

  @Column({ name: 'floors', type: 'int', default: 1 })
  floors: number;

  // Capacity Information
  @Column({ name: 'total_rooms', type: 'int', default: 0 })
  totalRooms: number;

  @Column({ name: 'total_beds', type: 'int', default: 0 })
  totalBeds: number;

  @Column({ name: 'occupied_beds', type: 'int', default: 0 })
  occupiedBeds: number;

  @Column({ name: 'available_beds', type: 'int', default: 0 })
  availableBeds: number;

  // Management Information
  @Column({ name: 'warden_id', type: 'uuid', nullable: true })
  wardenId?: string;

  @Column({ name: 'warden_name', type: 'varchar', length: 100, nullable: true })
  wardenName?: string;

  @Column({ name: 'warden_contact', type: 'varchar', length: 20, nullable: true })
  wardenContact?: string;

  @Column({ name: 'assistant_warden_id', type: 'uuid', nullable: true })
  assistantWardenId?: string;

  @Column({ name: 'assistant_warden_name', type: 'varchar', length: 100, nullable: true })
  assistantWardenName?: string;

  // Facilities and Amenities
  @Column({ name: 'facilities', type: 'jsonb', default: [] })
  facilities: Array<{
    type: FacilityType;
    name: string;
    description?: string;
    isAvailable: boolean;
    operatingHours?: {
      open: string;
      close: string;
      days: string[];
    };
  }>;

  // Rules and Policies
  @Column({ name: 'rules', type: 'jsonb', default: {} })
  rules: {
    checkInTime: string;
    checkOutTime: string;
    visitorsAllowed: boolean;
    visitorHours?: {
      start: string;
      end: string;
    };
    smokingAllowed: boolean;
    alcoholAllowed: boolean;
    petsAllowed: boolean;
    cookingAllowed: boolean;
    noisePolicy: string;
    cleaningSchedule: string;
    laundryFacilities: boolean;
    parkingAvailable: boolean;
    curfewTime?: string;
    additionalRules?: string[];
  };

  // Pricing Information
  @Column({ name: 'pricing', type: 'jsonb', default: {} })
  pricing: {
    baseRent: number;
    currency: string;
    billingCycle: 'monthly' | 'quarterly' | 'semesterly' | 'yearly';
    securityDeposit: number;
    maintenanceFee: number;
    utilitiesIncluded: boolean;
    internetIncluded: boolean;
    laundryIncluded: boolean;
    mealPlanAvailable: boolean;
    mealPlanCost?: number;
    discounts?: Array<{
      type: 'scholarship' | 'early_payment' | 'long_term' | 'sibling';
      percentage: number;
      description: string;
    }>;
  };

  // Contact Information
  @Column({ name: 'contact_info', type: 'jsonb', default: {} })
  contactInfo: {
    phone: string;
    email: string;
    emergencyContact: string;
    officeHours: {
      weekdays: {
        open: string;
        close: string;
      };
      weekends?: {
        open: string;
        close: string;
      };
    };
  };

  // Operational Information
  @Column({ name: 'operating_hours', type: 'jsonb', default: {} })
  operatingHours: {
    weekdays: {
      open: string;
      close: string;
    };
    weekends: {
      open: string;
      close: string;
    };
    holidays?: {
      closed: boolean;
      exceptions?: string[];
    };
  };

  // Security and Safety
  @Column({ name: 'security_features', type: 'jsonb', default: [] })
  securityFeatures: Array<{
    type: string;
    description: string;
    isActive: boolean;
  }>;

  // Maintenance and Operations
  @Column({ name: 'maintenance_schedule', type: 'jsonb', default: {} })
  maintenanceSchedule: {
    regularCleaning: string;
    deepCleaning: string;
    pestControl: string;
    fireSafetyChecks: string;
    electricalInspections: string;
    plumbingChecks: string;
  };

  // Statistics and Analytics
  @Column({ name: 'occupancy_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  occupancyRate: number;

  @Column({ name: 'average_stay_duration', type: 'int', default: 0 })
  averageStayDuration: number;

  @Column({ name: 'turnover_rate', type: 'decimal', precision: 5, scale: 2, default: 0 })
  turnoverRate: number;

  // Metadata
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'amenities', type: 'jsonb', default: [] })
  amenities: string[];

  @Column({ name: 'photos', type: 'jsonb', default: [] })
  photos: Array<{
    url: string;
    caption?: string;
    isPrimary: boolean;
    room?: string;
  }>;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: {
    yearBuilt?: number;
    lastRenovated?: number;
    energyRating?: string;
    accessibilityFeatures?: string[];
    nearbyFacilities?: string[];
    transportationAccess?: string[];
    tags?: string[];
  };

  @Column({ name: 'internal_notes', type: 'text', nullable: true })
  internalNotes?: string;

  // Audit Fields
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  // Virtual properties
  get isFull(): boolean {
    return this.availableBeds === 0;
  }

  get isActive(): boolean {
    return this.status === HostelStatus.ACTIVE;
  }

  get occupancyPercentage(): number {
    if (this.totalBeds === 0) return 0;
    return Math.round((this.occupiedBeds / this.totalBeds) * 100 * 100) / 100;
  }

  get availableRooms(): number {
    // This would need room data to calculate properly
    return Math.max(0, this.totalRooms - Math.ceil(this.occupiedBeds / 2)); // Assuming average 2 beds per room
  }

  get hasFacilities(): boolean {
    return this.facilities.length > 0;
  }

  get hasAmenities(): boolean {
    return this.amenities.length > 0;
  }

  // Methods
  updateOccupancy(occupiedBeds: number): void {
    this.occupiedBeds = occupiedBeds;
    this.availableBeds = Math.max(0, this.totalBeds - occupiedBeds);
    this.occupancyRate = this.occupancyPercentage;
    this.updatedAt = new Date();
  }

  addFacility(facility: typeof this.facilities[0]): void {
    this.facilities = [...this.facilities, facility];
  }

  removeFacility(facilityType: FacilityType): void {
    this.facilities = this.facilities.filter(f => f.type !== facilityType);
  }

  updateRules(updates: Partial<typeof this.rules>): void {
    this.rules = {
      ...this.rules,
      ...updates,
    };
  }

  updatePricing(updates: Partial<typeof this.pricing>): void {
    this.pricing = {
      ...this.pricing,
      ...updates,
    };
  }

  addAmenity(amenity: string): void {
    if (!this.amenities.includes(amenity)) {
      this.amenities = [...this.amenities, amenity];
    }
  }

  removeAmenity(amenity: string): void {
    this.amenities = this.amenities.filter(a => a !== amenity);
  }

  markAsUnderMaintenance(): void {
    this.status = HostelStatus.UNDER_MAINTENANCE;
    this.updatedAt = new Date();
  }

  markAsActive(): void {
    this.status = HostelStatus.ACTIVE;
    this.updatedAt = new Date();
  }

  markAsClosed(): void {
    this.status = HostelStatus.CLOSED;
    this.updatedAt = new Date();
  }

  // Relations (to be added as needed)
  // @ManyToOne(() => School)
  // @JoinColumn({ name: 'school_id' })
  // school: School;

  // @OneToMany(() => Room)
  // rooms: Room[];

  // @OneToMany(() => HostelAllocation)
  // allocations: HostelAllocation[];

  // @OneToMany(() => MaintenanceRequest)
  // maintenanceRequests: MaintenanceRequest[];
}