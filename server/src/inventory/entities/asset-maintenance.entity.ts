// Academia Pro - Asset Maintenance Entity
// Entity for tracking asset maintenance records and schedules

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

export enum MaintenanceType {
  PREVENTIVE = 'preventive',
  CORRECTIVE = 'corrective',
  PREDICTIVE = 'predictive',
  CONDITION_BASED = 'condition_based',
  EMERGENCY = 'emergency',
}

export enum MaintenanceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export enum MaintenancePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('asset_maintenance')
@Index(['assetId', 'scheduledDate'])
@Index(['assetId', 'status'])
@Index(['schoolId', 'maintenanceType'])
@Index(['schoolId', 'nextDueDate'])
export class AssetMaintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'asset_id', type: 'uuid' })
  assetId: string;

  @Column({ name: 'maintenance_code', type: 'varchar', length: 50, unique: true })
  maintenanceCode: string;

  @Column({
    name: 'maintenance_type',
    type: 'enum',
    enum: MaintenanceType,
  })
  maintenanceType: MaintenanceType;

  @Column({ name: 'maintenance_title', type: 'varchar', length: 255 })
  maintenanceTitle: string;

  @Column({ name: 'maintenance_description', type: 'text', nullable: true })
  maintenanceDescription: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: MaintenanceStatus,
    default: MaintenanceStatus.SCHEDULED,
  })
  status: MaintenanceStatus;

  @Column({
    name: 'priority',
    type: 'enum',
    enum: MaintenancePriority,
    default: MaintenancePriority.MEDIUM,
  })
  priority: MaintenancePriority;

  @Column({ name: 'scheduled_date', type: 'timestamp' })
  scheduledDate: Date;

  @Column({ name: 'actual_start_date', type: 'timestamp', nullable: true })
  actualStartDate: Date;

  @Column({ name: 'actual_completion_date', type: 'timestamp', nullable: true })
  actualCompletionDate: Date;

  @Column({ name: 'estimated_duration_hours', type: 'decimal', precision: 6, scale: 2, nullable: true })
  estimatedDurationHours: number;

  @Column({ name: 'actual_duration_hours', type: 'decimal', precision: 6, scale: 2, nullable: true })
  actualDurationHours: number;

  @Column({ name: 'estimated_cost', type: 'decimal', precision: 12, scale: 2, nullable: true })
  estimatedCost: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 12, scale: 2, nullable: true })
  actualCost: number;

  @Column({ name: 'labor_cost', type: 'decimal', precision: 12, scale: 2, nullable: true })
  laborCost: number;

  @Column({ name: 'parts_cost', type: 'decimal', precision: 12, scale: 2, nullable: true })
  partsCost: number;

  @Column({ name: 'external_service_cost', type: 'decimal', precision: 12, scale: 2, nullable: true })
  externalServiceCost: number;

  @Column({ name: 'assigned_to_user_id', type: 'uuid', nullable: true })
  assignedToUserId: string;

  @Column({ name: 'assigned_to_vendor_id', type: 'uuid', nullable: true })
  assignedToVendorId: string;

  @Column({ name: 'vendor_name', type: 'varchar', length: 255, nullable: true })
  vendorName: string;

  @Column({ name: 'vendor_contact', type: 'varchar', length: 255, nullable: true })
  vendorContact: string;

  @Column({ name: 'checklist', type: 'jsonb', nullable: true })
  checklist: Array<{
    item: string;
    completed: boolean;
    notes?: string;
    completedAt?: Date;
    completedBy?: string;
  }>;

  @Column({ name: 'parts_used', type: 'jsonb', nullable: true })
  partsUsed: Array<{
    partName: string;
    partNumber: string;
    quantity: number;
    cost: number;
    supplier?: string;
  }>;

  @Column({ name: 'work_performed', type: 'text', nullable: true })
  workPerformed: string;

  @Column({ name: 'findings', type: 'text', nullable: true })
  findings: string;

  @Column({ name: 'recommendations', type: 'text', nullable: true })
  recommendations: string;

  @Column({ name: 'next_due_date', type: 'timestamp', nullable: true })
  nextDueDate: Date;

  @Column({ name: 'next_maintenance_type', type: 'varchar', length: 100, nullable: true })
  nextMaintenanceType: string;

  @Column({ name: 'downtime_hours', type: 'decimal', precision: 6, scale: 2, nullable: true })
  downtimeHours: number;

  @Column({ name: 'attachments', type: 'jsonb', nullable: true })
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: Date;
    uploadedBy: string;
  }>;

  @Column({ name: 'approval_required', type: 'boolean', default: false })
  approvalRequired: boolean;

  @Column({ name: 'approved_by', type: 'varchar', length: 100, nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'follow_up_required', type: 'boolean', default: false })
  followUpRequired: boolean;

  @Column({ name: 'follow_up_date', type: 'timestamp', nullable: true })
  followUpDate: Date;

  @Column({ name: 'follow_up_notes', type: 'text', nullable: true })
  followUpNotes: string;

  @Column({ name: 'created_by', type: 'varchar', length: 100 })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  // @ManyToOne(() => Asset)
  // @JoinColumn({ name: 'asset_id' })
  // asset: Asset;
}