// Academia Pro - Students DTOs
// Export all student-related Data Transfer Objects

export { CreateStudentDto } from './create-student.dto';
export { UpdateStudentDto } from './update-student.dto';
export { TransferStudentDto } from './transfer-student.dto';
export { UpdateMedicalInfoDto } from './update-medical-info.dto';
export { AddDocumentDto } from './add-document.dto';
export { StudentResponseDto, StudentsListResponseDto, StudentStatisticsResponseDto } from './student-response.dto';

// Health DTOs
export { CreateHealthRecordDto, UpdateHealthRecordDto, EmergencyContactDto, DoctorInfoDto, InsuranceInfoDto } from './create-health-record.dto';

// Achievement DTOs
export {
  CreateAchievementDto,
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
  ITransferStudentRequest,
  IUpdateMedicalInfoRequest,
  IAddDocumentRequest,
  IStudentResponse,
  IStudentsListResponse,
  IStudentStatisticsResponse
} from '../../../../common/src/types/student/student.types';