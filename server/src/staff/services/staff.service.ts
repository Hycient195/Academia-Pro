// Academia Pro - Staff Service
// Service for managing staff members, payroll, and HR operations

import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, In, Like } from 'typeorm';
import { Staff, StaffType, StaffStatus, EmploymentType, Gender, MaritalStatus, BloodGroup, QualificationLevel } from '../entities/staff.entity';
import { CreateStaffDto, UpdateStaffDto } from '../dtos';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  /**
   * Create a new staff member
   */
  async createStaff(dto: CreateStaffDto, createdBy: string): Promise<Staff> {
    // Check if email already exists
    const existingStaff = await this.staffRepository.findOne({
      where: { email: dto.email },
    });

    if (existingStaff) {
      throw new ConflictException('Staff member with this email already exists');
    }

    // Generate employee ID if not provided
    let employeeId = dto.employeeId;
    if (!employeeId) {
      const year = new Date().getFullYear();
      const count = await this.staffRepository.count({
        where: { schoolId: dto.schoolId },
      });
      employeeId = `EMP${year}${(count + 1).toString().padStart(4, '0')}`;
    }

    // Calculate gross and net salary
    const houseAllowance = dto.houseAllowance || 0;
    const transportAllowance = dto.transportAllowance || 0;
    const medicalAllowance = dto.medicalAllowance || 0;
    const otherAllowances = dto.otherAllowances || 0;
    const taxDeductible = dto.taxDeductible || 0;
    const providentFund = dto.providentFund || 0;
    const otherDeductions = dto.otherDeductions || 0;

    const grossSalary = dto.basicSalary + houseAllowance + transportAllowance + medicalAllowance + otherAllowances;
    const netSalary = grossSalary - taxDeductible - providentFund - otherDeductions;

    // Create staff member
    const staff = this.staffRepository.create({
      schoolId: dto.schoolId,
      employeeId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      middleName: dto.middleName,
      gender: dto.gender,
      dateOfBirth: new Date(dto.dateOfBirth),
      maritalStatus: dto.maritalStatus,
      bloodGroup: dto.bloodGroup,
      email: dto.email,
      phone: dto.phone,
      alternatePhone: dto.alternatePhone,
      emergencyContactName: dto.emergencyContactName,
      emergencyContactPhone: dto.emergencyContactPhone,
      emergencyContactRelation: dto.emergencyContactRelation,
      currentAddress: dto.currentAddress,
      permanentAddress: dto.permanentAddress,
      staffType: dto.staffType,
      department: dto.department,
      designation: dto.designation,
      reportingTo: dto.reportingTo,
      employmentType: dto.employmentType || EmploymentType.FULL_TIME,
      joiningDate: new Date(dto.joiningDate),
      probationEndDate: dto.probationEndDate ? new Date(dto.probationEndDate) : undefined,
      contractEndDate: dto.contractEndDate ? new Date(dto.contractEndDate) : undefined,
      basicSalary: dto.basicSalary,
      salaryCurrency: dto.salaryCurrency || 'USD',
      houseAllowance,
      transportAllowance,
      medicalAllowance,
      otherAllowances,
      grossSalary,
      taxDeductible,
      providentFund,
      otherDeductions,
      netSalary,
      paymentMethod: dto.paymentMethod || 'bank_transfer',
      bankName: dto.bankName,
      bankAccountNumber: dto.bankAccountNumber,
      bankBranch: dto.bankBranch,
      ifscCode: dto.ifscCode,
      qualifications: dto.qualifications || [],
      certifications: dto.certifications || [],
      previousExperience: dto.previousExperience || [],
      medicalInfo: dto.medicalInfo,
      communicationPreferences: dto.communicationPreferences || {
        email: true,
        sms: true,
        push: false,
        newsletter: true,
        emergencyAlerts: true,
      },
      tags: dto.tags || [],
      internalNotes: dto.internalNotes,
      createdBy,
      updatedBy: createdBy,
    });

    const savedStaff = await this.staffRepository.save(staff);

    this.logger.log(
      `Created staff member ${savedStaff.fullName} (${savedStaff.employeeId})`
    );

    return savedStaff;
  }

  /**
   * Get staff member by ID
   */
  async getStaffById(staffId: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id: staffId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${staffId} not found`);
    }

    return staff;
  }

  /**
   * Get staff member by employee ID
   */
  async getStaffByEmployeeId(employeeId: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { employeeId },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with employee ID ${employeeId} not found`);
    }

    return staff;
  }

  /**
   * Get staff members by school
   */
  async getStaffBySchool(
    schoolId: string,
    options?: {
      staffType?: StaffType;
      department?: string;
      status?: StaffStatus;
      search?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<Staff[]> {
    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .where('staff.schoolId = :schoolId', { schoolId })
      .orderBy('staff.firstName', 'ASC')
      .addOrderBy('staff.lastName', 'ASC');

    if (options?.staffType) {
      queryBuilder.andWhere('staff.staffType = :staffType', {
        staffType: options.staffType,
      });
    }

    if (options?.department) {
      queryBuilder.andWhere('staff.department = :department', {
        department: options.department,
      });
    }

    if (options?.status) {
      queryBuilder.andWhere('staff.status = :status', {
        status: options.status,
      });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(staff.firstName ILIKE :search OR staff.lastName ILIKE :search OR staff.email ILIKE :search OR staff.employeeId ILIKE :search)',
        { search: `%${options.search}%` },
      );
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
   * Get staff members by department
   */
  async getStaffByDepartment(
    schoolId: string,
    department: string,
    options?: {
      status?: StaffStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<Staff[]> {
    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .where('staff.schoolId = :schoolId', { schoolId })
      .andWhere('staff.department = :department', { department })
      .orderBy('staff.firstName', 'ASC')
      .addOrderBy('staff.lastName', 'ASC');

    if (options?.status) {
      queryBuilder.andWhere('staff.status = :status', {
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
   * Update staff member
   */
  async updateStaff(staffId: string, dto: UpdateStaffDto, updatedBy: string): Promise<Staff> {
    const staff = await this.getStaffById(staffId);

    // Check email uniqueness if updating email
    if (dto.email && dto.email !== staff.email) {
      const existingStaff = await this.staffRepository.findOne({
        where: { email: dto.email },
      });

      if (existingStaff) {
        throw new ConflictException('Staff member with this email already exists');
      }
    }

    // Update salary components if provided
    if (dto.basicSalary !== undefined || dto.houseAllowance !== undefined ||
        dto.transportAllowance !== undefined || dto.medicalAllowance !== undefined ||
        dto.otherAllowances !== undefined || dto.taxDeductible !== undefined ||
        dto.providentFund !== undefined || dto.otherDeductions !== undefined) {

      const basicSalary = dto.basicSalary !== undefined ? dto.basicSalary : staff.basicSalary;
      const houseAllowance = dto.houseAllowance !== undefined ? dto.houseAllowance : staff.houseAllowance;
      const transportAllowance = dto.transportAllowance !== undefined ? dto.transportAllowance : staff.transportAllowance;
      const medicalAllowance = dto.medicalAllowance !== undefined ? dto.medicalAllowance : staff.medicalAllowance;
      const otherAllowances = dto.otherAllowances !== undefined ? dto.otherAllowances : staff.otherAllowances;
      const taxDeductible = dto.taxDeductible !== undefined ? dto.taxDeductible : staff.taxDeductible;
      const providentFund = dto.providentFund !== undefined ? dto.providentFund : staff.providentFund;
      const otherDeductions = dto.otherDeductions !== undefined ? dto.otherDeductions : staff.otherDeductions;

      staff.updateSalary({
        basicSalary,
        houseAllowance,
        transportAllowance,
        medicalAllowance,
        otherAllowances,
        taxDeductible,
        providentFund,
        otherDeductions,
      });
    }

    // Apply other updates
    Object.assign(staff, dto);
    staff.updatedBy = updatedBy;

    const updatedStaff = await this.staffRepository.save(staff);

    this.logger.log(`Updated staff member ${staffId}`);
    return updatedStaff;
  }

  /**
   * Delete staff member
   */
  async deleteStaff(staffId: string): Promise<void> {
    const staff = await this.getStaffById(staffId);

    // Prevent deletion of active staff
    if (staff.status === StaffStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete an active staff member');
    }

    await this.staffRepository.remove(staff);
    this.logger.log(`Deleted staff member ${staffId}`);
  }

  /**
   * Terminate staff member
   */
  async terminateStaff(staffId: string, reason: string, terminatedBy: string): Promise<Staff> {
    const staff = await this.getStaffById(staffId);

    staff.terminate(reason);
    staff.updatedBy = terminatedBy;

    const updatedStaff = await this.staffRepository.save(staff);

    this.logger.log(`Terminated staff member ${staffId}: ${reason}`);
    return updatedStaff;
  }

  /**
   * Suspend staff member
   */
  async suspendStaff(staffId: string, reason: string, suspendedBy: string): Promise<Staff> {
    const staff = await this.getStaffById(staffId);

    staff.suspend(reason);
    staff.updatedBy = suspendedBy;

    const updatedStaff = await this.staffRepository.save(staff);

    this.logger.log(`Suspended staff member ${staffId}: ${reason}`);
    return updatedStaff;
  }

  /**
   * Reactivate staff member
   */
  async reactivateStaff(staffId: string, reactivatedBy: string): Promise<Staff> {
    const staff = await this.getStaffById(staffId);

    staff.reactivate();
    staff.updatedBy = reactivatedBy;

    const updatedStaff = await this.staffRepository.save(staff);

    this.logger.log(`Reactivated staff member ${staffId}`);
    return updatedStaff;
  }

  /**
   * Update staff performance
   */
  async updatePerformance(
    staffId: string,
    rating: number,
    updatedBy: string,
    notes?: string,
  ): Promise<Staff> {
    const staff = await this.getStaffById(staffId);

    staff.updatePerformance(rating, notes);
    staff.updatedBy = updatedBy;

    const updatedStaff = await this.staffRepository.save(staff);

    this.logger.log(`Updated performance for staff member ${staffId}: ${rating}/5`);
    return updatedStaff;
  }

  /**
   * Process leave request
   */
  async processLeave(
    staffId: string,
    leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'casual',
    days: number,
    processedBy: string,
  ): Promise<{ success: boolean; staff: Staff; message: string }> {
    const staff = await this.getStaffById(staffId);

    const success = staff.deductLeave(leaveType, days);

    if (success) {
      staff.updatedBy = processedBy;
      await this.staffRepository.save(staff);

      this.logger.log(
        `Processed ${days} days of ${leaveType} leave for staff member ${staffId}`
      );

      return {
        success: true,
        staff,
        message: `${days} days of ${leaveType} leave approved`,
      };
    } else {
      return {
        success: false,
        staff,
        message: `Insufficient ${leaveType} leave balance`,
      };
    }
  }

  /**
   * Add leave balance
   */
  async addLeaveBalance(
    staffId: string,
    leaveType: 'annual' | 'sick' | 'maternity' | 'paternity' | 'casual',
    days: number,
    addedBy: string,
  ): Promise<Staff> {
    const staff = await this.getStaffById(staffId);

    staff.addLeave(leaveType, days);
    staff.updatedBy = addedBy;

    const updatedStaff = await this.staffRepository.save(staff);

    this.logger.log(
      `Added ${days} days to ${leaveType} leave balance for staff member ${staffId}`
    );

    return updatedStaff;
  }

  /**
   * Get staff statistics
   */
  async getStaffStatistics(schoolId: string): Promise<{
    totalStaff: number;
    activeStaff: number;
    inactiveStaff: number;
    terminatedStaff: number;
    byStaffType: Record<string, number>;
    byDepartment: Record<string, number>;
    byEmploymentType: Record<string, number>;
    averageSalary: number;
    averageExperience: number;
    leaveUtilization: {
      annual: { used: number; total: number };
      sick: { used: number; total: number };
      casual: { used: number; total: number };
    };
  }> {
    const allStaff = await this.staffRepository.find({
      where: { schoolId },
    });

    const totalStaff = allStaff.length;
    const activeStaff = allStaff.filter(s => s.status === StaffStatus.ACTIVE).length;
    const inactiveStaff = allStaff.filter(s => s.status === StaffStatus.INACTIVE).length;
    const terminatedStaff = allStaff.filter(s => s.status === StaffStatus.TERMINATED).length;

    // Group by staff type
    const byStaffType = allStaff.reduce((acc, staff) => {
      acc[staff.staffType] = (acc[staff.staffType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by department
    const byDepartment = allStaff.reduce((acc, staff) => {
      acc[staff.department] = (acc[staff.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by employment type
    const byEmploymentType = allStaff.reduce((acc, staff) => {
      acc[staff.employmentType] = (acc[staff.employmentType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate averages
    const activeStaffList = allStaff.filter(s => s.status === StaffStatus.ACTIVE);
    const averageSalary = activeStaffList.length > 0
      ? activeStaffList.reduce((sum, staff) => sum + staff.netSalary, 0) / activeStaffList.length
      : 0;

    const averageExperience = activeStaffList.length > 0
      ? activeStaffList.reduce((sum, staff) => sum + staff.experienceInYears, 0) / activeStaffList.length
      : 0;

    // Calculate leave utilization (simplified - in real implementation, you'd track actual leave taken)
    const totalAnnualLeave = activeStaffList.reduce((sum, staff) => sum + staff.annualLeaveBalance, 0);
    const totalSickLeave = activeStaffList.reduce((sum, staff) => sum + staff.sickLeaveBalance, 0);
    const totalCasualLeave = activeStaffList.reduce((sum, staff) => sum + staff.casualLeaveBalance, 0);

    return {
      totalStaff,
      activeStaff,
      inactiveStaff,
      terminatedStaff,
      byStaffType,
      byDepartment,
      byEmploymentType,
      averageSalary: Math.round(averageSalary * 100) / 100,
      averageExperience: Math.round(averageExperience * 10) / 10,
      leaveUtilization: {
        annual: { used: 0, total: totalAnnualLeave }, // Would need actual leave tracking
        sick: { used: 0, total: totalSickLeave },
        casual: { used: 0, total: totalCasualLeave },
      },
    };
  }

  /**
   * Get upcoming birthdays
   */
  async getUpcomingBirthdays(schoolId: string, days: number = 30): Promise<Staff[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();
    const futureMonth = futureDate.getMonth() + 1;
    const futureDay = futureDate.getDate();

    // This is a simplified query - in production, you'd need more complex date logic
    const staff = await this.staffRepository
      .createQueryBuilder('staff')
      .where('staff.schoolId = :schoolId', { schoolId })
      .andWhere('staff.status = :status', { status: StaffStatus.ACTIVE })
      .orderBy('EXTRACT(MONTH FROM staff.dateOfBirth)', 'ASC')
      .addOrderBy('EXTRACT(DAY FROM staff.dateOfBirth)', 'ASC')
      .getMany();

    // Filter birthdays within the next N days
    return staff.filter(staffMember => {
      const birthMonth = staffMember.dateOfBirth.getMonth() + 1;
      const birthDay = staffMember.dateOfBirth.getDate();

      if (currentMonth === futureMonth) {
        return birthMonth === currentMonth && birthDay >= currentDay && birthDay <= futureDay;
      } else {
        return (birthMonth === currentMonth && birthDay >= currentDay) ||
               (birthMonth === futureMonth && birthDay <= futureDay);
      }
    });
  }

  /**
   * Get staff members with expiring contracts
   */
  async getExpiringContracts(schoolId: string, days: number = 90): Promise<Staff[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.staffRepository.find({
      where: {
        schoolId,
        status: StaffStatus.ACTIVE,
        contractEndDate: LessThanOrEqual(futureDate),
      },
      order: {
        contractEndDate: 'ASC',
      },
    });
  }

  /**
   * Get staff members on probation
   */
  async getStaffOnProbation(schoolId: string): Promise<Staff[]> {
    return this.staffRepository.find({
      where: {
        schoolId,
        status: StaffStatus.ACTIVE,
        probationEndDate: MoreThanOrEqual(new Date()),
      },
      order: {
        probationEndDate: 'ASC',
      },
    });
  }

  /**
   * Bulk update staff salaries
   */
  async bulkUpdateSalaries(
    schoolId: string,
    updates: Array<{
      staffId: string;
      basicSalary?: number;
      houseAllowance?: number;
      transportAllowance?: number;
      medicalAllowance?: number;
      otherAllowances?: number;
      taxDeductible?: number;
      providentFund?: number;
      otherDeductions?: number;
    }>,
    updatedBy: string,
  ): Promise<Staff[]> {
    const updatedStaff: Staff[] = [];

    for (const update of updates) {
      try {
        const staff = await this.getStaffById(update.staffId);

        if (staff.schoolId !== schoolId) {
          throw new BadRequestException(`Staff member ${update.staffId} does not belong to this school`);
        }

        staff.updateSalary({
          basicSalary: update.basicSalary,
          houseAllowance: update.houseAllowance,
          transportAllowance: update.transportAllowance,
          medicalAllowance: update.medicalAllowance,
          otherAllowances: update.otherAllowances,
          taxDeductible: update.taxDeductible,
          providentFund: update.providentFund,
          otherDeductions: update.otherDeductions,
        });

        staff.updatedBy = updatedBy;
        const savedStaff = await this.staffRepository.save(staff);
        updatedStaff.push(savedStaff);
      } catch (error) {
        this.logger.error(`Failed to update salary for staff ${update.staffId}:`, error.message);
      }
    }

    this.logger.log(`Bulk updated salaries for ${updatedStaff.length} staff members`);
    return updatedStaff;
  }

  /**
   * Generate employee ID
   */
  private generateEmployeeId(schoolId: string): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-4);
    return `EMP${year}${timestamp}`;
  }
}