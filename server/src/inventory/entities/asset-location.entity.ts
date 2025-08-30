// Academia Pro - Asset Location Entity
// Entity for managing asset locations and storage areas

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';

export enum LocationType {
  BUILDING = 'building',
  FLOOR = 'floor',
  ROOM = 'room',
  CABINET = 'cabinet',
  SHELF = 'shelf',
  STORAGE_UNIT = 'storage_unit',
  OUTDOOR = 'outdoor',
  OTHER = 'other',
}

export enum LocationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_MAINTENANCE = 'under_maintenance',
  CLOSED = 'closed',
}

@Entity('asset_locations')
@Index(['schoolId', 'locationCode'])
@Index(['schoolId', 'parentId'])
@Index(['schoolId', 'locationType'])
export class AssetLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'location_code', type: 'varchar', length: 50, unique: true })
  locationCode: string;

  @Column({ name: 'location_name', type: 'varchar', length: 255 })
  locationName: string;

  @Column({ name: 'location_description', type: 'text', nullable: true })
  locationDescription: string;

  @Column({
    name: 'location_type',
    type: 'enum',
    enum: LocationType,
  })
  locationType: LocationType;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string;

  @Column({ name: 'building_name', type: 'varchar', length: 255, nullable: true })
  buildingName: string;

  @Column({ name: 'floor_number', type: 'varchar', length: 50, nullable: true })
  floorNumber: string;

  @Column({ name: 'room_number', type: 'varchar', length: 50, nullable: true })
  roomNumber: string;

  @Column({ name: 'area_code', type: 'varchar', length: 50, nullable: true })
  areaCode: string;

  @Column({ name: 'capacity', type: 'int', nullable: true })
  capacity: number;

  @Column({ name: 'current_occupancy', type: 'int', default: 0 })
  currentOccupancy: number;

  @Column({
    name: 'status',
    type: 'enum',
    enum: LocationStatus,
    default: LocationStatus.ACTIVE,
  })
  status: LocationStatus;

  @Column({ name: 'is_secure', type: 'boolean', default: false })
  isSecure: boolean;

  @Column({ name: 'security_level', type: 'varchar', length: 50, nullable: true })
  securityLevel: string;

  @Column({ name: 'access_restrictions', type: 'jsonb', nullable: true })
  accessRestrictions: {
    allowedRoles?: string[];
    allowedDepartments?: string[];
    requiresApproval?: boolean;
    approvalRequiredFrom?: string[];
  };

  @Column({ name: 'environmental_conditions', type: 'jsonb', nullable: true })
  environmentalConditions: {
    temperature?: {
      min: number;
      max: number;
      unit: 'celsius' | 'fahrenheit';
    };
    humidity?: {
      min: number;
      max: number;
      unit: 'percentage';
    };
    lighting?: string;
    ventilation?: string;
    specialRequirements?: string[];
  };

  @Column({ name: 'coordinates', type: 'jsonb', nullable: true })
  coordinates: {
    latitude?: number;
    longitude?: number;
    altitude?: number;
    qrCode?: string;
    nfcTag?: string;
  };

  @Column({ name: 'contact_person', type: 'jsonb', nullable: true })
  contactPerson: {
    name: string;
    phone: string;
    email?: string;
    department?: string;
  };

  @Column({ name: 'operating_hours', type: 'jsonb', nullable: true })
  operatingHours: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };

  @Column({ name: 'last_inventory_date', type: 'timestamp', nullable: true })
  lastInventoryDate: Date;

  @Column({ name: 'next_inventory_date', type: 'timestamp', nullable: true })
  nextInventoryDate: Date;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  // @ManyToOne(() => AssetLocation)
  // @JoinColumn({ name: 'parent_id' })
  // parent: AssetLocation;

  // @OneToMany(() => AssetLocation, location => location.parent)
  // children: AssetLocation[];

  // @OneToMany(() => Asset, asset => asset.location)
  // assets: Asset[];
}