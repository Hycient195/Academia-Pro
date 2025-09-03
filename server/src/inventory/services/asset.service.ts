// Academia Pro - Asset Service
// Service for managing school assets and equipment

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThanOrEqual } from 'typeorm';
import { Asset } from '../entities/asset.entity';
import { TAssetStatus, TAssetCategory, TAssetCondition, TDepreciationMethod } from '../../../../common/src/types/inventory/inventory.types';
import { AssetCategory } from '../entities/asset-category.entity';
import { AssetLocation } from '../entities/asset-location.entity';
import { AssetMaintenance, MaintenanceStatus } from '../entities/asset-maintenance.entity';
import { AssetMovement, MovementStatus } from '../entities/asset-movement.entity';

export interface AssetFilter {
  status?: TAssetStatus;
  condition?: TAssetCondition;
  category?: TAssetCategory;
  locationId?: string;
  assignedToUserId?: string;
  assignedToDepartment?: string;
}

export interface AssetAnalytics {
  totalAssets: number;
  activeAssets: number;
  maintenanceAssets: number;
  totalValue: number;
  depreciatedValue: number;
  assetsByType: { [key: string]: number };
  assetsByStatus: { [key: string]: number };
  assetsByCondition: { [key: string]: number };
  maintenanceDue: number;
  warrantyExpiring: number;
}

