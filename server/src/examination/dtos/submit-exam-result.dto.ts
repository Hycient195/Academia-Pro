// Academia Pro - Submit Exam Result DTO
// DTO for submitting exam results

import { IsNotEmpty, IsOptional, IsString, IsNumber, Min, Max, IsArray, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class QuestionScoreDto {
  @ApiProperty({
    description: 'Question ID',
    example: 'question-uuid-123',
  })
  @IsNotEmpty({ message: 'Question ID is required' })
  @IsString({ message: 'Question ID must be a string' })
  questionId: string;

  @ApiProperty({
    description: 'Marks obtained for this question',
    example: 5,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Obtained marks is required' })
  @IsNumber({}, { message: 'Obtained marks must be a number' })
  @Min(0, { message: 'Obtained marks cannot be negative' })
  obtainedMarks: number;

  @ApiProperty({
    description: 'Total marks for this question',
    example: 5,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Total marks is required' })
  @IsNumber({}, { message: 'Total marks must be a number' })
  @Min(0, { message: 'Total marks cannot be negative' })
  totalMarks: number;

  @ApiPropertyOptional({
    description: 'Time spent on this question in seconds',
    example: 120,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Time spent must be a number' })
  @Min(0, { message: 'Time spent cannot be negative' })
  timeSpentSeconds?: number;

  @ApiPropertyOptional({
    description: 'Number of attempts for this question',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Attempts must be a number' })
  @Min(1, { message: 'Attempts must be at least 1' })
  attempts?: number;

  @ApiPropertyOptional({
    description: 'Whether the answer was correct',
    example: true,
  })
  @IsOptional()
  isCorrect?: boolean;
}

export class SubmitExamResultDto {
  @ApiProperty({
    description: 'Exam ID',
    example: 'exam-uuid-123',
  })
  @IsNotEmpty({ message: 'Exam ID is required' })
  @IsString({ message: 'Exam ID must be a string' })
  examId: string;

  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-456',
  })
  @IsNotEmpty({ message: 'Student ID is required' })
  @IsString({ message: 'Student ID must be a string' })
  studentId: string;

  @ApiPropertyOptional({
    description: 'Detailed scores for each question',
    type: [QuestionScoreDto],
  })
  @IsOptional()
  @IsArray({ message: 'Question scores must be an array' })
  @ValidateNested({ each: true })
  questionScores?: QuestionScoreDto[];

  @ApiPropertyOptional({
    description: 'Additional notes from student',
    example: 'Found the exam challenging but managed to complete it',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}

export class GradeExamResultDto {
  @ApiProperty({
    description: 'Exam Result ID',
    example: 'exam-result-uuid-123',
  })
  @IsNotEmpty({ message: 'Exam Result ID is required' })
  @IsString({ message: 'Exam Result ID must be a string' })
  examResultId: string;

  @ApiProperty({
    description: 'Marks obtained by the student',
    example: 85,
    minimum: 0,
  })
  @IsNotEmpty({ message: 'Obtained marks is required' })
  @IsNumber({}, { message: 'Obtained marks must be a number' })
  @Min(0, { message: 'Obtained marks cannot be negative' })
  obtainedMarks: number;

  @ApiPropertyOptional({
    description: 'Teacher comments',
    example: 'Excellent work! Good understanding of concepts.',
  })
  @IsOptional()
  @IsString({ message: 'Teacher comments must be a string' })
  teacherComments?: string;

  @ApiPropertyOptional({
    description: 'Areas for improvement',
    example: ['time_management', 'detailed_explanations'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Improvement areas must be an array' })
  @IsString({ each: true, message: 'Each improvement area must be a string' })
  improvementAreas?: string[];

  @ApiPropertyOptional({
    description: 'Student strengths',
    example: ['problem_solving', 'conceptual_understanding'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Strengths must be an array' })
  @IsString({ each: true, message: 'Each strength must be a string' })
  strengths?: string[];
}

export class RequestReEvaluationDto {
  @ApiProperty({
    description: 'Exam Result ID',
    example: 'exam-result-uuid-123',
  })
  @IsNotEmpty({ message: 'Exam Result ID is required' })
  @IsString({ message: 'Exam Result ID must be a string' })
  examResultId: string;

  @ApiProperty({
    description: 'Reason for re-evaluation request',
    example: 'I believe there was an error in grading question 5',
  })
  @IsNotEmpty({ message: 'Reason is required' })
  @IsString({ message: 'Reason must be a string' })
  reason: string;
}