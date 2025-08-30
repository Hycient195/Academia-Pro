// Academia Pro - Inventory Analytics Service
// Service for comprehensive inventory analytics and reporting

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Asset, AssetStatus, AssetCondition, AssetType } from '../entities/asset.entity';
import { AssetCategory } from '../entities/asset-category.entity';
import { AssetLocation } from '../entities/asset-location.entity';
import { AssetMaintenance, MaintenanceStatus } from '../entities/asset-maintenance.entity';
import { AssetMovement, MovementType } from '../entities/asset-movement.entity';

export interface InventoryDashboard {
  overview: {
    totalAssets: number;
    activeAssets: number;
    maintenanceAssets: number;
    totalValue: number;
    depreciatedValue: number;
    utilizationRate: number;
  };
  statusBreakdown: { [key: string]: number };
  conditionBreakdown: { [key: string]: number };
  typeBreakdown: { [key: string]: number };
  locationBreakdown: { [key: string]: number };
  categoryBreakdown: { [key: string]: number };
  alerts: {
    maintenanceDue: number;
    warrantyExpiring: number;
    overdueAllocations: number;
    lowStockItems: number;
  };
  trends: {
    assetsAddedThisMonth: number;
    assetsRemovedThisMonth: number;
    maintenanceCompletedThisMonth: number;
    depreciationThisMonth: number;
  };
}

export interface MaintenanceReport {
  totalMaintenanceRecords: number;
  pendingMaintenance: number;
  completedMaintenance: number;
  overdueMaintenance: number;
  averageCompletionTime: number;
  totalMaintenanceCost: number;
  maintenanceByType: { [key: string]: number };
  maintenanceByPriority: { [key: string]: number };
  maintenanceCostByCategory: { [key: string]: number };
  topMaintenanceAssets: Array<{
    assetId: string;
    assetName: string;
    maintenanceCount: number;
    totalCost: number;
  }>;
}

export interface DepreciationReport {
  totalAssetsValue: number;
  totalDepreciatedValue: number;
  totalDepreciationExpense: number;
  averageDepreciationRate: number;
  assetsByDepreciationMethod: { [key: string]: number };
  depreciationByCategory: { [key: string]: number };
  depreciationByAge: {
    '0-1_years': number;
    '1-3_years': number;
    '3-5_years': number;
    '5+_years': number;
  };
  upcomingDepreciationRuns: number;
}

export interface AllocationReport {
  totalAllocations: number;
  activeAllocations: number;
  overdueReturns: number;
  averageAllocationDuration: number;
  utilizationRate: number;
  allocationByDepartment: { [key: string]: number };
  allocationByLocation: { [key: string]: number };
  topAllocatedAssets: Array<{
    assetId: string;
    assetName: string;
    allocationCount: number;
    totalDaysAllocated: number;
  }>;
  allocationTrends: {
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
  };
}

