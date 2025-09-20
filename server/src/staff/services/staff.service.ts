// Academia Pro - Staff Service
// Service for managing staff members, payroll, and HR operations

import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, In, Like } from 'typeorm';
import { Staff, StaffType, StaffStatus, EmploymentType, Gender, MaritalStatus, BloodGroup, QualificationLevel } from '../entities/staff.entity';
import { Department } from '../entities/department.entity';
import { CreateStaffDto, UpdateStaffDto } from '../dtos';
import { AuditService } from '../../security/services/audit.service';
import { AuditAction, AuditSeverity } from '../../security/types/audit.types';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    private readonly auditService: AuditService,
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
    const staffData = {
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
      salaryCurrency: dto.salaryCurrency || 'NGN',
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
    };

    const savedStaff = await this.staffRepository.save(staffData as any);

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
   * Get all staff members (for admin users)
   */
  async getAllStaff(options?: {
    staffType?: StaffType;
    department?: string;
    status?: StaffStatus;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<Staff[]> {
    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.departments', 'departments')
      .orderBy(`staff.${options?.sortBy || 'firstName'}`, options?.sortOrder || 'ASC')
      .addOrderBy('staff.lastName', 'ASC');

    if (options?.staffType) {
      queryBuilder.andWhere('staff.staffType = :staffType', {
        staffType: options.staffType,
      });
    }

    if (options?.department) {
      queryBuilder.andWhere('departments.name = :department', {
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
   * Search staff members
   */
  async searchStaff(query: string, options?: {
    limit?: number;
    offset?: number;
  }): Promise<Staff[]> {
    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .where(
        '(staff.firstName ILIKE :query OR staff.lastName ILIKE :query OR staff.email ILIKE :query OR staff.employeeId ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('staff.firstName', 'ASC')
      .addOrderBy('staff.lastName', 'ASC');

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Filter staff members
   */
  async filterStaff(filters: Record<string, any>, options?: {
    limit?: number;
    offset?: number;
  }): Promise<Staff[]> {
    const queryBuilder = this.staffRepository
      .createQueryBuilder('staff')
      .leftJoinAndSelect('staff.departments', 'departments')
      .orderBy('staff.firstName', 'ASC')
      .addOrderBy('staff.lastName', 'ASC');

    // Apply filters
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        switch (key) {
          case 'staffType':
            queryBuilder.andWhere('staff.staffType = :staffType', { staffType: value });
            break;
          case 'status':
            queryBuilder.andWhere('staff.status = :status', { status: value });
            break;
          case 'departmentId':
            queryBuilder.andWhere('departments.id = :departmentId', { departmentId: value });
            break;
          case 'minSalary':
            queryBuilder.andWhere('staff.netSalary >= :minSalary', { minSalary: value });
            break;
          case 'maxSalary':
            queryBuilder.andWhere('staff.netSalary <= :maxSalary', { maxSalary: value });
            break;
          case 'joiningDateFrom':
            queryBuilder.andWhere('staff.joiningDate >= :joiningDateFrom', { joiningDateFrom: new Date(value) });
            break;
          case 'joiningDateTo':
            queryBuilder.andWhere('staff.joiningDate <= :joiningDateTo', { joiningDateTo: new Date(value) });
            break;
        }
      }
    });

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

      const basicSalary = dto.basicSalary !== undefined ? dto.basicSalary : staff.compensation?.basicSalary || 0;
      const houseAllowance = dto.houseAllowance !== undefined ? dto.houseAllowance : staff.compensation?.houseAllowance || 0;
      const transportAllowance = dto.transportAllowance !== undefined ? dto.transportAllowance : staff.compensation?.transportAllowance || 0;
      const medicalAllowance = dto.medicalAllowance !== undefined ? dto.medicalAllowance : staff.compensation?.medicalAllowance || 0;
      const otherAllowances = dto.otherAllowances !== undefined ? dto.otherAllowances : staff.compensation?.otherAllowances || 0;
      const taxDeductible = dto.taxDeductible !== undefined ? dto.taxDeductible : staff.compensation?.taxDeductible || 0;
      const providentFund = dto.providentFund !== undefined ? dto.providentFund : staff.compensation?.providentFund || 0;
      const otherDeductions = dto.otherDeductions !== undefined ? dto.otherDeductions : staff.compensation?.otherDeductions || 0;

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
   * Get staff attendance information
   */
  async getStaffAttendance(staffId: string): Promise<{
    staffId: string;
    workingHoursPerWeek: number;
    workingDaysPerWeek: number;
    shiftStartTime: string;
    shiftEndTime: string;
    attendanceRate: number;
  }> {
    const staff = await this.getStaffById(staffId);

    return {
      staffId: staff.id,
      workingHoursPerWeek: staff.workingHoursPerWeek || 40,
      workingDaysPerWeek: staff.workingDaysPerWeek || 5,
      shiftStartTime: staff.shiftStartTime || '09:00',
      shiftEndTime: staff.shiftEndTime || '17:00',
      attendanceRate: 95, // This would come from actual attendance tracking
    };
  }

  /**
   * Update staff attendance information
   */
  async updateStaffAttendance(
    staffId: string,
    attendanceData: {
      workingHoursPerWeek?: number;
      workingDaysPerWeek?: number;
      shiftStartTime?: string;
      shiftEndTime?: string;
    },
    updatedBy: string,
  ): Promise<{
    staffId: string;
    workingHoursPerWeek: number;
    workingDaysPerWeek: number;
    shiftStartTime: string;
    shiftEndTime: string;
  }> {
    const staff = await this.getStaffById(staffId);

    // Validate working hours
    if (attendanceData.workingHoursPerWeek && (attendanceData.workingHoursPerWeek < 1 || attendanceData.workingHoursPerWeek > 80)) {
      throw new BadRequestException('Working hours per week must be between 1 and 80');
    }

    // Validate working days
    if (attendanceData.workingDaysPerWeek && (attendanceData.workingDaysPerWeek < 1 || attendanceData.workingDaysPerWeek > 7)) {
      throw new BadRequestException('Working days per week must be between 1 and 7');
    }

    // Update attendance fields
    if (attendanceData.workingHoursPerWeek !== undefined) {
      staff.workingHoursPerWeek = attendanceData.workingHoursPerWeek;
    }
    if (attendanceData.workingDaysPerWeek !== undefined) {
      staff.workingDaysPerWeek = attendanceData.workingDaysPerWeek;
    }
    if (attendanceData.shiftStartTime !== undefined) {
      staff.shiftStartTime = attendanceData.shiftStartTime;
    }
    if (attendanceData.shiftEndTime !== undefined) {
      staff.shiftEndTime = attendanceData.shiftEndTime;
    }

    staff.updatedBy = updatedBy;
    const updatedStaff = await this.staffRepository.save(staff);

    return {
      staffId: updatedStaff.id,
      workingHoursPerWeek: updatedStaff.workingHoursPerWeek || 40,
      workingDaysPerWeek: updatedStaff.workingDaysPerWeek || 5,
      shiftStartTime: updatedStaff.shiftStartTime || '09:00',
      shiftEndTime: updatedStaff.shiftEndTime || '17:00',
    };
  }

  /**
   * Get staff payroll information
   */
  async getStaffPayroll(staffId: string): Promise<{
    staffId: string;
    compensation: {
      basicSalary: number;
      houseAllowance: number;
      transportAllowance: number;
      medicalAllowance: number;
      otherAllowances: number;
      grossSalary: number;
      taxDeductible: number;
      providentFund: number;
      otherDeductions: number;
      netSalary: number;
      paymentMethod: string;
      bankDetails?: {
        bankName: string;
        accountNumber: string;
        branch: string;
        ifscCode: string;
      };
    };
  }> {
    const staff = await this.getStaffById(staffId);

    return {
      staffId: staff.id,
      compensation: {
        basicSalary: staff.compensation?.basicSalary || 0,
        houseAllowance: staff.compensation?.houseAllowance || 0,
        transportAllowance: staff.compensation?.transportAllowance || 0,
        medicalAllowance: staff.compensation?.medicalAllowance || 0,
        otherAllowances: staff.compensation?.otherAllowances || 0,
        grossSalary: staff.compensation?.grossSalary || 0,
        taxDeductible: staff.compensation?.taxDeductible || 0,
        providentFund: staff.compensation?.providentFund || 0,
        otherDeductions: staff.compensation?.otherDeductions || 0,
        netSalary: staff.compensation?.netSalary || 0,
        paymentMethod: staff.compensation?.paymentMethod || 'bank_transfer',
        bankDetails: staff.compensation?.bankDetails ? {
          bankName: staff.compensation.bankDetails.bankName,
          accountNumber: staff.compensation.bankDetails.accountNumber,
          branch: staff.compensation.bankDetails.branch,
          ifscCode: staff.compensation.bankDetails.ifscCode,
        } : undefined,
      },
    };
  }

  /**
   * Update staff payroll information
   */
  async updateStaffPayroll(
    staffId: string,
    payrollData: {
      basicSalary?: number;
      houseAllowance?: number;
      transportAllowance?: number;
      medicalAllowance?: number;
      otherAllowances?: number;
      taxDeductible?: number;
      providentFund?: number;
      otherDeductions?: number;
      paymentMethod?: string;
      bankDetails?: {
        bankName: string;
        accountNumber: string;
        branch: string;
        ifscCode: string;
      };
    },
    updatedBy: string,
  ): Promise<{
    staffId: string;
    compensation: {
      basicSalary: number;
      grossSalary: number;
      netSalary: number;
      paymentMethod: string;
    };
  }> {
    const staff = await this.getStaffById(staffId);

    // Validate salary values
    if (payrollData.basicSalary !== undefined && payrollData.basicSalary < 0) {
      throw new BadRequestException('Basic salary cannot be negative');
    }

    // Update compensation
    if (!staff.compensation) {
      staff.compensation = {
        basicSalary: 0,
        salaryCurrency: 'NGN',
        grossSalary: 0,
        netSalary: 0,
        paymentMethod: 'bank_transfer',
      };
    }

    // Update individual fields
    if (payrollData.basicSalary !== undefined) {
      staff.compensation.basicSalary = payrollData.basicSalary;
    }
    if (payrollData.houseAllowance !== undefined) {
      staff.compensation.houseAllowance = payrollData.houseAllowance;
    }
    if (payrollData.transportAllowance !== undefined) {
      staff.compensation.transportAllowance = payrollData.transportAllowance;
    }
    if (payrollData.medicalAllowance !== undefined) {
      staff.compensation.medicalAllowance = payrollData.medicalAllowance;
    }
    if (payrollData.otherAllowances !== undefined) {
      staff.compensation.otherAllowances = payrollData.otherAllowances;
    }
    if (payrollData.taxDeductible !== undefined) {
      staff.compensation.taxDeductible = payrollData.taxDeductible;
    }
    if (payrollData.providentFund !== undefined) {
      staff.compensation.providentFund = payrollData.providentFund;
    }
    if (payrollData.otherDeductions !== undefined) {
      staff.compensation.otherDeductions = payrollData.otherDeductions;
    }
    if (payrollData.paymentMethod !== undefined) {
      staff.compensation.paymentMethod = payrollData.paymentMethod;
    }
    if (payrollData.bankDetails !== undefined) {
      staff.compensation.bankDetails = payrollData.bankDetails;
    }

    // Recalculate gross and net salary
    const houseAllowance = staff.compensation.houseAllowance || 0;
    const transportAllowance = staff.compensation.transportAllowance || 0;
    const medicalAllowance = staff.compensation.medicalAllowance || 0;
    const otherAllowances = staff.compensation.otherAllowances || 0;
    const taxDeductible = staff.compensation.taxDeductible || 0;
    const providentFund = staff.compensation.providentFund || 0;
    const otherDeductions = staff.compensation.otherDeductions || 0;

    staff.compensation.grossSalary = staff.compensation.basicSalary + houseAllowance + transportAllowance + medicalAllowance + otherAllowances;
    staff.compensation.netSalary = staff.compensation.grossSalary - taxDeductible - providentFund - otherDeductions;

    staff.updatedBy = updatedBy;
    const updatedStaff = await this.staffRepository.save(staff);

    return {
      staffId: updatedStaff.id,
      compensation: {
        basicSalary: updatedStaff.compensation.basicSalary,
        grossSalary: updatedStaff.compensation.grossSalary,
        netSalary: updatedStaff.compensation.netSalary,
        paymentMethod: updatedStaff.compensation.paymentMethod,
      },
    };
  }

  /**
   * Get staff statistics overview
   */
  async getStaffStatsOverview(): Promise<{
    totalStaff: number;
    staffByType: Record<string, number>;
    staffByStatus: Record<string, number>;
    averageSalary: number;
    averagePerformanceRating: number;
  }> {
    const allStaff = await this.staffRepository.find();

    const totalStaff = allStaff.length;

    // Group by staff type
    const staffByType = allStaff.reduce((acc, staff) => {
      acc[staff.staffType] = (acc[staff.staffType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by status
    const staffByStatus = allStaff.reduce((acc, staff) => {
      acc[staff.status] = (acc[staff.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate average salary
    const activeStaff = allStaff.filter(s => s.status === StaffStatus.ACTIVE);
    const averageSalary = activeStaff.length > 0
      ? activeStaff.reduce((sum, staff) => sum + (staff.compensation?.netSalary || 0), 0) / activeStaff.length
      : 0;

    // Calculate average performance rating
    const staffWithRating = activeStaff.filter(s => s.performanceRating);
    const averagePerformanceRating = staffWithRating.length > 0
      ? staffWithRating.reduce((sum, staff) => sum + staff.performanceRating, 0) / staffWithRating.length
      : 0;

    return {
      totalStaff,
      staffByType,
      staffByStatus,
      averageSalary: Math.round(averageSalary * 100) / 100,
      averagePerformanceRating: Math.round(averagePerformanceRating * 10) / 10,
    };
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
      // Handle departments array - use first department or 'Unassigned'
      const deptName = staff.departments?.[0]?.name || 'Unassigned';
      acc[deptName] = (acc[deptName] || 0) + 1;
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
      ? activeStaffList.reduce((sum, staff) => sum + (staff.compensation?.netSalary || 0), 0) / activeStaffList.length
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
   * Assign staff member to department
   */
  async assignStaffToDepartment(staffId: string, departmentId: string, assignedBy: string): Promise<Staff> {
    const staff = await this.getStaffById(staffId);
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${departmentId} not found`);
    }

    // Check if staff is already assigned to this department
    const isAlreadyAssigned = staff.departments.some(dept => dept.id === departmentId);
    if (isAlreadyAssigned) {
      throw new ConflictException('Staff member is already assigned to this department');
    }

    // Add department to staff
    staff.departments.push(department);
    staff.updatedBy = assignedBy;

    const updatedStaff = await this.staffRepository.save(staff);

    this.logger.log(`Assigned staff member ${staffId} to department ${departmentId}`);

    // Audit the assignment
    await this.auditService.logActivity({
      action: AuditAction.DATA_UPDATED,
      resource: 'staff_department',
      resourceId: staffId,
      severity: AuditSeverity.MEDIUM,
      userId: assignedBy,
      schoolId: staff.schoolId,
      details: {
        departmentId,
        departmentName: department.name,
        action: 'assigned',
        timestamp: new Date(),
        module: 'staff',
        eventType: 'staff_department_assignment',
      },
    });

    return updatedStaff;
  }

  /**
   * Remove staff member from department
   */
  async removeStaffFromDepartment(staffId: string, departmentId: string, removedBy: string): Promise<Staff> {
    const staff = await this.getStaffById(staffId);
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${departmentId} not found`);
    }

    // Check if staff is assigned to this department
    const departmentIndex = staff.departments.findIndex(dept => dept.id === departmentId);
    if (departmentIndex === -1) {
      throw new NotFoundException('Staff member is not assigned to this department');
    }

    // Remove department from staff
    staff.departments.splice(departmentIndex, 1);
    staff.updatedBy = removedBy;

    const updatedStaff = await this.staffRepository.save(staff);

    this.logger.log(`Removed staff member ${staffId} from department ${departmentId}`);

    // Audit the removal
    await this.auditService.logActivity({
      action: AuditAction.DATA_UPDATED,
      resource: 'staff_department',
      resourceId: staffId,
      severity: AuditSeverity.MEDIUM,
      userId: removedBy,
      schoolId: staff.schoolId,
      details: {
        departmentId,
        departmentName: department.name,
        action: 'removed',
        timestamp: new Date(),
        module: 'staff',
        eventType: 'staff_department_removal',
      },
    });

    return updatedStaff;
  }

  /**
   * Get staff member with departments
   */
  async getStaffWithDepartments(staffId: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id: staffId },
      relations: ['departments'],
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with ID ${staffId} not found`);
    }

    return staff;
  }

  /**
   * Get staff members by department ID
   */
  async getStaffByDepartmentId(departmentId: string, options?: {
    status?: StaffStatus;
    limit?: number;
    offset?: number;
  }): Promise<Staff[]> {
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
      relations: ['staff'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${departmentId} not found`);
    }

    let staff = department.staff;

    // Filter by status if provided
    if (options?.status) {
      staff = staff.filter(s => s.status === options.status);
    }

    // Apply pagination if provided
    if (options?.limit) {
      const offset = options?.offset || 0;
      staff = staff.slice(offset, offset + options.limit);
    }

    return staff;
  }

  /**
   * Get staff departments
   */
  async getStaffDepartments(staffId: string): Promise<Department[]> {
    const staff = await this.getStaffWithDepartments(staffId);
    return staff.departments;
  }

  /**
   * Update staff departments (replace all)
   */
  async updateStaffDepartments(staffId: string, departmentIds: string[], updatedBy: string): Promise<Staff> {
    const staff = await this.getStaffById(staffId);

    // Validate all department IDs exist
    const departments = await this.departmentRepository.findBy({
      id: In(departmentIds),
    });

    if (departments.length !== departmentIds.length) {
      const foundIds = departments.map(d => d.id);
      const missingIds = departmentIds.filter(id => !foundIds.includes(id));
      throw new NotFoundException(`Departments not found: ${missingIds.join(', ')}`);
    }

    // Update departments
    staff.departments = departments;
    staff.updatedBy = updatedBy;

    const updatedStaff = await this.staffRepository.save(staff);

    this.logger.log(`Updated departments for staff member ${staffId}: ${departmentIds.join(', ')}`);

    // Audit the update
    await this.auditService.logActivity({
      action: AuditAction.DATA_UPDATED,
      resource: 'staff_departments',
      resourceId: staffId,
      severity: AuditSeverity.MEDIUM,
      userId: updatedBy,
      schoolId: staff.schoolId,
      details: {
        departmentIds,
        departmentNames: departments.map(d => d.name),
        action: 'updated_all',
        timestamp: new Date(),
        module: 'staff',
        eventType: 'staff_departments_update',
      },
    });

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

  // ==================== CUSTOM AUDIT METHODS ====================

  /**
   * Audit staff hiring and role changes
   */
  async auditStaffHiring(staffId: string, hiringDetails: any, userId: string, schoolId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_CREATED,
      resource: 'staff',
      resourceId: staffId,
      severity: AuditSeverity.MEDIUM,
      userId,
      schoolId,
      details: {
        hiringDetails: this.sanitizeAuditData(hiringDetails),
        timestamp: new Date(),
        module: 'staff',
        eventType: 'staff_hiring',
      },
    });
  }

  /**
   * Audit staff termination and disciplinary actions
   */
  async auditStaffTermination(staffId: string, terminationDetails: any, userId: string, schoolId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_UPDATED,
      resource: 'staff',
      resourceId: staffId,
      severity: AuditSeverity.HIGH,
      userId,
      schoolId,
      details: {
        terminationDetails: this.sanitizeAuditData(terminationDetails),
        timestamp: new Date(),
        module: 'staff',
        eventType: 'staff_termination',
      },
    });
  }

  /**
   * Audit performance reviews and evaluations
   */
  async auditPerformanceReview(staffId: string, reviewDetails: any, userId: string, schoolId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_UPDATED,
      resource: 'staff_performance',
      resourceId: staffId,
      severity: AuditSeverity.MEDIUM,
      userId,
      schoolId,
      details: {
        reviewDetails: this.sanitizeAuditData(reviewDetails),
        timestamp: new Date(),
        module: 'staff',
        eventType: 'performance_review',
      },
    });
  }

  /**
   * Audit salary and compensation changes
   */
  async auditSalaryChange(staffId: string, salaryDetails: any, userId: string, schoolId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.DATA_UPDATED,
      resource: 'staff_salary',
      resourceId: staffId,
      severity: AuditSeverity.HIGH,
      userId,
      schoolId,
      details: {
        salaryDetails: this.sanitizeAuditData(salaryDetails),
        timestamp: new Date(),
        module: 'staff',
        eventType: 'salary_change',
      },
    });
  }

  /**
   * Audit bulk staff operations with sampling
   */
  async auditBulkStaffOperation(operation: string, totalRecords: number, successCount: number, userId: string, schoolId?: string): Promise<void> {
    // Only audit if operation affects significant number of staff or has failures
    if (totalRecords >= 5 || successCount < totalRecords) {
      await this.auditService.logActivity({
        action: AuditAction.DATA_UPDATED,
        resource: 'bulk_staff_operation',
        severity: totalRecords >= 20 ? AuditSeverity.MEDIUM : AuditSeverity.LOW,
        userId,
        schoolId,
        details: {
          operation,
          totalRecords,
          successCount,
          failureCount: totalRecords - successCount,
          timestamp: new Date(),
          module: 'staff',
          eventType: 'bulk_operation',
          sampled: totalRecords < 20, // Mark as sampled for smaller operations
        },
      });
    }
  }

  /**
   * Audit leave and attendance policy changes
   */
  async auditLeavePolicyChange(policyId: string, policyDetails: any, userId: string, schoolId?: string): Promise<void> {
    await this.auditService.logActivity({
      action: AuditAction.SYSTEM_CONFIG_CHANGED,
      resource: 'leave_policy',
      resourceId: policyId,
      severity: AuditSeverity.MEDIUM,
      userId,
      schoolId,
      details: {
        policyDetails: this.sanitizeAuditData(policyDetails),
        timestamp: new Date(),
        module: 'staff',
        eventType: 'leave_policy_change',
      },
    });
  }

  /**
   * Sanitize sensitive data for audit logging
   */
  private sanitizeAuditData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = ['password', 'ssn', 'socialSecurity', 'bankAccount', 'creditCard', 'medicalInfo', 'salary', 'bankAccountNumber', 'ifscCode'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }
}