@Injectable()
export class AssetService {
  private readonly logger = new Logger(AssetService.name);

  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @InjectRepository(AssetCategory)
    private categoryRepository: Repository<AssetCategory>,
    @InjectRepository(AssetLocation)
    private locationRepository: Repository<AssetLocation>,
    @InjectRepository(AssetMaintenance)
    private maintenanceRepository: Repository<AssetMaintenance>,
    @InjectRepository(AssetMovement)
    private movementRepository: Repository<AssetMovement>,
    private dataSource: DataSource,
  ) {}

  async createAsset(assetData: Partial<Asset>): Promise<Asset> {
    this.logger.log(`Creating new asset: ${assetData.name}`);

    // Generate asset code if not provided
    if (!assetData.assetCode) {
      assetData.assetCode = await this.generateAssetCode(assetData.schoolId);
    }

    // Set default values
    if (!assetData.status) {
      assetData.status = TAssetStatus.ACTIVE;
    }
    if (!assetData.condition) {
      assetData.condition = TAssetCondition.GOOD;
    }
    if (!assetData.financial) {
      assetData.financial = {
        purchasePrice: 0,
        salvageValue: 0,
        usefulLife: 1,
        depreciationMethod: TDepreciationMethod.STRAIGHT_LINE,
        accumulatedDepreciation: 0,
        currentValue: 0,
        depreciationSchedule: []
      };
    }
    if (!assetData.financial.depreciationMethod) {
      assetData.financial.depreciationMethod = TDepreciationMethod.STRAIGHT_LINE;
    }
    if (assetData.financial.salvageValue === undefined) {
      assetData.financial.salvageValue = 0;
    }
    if (assetData.financial.accumulatedDepreciation === undefined) {
      assetData.financial.accumulatedDepreciation = 0;
    }

    const asset = this.assetRepository.create(assetData);
    const savedAsset = await this.assetRepository.save(asset);

    this.logger.log(`Asset created successfully: ${savedAsset.id}`);
    return savedAsset;
  }

  async getAssetsBySchool(schoolId: string, filter?: AssetFilter): Promise<Asset[]> {
    this.logger.log(`Getting assets for school: ${schoolId}`);

    const queryBuilder = this.assetRepository.createQueryBuilder('asset')
      .where('asset.schoolId = :schoolId', { schoolId });

    if (filter) {
      if (filter.status) {
        queryBuilder.andWhere('asset.status = :status', { status: filter.status });
      }
      if (filter.condition) {
        queryBuilder.andWhere('asset.condition = :condition', { condition: filter.condition });
      }
      if (filter.category) {
        queryBuilder.andWhere('asset.category = :category', { category: filter.category });
      }
      if (filter.locationId) {
        queryBuilder.andWhere('asset.locationId = :locationId', { locationId: filter.locationId });
      }
      if (filter.assignedToUserId) {
        queryBuilder.andWhere('asset.assignedToUserId = :assignedToUserId', { assignedToUserId: filter.assignedToUserId });
      }
      if (filter.assignedToDepartment) {
        queryBuilder.andWhere('asset.assignedToDepartment = :assignedToDepartment', { assignedToDepartment: filter.assignedToDepartment });
      }
    }

    return queryBuilder.orderBy('asset.createdAt', 'DESC').getMany();
  }

  async getAssetById(assetId: string): Promise<Asset> {
    this.logger.log(`Getting asset by ID: ${assetId}`);

    const asset = await this.assetRepository.findOne({
      where: { id: assetId },
    });

    if (!asset) {
      throw new Error('Asset not found');
    }

    return asset;
  }

  async updateAsset(assetId: string, updateData: Partial<Asset>): Promise<Asset> {
    this.logger.log(`Updating asset: ${assetId}`);

    const asset = await this.getAssetById(assetId);

    // Update the asset
    Object.assign(asset, updateData);
    asset.updatedAt = new Date();

    const updatedAsset = await this.assetRepository.save(asset);

    this.logger.log(`Asset updated successfully: ${assetId}`);
    return updatedAsset;
  }

  async deleteAsset(assetId: string): Promise<void> {
    this.logger.log(`Deleting asset: ${assetId}`);

    const asset = await this.getAssetById(assetId);

    // Check if asset has active maintenance or movements
    const activeMaintenance = await this.maintenanceRepository.count({
      where: { assetId, status: MaintenanceStatus.IN_PROGRESS },
    });

    if (activeMaintenance > 0) {
      throw new Error('Cannot delete asset with active maintenance records');
    }

    await this.assetRepository.remove(asset);
    this.logger.log(`Asset deleted successfully: ${assetId}`);
  }

  async assignAsset(assetId: string, assignmentData: {
    assignedToUserId?: string;
    assignedToDepartment?: string;
    locationId?: string;
  }): Promise<Asset> {
    this.logger.log(`Assigning asset: ${assetId}`);

    const asset = await this.getAssetById(assetId);

    // Create movement record
    const movement = this.movementRepository.create({
      schoolId: asset.schoolId,
      assetId: asset.id,
      movementCode: await this.generateMovementCode(asset.schoolId),
      movementType: 'assignment' as any,
      movementTitle: `Asset Assignment: ${asset.name}`,
      movementDescription: `Asset assigned to ${assignmentData.assignedToUserId ? 'user' : 'department'}`,
      status: MovementStatus.COMPLETED,
      fromLocationId: asset.locationId,
      toLocationId: assignmentData.locationId,
      fromUserId: asset.assignedToUserId,
      toUserId: assignmentData.assignedToUserId,
      fromDepartment: asset.assignedToDepartment,
      toDepartment: assignmentData.assignedToDepartment,
      movementDate: new Date(),
      requestedBy: 'system',
      createdBy: 'system',
    });

    await this.movementRepository.save(movement);

    // Update asset
    Object.assign(asset, assignmentData);
    asset.updatedAt = new Date();

    const updatedAsset = await this.assetRepository.save(asset);

    this.logger.log(`Asset assigned successfully: ${assetId}`);
    return updatedAsset;
  }

  async updateAssetCondition(assetId: string, condition: TAssetCondition, notes?: string): Promise<Asset> {
    this.logger.log(`Updating asset condition: ${assetId}`);

    const asset = await this.getAssetById(assetId);

    asset.condition = condition;
    asset.updatedAt = new Date();

    if (notes) {
      asset.notes = asset.notes ? `${asset.notes}\n${notes}` : notes;
    }

    const updatedAsset = await this.assetRepository.save(asset);

    this.logger.log(`Asset condition updated successfully: ${assetId}`);
    return updatedAsset;
  }

  async calculateDepreciation(assetId: string): Promise<Asset> {
    this.logger.log(`Calculating depreciation for asset: ${assetId}`);

    const asset = await this.getAssetById(assetId);

    if (!asset.procurement.purchaseDate || !asset.financial.purchasePrice || !asset.financial.usefulLife) {
      throw new Error('Asset missing required depreciation data');
    }

    const currentDate = new Date();
    const purchaseDate = new Date(asset.procurement.purchaseDate);
    const yearsElapsed = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    let depreciationAmount = 0;

    if (asset.financial.depreciationMethod === TDepreciationMethod.STRAIGHT_LINE) {
      const annualDepreciation = (asset.financial.purchasePrice - asset.financial.salvageValue) / asset.financial.usefulLife;
      depreciationAmount = annualDepreciation * Math.min(yearsElapsed, asset.financial.usefulLife);
    } else if (asset.financial.depreciationMethod === TDepreciationMethod.DECLINING_BALANCE) {
      const rate = 2 / asset.financial.usefulLife; // Double declining balance
      depreciationAmount = asset.financial.purchasePrice * (1 - Math.pow(1 - rate, yearsElapsed));
    }

    asset.financial.accumulatedDepreciation = Math.min(depreciationAmount, asset.financial.purchasePrice - asset.financial.salvageValue);
    asset.financial.currentValue = asset.financial.purchasePrice - asset.financial.accumulatedDepreciation;
    // asset.lastDepreciationDate = currentDate; // Not in entity
    asset.updatedAt = currentDate;

    const updatedAsset = await this.assetRepository.save(asset);

    this.logger.log(`Depreciation calculated for asset: ${assetId}`);
    return updatedAsset;
  }

  async getAssetsDueForMaintenance(schoolId: string): Promise<Asset[]> {
    this.logger.log(`Getting assets due for maintenance: ${schoolId}`);

    const currentDate = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(currentDate.getDate() + 30);

    return this.assetRepository.createQueryBuilder('asset')
      .where('asset.schoolId = :schoolId', { schoolId })
      .andWhere('asset.status = :status', { status: TAssetStatus.ACTIVE })
      .andWhere('asset.maintenance->\'nextMaintenanceDate\' BETWEEN :startDate AND :endDate', {
        startDate: currentDate,
        endDate: thirtyDaysFromNow
      })
      .getMany();
  }

  async getAssetsExpiringWarranty(schoolId: string): Promise<Asset[]> {
    this.logger.log(`Getting assets with expiring warranty: ${schoolId}`);

    const currentDate = new Date();
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(currentDate.getDate() + 90);

    return this.assetRepository.createQueryBuilder('asset')
      .where('asset.schoolId = :schoolId', { schoolId })
      .andWhere('asset.status = :status', { status: TAssetStatus.ACTIVE })
      .andWhere('asset.procurement->\'warrantyExpiryDate\' BETWEEN :startDate AND :endDate', {
        startDate: currentDate,
        endDate: ninetyDaysFromNow
      })
      .getMany();
  }

  async getAssetAnalytics(schoolId: string): Promise<AssetAnalytics> {
    this.logger.log(`Getting asset analytics for school: ${schoolId}`);

    const assets = await this.getAssetsBySchool(schoolId);

    const analytics: AssetAnalytics = {
      totalAssets: assets.length,
      activeAssets: assets.filter(a => a.status === TAssetStatus.ACTIVE).length,
      maintenanceAssets: assets.filter(a => a.status === TAssetStatus.MAINTENANCE).length,
      totalValue: assets.reduce((sum, a) => sum + (a.financial?.purchasePrice || 0), 0),
      depreciatedValue: assets.reduce((sum, a) => sum + (a.financial?.currentValue || 0), 0),
      assetsByType: {},
      assetsByStatus: {},
      assetsByCondition: {},
      maintenanceDue: 0,
      warrantyExpiring: 0,
    };

    // Calculate breakdowns
    assets.forEach(asset => {
      // By type
      analytics.assetsByType[asset.category] = (analytics.assetsByType[asset.category] || 0) + 1;

      // By status
      analytics.assetsByStatus[asset.status] = (analytics.assetsByStatus[asset.status] || 0) + 1;

      // By condition
      analytics.assetsByCondition[asset.condition] = (analytics.assetsByCondition[asset.condition] || 0) + 1;
    });

    // Get maintenance due and warranty expiring
    analytics.maintenanceDue = (await this.getAssetsDueForMaintenance(schoolId)).length;
    analytics.warrantyExpiring = (await this.getAssetsExpiringWarranty(schoolId)).length;

    return analytics;
  }

  async bulkUpdateAssets(assetIds: string[], updateData: Partial<Asset>): Promise<Asset[]> {
    this.logger.log(`Bulk updating ${assetIds.length} assets`);

    const assets = await this.assetRepository.find({
      where: assetIds.map(id => ({ id })),
    });

    const updatedAssets = assets.map(asset => {
      Object.assign(asset, updateData);
      asset.updatedAt = new Date();
      return asset;
    });

    const savedAssets = await this.assetRepository.save(updatedAssets);

    this.logger.log(`Bulk update completed for ${assetIds.length} assets`);
    return savedAssets;
  }

  async searchAssets(schoolId: string, searchTerm: string): Promise<Asset[]> {
    this.logger.log(`Searching assets: ${searchTerm}`);

    return this.assetRepository.createQueryBuilder('asset')
      .where('asset.schoolId = :schoolId', { schoolId })
      .andWhere('(asset.name ILIKE :searchTerm OR asset.assetCode ILIKE :searchTerm OR asset.specifications->>\'serialNumber\' ILIKE :searchTerm)')
      .setParameters({ searchTerm: `%${searchTerm}%` })
      .orderBy('asset.createdAt', 'DESC')
      .getMany();
  }

  private async generateAssetCode(schoolId: string): Promise<string> {
    const count = await this.assetRepository.count({ where: { schoolId } });
    const nextNumber = (count + 1).toString().padStart(4, '0');
    return `AST-${schoolId.slice(-4).toUpperCase()}-${nextNumber}`;
  }

  private async generateMovementCode(schoolId: string): Promise<string> {
    const count = await this.movementRepository.count({ where: { schoolId } });
    const nextNumber = (count + 1).toString().padStart(4, '0');
    return `MOV-${schoolId.slice(-4).toUpperCase()}-${nextNumber}`;
  }
}