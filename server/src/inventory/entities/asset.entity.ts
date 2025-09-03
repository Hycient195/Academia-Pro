// Academia Pro - Asset Entity
// Database entity for inventory and asset management

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import {
  TAssetCategory,
  TAssetStatus,
  TAssetCondition,
  TProcurementStatus,
  TMaintenanceType,
  TMaintenanceStatus,
  TDepreciationMethod
} from '@academia-pro/common/inventory';

// Re-export types with names expected by controllers and services
export { TAssetStatus as AssetStatus, TAssetCondition as AssetCondition, TAssetCategory as AssetType, TDepreciationMethod as DepreciationMethod };

@Entity('assets')
@Index(['schoolId', 'assetCode'], { unique: true })
@Index(['schoolId', 'category'])
@Index(['schoolId', 'status'])
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  assetCode: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TAssetCategory
  })
  category: TAssetCategory;

  @Column({
    type: 'enum',
    enum: TAssetStatus,
    default: TAssetStatus.ACTIVE
  })
  status: TAssetStatus;

  @Column({
    type: 'enum',
    enum: TAssetCondition,
    default: TAssetCondition.GOOD
  })
  condition: TAssetCondition;

  @Column({ type: 'jsonb' })
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

  @Column({ type: 'jsonb' })
  procurement: {
    supplier: {
      id: string;
      name: string;
      contactPerson?: string;
      email?: string;
      phone?: string;
      address?: string;
      taxId?: string;
      paymentTerms?: string;
      rating?: number;
    };
    purchaseOrderNumber?: string;
    invoiceNumber?: string;
    purchaseDate: Date;
    warrantyPeriod?: number;
    warrantyExpiryDate?: Date;
    procurementStatus: TProcurementStatus;
    procurementRequest?: {
      id: string;
      requestedBy: string;
      requestedDate: Date;
      requiredDate: Date;
      justification: string;
      estimatedCost: number;
      approvedBy?: string;
      approvalDate?: Date;
      approvalComments?: string;
      status: TProcurementStatus;
    };
  };

  @Column({ type: 'jsonb' })
  financial: {
    purchasePrice: number;
    salvageValue: number;
    usefulLife: number;
    depreciationMethod: TDepreciationMethod;
    accumulatedDepreciation: number;
    currentValue: number;
    depreciationSchedule: Array<{
      period: string;
      depreciationAmount: number;
      accumulatedDepreciation: number;
      currentValue: number;
      calculationDate: Date;
    }>;
    insurance?: {
      provider: string;
      policyNumber: string;
      coverageAmount: number;
      premium: number;
      startDate: Date;
      endDate: Date;
      deductible: number;
    };
  };

  @Column({ type: 'jsonb' })
  maintenance: {
    maintenanceSchedule: Array<{
      id: string;
      type: TMaintenanceType;
      description: string;
      frequency: number;
      estimatedCost: number;
      isActive: boolean;
      createdAt: Date;
    }>;
    maintenanceHistory: Array<{
      id: string;
      type: TMaintenanceType;
      description: string;
      performedBy: string;
      performedDate: Date;
      cost: number;
      status: TMaintenanceStatus;
      findings?: string;
      recommendations?: string;
      nextMaintenanceDate?: Date;
      partsReplaced?: string[];
      documents: Array<{
        id: string;
        type: string;
        fileName: string;
        fileUrl: string;
        fileSize: number;
        mimeType: string;
        uploadedAt: Date;
        uploadedBy: string;
        isVerified: boolean;
        verificationDate?: Date;
        verifiedBy?: string;
      }>;
    }>;
    nextMaintenanceDate?: Date;
    maintenanceCost: number;
    lastMaintenanceDate?: Date;
    maintenanceFrequency?: number;
  };

  @Column({ type: 'jsonb' })
  specifications: {
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    dimensions?: {
      length?: number;
      width?: number;
      height?: number;
      unit: 'cm' | 'inch';
    };
    weight?: {
      value: number;
      unit: 'kg' | 'lb';
    };
    powerRequirements?: {
      voltage?: number;
      current?: number;
      power?: number;
      unit: 'V' | 'A' | 'W';
    };
    material?: string;
    color?: string;
    capacity?: string;
    additionalSpecs?: Record<string, any>;
  };

  @Column({ type: 'jsonb', default: [] })
  assignments: Array<{
    id: string;
    assignedTo: string;
    assignedBy: string;
    assignedDate: Date;
    returnDate?: Date;
    expectedReturnDate?: Date;
    purpose: string;
    conditionAtAssignment: string;
    conditionAtReturn?: string;
    notes?: string;
    isActive: boolean;
  }>;

  @Column({ type: 'jsonb', default: [] })
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: Date;
    uploadedBy: string;
    isVerified: boolean;
    verificationDate?: Date;
    verifiedBy?: string;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  lastDepreciationDate?: Date;

  @Column()
  schoolId: string;

  @Column({ nullable: true })
  assignedToUserId?: string;

  @Column({ nullable: true })
  assignedToDepartment?: string;

  @Column({ nullable: true })
  locationId?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  updatedBy?: string;

  // Business logic methods
  updateLocation(location: Partial<typeof this.location>): void {
    this.location = { ...this.location, ...location };
  }

  updateProcurement(procurement: Partial<typeof this.procurement>): void {
    this.procurement = { ...this.procurement, ...procurement };
    // Update warranty expiry if warranty period is provided
    if (procurement.warrantyPeriod && this.procurement.purchaseDate) {
      this.procurement.warrantyExpiryDate = new Date(
        this.procurement.purchaseDate.getTime() +
        procurement.warrantyPeriod * 30 * 24 * 60 * 60 * 1000 // months to milliseconds
      );
    }
  }

  calculateDepreciation(): void {
    const currentDate = new Date();
    const purchaseDate = new Date(this.procurement.purchaseDate);
    const monthsElapsed = Math.floor(
      (currentDate.getTime() - purchaseDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
    );

    if (monthsElapsed <= 0) return;

    let depreciationAmount = 0;

    switch (this.financial.depreciationMethod) {
      case TDepreciationMethod.STRAIGHT_LINE:
        const totalDepreciableAmount = this.financial.purchasePrice - this.financial.salvageValue;
        const monthlyDepreciation = totalDepreciableAmount / (this.financial.usefulLife * 12);
        depreciationAmount = monthlyDepreciation * monthsElapsed;
        break;

      case TDepreciationMethod.DECLINING_BALANCE:
        const annualRate = 2 / this.financial.usefulLife; // Double declining balance
        const monthlyRate = annualRate / 12;
        let remainingValue = this.financial.purchasePrice;
        for (let i = 0; i < monthsElapsed; i++) {
          const monthlyDep = remainingValue * monthlyRate;
          depreciationAmount += monthlyDep;
          remainingValue -= monthlyDep;
          if (remainingValue <= this.financial.salvageValue) break;
        }
        break;
    }

    this.financial.accumulatedDepreciation = Math.min(depreciationAmount, this.financial.purchasePrice - this.financial.salvageValue);
    this.financial.currentValue = this.financial.purchasePrice - this.financial.accumulatedDepreciation;
  }

  addMaintenanceRecord(record: typeof this.maintenance.maintenanceHistory[0]): void {
    this.maintenance.maintenanceHistory.push({
      ...record,
      id: record.id || this.generateId(),
    });

    // Update maintenance summary
    this.maintenance.lastMaintenanceDate = record.performedDate;
    this.maintenance.maintenanceCost += record.cost;

    // Update next maintenance date if provided
    if (record.nextMaintenanceDate) {
      this.maintenance.nextMaintenanceDate = record.nextMaintenanceDate;
    }
  }

  assignToUser(assignment: typeof this.assignments[0]): void {
    // Deactivate any existing active assignments
    this.assignments.forEach(assignment => {
      if (assignment.isActive) {
        assignment.isActive = false;
        assignment.returnDate = new Date();
      }
    });

    // Add new assignment
    this.assignments.push({
      ...assignment,
      id: assignment.id || this.generateId(),
      assignedDate: assignment.assignedDate || new Date(),
      isActive: true,
    });
  }

  returnFromUser(returnCondition: string, notes?: string): void {
    const activeAssignment = this.assignments.find(a => a.isActive);
    if (activeAssignment) {
      activeAssignment.isActive = false;
      activeAssignment.returnDate = new Date();
      activeAssignment.conditionAtReturn = returnCondition;
      if (notes) activeAssignment.notes = notes;
    }
  }

  addDocument(document: typeof this.documents[0]): void {
    this.documents.push({
      ...document,
      id: document.id || this.generateId(),
      uploadedAt: new Date(),
      isVerified: false,
    });
  }

  updateStatus(newStatus: TAssetStatus): void {
    this.status = newStatus;

    // If disposing asset, calculate final depreciation
    if (newStatus === TAssetStatus.DISPOSED) {
      this.calculateDepreciation();
    }
  }

  private generateId(): string {
    return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Computed properties
  get currentAssignment(): typeof this.assignments[0] | undefined {
    return this.assignments.find(assignment => assignment.isActive);
  }

  get isCurrentlyAssigned(): boolean {
    return this.currentAssignment !== undefined;
  }

  get depreciationPercentage(): number {
    if (this.financial.purchasePrice === 0) return 0;
    return Math.round((this.financial.accumulatedDepreciation / this.financial.purchasePrice) * 100 * 100) / 100;
  }

  get ageInMonths(): number {
    const purchaseDate = new Date(this.procurement.purchaseDate);
    const currentDate = new Date();
    return Math.floor((currentDate.getTime() - purchaseDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
  }

  get ageInYears(): number {
    return Math.floor(this.ageInMonths / 12);
  }

  get isWarrantyActive(): boolean {
    if (!this.procurement.warrantyExpiryDate) return false;
    return new Date() < new Date(this.procurement.warrantyExpiryDate);
  }

  get isOverdueForMaintenance(): boolean {
    if (!this.maintenance.nextMaintenanceDate) return false;
    return new Date() > new Date(this.maintenance.nextMaintenanceDate);
  }

  get daysSinceLastMaintenance(): number {
    if (!this.maintenance.lastMaintenanceDate) return Infinity;
    const lastMaintenance = new Date(this.maintenance.lastMaintenanceDate);
    const currentDate = new Date();
    return Math.floor((currentDate.getTime() - lastMaintenance.getTime()) / (24 * 60 * 60 * 1000));
  }

  get maintenanceCount(): number {
    return this.maintenance.maintenanceHistory.length;
  }

  get totalMaintenanceCost(): number {
    return this.maintenance.maintenanceHistory.reduce((total, record) => total + record.cost, 0);
  }

  get supplierName(): string {
    return this.procurement.supplier.name;
  }

  get custodianName(): string {
    return this.location.custodian || 'Not assigned';
  }

  get locationSummary(): string {
    const parts = [];
    if (this.location.building) parts.push(this.location.building);
    if (this.location.room) parts.push(`Room ${this.location.room}`);
    if (this.location.department) parts.push(this.location.department);
    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  }
}