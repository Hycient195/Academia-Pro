// Academia Pro - Create Exam DTO
// DTO for creating new examinations and assessments

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsBoolean, IsNumber, Min, Max, MaxLength, IsArray, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExamType, AssessmentType, GradingMethod } from '../entities/exam.entity';

export class EligibilityCriteriaDto {
  @ApiPropertyOptional({
    description: 'Minimum attendance percentage required',
    example: 75,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum attendance percentage must be a number' })
  @Min(0, { message: 'Minimum attendance percentage cannot be less than 0' })
  @Max(100, { message: 'Minimum attendance percentage cannot exceed 100' })
  minimumAttendancePercentage?: number;

  @ApiPropertyOptional({
    description: 'Prerequisite exam IDs',
    example: ['exam-uuid-1', 'exam-uuid-2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Prerequisite exams must be an array' })
  @IsString({ each: true, message: 'Each prerequisite exam must be a string' })
  prerequisiteExams?: string[];

  @ApiPropertyOptional({
    description: 'Required assignment IDs',
    example: ['assignment-uuid-1', 'assignment-uuid-2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Required assignments must be an array' })
  @IsString({ each: true, message: 'Each required assignment must be a string' })
  requiredAssignments?: string[];

  @ApiPropertyOptional({
    description: 'Special permissions required',
    example: ['special_needs', 'medical_exception'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Special permissions must be an array' })
  @IsString({ each: true, message: 'Each special permission must be a string' })
  specialPermissions?: string[];
}

export class CreateExamDto {
  @ApiProperty({
    description: 'Exam title',
    example: 'Mathematics Final Examination 2024',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Exam title is required' })
  @IsString({ message: 'Exam title must be a string' })
  @MaxLength(200, { message: 'Exam title cannot exceed 200 characters' })
  examTitle: string;

  @ApiPropertyOptional({
    description: 'Exam description',
    example: 'Comprehensive final examination covering all topics from the academic year',
  })
  @IsOptional()
  @IsString({ message: 'Exam description must be a string' })
  examDescription?: string;

  @ApiProperty({
    description: 'Type of examination',
    example: ExamType.FINAL,
    enum: ExamType,
  })
  @IsNotEmpty({ message: 'Exam type is required' })
  @IsEnum(ExamType, { message: 'Invalid exam type' })
  examType: ExamType;

  @ApiPropertyOptional({
    description: 'Type of assessment',
    example: AssessmentType.SUMMATIVE,
    enum: AssessmentType,
  })
  @IsOptional()
  @IsEnum(AssessmentType, { message: 'Invalid assessment type' })
  assessmentType?: AssessmentType;

  @ApiProperty({
    description: 'Subject ID',
    example: 'subject-uuid-123',
  })
  @IsNotEmpty({ message: 'Subject ID is required' })
  @IsString({ message: 'Subject ID must be a string' })
  subjectId: string;

  @ApiProperty({
    description: 'Class ID',
    example: 'class-uuid-456',
  })
  @IsNotEmpty({ message: 'Class ID is required' })
  @IsString({ message: 'Class ID must be a string' })
  classId: string;

  @ApiPropertyOptional({
    description: 'Section ID',
    example: 'section-uuid-789',
  })
  @IsOptional()
  @IsString({ message: 'Section ID must be a string' })
  sectionId?: string;

  @ApiProperty({
    description: 'Teacher ID (exam creator/assigner)',
    example: 'teacher-uuid-101',
  })
  @IsNotEmpty({ message: 'Teacher ID is required' })
  @IsString({ message: 'Teacher ID must be a string' })
  teacherId: string;

  @ApiProperty({
    description: 'Scheduled date for the exam',
    example: '2024-12-15',
    format: 'date',
  })
  @IsNotEmpty({ message: 'Scheduled date is required' })
  @IsDateString({}, { message: 'Scheduled date must be a valid date' })
  scheduledDate: string;

  @ApiProperty({
    description: 'Exam start time',
    example: '09:00',
  })
  @IsNotEmpty({ message: 'Start time is required' })
  @IsString({ message: 'Start time must be a string' })
  startTime: string;

  @ApiProperty({
    description: 'Exam end time',
    example: '12:00',
  })
  @IsNotEmpty({ message: 'End time is required' })
  @IsString({ message: 'End time must be a string' })
  endTime: string;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 180,
    minimum: 15,
    maximum: 480,
  })
  @IsNotEmpty({ message: 'Duration is required' })
  @IsNumber({}, { message: 'Duration must be a number' })
  @Min(15, { message: 'Duration must be at least 15 minutes' })
  @Max(480, { message: 'Duration cannot exceed 480 minutes (8 hours)' })
  durationMinutes: number;

  @ApiPropertyOptional({
    description: 'Buffer time in minutes',
    example: 15,
    minimum: 0,
    maximum: 60,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Buffer time must be a number' })
  @Min(0, { message: 'Buffer time cannot be negative' })
  @Max(60, { message: 'Buffer time cannot exceed 60 minutes' })
  bufferTimeMinutes?: number;

  @ApiProperty({
    description: 'Total marks for the exam',
    example: 100,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Total marks is required' })
  @IsNumber({}, { message: 'Total marks must be a number' })
  @Min(1, { message: 'Total marks must be at least 1' })
  totalMarks: number;

  @ApiProperty({
    description: 'Passing marks',
    example: 40,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Passing marks is required' })
  @IsNumber({}, { message: 'Passing marks must be a number' })
  @Min(0, { message: 'Passing marks cannot be negative' })
  passingMarks: number;

  @ApiPropertyOptional({
    description: 'Weightage percentage in final grade',
    example: 100,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Weightage percentage must be a number' })
  @Min(1, { message: 'Weightage percentage must be at least 1' })
  @Max(100, { message: 'Weightage percentage cannot exceed 100' })
  weightagePercentage?: number;

  @ApiPropertyOptional({
    description: 'Grading method',
    example: GradingMethod.MANUAL,
    enum: GradingMethod,
  })
  @IsOptional()
  @IsEnum(GradingMethod, { message: 'Invalid grading method' })
  gradingMethod?: GradingMethod;

  @ApiPropertyOptional({
    description: 'Total number of questions',
    example: 50,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Total questions must be a number' })
  @Min(1, { message: 'Total questions must be at least 1' })
  totalQuestions?: number;

  @ApiPropertyOptional({
    description: 'Exam instructions',
    example: 'Answer all questions. Calculators allowed. No mobile phones.',
  })
  @IsOptional()
  @IsString({ message: 'Instructions must be a string' })
  instructions?: string;

  @ApiPropertyOptional({
    description: 'Whether the exam is mandatory',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is mandatory must be a boolean' })
  isMandatory?: boolean;

  @ApiPropertyOptional({
    description: 'Whether retakes are allowed',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Allow retake must be a boolean' })
  allowRetake?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum number of retakes allowed',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Max retakes must be a number' })
  @Min(1, { message: 'Max retakes must be at least 1' })
  maxRetakes?: number;

  @ApiPropertyOptional({
    description: 'Whether to shuffle questions',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Shuffle questions must be a boolean' })
  shuffleQuestions?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to shuffle options',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Shuffle options must be a boolean' })
  shuffleOptions?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to show results immediately after submission',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Show results immediately must be a boolean' })
  showResultsImmediately?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to allow review after submission',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Allow review after submission must be a boolean' })
  allowReviewAfterSubmission?: boolean;

  @ApiPropertyOptional({
    description: 'Whether proctoring is required',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Requires proctoring must be a boolean' })
  requiresProctoring?: boolean;

  @ApiPropertyOptional({
    description: 'Proctor ID',
    example: 'proctor-uuid-202',
  })
  @IsOptional()
  @IsString({ message: 'Proctor ID must be a string' })
  proctorId?: string;

  @ApiPropertyOptional({
    description: 'Whether monitoring is enabled',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Monitoring enabled must be a boolean' })
  monitoringEnabled?: boolean;

  @ApiPropertyOptional({
    description: 'Screenshot interval in minutes',
    example: 30,
    minimum: 5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Screenshot interval must be a number' })
  @Min(5, { message: 'Screenshot interval must be at least 5 minutes' })
  screenshotIntervalMinutes?: number;

  @ApiPropertyOptional({
    description: 'Whether tab switching is allowed',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Tab switch allowed must be a boolean' })
  tabSwitchAllowed?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum tab switches allowed',
    example: 3,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Max tab switches must be a number' })
  @Min(0, { message: 'Max tab switches cannot be negative' })
  maxTabSwitches?: number;

  @ApiPropertyOptional({
    description: 'Eligibility criteria for students',
    type: EligibilityCriteriaDto,
  })
  @IsOptional()
  @ValidateNested()
  eligibilityCriteria?: EligibilityCriteriaDto;

  @ApiPropertyOptional({
    description: 'List of excluded student IDs',
    example: ['student-uuid-1', 'student-uuid-2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Excluded students must be an array' })
  @IsString({ each: true, message: 'Each excluded student must be a string' })
  excludedStudents?: string[];

  @ApiPropertyOptional({
    description: 'Whether to notify students',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Notify students must be a boolean' })
  notifyStudents?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to notify parents',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Notify parents must be a boolean' })
  notifyParents?: boolean;

  @ApiPropertyOptional({
    description: 'Reminder hours before exam',
    example: 24,
    minimum: 1,
    maximum: 168,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Reminder hours must be a number' })
  @Min(1, { message: 'Reminder hours must be at least 1' })
  @Max(168, { message: 'Reminder hours cannot exceed 168 (1 week)' })
  reminderHoursBefore?: number;
}