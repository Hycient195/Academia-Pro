// Academia Pro - Staff DTOs Index
// Export all staff management DTOs

export { CreateStaffDto } from './create-staff.dto';
export { UpdateStaffDto } from './update-staff.dto';
export { StaffResponseDto, StaffListResponseDto, StaffStatisticsResponseDto } from './staff-response.dto';

// Re-export for convenience
export type {
  ICreateStaffRequest,
  IUpdateStaffRequest,
  IStaffResponse,
  IStaffListResponse,
  IStaffStatisticsResponse,
  IStaffFilters,
  ILeaveFilters,
  IPerformanceReviewFilters,
  IHRStatistics,
} from '../../../../common/src/types/staff/staff.types';