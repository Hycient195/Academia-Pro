// Academia Pro - Asset Depreciation Service
// Service for calculating and managing asset depreciation

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Asset, DepreciationMethod } from '../entities/asset.entity';

export interface DepreciationCalculation {
  assetId: string;
  currentValue: number;
  accumulatedDepreciation: number;
  depreciationExpense: number;
  bookValue: number;
  depreciationRate: number;
  usefulLifeRemaining: number;
  lastDepreciationDate: Date;
  nextDepreciationDate: Date;
}

export interface DepreciationSchedule {
  assetId: string;
  assetName: string;
  depreciationMethod: DepreciationMethod;
  usefulLifeYears: number;
  purchaseCost: number;
  salvageValue: number;
  schedule: Array<{
    period: number;
    date: Date;
    depreciationExpense: number;
    accumulatedDepreciation: number;
    bookValue: number;
  }>;
}

export interface DepreciationAnalytics {
  totalAssetsValue: number;
  totalDepreciatedValue: number;
  totalDepreciationExpense: number;
  averageDepreciationRate: number;
  assetsByDepreciationMethod: { [key: string]: number };
  depreciationByCategory: { [key: string]: number };
  upcomingDepreciationRuns: number;
}

@Injectable()
export class DepreciationService {
  private readonly logger = new Logger(DepreciationService.name);

  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    private dataSource: DataSource,
  ) {}

  async calculateDepreciation(assetId: string): Promise<DepreciationCalculation> {
    this.logger.log(`Calculating depreciation for asset: ${assetId}`);

    const asset = await this.assetRepository.findOne({ where: { id: assetId } });
    if (!asset) {
      throw new Error('Asset not found');
    }

    if (!asset.purchaseDate || !asset.purchaseCost || !asset.usefulLifeYears) {
      throw new Error('Asset missing required depreciation data');
    }

    const currentDate = new Date();
    const purchaseDate = new Date(asset.purchaseDate);
    const yearsElapsed = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

    let depreciationExpense = 0;
    let depreciationRate = 0;

    // Calculate depreciation based on method
    if (asset.depreciationMethod === DepreciationMethod.STRAIGHT_LINE) {
      depreciationRate = (asset.purchaseCost - asset.salvageValue) / asset.usefulLifeYears;
      depreciationExpense = depreciationRate;
    } else if (asset.depreciationMethod === DepreciationMethod.DECLINING_BALANCE) {
      // Double declining balance
      depreciationRate = 2 / asset.usefulLifeYears;
      const bookValue = asset.currentValue || asset.purchaseCost;
      depreciationExpense = bookValue * depreciationRate;
    }

    // Ensure we don't depreciate below salvage value
    const maxDepreciableAmount = asset.purchaseCost - asset.salvageValue;
    const currentAccumulated = asset.accumulatedDepreciation || 0;

    if (currentAccumulated + depreciationExpense > maxDepreciableAmount) {
      depreciationExpense = maxDepreciableAmount - currentAccumulated;
    }

    const newAccumulatedDepreciation = currentAccumulated + depreciationExpense;
    const newBookValue = asset.purchaseCost - newAccumulatedDepreciation;
    const usefulLifeRemaining = asset.usefulLifeYears - yearsElapsed;

    // Calculate next depreciation date (typically monthly)
    const nextDepreciationDate = new Date(currentDate);
    nextDepreciationDate.setMonth(nextDepreciationDate.getMonth() + 1);

    return {
      assetId: asset.id,
      currentValue: newBookValue,
      accumulatedDepreciation: newAccumulatedDepreciation,
      depreciationExpense,
      bookValue: newBookValue,
      depreciationRate,
      usefulLifeRemaining: Math.max(0, usefulLifeRemaining),
      lastDepreciationDate: currentDate,
      nextDepreciationDate,
    };
  }

  async applyDepreciation(assetId: string): Promise<Asset> {
    this.logger.log(`Applying depreciation to asset: ${assetId}`);

    const calculation = await this.calculateDepreciation(assetId);
    const asset = await this.assetRepository.findOne({ where: { id: assetId } });

    // Update asset with new depreciation values
    asset.currentValue = calculation.currentValue;
    asset.accumulatedDepreciation = calculation.accumulatedDepreciation;
    asset.lastDepreciationDate = calculation.lastDepreciationDate;
    asset.updatedAt = new Date();

    const updatedAsset = await this.assetRepository.save(asset);

    this.logger.log(`Depreciation applied to asset: ${assetId}`);
    return updatedAsset;
  }

  async bulkCalculateDepreciation(schoolId: string): Promise<DepreciationCalculation[]> {
    this.logger.log(`Bulk calculating depreciation for school: ${schoolId}`);

    const assets = await this.assetRepository.find({
      where: {
        schoolId,
        status: 'active' as any,
      },
    });

    const calculations: DepreciationCalculation[] = [];

    for (const asset of assets) {
      try {
        if (asset.purchaseDate && asset.purchaseCost && asset.usefulLifeYears) {
          const calculation = await this.calculateDepreciation(asset.id);
          calculations.push(calculation);
        }
      } catch (error) {
        this.logger.warn(`Failed to calculate depreciation for asset ${asset.id}: ${error.message}`);
      }
    }

    return calculations;
  }

  async bulkApplyDepreciation(schoolId: string): Promise<Asset[]> {
    this.logger.log(`Bulk applying depreciation for school: ${schoolId}`);

    const calculations = await this.bulkCalculateDepreciation(schoolId);
    const updatedAssets: Asset[] = [];

    for (const calculation of calculations) {
      try {
        const asset = await this.assetRepository.findOne({ where: { id: calculation.assetId } });
        asset.currentValue = calculation.currentValue;
        asset.accumulatedDepreciation = calculation.accumulatedDepreciation;
        asset.lastDepreciationDate = calculation.lastDepreciationDate;
        asset.updatedAt = new Date();

        const updatedAsset = await this.assetRepository.save(asset);
        updatedAssets.push(updatedAsset);
      } catch (error) {
        this.logger.warn(`Failed to apply depreciation for asset ${calculation.assetId}: ${error.message}`);
      }
    }

    this.logger.log(`Bulk depreciation applied to ${updatedAssets.length} assets`);
    return updatedAssets;
  }

  async getDepreciationSchedule(assetId: string): Promise<DepreciationSchedule> {
    this.logger.log(`Getting depreciation schedule for asset: ${assetId}`);

    const asset = await this.assetRepository.findOne({ where: { id: assetId } });
    if (!asset) {
      throw new Error('Asset not found');
    }

    if (!asset.purchaseDate || !asset.purchaseCost || !asset.usefulLifeYears) {
      throw new Error('Asset missing required depreciation data');
    }

    const schedule: DepreciationSchedule = {
      assetId: asset.id,
      assetName: asset.assetName,
      depreciationMethod: asset.depreciationMethod,
      usefulLifeYears: asset.usefulLifeYears,
      purchaseCost: asset.purchaseCost,
      salvageValue: asset.salvageValue || 0,
      schedule: [],
    };

    const purchaseDate = new Date(asset.purchaseDate);
    let accumulatedDepreciation = 0;
    let currentBookValue = asset.purchaseCost;

    // Generate schedule for each year
    for (let year = 1; year <= asset.usefulLifeYears; year++) {
      const periodDate = new Date(purchaseDate);
      periodDate.setFullYear(purchaseDate.getFullYear() + year - 1);

      let depreciationExpense = 0;

      if (asset.depreciationMethod === DepreciationMethod.STRAIGHT_LINE) {
        depreciationExpense = (asset.purchaseCost - asset.salvageValue) / asset.usefulLifeYears;
      } else if (asset.depreciationMethod === DepreciationMethod.DECLINING_BALANCE) {
        const rate = 2 / asset.usefulLifeYears;
        depreciationExpense = currentBookValue * rate;
      }

      // Ensure we don't go below salvage value
      if (accumulatedDepreciation + depreciationExpense > asset.purchaseCost - asset.salvageValue) {
        depreciationExpense = (asset.purchaseCost - asset.salvageValue) - accumulatedDepreciation;
      }

      accumulatedDepreciation += depreciationExpense;
      currentBookValue = asset.purchaseCost - accumulatedDepreciation;

      schedule.schedule.push({
        period: year,
        date: periodDate,
        depreciationExpense,
        accumulatedDepreciation,
        bookValue: currentBookValue,
      });
    }

    return schedule;
  }

  async getAssetsDueForDepreciation(schoolId: string): Promise<Asset[]> {
    this.logger.log(`Getting assets due for depreciation: ${schoolId}`);

    const currentDate = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(currentDate.getMonth() - 1);

    // Assets that haven't been depreciated in the last month
    return this.assetRepository.find({
      where: {
        schoolId,
        status: 'active' as any,
        lastDepreciationDate: LessThan(lastMonth),
      },
    });
  }

  async getDepreciationAnalytics(schoolId: string): Promise<DepreciationAnalytics> {
    this.logger.log(`Getting depreciation analytics for school: ${schoolId}`);

    const assets = await this.assetRepository.find({
      where: { schoolId },
    });

    const analytics: DepreciationAnalytics = {
      totalAssetsValue: 0,
      totalDepreciatedValue: 0,
      totalDepreciationExpense: 0,
      averageDepreciationRate: 0,
      assetsByDepreciationMethod: {},
      depreciationByCategory: {},
      upcomingDepreciationRuns: 0,
    };

    let totalDepreciationRate = 0;
    let assetsWithDepreciation = 0;

    assets.forEach(asset => {
      if (asset.purchaseCost) {
        analytics.totalAssetsValue += asset.purchaseCost;
      }

      if (asset.accumulatedDepreciation) {
        analytics.totalDepreciationExpense += asset.accumulatedDepreciation;
        analytics.totalDepreciatedValue += asset.currentValue || 0;
      }

      if (asset.usefulLifeYears && asset.purchaseCost) {
        const rate = (asset.purchaseCost - (asset.salvageValue || 0)) / asset.usefulLifeYears / asset.purchaseCost;
        totalDepreciationRate += rate;
        assetsWithDepreciation++;
      }

      // Count by depreciation method
      const method = asset.depreciationMethod || DepreciationMethod.STRAIGHT_LINE;
      analytics.assetsByDepreciationMethod[method] = (analytics.assetsByDepreciationMethod[method] || 0) + 1;

      // Count by category (simplified - would need category relation)
      if (asset.categoryId) {
        analytics.depreciationByCategory[asset.categoryId] = (analytics.depreciationByCategory[asset.categoryId] || 0) + (asset.accumulatedDepreciation || 0);
      }
    });

    if (assetsWithDepreciation > 0) {
      analytics.averageDepreciationRate = totalDepreciationRate / assetsWithDepreciation;
    }

    // Get upcoming depreciation runs
    analytics.upcomingDepreciationRuns = (await this.getAssetsDueForDepreciation(schoolId)).length;

    return analytics;
  }

  async resetDepreciation(assetId: string): Promise<Asset> {
    this.logger.log(`Resetting depreciation for asset: ${assetId}`);

    const asset = await this.assetRepository.findOne({ where: { id: assetId } });
    if (!asset) {
      throw new Error('Asset not found');
    }

    asset.accumulatedDepreciation = 0;
    asset.currentValue = asset.purchaseCost;
    asset.lastDepreciationDate = null;
    asset.updatedAt = new Date();

    const updatedAsset = await this.assetRepository.save(asset);

    this.logger.log(`Depreciation reset for asset: ${assetId}`);
    return updatedAsset;
  }

  async updateDepreciationMethod(
    assetId: string,
    newMethod: DepreciationMethod,
    newUsefulLifeYears?: number,
  ): Promise<Asset> {
    this.logger.log(`Updating depreciation method for asset: ${assetId}`);

    const asset = await this.assetRepository.findOne({ where: { id: assetId } });
    if (!asset) {
      throw new Error('Asset not found');
    }

    asset.depreciationMethod = newMethod;
    if (newUsefulLifeYears) {
      asset.usefulLifeYears = newUsefulLifeYears;
    }

    // Reset depreciation when method changes
    asset.accumulatedDepreciation = 0;
    asset.currentValue = asset.purchaseCost;
    asset.lastDepreciationDate = null;
    asset.updatedAt = new Date();

    const updatedAsset = await this.assetRepository.save(asset);

    this.logger.log(`Depreciation method updated for asset: ${assetId}`);
    return updatedAsset;
  }
}