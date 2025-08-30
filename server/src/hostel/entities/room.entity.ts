// Academia Pro - Room Entity
// Database entity for managing hostel rooms

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index, Unique } from 'typeorm';
import { Hostel, RoomType, RoomStatus, BedStatus } from './hostel.entity';

@Entity('hostel_rooms')
@Unique(['hostelId', 'roomNumber'])
@Index(['hostelId', 'floor'])
@Index(['hostelId', 'roomType'])
@Index(['hostelId', 'status'])
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'hostel_id', type: 'uuid' })
  hostelId: string;

  @Column({ name: 'room_number', type: 'varchar', length: 20 })
  roomNumber: string;

  @Column({ name: 'floor', type: 'int' })
  floor: number;

  @Column({
    name: 'room_type',
    type: 'enum',
    enum: RoomType,
    default: RoomType.DOUBLE,
  })
  roomType: RoomType;

  @Column({
    type: 'enum',
    enum: RoomStatus,
    default: RoomStatus.AVAILABLE,
  })
  status: RoomStatus;

  // Capacity Information
  @Column({ name: 'total_beds', type: 'int', default: 2 })
  totalBeds: number;

  @Column({ name: 'occupied_beds', type: 'int', default: 0 })
  occupiedBeds: number;

  @Column({ name: 'available_beds', type: 'int', default: 2 })
  availableBeds: number;

  // Physical Characteristics
  @Column({ name: 'area_sqm', type: 'decimal', precision: 6, scale: 2, nullable: true })
  areaSqm?: number;

  @Column({ name: 'has_balcony', type: 'boolean', default: false })
  hasBalcony: boolean;

  @Column({ name: 'has_private_bathroom', type: 'boolean', default: false })
  hasPrivateBathroom: boolean;

  @Column({ name: 'has_ac', type: 'boolean', default: false })
  hasAC: boolean;

  @Column({ name: 'has_heater', type: 'boolean', default: false })
  hasHeater: boolean;

  // Amenities
  @Column({ name: 'amenities', type: 'jsonb', default: [] })
  amenities: string[];

  @Column({ name: 'furniture', type: 'jsonb', default: [] })
  furniture: Array<{
    type: string;
    quantity: number;
    condition: 'excellent' | 'good' | 'fair' | 'poor';
  }>;

  // Pricing
  @Column({ name: 'monthly_rent', type: 'decimal', precision: 8, scale: 2, nullable: true })
  monthlyRent?: number;

  @Column({ name: 'security_deposit', type: 'decimal', precision: 8, scale: 2, nullable: true })
  securityDeposit?: number;

  // Maintenance
  @Column({ name: 'last_cleaned', type: 'timestamp', nullable: true })
  lastCleaned?: Date;

  @Column({ name: 'next_cleaning_due', type: 'timestamp', nullable: true })
  nextCleaningDue?: Date;

  @Column({ name: 'maintenance_notes', type: 'text', nullable: true })
  maintenanceNotes?: string;

  // Location within hostel
  @Column({ name: 'wing', type: 'varchar', length: 20, nullable: true })
  wing?: string;

  @Column({ name: 'block', type: 'varchar', length: 20, nullable: true })
  block?: string;

  @Column({ name: 'near_window', type: 'boolean', default: false })
  nearWindow: boolean;

  @Column({ name: 'near_stairs', type: 'boolean', default: false })
  nearStairs: boolean;

  // Photos and description
  @Column({ name: 'photos', type: 'jsonb', default: [] })
  photos: Array<{
    url: string;
    caption?: string;
    isPrimary: boolean;
  }>;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // Metadata
  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata?: {
    accessibilityFeatures?: string[];
    specialNotes?: string;
    renovationHistory?: Array<{
      date: Date;
      type: string;
      description: string;
    }>;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid' })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  // Relations
  @ManyToOne(() => Hostel)
  @JoinColumn({ name: 'hostel_id' })
  hostel: Hostel;

  // Virtual properties
  get isFull(): boolean {
    return this.availableBeds === 0;
  }

  get isAvailable(): boolean {
    return this.status === RoomStatus.AVAILABLE;
  }

  get occupancyRate(): number {
    if (this.totalBeds === 0) return 0;
    return Math.round((this.occupiedBeds / this.totalBeds) * 100 * 100) / 100;
  }

  get roomCode(): string {
    return `${this.hostel?.hostelCode || 'HOSTEL'}-${this.roomNumber}`;
  }

  // Methods
  updateOccupancy(occupiedBeds: number): void {
    this.occupiedBeds = occupiedBeds;
    this.availableBeds = Math.max(0, this.totalBeds - occupiedBeds);
    this.updatedAt = new Date();
  }

  markAsAvailable(): void {
    this.status = RoomStatus.AVAILABLE;
    this.updatedAt = new Date();
  }

  markAsOccupied(): void {
    this.status = RoomStatus.OCCUPIED;
    this.updatedAt = new Date();
  }

  markAsUnderMaintenance(): void {
    this.status = RoomStatus.UNDER_MAINTENANCE;
    this.updatedAt = new Date();
  }

  markAsOutOfOrder(): void {
    this.status = RoomStatus.OUT_OF_ORDER;
    this.updatedAt = new Date();
  }

  addAmenity(amenity: string): void {
    if (!this.amenities.includes(amenity)) {
      this.amenities = [...this.amenities, amenity];
    }
  }

  removeAmenity(amenity: string): void {
    this.amenities = this.amenities.filter(a => a !== amenity);
  }

  updateCleaningSchedule(): void {
    this.lastCleaned = new Date();
    // Schedule next cleaning in 3 days
    const nextCleaning = new Date();
    nextCleaning.setDate(nextCleaning.getDate() + 3);
    this.nextCleaningDue = nextCleaning;
  }
}