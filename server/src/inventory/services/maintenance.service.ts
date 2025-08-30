// Academia Pro - Asset Maintenance Service
// Service for managing asset maintenance schedules and records

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, LessThanOrEqual } from 'typeorm';
import { AssetMaintenance, MaintenanceType, MaintenanceStatus, MaintenancePriority } from '../entities/asset-maintenance.entity';
import { Asset } from '../entities/asset.entity';

export interface MaintenanceFilter {
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
  maintenanceType?: MaintenanceType;
  assetId?: string;
}

export interface MaintenanceAnalytics {
  totalMaintenanceRecords: number;
  pendingMaintenance: number;
  completedMaintenance: number;
  overdueMaintenance: number;
  maintenanceByType: { [key: string]: number };
  maintenanceByStatus: { [key: string]: number };
  averageCompletionTime: number;
  totalMaintenanceCost: number;
}

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(
    @InjectRepository(AssetMaintenance)
    private maintenanceRepository: Repository<AssetMaintenance>,
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    private dataSource: DataSource,
  ) {}

  async createMaintenanceRecord(maintenanceData: Partial<AssetMaintenance>): Promise<AssetMaintenance> {
    this.logger.log(`Creating maintenance record for asset: ${maintenanceData.assetId}`);

    // Generate maintenance code if not provided
    if (!maintenanceData.maintenanceCode) {
      maintenanceData.maintenanceCode = await this.generateMaintenanceCode(maintenanceData.schoolId);
    }

    // Set default values
    if (!maintenanceData.status) {
      maintenanceData.status = MaintenanceStatus.SCHEDULED;
    }
    if (!maintenanceData.priority) {
      maintenanceData.priority = MaintenancePriority.MEDIUM;
    }

    const maintenance = this.maintenanceRepository.create(maintenanceData);
    const savedMaintenance = await this.maintenanceRepository.save(maintenance);

    // Update asset status if maintenance is in progress
    if (savedMaintenance.status === MaintenanceStatus.IN_PROGRESS) {
      await this.assetRepository.update(savedMaintenance.assetId, {
        status: 'maintenance' as any,
        updatedAt: new Date(),
      });
    }

    this.logger.log(`Maintenance record created successfully: ${savedMaintenance.id}`);
    return savedMaintenance;
  }

  async getMaintenanceRecords(schoolId: string, filter?: MaintenanceFilter): Promise<AssetMaintenance[]> {
    this.logger.log(`Getting maintenance records for school: ${schoolId}`);

    const queryBuilder = this.maintenanceRepository.createQueryBuilder('maintenance')
      .leftJoinAndSelect('maintenance.asset', 'asset')
      .where('maintenance.schoolId = :schoolId', { schoolId });

    if (filter) {
      if (filter.status) {
        queryBuilder.andWhere('maintenance.status = :status', { status: filter.status });
      }
      if (filter.priority) {
        queryBuilder.andWhere('maintenance.priority = :priority', { priority: filter.priority });
      }
      if (filter.maintenanceType) {
        queryBuilder.andWhere('maintenance.maintenanceType = :maintenanceType', { maintenanceType: filter.maintenanceType });
      }
      if (filter.assetId) {
        queryBuilder.andWhere('maintenance.assetId = :assetId', { assetId: filter.assetId });
      }
    }

    return queryBuilder.orderBy('maintenance.scheduledDate', 'DESC').getMany();
  }

  async getMaintenanceById(maintenanceId: string): Promise<AssetMaintenance> {
    this.logger.log(`Getting maintenance record by ID: ${maintenanceId}`);

    const maintenance = await this.maintenanceRepository.findOne({
      where: { id: maintenanceId },
      relations: ['asset'],
    });

    if (!maintenance) {
      throw new Error('Maintenance record not found');
    }

    return maintenance;
  }

  async updateMaintenanceRecord(
    maintenanceId: string,
    updateData: Partial<AssetMaintenance>,
  ): Promise<AssetMaintenance> {
    this.logger.log(`Updating maintenance record: ${maintenanceId}`);

    const maintenance = await this.getMaintenanceById(maintenanceId);

    // Handle status changes
    if (updateData.status && updateData.status !== maintenance.status) {
      await this.handleStatusChange(maintenance, updateData.status);
    }

    Object.assign(maintenance, updateData);
    maintenance.updatedAt = new Date();

    const updatedMaintenance = await this.maintenanceRepository.save(maintenance);

    this.logger.log(`Maintenance record updated successfully: ${maintenanceId}`);
    return updatedMaintenance;
  }

  async deleteMaintenanceRecord(maintenanceId: string): Promise<void> {
    this.logger.log(`Deleting maintenance record: ${maintenanceId}`);

    const maintenance = await this.getMaintenanceById(maintenanceId);

    // Don't allow deletion of completed maintenance records
    if (maintenance.status === MaintenanceStatus.COMPLETED) {
      throw new Error('Cannot delete completed maintenance records');
    }

    await this.maintenanceRepository.remove(maintenance);
    this.logger.log(`Maintenance record deleted successfully: ${maintenanceId}`);
  }

  async scheduleMaintenance(
    assetId: string,
    scheduleData: {
      maintenanceType: MaintenanceType;
      title: string;
      description?: string;
      scheduledDate: Date;
      estimatedCost?: number;
      priority?: MaintenancePriority;
      checklist?: string[];
    },
  ): Promise<AssetMaintenance> {
    this.logger.log(`Scheduling maintenance for asset: ${assetId}`);

    const asset = await this.assetRepository.findOne({ where: { id: assetId } });
    if (!asset) {
      throw new Error('Asset not found');
    }

    const maintenanceData = {
      schoolId: asset.schoolId,
      assetId: asset.id,
      maintenanceType: scheduleData.maintenanceType,
      maintenanceTitle: scheduleData.title,
      maintenanceDescription: scheduleData.description,
      scheduledDate: scheduleData.scheduledDate,
      estimatedCost: scheduleData.estimatedCost,
      priority: scheduleData.priority || MaintenancePriority.MEDIUM,
      checklist: scheduleData.checklist?.map(item => ({
        item,
        completed: false,
        completedAt: undefined,
        completedBy: undefined,
      })),
      createdBy: 'system',
    };

    return this.createMaintenanceRecord(maintenanceData);
  }

  async startMaintenance(maintenanceId: string, startedBy: string): Promise<AssetMaintenance> {
    this.logger.log(`Starting maintenance: ${maintenanceId}`);

    const maintenance = await this.getMaintenanceById(maintenanceId);

    if (maintenance.status !== MaintenanceStatus.SCHEDULED) {
      throw new Error('Maintenance must be in scheduled status to start');
    }

    return this.updateMaintenanceRecord(maintenanceId, {
      status: MaintenanceStatus.IN_PROGRESS,
      actualStartDate: new Date(),
    });
  }

  async completeMaintenance(
    maintenanceId: string,
    completionData: {
      workPerformed: string;
      findings?: string;
      recommendations?: string;
      actualCost?: number;
      partsUsed?: Array<{
        partName: string;
        partNumber: string;
        quantity: number;
        cost: number;
        supplier?: string;
      }>;
      checklist?: Array<{
        item: string;
        completed: boolean;
        notes?: string;
      }>;
      nextDueDate?: Date;
    },
  ): Promise<AssetMaintenance> {
    this.logger.log(`Completing maintenance: ${maintenanceId}`);

    const maintenance = await this.getMaintenanceById(maintenanceId);

    if (maintenance.status !== MaintenanceStatus.IN_PROGRESS) {
      throw new Error('Maintenance must be in progress to complete');
    }

    // Update asset status back to active
    await this.assetRepository.update(maintenance.assetId, {
      status: 'active' as any,
      updatedAt: new Date(),
    });

    return this.updateMaintenanceRecord(maintenanceId, {
      status: MaintenanceStatus.COMPLETED,
      actualCompletionDate: new Date(),
      workPerformed: completionData.workPerformed,
      findings: completionData.findings,
      recommendations: completionData.recommendations,
      actualCost: completionData.actualCost,
      partsUsed: completionData.partsUsed,
      checklist: completionData.checklist,
      nextDueDate: completionData.nextDueDate,
    });
  }

  async getOverdueMaintenance(schoolId: string): Promise<AssetMaintenance[]> {
    this.logger.log(`Getting overdue maintenance for school: ${schoolId}`);

    const currentDate = new Date();

    return this.maintenanceRepository.find({
      where: {
        schoolId,
        status: MaintenanceStatus.SCHEDULED,
        scheduledDate: LessThanOrEqual(currentDate),
      },
      relations: ['asset'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async getUpcomingMaintenance(schoolId: string, daysAhead: number = 30): Promise<AssetMaintenance[]> {
    this.logger.log(`Getting upcoming maintenance for school: ${schoolId}`);

    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setDate(currentDate.getDate() + daysAhead);

    return this.maintenanceRepository.find({
      where: {
        schoolId,
        status: MaintenanceStatus.SCHEDULED,
        scheduledDate: Between(currentDate, futureDate),
      },
      relations: ['asset'],
      order: { scheduledDate: 'ASC' },
    });
  }

  async getMaintenanceAnalytics(schoolId: string): Promise<MaintenanceAnalytics> {
    this.logger.log(`Getting maintenance analytics for school: ${schoolId}`);

    const maintenanceRecords = await this.getMaintenanceRecords(schoolId);

    const analytics: MaintenanceAnalytics = {
      totalMaintenanceRecords: maintenanceRecords.length,
      pendingMaintenance: maintenanceRecords.filter(m => m.status === MaintenanceStatus.SCHEDULED).length,
      completedMaintenance: maintenanceRecords.filter(m => m.status === MaintenanceStatus.COMPLETED).length,
      overdueMaintenance: 0,
      maintenanceByType: {},
      maintenanceByStatus: {},
      averageCompletionTime: 0,
      totalMaintenanceCost: 0,
    };

    const currentDate = new Date();
    let totalCompletionTime = 0;
    let completedCount = 0;

    maintenanceRecords.forEach(record => {
      // Count overdue
      if (record.status === MaintenanceStatus.SCHEDULED && record.scheduledDate < currentDate) {
        analytics.overdueMaintenance++;
      }

      // Count by type
      analytics.maintenanceByType[record.maintenanceType] = (analytics.maintenanceByType[record.maintenanceType] || 0) + 1;

      // Count by status
      analytics.maintenanceByStatus[record.status] = (analytics.maintenanceByStatus[record.status] || 0) + 1;

      // Calculate completion time
      if (record.actualStartDate && record.actualCompletionDate) {
        const completionTime = record.actualCompletionDate.getTime() - record.actualStartDate.getTime();
        totalCompletionTime += completionTime;
        completedCount++;
      }

      // Sum costs
      if (record.actualCost) {
        analytics.totalMaintenanceCost += record.actualCost;
      }
    });

    // Calculate average completion time in hours
    if (completedCount > 0) {
      analytics.averageCompletionTime = (totalCompletionTime / completedCount) / (1000 * 60 * 60);
    }

    return analytics;
  }

  private async handleStatusChange(
    maintenance: AssetMaintenance,
    newStatus: MaintenanceStatus,
  ): Promise<void> {
    const asset = await this.assetRepository.findOne({ where: { id: maintenance.assetId } });

    if (newStatus === MaintenanceStatus.IN_PROGRESS) {
      // Set asset to maintenance status
      await this.assetRepository.update(asset.id, {
        status: 'maintenance' as any,
        updatedAt: new Date(),
      });
    } else if (newStatus === MaintenanceStatus.COMPLETED) {
      // Set asset back to active status
      await this.assetRepository.update(asset.id, {
        status: 'active' as any,
        updatedAt: new Date(),
      });
    }
  }

  private async generateMaintenanceCode(schoolId: string): Promise<string> {
    const count = await this.maintenanceRepository.count({ where: { schoolId } });
    const nextNumber = (count + 1).toString().padStart(4, '0');
    return `MTN-${schoolId.slice(-4).toUpperCase()}-${nextNumber}`;
  }
}