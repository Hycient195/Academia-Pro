// Academia Pro - Hostel Service
// Service for managing hostels, rooms, and student allocations

import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Hostel, HostelStatus, HostelType, FacilityType } from '../entities/hostel.entity';
import { Room } from '../entities/room.entity';
import { HostelAllocation } from '../entities/hostel-allocation.entity';
import { RoomStatus, RoomType, AllocationStatus } from '../entities/hostel.entity';
import { CheckInStatus, CheckOutStatus } from '../entities/hostel-allocation.entity';
import { CreateHostelDto, UpdateHostelDto } from '../dtos';

@Injectable()
export class HostelService {
  private readonly logger = new Logger(HostelService.name);

  constructor(
    @InjectRepository(Hostel)
    private readonly hostelRepository: Repository<Hostel>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(HostelAllocation)
    private readonly allocationRepository: Repository<HostelAllocation>,
  ) {}

  /**
   * Create a new hostel
   */
  async createHostel(dto: CreateHostelDto, createdBy: string): Promise<Hostel> {
    // Check if hostel code already exists for this school
    const existingHostel = await this.hostelRepository.findOne({
      where: { schoolId: dto.schoolId, hostelCode: dto.hostelCode },
    });

    if (existingHostel) {
      throw new ConflictException('Hostel with this code already exists for this school');
    }

    // Create hostel
    const hostelData = {
      schoolId: dto.schoolId,
      hostelName: dto.hostelName,
      hostelCode: dto.hostelCode,
      hostelType: dto.hostelType as unknown as HostelType,
      address: dto.address,
      buildingNumber: dto.buildingNumber,
      floors: dto.floors,
      totalRooms: dto.totalRooms || 0,
      totalBeds: dto.totalBeds || 0,
      occupiedBeds: 0,
      availableBeds: dto.totalBeds || 0,
      wardenId: dto.wardenId,
      wardenName: dto.wardenName,
      wardenContact: dto.wardenContact,
      assistantWardenId: dto.assistantWardenId,
      assistantWardenName: dto.assistantWardenName,
      facilities: (dto.facilities || []) as unknown as typeof Hostel.prototype.facilities,
      rules: dto.rules,
      pricing: dto.pricing,
      contactInfo: dto.contactInfo,
      operatingHours: dto.operatingHours,
      description: dto.description,
      amenities: dto.amenities || [],
      internalNotes: dto.internalNotes,
      createdBy,
      updatedBy: createdBy,
    };

    const hostel = this.hostelRepository.create(hostelData);
    const savedHostel = await this.hostelRepository.save(hostel);

    this.logger.log(
      `Created hostel "${savedHostel.hostelName}" (${savedHostel.hostelCode})`
    );

    return savedHostel;
  }

  /**
   * Get hostel by ID
   */
  async getHostelById(hostelId: string): Promise<Hostel> {
    const hostel = await this.hostelRepository.findOne({
      where: { id: hostelId },
    });

    if (!hostel) {
      throw new NotFoundException(`Hostel with ID ${hostelId} not found`);
    }

    return hostel;
  }

  /**
   * Get hostel by code
   */
  async getHostelByCode(schoolId: string, hostelCode: string): Promise<Hostel> {
    const hostel = await this.hostelRepository.findOne({
      where: { schoolId, hostelCode },
    });

    if (!hostel) {
      throw new NotFoundException(`Hostel with code ${hostelCode} not found`);
    }

    return hostel;
  }

