// Academia Pro - Asset Response DTO
// Safe response format for asset data (frontend consumption)

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Asset } from '../asset.entity';
import { TAssetCategory, TAssetStatus, TProcurementStatus, IAssetResponse, IAssetListResponse, IAssetStatisticsResponse, IAssetLocation, IAssetSpecifications } from '@academia-pro/common/inventory';

export class AssetResponseDto implements IAssetResponse {
  @ApiProperty({
    description: 'Unique asset identifier',
    example: 'asset-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Asset code',
    example: 'AST-001',
  })
  assetCode: string;

  @ApiProperty({
    description: 'Asset name',
    example: 'Dell Laptop',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Asset description',
    example: 'High-performance laptop for teaching staff',
  })
  description?: string;

  @ApiProperty({
    description: 'Asset category',
    example: 'computers',
    enum: TAssetCategory,
  })
  category: TAssetCategory;

  @ApiProperty({
    description: 'Asset status',
    example: 'active',
    enum: TAssetStatus,
  })
  status: TAssetStatus;

  @ApiProperty({
    description: 'Asset location details',
    type: Object,
  })
  location: IAssetLocation;

  @ApiProperty({
    description: 'Asset specifications',
    type: Object,
  })
  specifications: IAssetSpecifications;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  schoolId: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2024-01-15T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2024-08-01T00:00:00Z',
  })
  updatedAt: Date;

  // Computed fields
  @ApiProperty({
    description: 'Procurement summary',
    type: Object,
  })
  procurementSummary: {
    supplierName: string;
    purchaseDate: Date;
    purchasePrice: number;
    warrantyExpiryDate?: Date;
    procurementStatus: TProcurementStatus;
  };

  @ApiProperty({
    description: 'Financial summary',
    type: Object,
  })
  financialSummary: {
    currentValue: number;
    accumulatedDepreciation: number;
    depreciationPercentage: number;
    nextDepreciationDate?: Date;
  };

  @ApiProperty({
    description: 'Maintenance summary',
    type: Object,
  })
  maintenanceSummary: {
    lastMaintenanceDate?: Date;
    nextMaintenanceDate?: Date;
    totalMaintenanceCost: number;
    maintenanceCount: number;
  };

  @ApiProperty({
    description: 'Assignment summary',
    type: Object,
  })
  assignmentSummary: {
    isCurrentlyAssigned: boolean;
    currentAssignee?: string;
    assignedDate?: Date;
    expectedReturnDate?: Date;
  };

  @ApiProperty({
    description: 'Location summary',
    type: Object,
  })
  locationSummary: {
    building?: string;
    room?: string;
    department?: string;
    custodian?: string;
  };

  @ApiProperty({
    description: 'Depreciation percentage',
    example: 25.5,
  })
  depreciationPercentage: number;

  @ApiProperty({
    description: 'Days since last maintenance',
    example: 45,
  })
  daysSinceLastMaintenance: number;

  @ApiProperty({
    description: 'Is warranty active',
    example: true,
  })
  isWarrantyActive: boolean;

  @ApiProperty({
    description: 'Is overdue for maintenance',
    example: false,
  })
  isOverdueForMaintenance: boolean;

  constructor(partial: Partial<AssetResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(asset: Asset): AssetResponseDto {
    const dto = new AssetResponseDto({});
    dto.id = asset.id;
    dto.assetCode = asset.assetCode;
    dto.name = asset.name;
    dto.description = asset.description;
    dto.category = asset.category as any;
    dto.status = asset.status as any;
    dto.location = asset.location;
    dto.specifications = asset.specifications as any;
    dto.schoolId = asset.schoolId;
    dto.createdAt = asset.createdAt;
    dto.updatedAt = asset.updatedAt;

    // Computed fields
    dto.procurementSummary = {
      supplierName: asset.procurement?.supplier?.name || '',
      purchaseDate: asset.procurement?.purchaseDate || new Date(),
      purchasePrice: asset.financial?.purchasePrice || 0,
      warrantyExpiryDate: asset.procurement?.warrantyExpiryDate,
      procurementStatus: asset.procurement?.procurementStatus || 'received' as any,
    };

    dto.financialSummary = {
      currentValue: asset.financial?.currentValue || 0,
      accumulatedDepreciation: asset.financial?.accumulatedDepreciation || 0,
      depreciationPercentage: asset.depreciationPercentage,
      nextDepreciationDate: undefined, // Would be calculated based on depreciation schedule
    };

    dto.maintenanceSummary = {
      lastMaintenanceDate: asset.maintenance?.lastMaintenanceDate,
      nextMaintenanceDate: asset.maintenance?.nextMaintenanceDate,
      totalMaintenanceCost: asset.maintenance?.maintenanceCost || 0,
      maintenanceCount: asset.maintenanceCount,
    };

    dto.assignmentSummary = {
      isCurrentlyAssigned: asset.isCurrentlyAssigned,
      currentAssignee: asset.currentAssignment?.assignedTo,
      assignedDate: asset.currentAssignment?.assignedDate,
      expectedReturnDate: asset.currentAssignment?.expectedReturnDate,
    };

    dto.locationSummary = {
      building: asset.location?.building,
      room: asset.location?.room,
      department: asset.location?.department,
      custodian: asset.location?.custodian,
    };

    dto.depreciationPercentage = asset.depreciationPercentage;
    dto.daysSinceLastMaintenance = asset.daysSinceLastMaintenance;
    dto.isWarrantyActive = asset.isWarrantyActive;
    dto.isOverdueForMaintenance = asset.isOverdueForMaintenance;

    return dto;
  }
}

