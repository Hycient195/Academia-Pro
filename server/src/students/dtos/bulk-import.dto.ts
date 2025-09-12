// Academia Pro - Bulk Import DTOs
// Data Transfer Objects for bulk student import operations

import { IsString, IsNotEmpty, IsOptional, IsArray, IsObject, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IStudentImportData } from '@academia-pro/types/student';

export class BulkImportRequestDto {
  @ApiProperty({
    description: 'School ID for the import',
    example: 'school-uuid-123',
  })
  @IsUUID('4', { message: 'School ID must be a valid UUID' })
  @IsNotEmpty({ message: 'School ID is required' })
  schoolId: string;

  @ApiPropertyOptional({
    description: 'CSV or Excel file data as array of student records',
    example: [{
      FirstName: 'John',
      LastName: 'Doe',
      DateOfBirth: '2005-03-15',
      Gender: 'male',
      AdmissionNumber: 'ADM20240001',
      Stage: 'PRY',
      GradeCode: 'PRY1',
      StreamSection: 'A',
      AdmissionDate: '2024-08-01',
      EnrollmentType: 'regular'
    }],
  })
  @IsArray({ message: 'Data must be an array of student records' })
  @IsOptional()
  data?: IStudentImportData[];
}

export class BulkImportResultDto {
  @ApiProperty({
    description: 'Total number of records processed',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Number of successfully imported students',
    example: 85,
  })
  successful: number;

  @ApiProperty({
    description: 'Number of failed imports',
    example: 15,
  })
  failed: number;

  @ApiProperty({
    description: 'Import errors with details',
    example: [{
      row: 5,
      field: 'email',
      message: 'Invalid email format',
      data: {}
    }],
  })
  errors: Array<{
    row: number;
    field: string;
    message: string;
    data: Partial<IStudentImportData>;
  }>;

  @ApiProperty({
    description: 'Preview of import data with validation results',
    example: [{
      row: 1,
      data: {},
      valid: true,
      errors: []
    }],
  })
  preview: Array<{
    row: number;
    data: IStudentImportData;
    valid: boolean;
    errors: string[];
  }>;
}