// Academia Pro - Students DTOs
// Export all student-related Data Transfer Objects

export { CreateStudentDto } from './create-student.dto';
export { UpdateStudentDto } from './update-student.dto';
export { TransferStudentDto } from './transfer-student.dto';
export { UpdateMedicalInfoDto } from './update-medical-info.dto';
export { AddDocumentDto } from './add-document.dto';
export { StudentResponseDto, StudentsListResponseDto, StudentStatisticsResponseDto } from './student-response.dto';

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