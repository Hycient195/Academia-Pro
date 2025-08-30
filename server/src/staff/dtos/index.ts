// Academia Pro - Staff DTOs
// Export all staff-related Data Transfer Objects

export {
  CreateStaffDto,
  UpdateStaffDto,
  AddressDto,
  QualificationDto,
  CertificationDto,
  PreviousExperienceDto,
  MedicalInfoDto,
  CommunicationPreferencesDto,
} from './create-staff.dto';

// Re-export types for convenience
export type {
  StaffType,
  StaffStatus,
  EmploymentType,
  Gender,
  MaritalStatus,
  BloodGroup,
  QualificationLevel,
} from '../entities/staff.entity';