export class AssetListResponseDto implements IAssetListResponse {
  @ApiProperty({
    description: 'List of assets',
    type: [AssetResponseDto],
  })
  assets: AssetResponseDto[];

  @ApiProperty({
    description: 'Total number of assets',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Summary statistics',
    type: Object,
  })
  summary: {
    totalValue: number;
    activeAssets: number;
    maintenanceDue: number;
    depreciationThisMonth: number;
  };

  constructor(partial: Partial<AssetListResponseDto>) {
    Object.assign(this, partial);
  }
}

export class AssetStatisticsResponseDto implements IAssetStatisticsResponse {
  @ApiProperty({
    description: 'Total number of assets',
    example: 150,
  })
  totalAssets: number;

  @ApiProperty({
    description: 'Number of active assets',
    example: 145,
  })
  activeAssets: number;

  @ApiProperty({
    description: 'Assets grouped by category',
    example: { computers: 25, furniture: 40, equipment: 30 },
  })
  assetsByCategory: Record<TAssetCategory, number>;

  @ApiProperty({
    description: 'Assets grouped by status',
    example: { active: 145, maintenance: 3, inactive: 2 },
  })
  assetsByStatus: Record<TAssetStatus, number>;

  @ApiProperty({
    description: 'Total current value of all assets',
    example: 2500000,
  })
  totalValue: number;

  @ApiProperty({
    description: 'Total accumulated depreciation',
    example: 500000,
  })
  totalDepreciation: number;

  @ApiProperty({
    description: 'Number of assets due for maintenance',
    example: 12,
  })
  maintenanceDueCount: number;

  @ApiProperty({
    description: 'Number of pending procurement requests',
    example: 5,
  })
  procurementPendingCount: number;

  @ApiProperty({
    description: 'Asset value breakdown by category',
    example: { computers: 800000, furniture: 600000, equipment: 1100000 },
  })
  categoryValueBreakdown: Record<TAssetCategory, number>;

  @ApiProperty({
    description: 'Monthly depreciation amount',
    example: 25000,
  })
  monthlyDepreciation: number;

  @ApiProperty({
    description: 'Assets grouped by age',
    type: Object,
  })
  assetsByAge: {
    '0-1_years': number;
    '1-3_years': number;
    '3-5_years': number;
    '5+_years': number;
  };

  @ApiProperty({
    description: 'Top suppliers by asset count and value',
    type: [Object],
  })
  topSuppliers: Array<{
    supplierName: string;
    assetCount: number;
    totalValue: number;
  }>;

  constructor(partial: Partial<AssetStatisticsResponseDto>) {
    Object.assign(this, partial);
  }
}