// Academia Pro - Examination DTOs
// Export all examination-related Data Transfer Objects

export { CreateExamDto, EligibilityCriteriaDto } from './create-exam.dto';
export {
  SubmitExamResultDto,
  GradeExamResultDto,
  RequestReEvaluationDto,
  QuestionScoreDto,
} from './submit-exam-result.dto';

// Re-export types for convenience
export type {
  ExamType,
  ExamStatus,
  GradingMethod,
  AssessmentType,
} from '../entities/exam.entity';
export type {
  ResultStatus,
  GradeScale,
} from '../entities/exam-result.entity';
export type {
  DisciplineType,
  DisciplineSeverity,
  DisciplineAction,
} from '../../students/entities/student-discipline.entity';