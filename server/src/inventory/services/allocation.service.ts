// Academia Pro - Asset Allocation Service
// Service for managing asset allocations, assignments, and tracking

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Asset, AssetStatus } from '../entities/asset.entity';
import { AssetMovement, MovementType, MovementStatus } from '../entities/asset-movement.entity';

export interface AllocationRequest {
  assetId: string;
  requestedBy: string;
  requestedFor?: string;
  department?: string;
  locationId?: string;
  purpose: string;
  expectedReturnDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  specialRequirements?: string;
}

export interface AllocationAnalytics {
  totalAllocations: number;
  activeAllocations: number;
  overdueReturns: number;
  allocationByDepartment: { [key: string]: number };
  allocationByLocation: { [key: string]: number };
  averageAllocationDuration: number;
  utilizationRate: number;
}

@Injectable()
export class AllocationService {
  private readonly logger = new Logger(AllocationService.name);

  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
    @InjectRepository(AssetMovement)
    private movementRepository: Repository<AssetMovement>,
    private dataSource: DataSource,
  ) {}

  async requestAllocation(request: AllocationRequest): Promise<AssetMovement> {
    this.logger.log(`Creating allocation request for asset: ${request.assetId}`);

    const asset = await this.assetRepository.findOne({ where: { id: request.assetId } });
    if (!asset) {
      throw new Error('Asset not found');
    }

    if (asset.status !== AssetStatus.ACTIVE) {
      throw new Error('Asset is not available for allocation');
    }

    // Check if asset is already allocated
    const activeAllocation = await this.movementRepository.findOne({
      where: {
        assetId: request.assetId,
        movementType: 'assignment' as any,
        status: MovementStatus.COMPLETED,
      },
      order: { createdAt: 'DESC' },
    });

    if (activeAllocation && !activeAllocation.actualReturnDate) {
      throw new Error('Asset is currently allocated and not yet returned');
    }

    const movementCode = await this.generateMovementCode(asset.schoolId);

    const allocationRequest = this.movementRepository.create({
      schoolId: asset.schoolId,
      assetId: asset.id,
      movementCode,
      movementType: 'assignment' as any,
      movementTitle: `Asset Allocation Request: ${asset.name}`,
      movementDescription: `Allocation requested for: ${request.purpose}`,
      status: MovementStatus.PENDING,
      fromLocationId: asset.locationId,
      toLocationId: request.locationId,
      fromUserId: asset.assignedToUserId,
      toUserId: request.requestedFor,
      fromDepartment: asset.assignedToDepartment,
      toDepartment: request.department,
      movementDate: new Date(),
      expectedReturnDate: request.expectedReturnDate,
      requestedBy: request.requestedBy,
      createdBy: request.requestedBy,
      notes: request.specialRequirements,
    });

    const savedRequest = await this.movementRepository.save(allocationRequest);

    this.logger.log(`Allocation request created: ${savedRequest.id}`);
    return savedRequest;
  }

  async approveAllocation(requestId: string, approvedBy: string): Promise<AssetMovement> {
    this.logger.log(`Approving allocation request: ${requestId}`);

    const request = await this.movementRepository.findOne({ where: { id: requestId } });
    if (!request) {
      throw new Error('Allocation request not found');
    }

    if (request.status !== MovementStatus.PENDING) {
      throw new Error('Request is not in pending status');
    }

    // Update the request
    request.status = MovementStatus.APPROVED;
    request.approvedBy = approvedBy;
    request.approvedAt = new Date();
    request.updatedAt = new Date();

    const approvedRequest = await this.movementRepository.save(request);

    this.logger.log(`Allocation request approved: ${requestId}`);
    return approvedRequest;
  }

  async allocateAsset(requestId: string, carriedBy?: string): Promise<AssetMovement> {
    this.logger.log(`Allocating asset for request: ${requestId}`);

    const request = await this.movementRepository.findOne({ where: { id: requestId } });
    if (!request) {
      throw new Error('Allocation request not found');
    }

    if (request.status !== MovementStatus.APPROVED) {
      throw new Error('Request must be approved before allocation');
    }

    // Update asset
    const asset = await this.assetRepository.findOne({ where: { id: request.assetId } });
    asset.assignedToUserId = request.toUserId;
    asset.assignedToDepartment = request.toDepartment;
    asset.locationId = request.toLocationId;
    asset.updatedAt = new Date();

    await this.assetRepository.save(asset);

    // Update movement
    request.status = MovementStatus.COMPLETED;
    request.carriedBy = carriedBy;
    request.receivedBy = request.toUserId;
    request.movementDate = new Date();
    request.updatedAt = new Date();

    const completedAllocation = await this.movementRepository.save(request);

    this.logger.log(`Asset allocated successfully: ${request.assetId}`);
    return completedAllocation;
  }

  async returnAsset(assetId: string, returnedBy: string, condition?: string, notes?: string): Promise<AssetMovement> {
    this.logger.log(`Processing asset return: ${assetId}`);

    // Find the active allocation
    const activeAllocation = await this.movementRepository.findOne({
      where: {
        assetId,
        movementType: 'assignment' as any,
        status: MovementStatus.COMPLETED,
      },
      order: { createdAt: 'DESC' },
    });

    if (!activeAllocation) {
      throw new Error('No active allocation found for this asset');
    }

    if (activeAllocation.actualReturnDate) {
      throw new Error('Asset has already been returned');
    }

    // Create return movement
    const returnMovement = this.movementRepository.create({
      schoolId: activeAllocation.schoolId,
      assetId: assetId,
      movementCode: await this.generateMovementCode(activeAllocation.schoolId),
      movementType: 'return' as any,
      movementTitle: `Asset Return: ${assetId}`,
      movementDescription: `Asset returned by ${returnedBy}`,
      status: MovementStatus.COMPLETED,
      fromLocationId: activeAllocation.toLocationId,
      toLocationId: activeAllocation.fromLocationId,
      fromUserId: activeAllocation.toUserId,
      toUserId: activeAllocation.fromUserId,
      fromDepartment: activeAllocation.toDepartment,
      toDepartment: activeAllocation.fromDepartment,
      movementDate: new Date(),
      actualReturnDate: new Date(),
      requestedBy: returnedBy,
      createdBy: returnedBy,
      conditionAfter: condition,
      notes: notes,
    });

    const savedReturn = await this.movementRepository.save(returnMovement);

    // Update asset back to original state
    const asset = await this.assetRepository.findOne({ where: { id: assetId } });
    asset.assignedToUserId = activeAllocation.fromUserId;
    asset.assignedToDepartment = activeAllocation.fromDepartment;
    asset.locationId = activeAllocation.fromLocationId;
    asset.updatedAt = new Date();

    await this.assetRepository.save(asset);

    // Mark original allocation as returned
    activeAllocation.actualReturnDate = new Date();
    activeAllocation.updatedAt = new Date();
    await this.movementRepository.save(activeAllocation);

    this.logger.log(`Asset returned successfully: ${assetId}`);
    return savedReturn;
  }

  async getAllocationRequests(schoolId: string, status?: MovementStatus): Promise<AssetMovement[]> {
    this.logger.log(`Getting allocation requests for school: ${schoolId}`);

    const queryBuilder = this.movementRepository.createQueryBuilder('movement')
      .leftJoinAndSelect('movement.asset', 'asset')
      .where('movement.schoolId = :schoolId', { schoolId })
      .andWhere('movement.movementType = :movementType', { movementType: 'assignment' });

    if (status) {
      queryBuilder.andWhere('movement.status = :status', { status });
    }

    return queryBuilder.orderBy('movement.createdAt', 'DESC').getMany();
  }

  async getActiveAllocations(schoolId: string): Promise<AssetMovement[]> {
    this.logger.log(`Getting active allocations for school: ${schoolId}`);

    return this.movementRepository.find({
      where: {
        schoolId,
        movementType: 'assignment' as any,
        status: MovementStatus.COMPLETED,
        actualReturnDate: null,
      },
      relations: ['asset'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOverdueAllocations(schoolId: string): Promise<AssetMovement[]> {
    this.logger.log(`Getting overdue allocations for school: ${schoolId}`);

    const currentDate = new Date();

    return this.movementRepository.find({
      where: {
        schoolId,
        movementType: 'assignment' as any,
        status: MovementStatus.COMPLETED,
        actualReturnDate: null,
        expectedReturnDate: Between(new Date('2000-01-01'), currentDate),
      },
      relations: ['asset'],
      order: { expectedReturnDate: 'ASC' },
    });
  }

  async extendAllocation(requestId: string, newReturnDate: Date, reason: string): Promise<AssetMovement> {
    this.logger.log(`Extending allocation: ${requestId}`);

    const allocation = await this.movementRepository.findOne({ where: { id: requestId } });
    if (!allocation) {
      throw new Error('Allocation not found');
    }

    if (allocation.actualReturnDate) {
      throw new Error('Cannot extend a completed allocation');
    }

    allocation.expectedReturnDate = newReturnDate;
    allocation.notes = allocation.notes
      ? `${allocation.notes}\nExtension: ${reason} - New return date: ${newReturnDate.toISOString()}`
      : `Extension: ${reason} - New return date: ${newReturnDate.toISOString()}`;
    allocation.updatedAt = new Date();

    const updatedAllocation = await this.movementRepository.save(allocation);

    this.logger.log(`Allocation extended successfully: ${requestId}`);
    return updatedAllocation;
  }

  async getAllocationHistory(assetId: string): Promise<AssetMovement[]> {
    this.logger.log(`Getting allocation history for asset: ${assetId}`);

    return this.movementRepository.find({
      where: {
        assetId,
        movementType: 'assignment' as any,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async getAllocationAnalytics(schoolId: string): Promise<AllocationAnalytics> {
    this.logger.log(`Getting allocation analytics for school: ${schoolId}`);

    const allocations = await this.getAllocationRequests(schoolId);
    const activeAllocations = await this.getActiveAllocations(schoolId);
    const overdueAllocations = await this.getOverdueAllocations(schoolId);

    const analytics: AllocationAnalytics = {
      totalAllocations: allocations.length,
      activeAllocations: activeAllocations.length,
      overdueReturns: overdueAllocations.length,
      allocationByDepartment: {},
      allocationByLocation: {},
      averageAllocationDuration: 0,
      utilizationRate: 0,
    };

    // Calculate department and location breakdowns
    activeAllocations.forEach(allocation => {
      if (allocation.toDepartment) {
        analytics.allocationByDepartment[allocation.toDepartment] =
          (analytics.allocationByDepartment[allocation.toDepartment] || 0) + 1;
      }
      if (allocation.toLocationId) {
        analytics.allocationByLocation[allocation.toLocationId] =
          (analytics.allocationByLocation[allocation.toLocationId] || 0) + 1;
      }
    });

    // Calculate average allocation duration
    let totalDuration = 0;
    let completedAllocations = 0;

    allocations.forEach(allocation => {
      if (allocation.actualReturnDate && allocation.movementDate) {
        const duration = allocation.actualReturnDate.getTime() - allocation.movementDate.getTime();
        totalDuration += duration;
        completedAllocations++;
      }
    });

    if (completedAllocations > 0) {
      analytics.averageAllocationDuration = totalDuration / completedAllocations / (1000 * 60 * 60 * 24); // Convert to days
    }

    // Calculate utilization rate (simplified - active allocations vs total assets)
    const totalAssets = await this.assetRepository.count({ where: { schoolId } });
    if (totalAssets > 0) {
      analytics.utilizationRate = (activeAllocations.length / totalAssets) * 100;
    }

    return analytics;
  }

  async cancelAllocation(requestId: string, cancelledBy: string, reason: string): Promise<AssetMovement> {
    this.logger.log(`Cancelling allocation: ${requestId}`);

    const allocation = await this.movementRepository.findOne({ where: { id: requestId } });
    if (!allocation) {
      throw new Error('Allocation not found');
    }

    if (allocation.status === MovementStatus.COMPLETED && allocation.actualReturnDate) {
      throw new Error('Cannot cancel a completed allocation');
    }

    allocation.status = MovementStatus.CANCELLED;
    allocation.rejectionReason = reason;
    allocation.rejectedBy = cancelledBy;
    allocation.rejectedAt = new Date();
    allocation.updatedAt = new Date();

    const cancelledAllocation = await this.movementRepository.save(allocation);

    this.logger.log(`Allocation cancelled successfully: ${requestId}`);
    return cancelledAllocation;
  }

  private async generateMovementCode(schoolId: string): Promise<string> {
    const count = await this.movementRepository.count({ where: { schoolId } });
    const nextNumber = (count + 1).toString().padStart(4, '0');
    return `MOV-${schoolId.slice(-4).toUpperCase()}-${nextNumber}`;
  }
}