export interface InventoryReport {
  generatedAt: Date;
  schoolId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  dashboard: InventoryDashboard;
  maintenanceReport: MaintenanceReport;
  depreciationReport: DepreciationReport;
  allocationReport: AllocationReport;
  recommendations: string[];
}

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

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

  async getInventoryDashboard(schoolId: string): Promise<InventoryDashboard> {
    this.logger.log(`Getting inventory dashboard for school: ${schoolId}`);

    const assets = await this.assetRepository.find({ where: { schoolId } });
    const maintenanceRecords = await this.maintenanceRepository.find({ where: { schoolId } });
    const movements = await this.movementRepository.find({ where: { schoolId } });

    const dashboard: InventoryDashboard = {
      overview: {
        totalAssets: assets.length,
        activeAssets: assets.filter(a => a.status === AssetStatus.ACTIVE).length,
        maintenanceAssets: assets.filter(a => a.status === AssetStatus.MAINTENANCE).length,
        totalValue: assets.reduce((sum, a) => sum + (a.purchaseCost || 0), 0),
        depreciatedValue: assets.reduce((sum, a) => sum + (a.currentValue || 0), 0),
        utilizationRate: 0,
      },
      statusBreakdown: {},
      conditionBreakdown: {},
      typeBreakdown: {},
      locationBreakdown: {},
      categoryBreakdown: {},
      alerts: {
        maintenanceDue: 0,
        warrantyExpiring: 0,
        overdueAllocations: 0,
        lowStockItems: 0,
      },
      trends: {
        assetsAddedThisMonth: 0,
        assetsRemovedThisMonth: 0,
        maintenanceCompletedThisMonth: 0,
        depreciationThisMonth: 0,
      },
    };

    // Calculate breakdowns
    assets.forEach(asset => {
      // Status
      dashboard.statusBreakdown[asset.status] = (dashboard.statusBreakdown[asset.status] || 0) + 1;

      // Condition
      dashboard.conditionBreakdown[asset.condition] = (dashboard.conditionBreakdown[asset.condition] || 0) + 1;

      // Type
      dashboard.typeBreakdown[asset.assetType] = (dashboard.typeBreakdown[asset.assetType] || 0) + 1;

      // Location
      if (asset.locationId) {
        dashboard.locationBreakdown[asset.locationId] = (dashboard.locationBreakdown[asset.locationId] || 0) + 1;
      }

      // Category
      if (asset.categoryId) {
        dashboard.categoryBreakdown[asset.categoryId] = (dashboard.categoryBreakdown[asset.categoryId] || 0) + 1;
      }
    });

    // Calculate utilization rate
    const activeAllocations = movements.filter(m =>
      m.movementType === 'assignment' as any &&
      m.status === 'completed' as any &&
      !m.actualReturnDate
    ).length;

    if (assets.length > 0) {
      dashboard.overview.utilizationRate = (activeAllocations / assets.length) * 100;
    }

    // Calculate alerts
    const currentDate = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(currentDate.getDate() + 30);

    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(currentDate.getDate() + 90);

    dashboard.alerts.maintenanceDue = maintenanceRecords.filter(m =>
      m.status === MaintenanceStatus.SCHEDULED &&
      m.scheduledDate <= thirtyDaysFromNow
    ).length;

    dashboard.alerts.warrantyExpiring = assets.filter(a =>
      a.warrantyExpiry && a.warrantyExpiry <= ninetyDaysFromNow
    ).length;

    dashboard.alerts.overdueAllocations = movements.filter(m =>
      m.movementType === 'assignment' as any &&
      m.status === 'completed' as any &&
      !m.actualReturnDate &&
      m.expectedReturnDate &&
      m.expectedReturnDate < currentDate
    ).length;

    // Calculate trends (simplified - would need date filtering in real implementation)
    const thisMonth = new Date();
    thisMonth.setDate(1);

    dashboard.trends.assetsAddedThisMonth = assets.filter(a => a.createdAt >= thisMonth).length;
    dashboard.trends.maintenanceCompletedThisMonth = maintenanceRecords.filter(m =>
      m.status === MaintenanceStatus.COMPLETED && m.actualCompletionDate && m.actualCompletionDate >= thisMonth
    ).length;

    return dashboard;
  }

  async getMaintenanceReport(schoolId: string, startDate?: Date, endDate?: Date): Promise<MaintenanceReport> {
    this.logger.log(`Getting maintenance report for school: ${schoolId}`);

    let maintenanceRecords = await this.maintenanceRepository.find({
      where: { schoolId },
      relations: ['asset'],
    });

    // Filter by date range if provided
    if (startDate && endDate) {
      maintenanceRecords = maintenanceRecords.filter(m =>
        m.createdAt >= startDate && m.createdAt <= endDate
      );
    }

    const report: MaintenanceReport = {
      totalMaintenanceRecords: maintenanceRecords.length,
      pendingMaintenance: maintenanceRecords.filter(m => m.status === MaintenanceStatus.SCHEDULED).length,
      completedMaintenance: maintenanceRecords.filter(m => m.status === MaintenanceStatus.COMPLETED).length,
      overdueMaintenance: 0,
      averageCompletionTime: 0,
      totalMaintenanceCost: 0,
      maintenanceByType: {},
      maintenanceByPriority: {},
      maintenanceCostByCategory: {},
      topMaintenanceAssets: [],
    };

    const currentDate = new Date();
    let totalCompletionTime = 0;
    let completedCount = 0;

    // Calculate metrics
    maintenanceRecords.forEach(record => {
      // Overdue maintenance
      if (record.status === MaintenanceStatus.SCHEDULED && record.scheduledDate < currentDate) {
        report.overdueMaintenance++;
      }

      // Completion time
      if (record.actualStartDate && record.actualCompletionDate) {
        const completionTime = record.actualCompletionDate.getTime() - record.actualStartDate.getTime();
        totalCompletionTime += completionTime;
        completedCount++;
      }

      // Costs
      if (record.actualCost) {
        report.totalMaintenanceCost += record.actualCost;
      }

      // By type
      report.maintenanceByType[record.maintenanceType] = (report.maintenanceByType[record.maintenanceType] || 0) + 1;

      // By priority
      report.maintenanceByPriority[record.priority] = (report.maintenanceByPriority[record.priority] || 0) + 1;

      // Cost by category (would need to fetch asset separately)
      // if (record.asset?.categoryId) {
      //   report.maintenanceCostByCategory[record.asset.categoryId] =
      //     (report.maintenanceCostByCategory[record.asset.categoryId] || 0) + (record.actualCost || 0);
      // }
    });

    // Average completion time
    if (completedCount > 0) {
      report.averageCompletionTime = (totalCompletionTime / completedCount) / (1000 * 60 * 60); // Convert to hours
    }

    // Top maintenance assets
    const assetMaintenanceCount = new Map<string, { name: string; count: number; cost: number }>();

    maintenanceRecords.forEach(record => {
      // Since we don't have the asset relation loaded, we'll use assetId as name placeholder
      const existing = assetMaintenanceCount.get(record.assetId) || {
        name: `Asset ${record.assetId}`,
        count: 0,
        cost: 0,
      };
      existing.count++;
      existing.cost += record.actualCost || 0;
      assetMaintenanceCount.set(record.assetId, existing);
    });

    report.topMaintenanceAssets = Array.from(assetMaintenanceCount.entries())
      .map(([assetId, data]) => ({
        assetId,
        assetName: data.name,
        maintenanceCount: data.count,
        totalCost: data.cost,
      }))
      .sort((a, b) => b.maintenanceCount - a.maintenanceCount)
      .slice(0, 10);

    return report;
  }

  async getDepreciationReport(schoolId: string): Promise<DepreciationReport> {
    this.logger.log(`Getting depreciation report for school: ${schoolId}`);

    const assets = await this.assetRepository.find({ where: { schoolId } });

    const report: DepreciationReport = {
      totalAssetsValue: 0,
      totalDepreciatedValue: 0,
      totalDepreciationExpense: 0,
      averageDepreciationRate: 0,
      assetsByDepreciationMethod: {},
      depreciationByCategory: {},
      depreciationByAge: {
        '0-1_years': 0,
        '1-3_years': 0,
        '3-5_years': 0,
        '5+_years': 0,
      },
      upcomingDepreciationRuns: 0,
    };

    const currentDate = new Date();
    let totalDepreciationRate = 0;
    let assetsWithDepreciation = 0;

    assets.forEach(asset => {
      if (asset.purchaseCost) {
        report.totalAssetsValue += asset.purchaseCost;
      }

      if (asset.accumulatedDepreciation) {
        report.totalDepreciationExpense += asset.accumulatedDepreciation;
        report.totalDepreciatedValue += asset.currentValue || 0;
      }

      // By depreciation method
      const method = asset.depreciationMethod || 'straight_line';
      report.assetsByDepreciationMethod[method] = (report.assetsByDepreciationMethod[method] || 0) + 1;

      // By category
      if (asset.categoryId) {
        report.depreciationByCategory[asset.categoryId] =
          (report.depreciationByCategory[asset.categoryId] || 0) + (asset.accumulatedDepreciation || 0);
      }

      // By age
      if (asset.purchaseDate) {
        const ageInYears = (currentDate.getTime() - asset.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
        if (ageInYears < 1) report.depreciationByAge['0-1_years']++;
        else if (ageInYears < 3) report.depreciationByAge['1-3_years']++;
        else if (ageInYears < 5) report.depreciationByAge['3-5_years']++;
        else report.depreciationByAge['5+_years']++;
      }

      // Depreciation rate
      if (asset.usefulLifeYears && asset.purchaseCost) {
        const rate = (asset.purchaseCost - (asset.salvageValue || 0)) / asset.usefulLifeYears / asset.purchaseCost;
        totalDepreciationRate += rate;
        assetsWithDepreciation++;
      }
    });

    if (assetsWithDepreciation > 0) {
      report.averageDepreciationRate = totalDepreciationRate / assetsWithDepreciation;
    }

    // Upcoming depreciation runs (simplified)
    const lastMonth = new Date();
    lastMonth.setMonth(currentDate.getMonth() - 1);
    report.upcomingDepreciationRuns = assets.filter(a =>
      !a.lastDepreciationDate || a.lastDepreciationDate < lastMonth
    ).length;

    return report;
  }

  async getAllocationReport(schoolId: string, startDate?: Date, endDate?: Date): Promise<AllocationReport> {
    this.logger.log(`Getting allocation report for school: ${schoolId}`);

    let movements = await this.movementRepository.find({
      where: { schoolId },
      relations: ['asset'],
    });

    // Filter by date range if provided
    if (startDate && endDate) {
      movements = movements.filter(m =>
        m.createdAt >= startDate && m.createdAt <= endDate
      );
    }

    const allocationMovements = movements.filter(m => m.movementType === 'assignment' as any);

    const report: AllocationReport = {
      totalAllocations: allocationMovements.length,
      activeAllocations: allocationMovements.filter(m =>
        m.status === 'completed' as any && !m.actualReturnDate
      ).length,
      overdueReturns: 0,
      averageAllocationDuration: 0,
      utilizationRate: 0,
      allocationByDepartment: {},
      allocationByLocation: {},
      topAllocatedAssets: [],
      allocationTrends: {
        thisMonth: 0,
        lastMonth: 0,
        growthRate: 0,
      },
    };

    const currentDate = new Date();
    let totalDuration = 0;
    let completedAllocations = 0;

    // Calculate metrics
    allocationMovements.forEach(movement => {
      // Overdue returns
      if (movement.status === 'completed' as any &&
          !movement.actualReturnDate &&
          movement.expectedReturnDate &&
          movement.expectedReturnDate < currentDate) {
        report.overdueReturns++;
      }

      // Duration
      if (movement.actualReturnDate && movement.movementDate) {
        const duration = movement.actualReturnDate.getTime() - movement.movementDate.getTime();
        totalDuration += duration;
        completedAllocations++;
      }

      // By department
      if (movement.toDepartment) {
        report.allocationByDepartment[movement.toDepartment] =
          (report.allocationByDepartment[movement.toDepartment] || 0) + 1;
      }

      // By location
      if (movement.toLocationId) {
        report.allocationByLocation[movement.toLocationId] =
          (report.allocationByLocation[movement.toLocationId] || 0) + 1;
      }
    });

    // Average duration
    if (completedAllocations > 0) {
      report.averageAllocationDuration = (totalDuration / completedAllocations) / (1000 * 60 * 60 * 24); // Convert to days
    }

    // Utilization rate
    const totalAssets = await this.assetRepository.count({ where: { schoolId } });
    if (totalAssets > 0) {
      report.utilizationRate = (report.activeAllocations / totalAssets) * 100;
    }

    // Top allocated assets
    const assetAllocationCount = new Map<string, { name: string; count: number; totalDays: number }>();

    allocationMovements.forEach(movement => {
      // Since we don't have the asset relation loaded, we'll use assetId as name placeholder
      const existing = assetAllocationCount.get(movement.assetId) || {
        name: `Asset ${movement.assetId}`,
        count: 0,
        totalDays: 0,
      };
      existing.count++;

      if (movement.actualReturnDate && movement.movementDate) {
        const days = (movement.actualReturnDate.getTime() - movement.movementDate.getTime()) / (1000 * 60 * 60 * 24);
        existing.totalDays += days;
      }

      assetAllocationCount.set(movement.assetId, existing);
    });

    report.topAllocatedAssets = Array.from(assetAllocationCount.entries())
      .map(([assetId, data]) => ({
        assetId,
        assetName: data.name,
        allocationCount: data.count,
        totalDaysAllocated: data.totalDays,
      }))
      .sort((a, b) => b.allocationCount - a.allocationCount)
      .slice(0, 10);

    // Allocation trends (simplified)
    const thisMonth = new Date();
    thisMonth.setDate(1);
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    report.allocationTrends.thisMonth = allocationMovements.filter(m => m.createdAt >= thisMonth).length;
    report.allocationTrends.lastMonth = allocationMovements.filter(m =>
      m.createdAt >= lastMonth && m.createdAt < thisMonth
    ).length;

    if (report.allocationTrends.lastMonth > 0) {
      report.allocationTrends.growthRate =
        ((report.allocationTrends.thisMonth - report.allocationTrends.lastMonth) / report.allocationTrends.lastMonth) * 100;
    }

    return report;
  }

  async generateComprehensiveReport(schoolId: string, startDate?: Date, endDate?: Date): Promise<InventoryReport> {
    this.logger.log(`Generating comprehensive inventory report for school: ${schoolId}`);

    const report: InventoryReport = {
      generatedAt: new Date(),
      schoolId,
      period: {
        startDate: startDate || new Date(new Date().getFullYear(), 0, 1), // Start of year
        endDate: endDate || new Date(),
      },
      dashboard: await this.getInventoryDashboard(schoolId),
      maintenanceReport: await this.getMaintenanceReport(schoolId, startDate, endDate),
      depreciationReport: await this.getDepreciationReport(schoolId),
      allocationReport: await this.getAllocationReport(schoolId, startDate, endDate),
      recommendations: [],
    };

    // Generate recommendations based on data
    this.generateRecommendations(report);

    return report;
  }

  private generateRecommendations(report: InventoryReport): void {
    const recommendations: string[] = [];

    // Maintenance recommendations
    if (report.dashboard.alerts.maintenanceDue > 0) {
      recommendations.push(`Schedule maintenance for ${report.dashboard.alerts.maintenanceDue} assets due for servicing`);
    }

    if (report.maintenanceReport.overdueMaintenance > 0) {
      recommendations.push(`Address ${report.maintenanceReport.overdueMaintenance} overdue maintenance items`);
    }

    // Warranty recommendations
    if (report.dashboard.alerts.warrantyExpiring > 0) {
      recommendations.push(`Review warranty status for ${report.dashboard.alerts.warrantyExpiring} assets expiring soon`);
    }

    // Allocation recommendations
    if (report.allocationReport.overdueReturns > 0) {
      recommendations.push(`Follow up on ${report.allocationReport.overdueReturns} overdue asset returns`);
    }

    if (report.dashboard.overview.utilizationRate < 30) {
      recommendations.push('Consider increasing asset utilization through better allocation management');
    }

    // Condition recommendations
    const poorConditionAssets = Object.entries(report.dashboard.conditionBreakdown)
      .filter(([condition, count]) => condition === 'poor' || condition === 'damaged')
      .reduce((sum, [, count]) => sum + count, 0);

    if (poorConditionAssets > 0) {
      recommendations.push(`Review condition of ${poorConditionAssets} assets requiring attention`);
    }

    // Default recommendations if none generated
    if (recommendations.length === 0) {
      recommendations.push('Inventory management is in good condition');
      recommendations.push('Continue regular maintenance and depreciation tracking');
      recommendations.push('Monitor asset utilization and allocation patterns');
    }

    report.recommendations = recommendations;
  }
}