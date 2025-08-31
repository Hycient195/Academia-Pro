// Academia Pro - Asset Entity
// Core entity for managing school assets and equipment

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, Index } from 'typeorm';

export enum AssetStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  DISPOSED = 'disposed',
  LOST = 'lost',
  STOLEN = 'stolen',
}

export enum AssetCondition {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  DAMAGED = 'damaged',
  BEYOND_REPAIR = 'beyond_repair',
}

export enum AssetType {
  FURNITURE = 'furniture',
  EQUIPMENT = 'equipment',
  ELECTRONICS = 'electronics',
  VEHICLE = 'vehicle',
  BOOKS = 'books',
  SPORTS_EQUIPMENT = 'sports_equipment',
  LABORATORY_EQUIPMENT = 'laboratory_equipment',
  COMPUTERS = 'computers',
  AUDIO_VISUAL = 'audio_visual',
  CLEANING_SUPPLIES = 'cleaning_supplies',
  OTHER = 'other',
}

export enum DepreciationMethod {
  STRAIGHT_LINE = 'straight_line',
  DECLINING_BALANCE = 'declining_balance',
  UNITS_OF_PRODUCTION = 'units_of_production',
}

@Entity('assets')
@Index(['schoolId', 'assetCode'])
@Index(['schoolId', 'status'])
@Index(['schoolId', 'assetType'])
@Index(['schoolId', 'locationId'])
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'asset_code', type: 'varchar', length: 50, unique: true })
  assetCode: string;

  @Column({ name: 'asset_name', type: 'varchar', length: 255 })
  assetName: string;

  @Column({ name: 'asset_description', type: 'text', nullable: true })
  assetDescription: string;

  @Column({
    name: 'asset_type',
    type: 'enum',
    enum: AssetType,
  })
  assetType: AssetType;

  @Column({ name: 'category_id', type: 'uuid', nullable: true })
  categoryId: string;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string;

  @Column({ name: 'location', type: 'jsonb', nullable: true })
  location: {
    building?: string;
    floor?: string;
    room?: string;
    department?: string;
    custodian?: string;
    custodianContact?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  @Column({ name: 'assigned_to_user_id', type: 'uuid', nullable: true })
  assignedToUserId: string;

  @Column({ name: 'assigned_to_department', type: 'varchar', length: 100, nullable: true })
  assignedToDepartment: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: AssetStatus,
    default: AssetStatus.ACTIVE,
  })
  status: AssetStatus;

  @Column({
    name: 'condition',
    type: 'enum',
    enum: AssetCondition,
    default: AssetCondition.GOOD,
  })
  condition: AssetCondition;

  @Column({ name: 'purchase_date', type: 'timestamp', nullable: true })
  purchaseDate: Date;

  @Column({ name: 'purchase_cost', type: 'decimal', precision: 12, scale: 2, nullable: true })
  purchaseCost: number;

  @Column({ name: 'supplier_name', type: 'varchar', length: 255, nullable: true })
  supplierName: string;

  @Column({ name: 'supplier_contact', type: 'varchar', length: 255, nullable: true })
  supplierContact: string;

  @Column({ name: 'warranty_expiry', type: 'timestamp', nullable: true })
  warrantyExpiry: Date;

  @Column({ name: 'insurance_policy_number', type: 'varchar', length: 100, nullable: true })
  insurancePolicyNumber: string;

  @Column({ name: 'insurance_expiry', type: 'timestamp', nullable: true })
  insuranceExpiry: Date;

  @Column({ name: 'serial_number', type: 'varchar', length: 100, nullable: true })
  serialNumber: string;

  @Column({ name: 'model_number', type: 'varchar', length: 100, nullable: true })
  modelNumber: string;

  @Column({ name: 'manufacturer', type: 'varchar', length: 255, nullable: true })
  manufacturer: string;

  @Column({ name: 'barcode', type: 'varchar', length: 100, nullable: true })
  barcode: string;

  @Column({ name: 'qr_code', type: 'varchar', length: 255, nullable: true })
  qrCode: string;

  @Column({ name: 'useful_life_years', type: 'int', nullable: true })
  usefulLifeYears: number;

  @Column({
    name: 'depreciation_method',
    type: 'enum',
    enum: DepreciationMethod,
    default: DepreciationMethod.STRAIGHT_LINE,
  })
  depreciationMethod: DepreciationMethod;

  @Column({ name: 'salvage_value', type: 'decimal', precision: 12, scale: 2, default: 0 })
  salvageValue: number;

  @Column({ name: 'current_value', type: 'decimal', precision: 12, scale: 2, nullable: true })
  currentValue: number;

  @Column({ name: 'accumulated_depreciation', type: 'decimal', precision: 12, scale: 2, default: 0 })
  accumulatedDepreciation: number;

  @Column({ name: 'last_depreciation_date', type: 'timestamp', nullable: true })
  lastDepreciationDate: Date;

  @Column({ name: 'maintenance_schedule', type: 'jsonb', nullable: true })
  maintenanceSchedule: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    maintenanceType: string;
    estimatedCost?: number;
  };

  @Column({ name: 'specifications', type: 'jsonb', nullable: true })
  specifications: {
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit: 'cm' | 'inch' | 'mm';
    };
    weight?: {
      value: number;
      unit: 'kg' | 'lb' | 'g';
    };
    powerRequirements?: {
      voltage?: number;
      amperage?: number;
      wattage?: number;
    };
    material?: string;
    color?: string;
    capacity?: string;
    [key: string]: any;
  };

  @Column({ name: 'attachments', type: 'jsonb', nullable: true })
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: Date;
    uploadedBy: string;
  }>;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields: { [key: string]: any };

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  // @ManyToOne(() => AssetCategory)
  // @JoinColumn({ name: 'category_id' })
  // category: AssetCategory;

  // @ManyToOne(() => AssetLocation)
  // @JoinColumn({ name: 'location_id' })
  // location: AssetLocation;

  // @OneToMany(() => AssetMaintenance, maintenance => maintenance.asset)
  // maintenanceRecords: AssetMaintenance[];

  // @OneToMany(() => AssetMovement, movement => movement.asset)
  // movementHistory: AssetMovement[];
}