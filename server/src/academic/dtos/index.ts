// Academia Pro - Academic DTOs Index
// Export all academic management DTOs

export { CreateSubjectDto } from './create-subject.dto';
export { UpdateSubjectDto } from './update-subject.dto';
export { CreateCurriculumDto } from './create-curriculum.dto';
export { CreateClassDto } from './create-class.dto';
export { CreateLearningObjectiveDto } from './create-learning-objective.dto';

// Response DTOs
export { SubjectResponseDto } from './subject-response.dto';
export { CurriculumResponseDto } from './curriculum-response.dto';
export { ClassResponseDto } from './class-response.dto';
export { LearningObjectiveResponseDto } from './learning-objective-response.dto';

// Re-export for convenience
export type {
  ICreateSubjectRequest,
  IUpdateSubjectRequest,
  ICreateCurriculumRequest,
  ICreateClassRequest,
  ICreateLearningObjectiveRequest,
  ISubjectResponse,
  ICurriculumResponse,
  IClassResponse,
  ILearningObjectiveResponse,
  IAcademicStatistics,
} from '../../../../common/src/types/academic/academic.types';