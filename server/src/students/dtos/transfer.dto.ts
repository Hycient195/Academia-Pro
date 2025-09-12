// Academia Pro - Transfer DTOs
// Data Transfer Objects for student transfer operations

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

interface ITransferStudentRequest {
  studentId: string;
  newGradeCode?: string;
  newStreamSection?: string;
  reason?: string;
  effectiveDate?: string;
  type?: 'internal' | 'external';
  targetSchoolId?: string;
}

interface ITransferResult {
  success: boolean;
  studentId: string;
  message: string;
  transferId?: string;
}

export class TransferStudentRequestDto implements ITransferStudentRequest {
  @ApiProperty({
    description: 'Student ID to transfer',
    example: 'student-uuid-123',
  })
  @IsUUID('4', { message: 'Student ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Student ID is required' })
  studentId: string;

  @ApiPropertyOptional({
    description: 'New grade code for internal transfer',
    example: 'JSS2',
  })
  @IsOptional()
  @IsString({ message: 'Grade code must be a string' })
  newGradeCode?: string;

  @ApiPropertyOptional({
    description: 'New stream section',
    example: 'A',
  })
  @IsOptional()
  @IsString({ message: 'Stream section must be a string' })
  newStreamSection?: string;

  @ApiPropertyOptional({
    description: 'Reason for transfer',
    example: 'Academic performance improvement',
  })
  @IsOptional()
  @IsString({ message: 'Reason must be a string' })
  reason?: string;

  @ApiPropertyOptional({
    description: 'Effective date of transfer',
    example: '2024-08-01',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Effective date must be a valid date' })
  effectiveDate?: string;

  @ApiPropertyOptional({
    description: 'Transfer type',
    example: 'internal',
    enum: ['internal', 'external'],
  })
  @IsOptional()
  @IsEnum(['internal', 'external'], {
    message: 'Transfer type must be either internal or external'
  })
  type?: 'internal' | 'external';

  @ApiPropertyOptional({
    description: 'Target school ID for external transfer',
    example: 'school-uuid-456',
  })
  @IsOptional()
  @IsUUID('4', { message: 'Target school ID must be a valid UUID' })
  targetSchoolId?: string;
}

export class TransferResultDto implements ITransferResult {
  @ApiProperty({
    description: 'Whether the transfer was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Student ID that was transferred',
    example: 'student-uuid-123',
  })
  studentId: string;

  @ApiProperty({
    description: 'Result message',
    example: 'Student transferred successfully',
  })
  message: string;

  @ApiPropertyOptional({
    description: 'Transfer record ID',
    example: 'transfer-uuid-789',
  })
  transferId?: string;
}