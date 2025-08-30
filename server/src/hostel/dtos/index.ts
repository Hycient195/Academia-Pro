// Academia Pro - Hostel DTOs
// Export all hostel-related Data Transfer Objects

export {
  CreateHostelDto,
  UpdateHostelDto,
  AddressDto,
  FacilityDto,
  HostelRulesDto,
  HostelPricingDto,
  ContactInfoDto,
  OperatingHoursDto,
} from './create-hostel.dto';

// Re-export types for convenience
export type {
  HostelType,
  HostelStatus,
  RoomType,
  RoomStatus,
  BedStatus,
  FacilityType,
  MaintenanceType,
  MaintenanceStatus,
  AllocationStatus,
} from '../entities/hostel.entity';

export type {
  CheckInStatus,
  CheckOutStatus,
  AllocationType,
} from '../entities/hostel-allocation.entity';