  /**
   * Get hostels by school
   */
  async getHostelsBySchool(
    schoolId: string,
    options?: {
      type?: HostelType;
      status?: HostelStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<Hostel[]> {
    const queryBuilder = this.hostelRepository
      .createQueryBuilder('hostel')
      .where('hostel.schoolId = :schoolId', { schoolId })
      .orderBy('hostel.hostelName', 'ASC');

    if (options?.type) {
      queryBuilder.andWhere('hostel.hostelType = :type', {
        type: options.type,
      });
    }

    if (options?.status) {
      queryBuilder.andWhere('hostel.status = :status', {
        status: options.status,
      });
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Update hostel
   */
  async updateHostel(hostelId: string, dto: UpdateHostelDto, updatedBy: string): Promise<Hostel> {
    const hostel = await this.getHostelById(hostelId);

    // Hostel code cannot be updated to prevent conflicts

    // Update fields
    Object.assign(hostel, dto);
    hostel.updatedBy = updatedBy;

    const updatedHostel = await this.hostelRepository.save(hostel);

    this.logger.log(`Updated hostel ${hostelId}`);
    return updatedHostel;
  }

  /**
   * Delete hostel
   */
  async deleteHostel(hostelId: string): Promise<void> {
    const hostel = await this.getHostelById(hostelId);

    // Check if hostel has active allocations
    const activeAllocations = await this.allocationRepository.count({
      where: { hostelId, status: AllocationStatus.ACTIVE },
    });

    if (activeAllocations > 0) {
      throw new BadRequestException('Cannot delete hostel with active student allocations');
    }

    await this.hostelRepository.remove(hostel);
    this.logger.log(`Deleted hostel ${hostelId}`);
  }

  /**
   * Get hostel statistics
   */
  async getHostelStatistics(schoolId: string): Promise<{
    totalHostels: number;
    activeHostels: number;
    totalCapacity: number;
    totalOccupied: number;
    totalAvailable: number;
    occupancyRate: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
  }> {
    const hostels = await this.hostelRepository.find({
      where: { schoolId },
    });

    const totalHostels = hostels.length;
    const activeHostels = hostels.filter(h => h.status === HostelStatus.ACTIVE).length;
    const totalCapacity = hostels.reduce((sum, h) => sum + h.totalBeds, 0);
    const totalOccupied = hostels.reduce((sum, h) => sum + h.occupiedBeds, 0);
    const totalAvailable = hostels.reduce((sum, h) => sum + h.availableBeds, 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100 * 100) / 100 : 0;

    // Group by type
    const byType = hostels.reduce((acc, hostel) => {
      acc[hostel.hostelType] = (acc[hostel.hostelType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by status
    const byStatus = hostels.reduce((acc, hostel) => {
      acc[hostel.status] = (acc[hostel.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalHostels,
      activeHostels,
      totalCapacity,
      totalOccupied,
      totalAvailable,
      occupancyRate,
      byType,
      byStatus,
    };
  }

  /**
   * Get available hostels for allocation
   */
  async getAvailableHostels(
    schoolId: string,
    options?: {
      type?: HostelType;
      minAvailableBeds?: number;
    },
  ): Promise<Hostel[]> {
    const queryBuilder = this.hostelRepository
      .createQueryBuilder('hostel')
      .where('hostel.schoolId = :schoolId', { schoolId })
      .andWhere('hostel.status = :status', { status: HostelStatus.ACTIVE })
      .andWhere('hostel.availableBeds > 0')
      .orderBy('hostel.availableBeds', 'DESC')
      .addOrderBy('hostel.hostelName', 'ASC');

    if (options?.type) {
      queryBuilder.andWhere('hostel.hostelType = :type', {
        type: options.type,
      });
    }

    if (options?.minAvailableBeds) {
      queryBuilder.andWhere('hostel.availableBeds >= :minBeds', {
        minBeds: options.minAvailableBeds,
      });
    }

    return queryBuilder.getMany();
  }

  /**
   * Update hostel occupancy
   */
  async updateHostelOccupancy(hostelId: string): Promise<Hostel> {
    const hostel = await this.getHostelById(hostelId);

    // Count active allocations
    const activeAllocations = await this.allocationRepository.count({
      where: { hostelId, status: AllocationStatus.ACTIVE },
    });

    hostel.occupiedBeds = activeAllocations;
    hostel.availableBeds = Math.max(0, hostel.totalBeds - activeAllocations);
    hostel.occupancyRate = hostel.occupancyPercentage;

    const updatedHostel = await this.hostelRepository.save(hostel);

    this.logger.log(`Updated occupancy for hostel ${hostelId}: ${activeAllocations} occupied, ${hostel.availableBeds} available`);
    return updatedHostel;
  }

  /**
   * Add facility to hostel
   */
  async addFacilityToHostel(
    hostelId: string,
    facility: typeof Hostel.prototype.facilities[0],
    updatedBy: string,
  ): Promise<Hostel> {
    const hostel = await this.getHostelById(hostelId);

    hostel.addFacility(facility);
    hostel.updatedBy = updatedBy;

    const updatedHostel = await this.hostelRepository.save(hostel);

    this.logger.log(`Added facility ${facility.type} to hostel ${hostelId}`);
    return updatedHostel;
  }

  /**
   * Remove facility from hostel
   */
  async removeFacilityFromHostel(
    hostelId: string,
    facilityType: FacilityType,
    updatedBy: string,
  ): Promise<Hostel> {
    const hostel = await this.getHostelById(hostelId);

    hostel.removeFacility(facilityType);
    hostel.updatedBy = updatedBy;

    const updatedHostel = await this.hostelRepository.save(hostel);

    this.logger.log(`Removed facility ${facilityType} from hostel ${hostelId}`);
    return updatedHostel;
  }

  /**
   * Update hostel status
   */
  async updateHostelStatus(
    hostelId: string,
    status: HostelStatus,
    updatedBy: string,
  ): Promise<Hostel> {
    const hostel = await this.getHostelById(hostelId);

    switch (status) {
      case HostelStatus.UNDER_MAINTENANCE:
        hostel.markAsUnderMaintenance();
        break;
      case HostelStatus.ACTIVE:
        hostel.markAsActive();
        break;
      case HostelStatus.CLOSED:
        hostel.markAsClosed();
        break;
      default:
        hostel.status = status;
    }

    hostel.updatedBy = updatedBy;

    const updatedHostel = await this.hostelRepository.save(hostel);

    this.logger.log(`Updated status of hostel ${hostelId} to ${status}`);
    return updatedHostel;
  }

  /**
   * Get hostel dashboard data
   */
  async getHostelDashboard(schoolId: string): Promise<{
    summary: any;
    alerts: any;
    recentActivity: any;
    occupancyTrends: any;
  }> {
    const statistics = await this.getHostelStatistics(schoolId);
    const availableHostels = await this.getAvailableHostels(schoolId);

    // Get hostels with low occupancy (< 30%)
    const lowOccupancyHostels = availableHostels.filter(h =>
      h.occupancyRate < 30 && h.totalBeds > 0
    );

    // Get hostels with high occupancy (> 90%)
    const highOccupancyHostels = availableHostels.filter(h =>
      h.occupancyRate > 90
    );

    return {
      summary: statistics,
      alerts: {
        lowOccupancy: lowOccupancyHostels.length,
        highOccupancy: highOccupancyHostels.length,
        maintenanceRequired: 0, // Would need maintenance tracking
        upcomingCheckouts: 0, // Would need checkout tracking
      },
      recentActivity: {
        newAllocations: 0, // Would need activity tracking
        checkIns: 0,
        checkOuts: 0,
      },
      occupancyTrends: {
        currentRate: statistics.occupancyRate,
        availableBeds: statistics.totalAvailable,
        trend: 'stable', // Would need historical data
      },
    };
  }

  /**
   * Bulk update hostel facilities
   */
  async bulkUpdateFacilities(
    schoolId: string,
    updates: Array<{
      hostelId: string;
      facilities: typeof Hostel.prototype.facilities;
    }>,
    updatedBy: string,
  ): Promise<Hostel[]> {
    const updatedHostels: Hostel[] = [];

    for (const update of updates) {
      try {
        const hostel = await this.getHostelById(update.hostelId);

        if (hostel.schoolId !== schoolId) {
          throw new BadRequestException(`Hostel ${update.hostelId} does not belong to this school`);
        }

        hostel.facilities = update.facilities;
        hostel.updatedBy = updatedBy;

        const savedHostel = await this.hostelRepository.save(hostel);
        updatedHostels.push(savedHostel);
      } catch (error) {
        this.logger.error(`Failed to update facilities for hostel ${update.hostelId}:`, error.message);
      }
    }

    this.logger.log(`Bulk updated facilities for ${updatedHostels.length} hostels`);
    return updatedHostels;
  }

  /**
   * Get hostels by type
   */
  async getHostelsByType(
    schoolId: string,
    type: HostelType,
    options?: {
      status?: HostelStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<Hostel[]> {
    const queryBuilder = this.hostelRepository
      .createQueryBuilder('hostel')
      .where('hostel.schoolId = :schoolId', { schoolId })
      .andWhere('hostel.hostelType = :type', { type })
      .orderBy('hostel.hostelName', 'ASC');

    if (options?.status) {
      queryBuilder.andWhere('hostel.status = :status', {
        status: options.status,
      });
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Search hostels
   */
  async searchHostels(
    schoolId: string,
    query: string,
    options?: {
      type?: HostelType;
      status?: HostelStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<Hostel[]> {
    const queryBuilder = this.hostelRepository
      .createQueryBuilder('hostel')
      .where('hostel.schoolId = :schoolId', { schoolId })
      .andWhere(
        '(hostel.hostelName ILIKE :query OR hostel.hostelCode ILIKE :query OR ' +
        'hostel.description ILIKE :query OR hostel.wardenName ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('hostel.hostelName', 'ASC');

    if (options?.type) {
      queryBuilder.andWhere('hostel.hostelType = :type', {
        type: options.type,
      });
    }

    if (options?.status) {
      queryBuilder.andWhere('hostel.status = :status', {
        status: options.status,
      });
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Get hostel utilization report
   */
  async getHostelUtilizationReport(
    schoolId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    hostels: Array<{
      id: string;
      name: string;
      type: HostelType;
      capacity: number;
      occupied: number;
      available: number;
      occupancyRate: number;
      revenue: number;
    }>;
    summary: {
      totalCapacity: number;
      totalOccupied: number;
      totalAvailable: number;
      overallOccupancyRate: number;
      totalRevenue: number;
    };
    period: {
      startDate: string;
      endDate: string;
    };
  }> {
    const hostels = await this.getHostelsBySchool(schoolId, {
      status: HostelStatus.ACTIVE,
    });

    const hostelData = hostels.map(hostel => ({
      id: hostel.id,
      name: hostel.hostelName,
      type: hostel.hostelType,
      capacity: hostel.totalBeds,
      occupied: hostel.occupiedBeds,
      available: hostel.availableBeds,
      occupancyRate: hostel.occupancyRate,
      revenue: (hostel.pricing?.baseRent || 0) * hostel.occupiedBeds,
    }));

    const summary = {
      totalCapacity: hostelData.reduce((sum, h) => sum + h.capacity, 0),
      totalOccupied: hostelData.reduce((sum, h) => sum + h.occupied, 0),
      totalAvailable: hostelData.reduce((sum, h) => sum + h.available, 0),
      overallOccupancyRate: hostelData.length > 0
        ? Math.round(hostelData.reduce((sum, h) => sum + h.occupancyRate, 0) / hostelData.length * 100) / 100
        : 0,
      totalRevenue: hostelData.reduce((sum, h) => sum + h.revenue, 0),
    };

    return {
      hostels: hostelData,
      summary,
      period: {
        startDate: startDate?.toISOString() || 'All time',
        endDate: endDate?.toISOString() || 'Present',
      },
    };
  }
}