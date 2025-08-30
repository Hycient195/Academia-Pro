// Academia Pro - Staff Service
// Business logic for staff and HR management

import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Staff } from './staff.entity';
import {
  CreateStaffDto,
  UpdateStaffDto,
  StaffResponseDto,
  StaffListResponseDto,
  StaffStatisticsResponseDto,
} from './dtos/index';
import {
  TEmploymentStatus,
  IStaffFilters,
  ILeaveFilters,
  IPerformanceReviewFilters,
  IHRStatistics,
} from '../../../common/src/types/staff/staff.types';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    private dataSource: DataSource,
  ) {}

  /**
   * Create a new staff member
   */
  async create(createStaffDto: CreateStaffDto): Promise<StaffResponseDto> {
    const { employeeId, email, schoolId, ...staffData } = createStaffDto;

    // Check if employee ID already exists
    const existingStaff = await this.staffRepository.findOne({
      where: { employeeId },
    });

    if (existingStaff) {
      throw new ConflictException('Staff member with this employee ID already exists');
    }

    // Check if email is unique within the school
    if (email) {
      const existingEmail = await this.staffRepository.findOne({
        where: { email, schoolId },
      });
      if (existingEmail) {
        throw new ConflictException('Staff member with this email already exists in this school');
      }
    }

    // Create staff entity
    const staff = this.staffRepository.create({
      ...staffData,
      employeeId,
      email,
      schoolId,
      employmentStatus: TEmploymentStatus.ACTIVE,
    } as any);

    const savedStaff = await this.staffRepository.save(staff);
    return StaffResponseDto.fromEntity(Array.isArray(savedStaff) ? savedStaff[0] : savedStaff);
  }

  /**
   * Get all staff members with filtering and pagination
   */
  async findAll(options?: {
    page?: number;
    limit?: number;
    filters?: IStaffFilters;
  }): Promise<StaffListResponseDto> {
    const { page = 1, limit = 10, filters } = options || {};

    const queryBuilder = this.staffRepository.createQueryBuilder('staff')
      .leftJoinAndSelect('staff.manager', 'manager');

    // Apply filters
    if (filters?.schoolId) {
      queryBuilder.andWhere('staff.schoolId = :schoolId', { schoolId: filters.schoolId });
    }

    if (filters?.department) {
      queryBuilder.andWhere('staff.department = :department', { department: filters.department });
    }

    if (filters?.position) {
      queryBuilder.andWhere('staff.position = :position', { position: filters.position });
    }

    if (filters?.employmentType) {
      queryBuilder.andWhere('staff.employmentType = :employmentType', { employmentType: filters.employmentType });
    }

    if (filters?.employmentStatus) {
      queryBuilder.andWhere('staff.employmentStatus = :employmentStatus', { employmentStatus: filters.employmentStatus });
    }

    if (filters?.managerId) {
      queryBuilder.andWhere('staff.managerId = :managerId', { managerId: filters.managerId });
    }

    if (filters?.hireDateFrom) {
      queryBuilder.andWhere('staff.hireDate >= :hireDateFrom', { hireDateFrom: filters.hireDateFrom });
    }

    if (filters?.hireDateTo) {
      queryBuilder.andWhere('staff.hireDate <= :hireDateTo', { hireDateTo: filters.hireDateTo });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(staff.firstName ILIKE :search OR staff.lastName ILIKE :search OR staff.employeeId ILIKE :search OR staff.email ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Apply pagination
    queryBuilder
      .orderBy('staff.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [staff, total] = await queryBuilder.getManyAndCount();

    const staffResponseDtos = staff.map(staffMember => StaffResponseDto.fromEntity(staffMember));

    return new StaffListResponseDto({
      staff: staffResponseDtos,
      total,
      page,
      limit,
    });
  }

  /**
   * Get staff member by ID
   */
  async findOne(id: string): Promise<StaffResponseDto> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['manager', 'subordinates'],
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    return StaffResponseDto.fromEntity(staff);
  }

  /**
   * Update staff member
   */
  async update(id: string, updateStaffDto: UpdateStaffDto): Promise<StaffResponseDto> {
    const staff = await this.staffRepository.findOne({
      where: { id },
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Check for unique constraints if updating email
    // Note: employeeId should not be updatable as it's typically auto-generated

    if (updateStaffDto.email && updateStaffDto.email !== staff.email) {
      const existingEmail = await this.staffRepository.findOne({
        where: { email: updateStaffDto.email, schoolId: staff.schoolId },
      });
      if (existingEmail) {
        throw new ConflictException('Staff member with this email already exists in this school');
      }
    }

    Object.assign(staff, updateStaffDto);
    const updatedStaff = await this.staffRepository.save(staff);
    return StaffResponseDto.fromEntity(updatedStaff);
  }

  /**
   * Delete staff member
   */
  async remove(id: string): Promise<void> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['subordinates'],
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    // Check if staff has subordinates
    if (staff.subordinates && staff.subordinates.length > 0) {
      throw new BadRequestException('Cannot delete staff member who has subordinates. Please reassign subordinates first.');
    }

    await this.staffRepository.remove(staff);
  }

  /**
   * Get staff statistics
   */
  async getStatistics(schoolId: string): Promise<StaffStatisticsResponseDto> {
    const [
      totalStaff,
      activeStaff,
      staffByDepartment,
      staffByPosition,
      staffByEmploymentType,
      staffByEmploymentStatus,
      averageSalaryByDepartment,
    ] = await Promise.all([
      // Total staff count
      this.staffRepository.count({ where: { schoolId } }),

      // Active staff count
      this.staffRepository.count({ where: { schoolId, employmentStatus: TEmploymentStatus.ACTIVE } }),

      // Staff by department
      this.staffRepository
        .createQueryBuilder('staff')
        .select('staff.department', 'department')
        .addSelect('COUNT(*)', 'count')
        .where('staff.schoolId = :schoolId', { schoolId })
        .groupBy('staff.department')
        .getRawMany(),

      // Staff by position
      this.staffRepository
        .createQueryBuilder('staff')
        .select('staff.position', 'position')
        .addSelect('COUNT(*)', 'count')
        .where('staff.schoolId = :schoolId', { schoolId })
        .groupBy('staff.position')
        .getRawMany(),

      // Staff by employment type
      this.staffRepository
        .createQueryBuilder('staff')
        .select('staff.employmentType', 'employmentType')
        .addSelect('COUNT(*)', 'count')
        .where('staff.schoolId = :schoolId', { schoolId })
        .groupBy('staff.employmentType')
        .getRawMany(),

      // Staff by employment status
      this.staffRepository
        .createQueryBuilder('staff')
        .select('staff.employmentStatus', 'employmentStatus')
        .addSelect('COUNT(*)', 'count')
        .where('staff.schoolId = :schoolId', { schoolId })
        .groupBy('staff.employmentStatus')
        .getRawMany(),

      // Average salary by department
      this.staffRepository
        .createQueryBuilder('staff')
        .select('staff.department', 'department')
        .addSelect('AVG(CAST(staff.salary->>\'netSalary\' AS DECIMAL))', 'averageSalary')
        .where('staff.schoolId = :schoolId', { schoolId })
        .groupBy('staff.department')
        .getRawMany(),
    ]);

    // Helper function to convert array to record
    const convertToRecord = (data: any[], keyField: string, valueField: string = 'count'): Record<string, number> => {
      const result: Record<string, number> = {};
      data.forEach(item => {
        const value = item[valueField];
        result[item[keyField]] = valueField === 'count' ? parseInt(value) || 0 : parseFloat(value) || 0;
      });
      return result;
    };

    // Calculate leave utilization (simplified)
    const leaveUtilization = {
      annual: 0, // Would be calculated from leave records
      sick: 0,
      maternity: 0,
    };

    return new StaffStatisticsResponseDto({
      totalStaff,
      activeStaff,
      staffByDepartment: convertToRecord(staffByDepartment, 'department'),
      staffByPosition: convertToRecord(staffByPosition, 'position'),
      staffByEmploymentType: convertToRecord(staffByEmploymentType, 'employmentType'),
      staffByEmploymentStatus: convertToRecord(staffByEmploymentStatus, 'employmentStatus'),
      averageSalaryByDepartment: convertToRecord(averageSalaryByDepartment, 'department'),
      leaveUtilization,
    });
  }

  /**
   * Get HR statistics
   */
  async getHRStatistics(schoolId: string): Promise<IHRStatistics> {
    const [
      totalStaff,
      totalDepartments,
      totalPositions,
      averageSalary,
      totalLeavesThisMonth,
    ] = await Promise.all([
      this.staffRepository.count({ where: { schoolId } }),
      this.staffRepository
        .createQueryBuilder('staff')
        .select('COUNT(DISTINCT staff.department)', 'count')
        .where('staff.schoolId = :schoolId', { schoolId })
        .getRawOne(),
      this.staffRepository
        .createQueryBuilder('staff')
        .select('COUNT(DISTINCT staff.position)', 'count')
        .where('staff.schoolId = :schoolId', { schoolId })
        .getRawOne(),
      this.staffRepository
        .createQueryBuilder('staff')
        .select('AVG(CAST(staff.salary->>\'netSalary\' AS DECIMAL))', 'average')
        .where('staff.schoolId = :schoolId', { schoolId })
        .getRawOne(),
      // This would be calculated from leave records in a real implementation
      Promise.resolve({ count: 0 }),
    ]);

    // Calculate department statistics
    const departmentStats = await this.staffRepository
      .createQueryBuilder('staff')
      .select('staff.department', 'department')
      .addSelect('COUNT(*)', 'staffCount')
      .addSelect('AVG(CAST(staff.salary->>\'netSalary\' AS DECIMAL))', 'averageSalary')
      .addSelect('AVG(CAST(staff.performance->-1->>\'rating\' AS DECIMAL))', 'averageRating')
      .where('staff.schoolId = :schoolId', { schoolId })
      .groupBy('staff.department')
      .getRawMany();

    const departmentStatsRecord: Record<string, { staffCount: number; averageSalary: number; averageRating: number }> = {};
    departmentStats.forEach(stat => {
      departmentStatsRecord[stat.department] = {
        staffCount: parseInt(stat.staffCount),
        averageSalary: parseFloat(stat.averageSalary) || 0,
        averageRating: parseFloat(stat.averageRating) || 0,
      };
    });

    return {
      totalStaff,
      totalDepartments: parseInt(totalDepartments?.count || '0'),
      totalPositions: parseInt(totalPositions?.count || '0'),
      averageSalary: parseFloat(averageSalary?.average || '0'),
      totalLeavesThisMonth: totalLeavesThisMonth.count,
      totalPendingLeaves: 0, // Would be calculated from leave records
      staffTurnoverRate: 0, // Would require historical data
      averagePerformanceRating: 0, // Would be calculated from performance records
      departmentStats: departmentStatsRecord,
    };
  }
}