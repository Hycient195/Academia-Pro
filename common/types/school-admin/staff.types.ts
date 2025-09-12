// Academia Pro - Staff Types for School Admin
// Consolidated type definitions for staff management

export interface IStaff {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  schoolId: string;
  department: 'administration' | 'teaching' | 'support' | 'maintenance' | 'security' | 'medical' | 'library' | 'it' | 'finance' | 'other';
  position: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern';
  employmentStatus: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'retired' | 'suspended';
  hireDate: string;
  salary?: number;
  managerId?: string;
  qualifications?: string[];
  certifications?: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  documents?: Array<{
    id: string;
    type: string;
    name: string;
    url: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateStaffDto {
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone?: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  schoolId: string;
  department: 'administration' | 'teaching' | 'support' | 'maintenance' | 'security' | 'medical' | 'library' | 'it' | 'finance' | 'other';
  position: string;
  employmentType: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern';
  hireDate: string;
  salary?: number;
  managerId?: string;
  qualifications?: string[];
  certifications?: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

export interface IUpdateStaffDto {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  phone?: string;
  address?: Partial<{
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  }>;
  department?: 'administration' | 'teaching' | 'support' | 'maintenance' | 'security' | 'medical' | 'library' | 'it' | 'finance' | 'other';
  position?: string;
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern';
  employmentStatus?: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'retired' | 'suspended';
  salary?: number;
  managerId?: string;
  qualifications?: string[];
  certifications?: string[];
  emergencyContact?: Partial<{
    name: string;
    relationship: string;
    phone: string;
  }>;
}

export interface IStaffStatistics {
  totalStaff: number;
  activeStaff: number;
  inactiveStaff: number;
  terminatedStaff: number;
  onLeaveStaff: number;
  retiredStaff: number;
  suspendedStaff: number;
  byDepartment: Record<string, number>;
  byPosition: Record<string, number>;
  byEmploymentType: Record<string, number>;
  byEmploymentStatus: Record<string, number>;
  averageSalary: number;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  tenureDistribution: {
    '0-1_years': number;
    '1-3_years': number;
    '3-5_years': number;
    '5-10_years': number;
    '10+_years': number;
  };
  averageTenure: number;
}

export interface IHRStatistics {
  totalStaff: number;
  activeStaff: number;
  newHiresThisMonth: number;
  terminationsThisMonth: number;
  turnoverRate: number;
  averageTenure: number;
  departmentDistribution: Record<string, number>;
  performanceMetrics: {
    averagePerformanceScore: number;
    highPerformers: number;
    needsImprovement: number;
  };
  attendanceMetrics: {
    averageAttendanceRate: number;
    absentToday: number;
    onLeave: number;
  };
  trainingMetrics: {
    totalTrainingHours: number;
    completedCertifications: number;
    pendingCertifications: number;
  };
}

export interface IStaffFilters {
  schoolId?: string;
  department?: 'administration' | 'teaching' | 'support' | 'maintenance' | 'security' | 'medical' | 'library' | 'it' | 'finance' | 'other';
  position?: string;
  employmentType?: 'full_time' | 'part_time' | 'contract' | 'temporary' | 'intern';
  employmentStatus?: 'active' | 'inactive' | 'terminated' | 'on_leave' | 'retired' | 'suspended';
  managerId?: string;
  hireDateFrom?: string;
  hireDateTo?: string;
  search?: string;
}

export interface IStaffSearchParams extends IStaffFilters {
  page?: number;
  limit?: number;
}

export interface IStaffSearchResult {
  data: IStaff[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IStaffPerformance {
  staffId: string;
  overallScore: number;
  metrics: Record<string, number>;
  reviews: Array<{
    id: string;
    reviewerId: string;
    reviewerName: string;
    score: number;
    comments: string;
    reviewDate: string;
  }>;
}

export interface IStaffAttendance {
  staffId: string;
  attendanceRate: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  records: Array<{
    date: string;
    status: 'present' | 'absent' | 'late' | 'leave' | 'half_day';
    checkInTime?: string;
    checkOutTime?: string;
    hoursWorked?: number;
  }>;
}

// Bulk operation types
export interface IBulkCreateStaffDto extends Array<ICreateStaffDto> {}

export interface IBulkUpdateStaffDto {
  updates: Array<{
    id: string;
    data: IUpdateStaffDto;
  }>;
}

export interface IBulkStaffOperationResult {
  success: boolean;
  message: string;
  processed: number;
  errors: string[];
}

export interface IBulkCreateStaffResult extends IBulkStaffOperationResult {
  created: number;
}

export interface IBulkUpdateStaffResult extends IBulkStaffOperationResult {
  updated: number;
}

export interface IBulkDeleteStaffResult extends IBulkStaffOperationResult {
  deleted: number;
}