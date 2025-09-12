// Academia Pro - Students DTOs
// Export all student-related Data Transfer Objects

export { CreateStudentDto } from './create-student.dto';
export { UpdateStudentDto } from './update-student.dto';
export { TransferStudentDto } from './transfer-student.dto';
export { UpdateMedicalInfoDto } from './update-medical-info.dto';
export { AddDocumentDto } from './add-document.dto';
export { AssignClassDto } from './assign-class.dto';
export { PromotionRequestDto, PromotionResultDto } from './promotion.dto';
export { BulkImportRequestDto, BulkImportResultDto } from './bulk-import.dto';
export { GraduationRequestDto, GraduationResultDto } from './graduation.dto';
export { TransferStudentRequestDto, TransferResultDto } from './transfer.dto';
export { StudentResponseDto, StudentsListResponseDto, StudentStatisticsResponseDto } from './student-response.dto';

// Health DTOs
export { CreateHealthRecordDto, UpdateHealthRecordDto, EmergencyContactDto, DoctorInfoDto, InsuranceInfoDto } from './create-health-record.dto';

// Achievement DTOs
export {
  UpdateAchievementDto,
  SupportingDocumentDto as AchievementSupportingDocumentDto,
  SocialMediaUrlDto,
  AchievementMetadataDto,
  PressCoverageDto
} from './create-achievement.dto';

// Discipline DTOs
export {
  CreateDisciplineDto,
  UpdateDisciplineDto,
  WitnessDto,
  DisciplineMetadataDto
} from './create-discipline.dto';

// Document DTOs
export { CreateDocumentDto, UpdateDocumentDto } from './create-document.dto';

// Alumni DTOs
export {
  CreateAlumniDto,
  UpdateAlumniDto,
  AcademicHonorDto,
  HigherEducationDto
} from './create-alumni.dto';

// Re-export for convenience
export type {
  ICreateStudentRequest,
  IUpdateStudentRequest,
  IUpdateMedicalInfoRequest,
  IAddDocumentRequest,
  IStudentResponse,
  IStudentsListResponse,
  IStudentStatisticsResponse
} from '@academia-pro/types/student/student.types';