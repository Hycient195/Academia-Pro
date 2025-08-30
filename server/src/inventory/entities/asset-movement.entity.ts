// Academia Pro - Asset Movement Entity
// Entity for tracking asset movements, transfers, and location changes

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';

export enum MovementType {
  TRANSFER = 'transfer',
  LOAN = 'loan',
  RETURN = 'return',
  DISPOSAL = 'disposal',
  LOST = 'lost',
  STOLEN = 'stolen',
  MAINTENANCE = 'maintenance',
  RELOCATION = 'relocation',
  ASSIGNMENT = 'assignment',
  UNASSIGNMENT = 'unassignment',
}

export enum MovementStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  IN_TRANSIT = 'in_transit',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

@Entity('asset_movements')
@Index(['assetId', 'movementDate'])
@Index(['assetId', 'status'])
@Index(['schoolId', 'movementType'])
@Index(['fromLocationId'])
@Index(['toLocationId'])
export class AssetMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'asset_id', type: 'uuid' })
  assetId: string;

  @Column({ name: 'movement_code', type: 'varchar', length: 50, unique: true })
  movementCode: string;

  @Column({
    name: 'movement_type',
    type: 'enum',
    enum: MovementType,
  })
  movementType: MovementType;

  @Column({ name: 'movement_title', type: 'varchar', length: 255 })
  movementTitle: string;

  @Column({ name: 'movement_description', type: 'text', nullable: true })
  movementDescription: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: MovementStatus,
    default: MovementStatus.PENDING,
  })
  status: MovementStatus;

  @Column({ name: 'from_location_id', type: 'uuid', nullable: true })
  fromLocationId: string;

  @Column({ name: 'to_location_id', type: 'uuid', nullable: true })
  toLocationId: string;

  @Column({ name: 'from_user_id', type: 'uuid', nullable: true })
  fromUserId: string;

  @Column({ name: 'to_user_id', type: 'uuid', nullable: true })
  toUserId: string;

  @Column({ name: 'from_department', type: 'varchar', length: 100, nullable: true })
  fromDepartment: string;

  @Column({ name: 'to_department', type: 'varchar', length: 100, nullable: true })
  toDepartment: string;

  @Column({ name: 'movement_date', type: 'timestamp' })
  movementDate: Date;

  @Column({ name: 'expected_return_date', type: 'timestamp', nullable: true })
  expectedReturnDate: Date;

  @Column({ name: 'actual_return_date', type: 'timestamp', nullable: true })
  actualReturnDate: Date;

  @Column({ name: 'requested_by', type: 'varchar', length: 100 })
  requestedBy: string;

  @Column({ name: 'approved_by', type: 'varchar', length: 100, nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'rejected_by', type: 'varchar', length: 100, nullable: true })
  rejectedBy: string;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ name: 'carried_by', type: 'varchar', length: 100, nullable: true })
  carriedBy: string;

  @Column({ name: 'received_by', type: 'varchar', length: 100, nullable: true })
  receivedBy: string;

  @Column({ name: 'condition_before', type: 'varchar', length: 50, nullable: true })
  conditionBefore: string;

  @Column({ name: 'condition_after', type: 'varchar', length: 50, nullable: true })
  conditionAfter: string;

  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'attachments', type: 'jsonb', nullable: true })
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileType: string;
    uploadedAt: Date;
    uploadedBy: string;
  }>;

  @Column({ name: 'transport_details', type: 'jsonb', nullable: true })
  transportDetails: {
    method?: string;
    carrier?: string;
    trackingNumber?: string;
    cost?: number;
    insurance?: boolean;
  };

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields: { [key: string]: any };

  @Column({ name: 'requires_approval', type: 'boolean', default: true })
  requiresApproval: boolean;

  @Column({ name: 'approval_workflow', type: 'jsonb', nullable: true })
  approvalWorkflow: {
    currentStep?: string;
    steps?: Array<{
      stepName: string;
      approverRole: string;
      status: 'pending' | 'approved' | 'rejected';
      approvedAt?: Date;
      approvedBy?: string;
      comments?: string;
    }>;
  };

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

  // @ManyToOne(() => AssetLocation)
  // @JoinColumn({ name: 'from_location_id' })
  // fromLocation: AssetLocation;

  // @ManyToOne(() => AssetLocation)
  // @JoinColumn({ name: 'to_location_id' })
  // toLocation: AssetLocation;
}