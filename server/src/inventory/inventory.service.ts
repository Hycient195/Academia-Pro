// Academia Pro - Inventory Service
// Business logic for inventory and asset management

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Asset } from './entities';

// import { Asset } from './asset.entity';
import {
  CreateAssetDto,
  UpdateAssetDto,
  AssetResponseDto,
  AssetListResponseDto,
  AssetStatisticsResponseDto,
} from './dtos/index';
import {
  TAssetStatus,
  IAssetFilters,
  IAssetStatisticsResponse,
} from '@academia-pro/types/inventory/inventory.types';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    private dataSource: DataSource,
  ) {}

  /**
   * Create a new asset
   */
  async create(createAssetDto: CreateAssetDto): Promise<AssetResponseDto> {
    const { assetCode, schoolId, ...assetData } = createAssetDto;

    // Check if asset code already exists
    const existingAsset = await this.assetRepository.findOne({
      where: { assetCode },
    });

    if (existingAsset) {
      throw new ConflictException('Asset with this code already exists');
    }

    // Create asset entity
    const asset = this.assetRepository.create({
      ...assetData,
      assetCode,
      schoolId,
      status: TAssetStatus.ACTIVE,
      procurement: {
        ...assetData.procurement,
        procurementStatus: 'received' as any,
      },
      financial: {
        ...assetData.financial,
        accumulatedDepreciation: 0,
        currentValue: assetData.financial.purchasePrice,
        depreciationSchedule: [],
      },
      maintenance: {
        maintenanceSchedule: [],
        maintenanceHistory: [],
        nextMaintenanceDate: undefined,
        maintenanceCost: 0,
        lastMaintenanceDate: undefined,
        maintenanceFrequency: undefined,
      },
      assignments: [],
      documents: [],
    });

    const savedAsset = await this.assetRepository.save(asset);
    return AssetResponseDto.fromEntity(savedAsset);
  }

  /**
   * Get all assets with filtering and pagination
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    filters?: IAssetFilters;
  }): Promise<AssetListResponseDto> {
    const { page = 1, limit = 10, filters } = options || {};

    const queryBuilder = this.assetRepository.createQueryBuilder('asset');

    // Apply filters
    if (filters?.schoolId) {
      queryBuilder.andWhere('asset.schoolId = :schoolId', { schoolId: filters.schoolId });
    }

    if (filters?.category) {
      queryBuilder.andWhere('asset.category = :category', { category: filters.category });
    }

    if (filters?.status) {
      queryBuilder.andWhere('asset.status = :status', { status: filters.status });
    }

    if (filters?.department) {
      queryBuilder.andWhere('asset.location->>\'department\' = :department', { department: filters.department });
    }

    if (filters?.building) {
      queryBuilder.andWhere('asset.location->>\'building\' = :building', { building: filters.building });
    }

    if (filters?.custodian) {
      queryBuilder.andWhere('asset.location->>\'custodian\' = :custodian', { custodian: filters.custodian });
    }

    if (filters?.procurementStatus) {
      queryBuilder.andWhere('asset.procurement->>\'procurementStatus\' = :procurementStatus', { procurementStatus: filters.procurementStatus });
    }

    if (filters?.minValue !== undefined) {
      queryBuilder.andWhere('CAST(asset.financial->>\'currentValue\' AS DECIMAL) >= :minValue', { minValue: filters.minValue });
    }

    if (filters?.maxValue !== undefined) {
      queryBuilder.andWhere('CAST(asset.financial->>\'currentValue\' AS DECIMAL) <= :maxValue', { maxValue: filters.maxValue });
    }

    if (filters?.purchaseDateFrom) {
      queryBuilder.andWhere('asset.procurement->>\'purchaseDate\' >= :purchaseDateFrom', { purchaseDateFrom: filters.purchaseDateFrom.toISOString() });
    }

    if (filters?.purchaseDateTo) {
      queryBuilder.andWhere('asset.procurement->>\'purchaseDate\' <= :purchaseDateTo', { purchaseDateTo: filters.purchaseDateTo.toISOString() });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(asset.name ILIKE :search OR asset.assetCode ILIKE :search OR asset.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Apply pagination
    queryBuilder
      .orderBy('asset.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [assets, total] = await queryBuilder.getManyAndCount();

    const assetResponseDtos = assets.map(asset => AssetResponseDto.fromEntity(asset));

    // Calculate summary
    const summary = {
      totalValue: assets.reduce((sum, asset) => sum + asset.financial.currentValue, 0),
      activeAssets: assets.filter(asset => asset.status === TAssetStatus.ACTIVE).length,
      maintenanceDue: assets.filter(asset => asset.isOverdueForMaintenance).length,
      depreciationThisMonth: 0, // Would be calculated based on depreciation schedule
    };

    return new AssetListResponseDto({
      assets: assetResponseDtos,
      total,
      page,
      limit,
      summary,
    });
  }

  /**
   * Get asset by ID
   */
  async findOne(id: string): Promise<AssetResponseDto> {
    const asset = await this.assetRepository.findOne({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    return AssetResponseDto.fromEntity(asset);
  }

  /**
   * Update asset
   */
  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<AssetResponseDto> {
    const asset = await this.assetRepository.findOne({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Check for unique constraints if updating assetCode
    if ((updateAssetDto as any).assetCode && (updateAssetDto as any).assetCode !== asset.assetCode) {
      const existingAsset = await this.assetRepository.findOne({
        where: { assetCode: (updateAssetDto as any).assetCode },
      });
      if (existingAsset) {
        throw new ConflictException('Asset with this code already exists');
      }
    }

    Object.assign(asset, updateAssetDto);

    // Recalculate depreciation if financial info was updated
    if (updateAssetDto.financial) {
      asset.calculateDepreciation();
    }

    const updatedAsset = await this.assetRepository.save(asset);
    return AssetResponseDto.fromEntity(updatedAsset);
  }

  /**
   * Delete asset
   */
  async remove(id: string): Promise<void> {
    const asset = await this.assetRepository.findOne({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    // Check if asset has active assignments
    if (asset.isCurrentlyAssigned) {
      throw new BadRequestException('Cannot delete asset that is currently assigned. Please return the asset first.');
    }

    await this.assetRepository.remove(asset);
  }

  /**
   * Assign asset to user
   */
  async assignAsset(assetId: string, assignment: {
    assignedTo: string;
    assignedBy: string;
    expectedReturnDate: Date;
    purpose: string;
    notes?: string;
  }): Promise<AssetResponseDto> {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (asset.isCurrentlyAssigned) {
      throw new BadRequestException('Asset is already assigned');
    }

    asset.assignToUser({
      id: this.generateId(),
      ...assignment,
      assignedDate: new Date(),
      conditionAtAssignment: 'good', // Default condition
      isActive: true,
    });

    const updatedAsset = await this.assetRepository.save(asset);
    return AssetResponseDto.fromEntity(updatedAsset);
  }

  /**
   * Return asset from user
   */
  async returnAsset(assetId: string, returnCondition: string, notes?: string): Promise<AssetResponseDto> {
    const asset = await this.assetRepository.findOne({
      where: { id: assetId },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    if (!asset.isCurrentlyAssigned) {
      throw new BadRequestException('Asset is not currently assigned');
    }

    asset.returnFromUser(returnCondition, notes);

    const updatedAsset = await this.assetRepository.save(asset);
    return AssetResponseDto.fromEntity(updatedAsset);
  }

  /**
   * Get asset statistics
   */
  async getStatistics(schoolId: string): Promise<AssetStatisticsResponseDto> {
    const [
      totalAssets,
      activeAssets,
      assetsByCategory,
      assetsByStatus,
      totalValue,
      totalDepreciation,
      maintenanceDueCount,
      procurementPendingCount,
      categoryValueBreakdown,
    ] = await Promise.all([
      // Total assets count
      this.assetRepository.count({ where: { schoolId } }),

      // Active assets count
      this.assetRepository.count({ where: { schoolId, status: TAssetStatus.ACTIVE } }),

      // Assets by category
      this.assetRepository
        .createQueryBuilder('asset')
        .select('asset.category', 'category')
        .addSelect('COUNT(*)', 'count')
        .where('asset.schoolId = :schoolId', { schoolId })
        .groupBy('asset.category')
        .getRawMany(),

      // Assets by status
      this.assetRepository
        .createQueryBuilder('asset')
        .select('asset.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('asset.schoolId = :schoolId', { schoolId })
        .groupBy('asset.status')
        .getRawMany(),

      // Total current value
      this.assetRepository
        .createQueryBuilder('asset')
        .select('SUM(CAST(asset.financial->>\'currentValue\' AS DECIMAL))', 'total')
        .where('asset.schoolId = :schoolId', { schoolId })
        .getRawOne(),

      // Total accumulated depreciation
      this.assetRepository
        .createQueryBuilder('asset')
        .select('SUM(CAST(asset.financial->>\'accumulatedDepreciation\' AS DECIMAL))', 'total')
        .where('asset.schoolId = :schoolId', { schoolId })
        .getRawOne(),

      // Maintenance due count
      this.assetRepository
        .createQueryBuilder('asset')
        .where('asset.schoolId = :schoolId', { schoolId })
        .andWhere('asset.maintenance->>\'nextMaintenanceDate\' < :currentDate', { currentDate: new Date().toISOString() })
        .getCount(),

      // Procurement pending count (would be from procurement table)
      Promise.resolve(0),

      // Category value breakdown
      this.assetRepository
        .createQueryBuilder('asset')
        .select('asset.category', 'category')
        .addSelect('SUM(CAST(asset.financial->>\'currentValue\' AS DECIMAL))', 'value')
        .where('asset.schoolId = :schoolId', { schoolId })
        .groupBy('asset.category')
        .getRawMany(),
    ]);

    // Helper function to convert array to record
    const convertToRecord = (data: any[], keyField: string, valueField: string = 'count'): Record<string, number> => {
      const result: Record<string, number> = {};
      data.forEach(item => {
        result[item[keyField]] = parseInt(item[valueField]) || parseFloat(item[valueField]) || 0;
      });
      return result;
    };

    // Calculate assets by age
    const assetsByAge = {
      '0-1_years': 0,
      '1-3_years': 0,
      '3-5_years': 0,
      '5+_years': 0,
    };

    // This would be calculated from actual asset data
    const monthlyDepreciation = totalDepreciation ? totalDepreciation / 12 : 0;

    // Top suppliers (simplified)
    const topSuppliers = [
      { supplierName: 'TechCorp', assetCount: 25, totalValue: 500000 },
      { supplierName: 'OfficePlus', assetCount: 40, totalValue: 300000 },
    ];

    return new AssetStatisticsResponseDto({
      totalAssets,
      activeAssets,
      assetsByCategory: convertToRecord(assetsByCategory, 'category'),
      assetsByStatus: convertToRecord(assetsByStatus, 'status'),
      totalValue: parseFloat(totalValue?.total || '0'),
      totalDepreciation: parseFloat(totalDepreciation?.total || '0'),
      maintenanceDueCount,
      procurementPendingCount,
      categoryValueBreakdown: convertToRecord(categoryValueBreakdown, 'category', 'value'),
      monthlyDepreciation,
      assetsByAge,
      topSuppliers,
    });
  }

  /**
   * Calculate depreciation for all assets
   */
  async calculateAllDepreciation(schoolId: string): Promise<void> {
    const assets = await this.assetRepository.find({
      where: { schoolId },
    });

    for (const asset of assets) {
      asset.calculateDepreciation();
    }

    await this.assetRepository.save(assets);
  }

  /**
   * Get assets due for maintenance
   */
  async getMaintenanceDueAssets(schoolId: string): Promise<AssetResponseDto[]> {
    const assets = await this.assetRepository
      .createQueryBuilder('asset')
      .where('asset.schoolId = :schoolId', { schoolId })
      .andWhere('asset.status = :status', { status: TAssetStatus.ACTIVE })
      .andWhere('asset.maintenance->>\'nextMaintenanceDate\' < :currentDate', { currentDate: new Date().toISOString() })
      .getMany();

    return assets.map(asset => AssetResponseDto.fromEntity(asset));
  }

  /**
   * Get assets by category
   */
  async getAssetsByCategory(schoolId: string, category: string): Promise<AssetResponseDto[]> {
    const assets = await this.assetRepository.find({
      where: { schoolId, category: category as any },
    });

    return assets.map(asset => AssetResponseDto.fromEntity(asset));
  }

  private generateId(): string {
    return `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}