// Academia Pro - Staff Response DTO
// Safe response format for staff data (frontend consumption)

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Staff } from '../staff.entity';
import { TDepartment, TPosition, TEmploymentType, TEmploymentStatus } from '@academia-pro/common/staff';

export class StaffResponseDto {
  @ApiProperty({
    description: 'Unique staff identifier',
    example: 'staff-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Employee ID',
    example: 'EMP001',
  })
  employeeId: string;

  @ApiProperty({
    description: 'Staff first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Staff last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Staff middle name',
    example: 'Michael',
  })
  middleName?: string;

  @ApiProperty({
    description: 'Staff email',
    example: 'john.doe@school.com',
  })
  email: string;

  @ApiProperty({
    description: 'Staff phone number',
    example: '+1234567890',
  })
  phone: string;

  @ApiProperty({
    description: 'Department',
    example: 'academic',
    enum: TDepartment,
  })
  department: TDepartment;

  @ApiProperty({
    description: 'Position',
    example: 'teacher',
    enum: TPosition,
  })
  position: TPosition;

  @ApiProperty({
    description: 'Employment type',
    example: 'full_time',
    enum: TEmploymentType,
  })
  employmentType: TEmploymentType;

  @ApiProperty({
    description: 'Employment status',
    example: 'active',
    enum: TEmploymentStatus,
  })
  employmentStatus: TEmploymentStatus;

  @ApiProperty({
    description: 'Hire date',
    example: '2024-01-15T00:00:00Z',
  })
  hireDate: Date;

  @ApiPropertyOptional({
    description: 'Contract end date',
    example: '2025-01-15T00:00:00Z',
  })
  contractEndDate?: Date;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  schoolId: string;

  @ApiPropertyOptional({
    description: 'Manager ID',
    example: 'staff-uuid-456',
  })
  managerId?: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2024-01-15T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2024-08-01T00:00:00Z',
  })
  updatedAt: Date;

  // Computed fields
  @ApiProperty({
    description: 'Full name (computed)',
    example: 'John Michael Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Age in years (computed)',
    example: 35,
  })
  age: number;

  @ApiProperty({
    description: 'Years of experience (computed)',
    example: 8,
  })
  experience: number;

  @ApiProperty({
    description: 'Current net salary (computed)',
    example: 45000,
  })
  currentSalary: number;

  @ApiProperty({
    description: 'Leave balance information',
    type: Object,
  })
  leaveBalance: {
    annual: number;
    sick: number;
    maternity: number;
  };

  @ApiPropertyOptional({
    description: 'Manager information',
    type: Object,
  })
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    position: TPosition;
  };

  @ApiProperty({
    description: 'Number of subordinates',
    example: 3,
  })
  subordinatesCount: number;

  @ApiPropertyOptional({
    description: 'Last performance rating',
    example: 4.2,
  })
  lastPerformanceRating?: number;

  @ApiProperty({
    description: 'Upcoming leaves',
    type: [Object],
  })
  upcomingLeaves: Array<{
    id: string;
    leaveType: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    status: string;
  }>;

  constructor(partial: Partial<StaffResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(staff: Staff): StaffResponseDto {
    const dto = new StaffResponseDto({});
    dto.id = staff.id;
    dto.employeeId = staff.employeeId;
    dto.firstName = staff.firstName;
    dto.lastName = staff.lastName;
    dto.middleName = staff.middleName;
    dto.email = staff.email;
    dto.phone = staff.phone;
    dto.department = staff.department;
    dto.position = staff.position;
    dto.employmentType = staff.employmentType;
    dto.employmentStatus = staff.employmentStatus;
    dto.hireDate = staff.hireDate;
    dto.contractEndDate = staff.contractEndDate;
    dto.schoolId = staff.schoolId;
    dto.managerId = staff.managerId;
    dto.createdAt = staff.createdAt;
    dto.updatedAt = staff.updatedAt;

    // Computed fields
    dto.fullName = staff.fullName;
    dto.age = staff.age;
    dto.experience = staff.experience;
    dto.currentSalary = staff.salary.netSalary;
    dto.leaveBalance = staff.leaveBalance;
    dto.subordinatesCount = staff.subordinatesCount;
    dto.lastPerformanceRating = staff.lastPerformanceRating;

    // Manager info (would be populated by service if needed)
    dto.manager = undefined; // To be set by service

    // Upcoming leaves (filter and limit to next few)
    const currentDate = new Date();
    dto.upcomingLeaves = staff.leaves
      .filter(leave =>
        new Date(leave.startDate) >= currentDate &&
        leave.status === 'approved'
      )
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .slice(0, 3) // Next 3 upcoming leaves
      .map(leave => ({
        id: leave.id,
        leaveType: leave.leaveType,
        startDate: leave.startDate,
        endDate: leave.endDate,
        totalDays: leave.totalDays,
        status: leave.status,
      }));

    return dto;
  }
}

export class StaffListResponseDto {
  @ApiProperty({
    description: 'List of staff members',
    type: [StaffResponseDto],
  })
  staff: StaffResponseDto[];

  @ApiProperty({
    description: 'Total number of staff members',
    example: 50,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  constructor(partial: Partial<StaffListResponseDto>) {
    Object.assign(this, partial);
  }
}

export class StaffStatisticsResponseDto {
  @ApiProperty({
    description: 'Total number of staff members',
    example: 50,
  })
  totalStaff: number;

  @ApiProperty({
    description: 'Number of active staff members',
    example: 48,
  })
  activeStaff: number;

  @ApiProperty({
    description: 'Staff grouped by department',
    example: { academic: 25, administrative: 10, support: 8, technical: 5, medical: 2 },
  })
  staffByDepartment: Record<TDepartment, number>;

  @ApiProperty({
    description: 'Staff grouped by position',
    example: { teacher: 20, administrator: 5, librarian: 3, driver: 8, nurse: 2 },
  })
  staffByPosition: Record<TPosition, number>;

  @ApiProperty({
    description: 'Staff grouped by employment type',
    example: { full_time: 40, part_time: 8, contract: 2 },
  })
  staffByEmploymentType: Record<TEmploymentType, number>;

  @ApiProperty({
    description: 'Staff grouped by employment status',
    example: { active: 48, inactive: 1, on_leave: 1 },
  })
  staffByEmploymentStatus: Record<TEmploymentStatus, number>;

  @ApiProperty({
    description: 'Average salary by department',
    example: { academic: 35000, administrative: 28000, support: 22000 },
  })
  averageSalaryByDepartment: Record<TDepartment, number>;

  @ApiProperty({
    description: 'Leave utilization statistics',
    type: Object,
  })
  leaveUtilization: {
    annual: number;
    sick: number;
    maternity: number;
  };

  constructor(partial: Partial<StaffStatisticsResponseDto>) {
    Object.assign(this, partial);
  }
}