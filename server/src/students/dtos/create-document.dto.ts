// Academia Pro - Create Document DTO
// DTO for creating new student documents

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsBoolean, IsArray, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DocumentType } from '../entities/student-document.entity';

export class CreateDocumentDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @IsNotEmpty({ message: 'Student ID is required' })
  @IsString({ message: 'Student ID must be a string' })
  studentId: string;

  @ApiProperty({
    description: 'Type of document',
    example: DocumentType.BIRTH_CERTIFICATE,
    enum: DocumentType,
  })
  @IsNotEmpty({ message: 'Document type is required' })
  @IsEnum(DocumentType, { message: 'Invalid document type' })
  documentType: DocumentType;

  @ApiProperty({
    description: 'Document name',
    example: 'Birth Certificate',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Document name is required' })
  @IsString({ message: 'Document name must be a string' })
  @MaxLength(200, { message: 'Document name cannot exceed 200 characters' })
  documentName: string;

  @ApiPropertyOptional({
    description: 'Document description',
    example: 'Official birth certificate issued by local authorities',
  })
  @IsOptional()
  @IsString({ message: 'Document description must be a string' })
  documentDescription?: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'birth_certificate.pdf',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Original file name is required' })
  @IsString({ message: 'Original file name must be a string' })
  @MaxLength(255, { message: 'Original file name cannot exceed 255 characters' })
  originalFileName: string;

  @ApiProperty({
    description: 'File URL',
    example: 'https://storage.example.com/documents/birth_cert_123.pdf',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'File URL is required' })
  @IsString({ message: 'File URL must be a string' })
  @MaxLength(500, { message: 'File URL cannot exceed 500 characters' })
  fileUrl: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 2048576,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'File size is required' })
  @IsNumber({}, { message: 'File size must be a number' })
  @Min(1, { message: 'File size must be at least 1 byte' })
  fileSizeBytes: number;

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'MIME type is required' })
  @IsString({ message: 'MIME type must be a string' })
  @MaxLength(100, { message: 'MIME type cannot exceed 100 characters' })
  mimeType: string;

  @ApiPropertyOptional({
    description: 'Document number',
    example: 'BC123456789',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Document number must be a string' })
  @MaxLength(100, { message: 'Document number cannot exceed 100 characters' })
  documentNumber?: string;

  @ApiPropertyOptional({
    description: 'Issuing authority',
    example: 'Local Civil Registry',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Issuing authority must be a string' })
  @MaxLength(200, { message: 'Issuing authority cannot exceed 200 characters' })
  issuingAuthority?: string;

  @ApiPropertyOptional({
    description: 'Issue date',
    example: '2020-03-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Issue date must be a valid date' })
  issueDate?: string;

  @ApiPropertyOptional({
    description: 'Expiry date',
    example: '2030-03-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiry date must be a valid date' })
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Whether verification is required',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Verification required must be a boolean' })
  verificationRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the document is confidential',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Confidential must be a boolean' })
  isConfidential?: boolean;

  @ApiPropertyOptional({
    description: 'Allowed roles for access',
    example: ['admin', 'teacher', 'parent'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Allowed roles must be an array' })
  @IsString({ each: true, message: 'Each role must be a string' })
  allowedRoles?: string[];
}

export class UpdateDocumentDto {
  @ApiPropertyOptional({
    description: 'Document name',
    example: 'Birth Certificate',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Document name must be a string' })
  @MaxLength(200, { message: 'Document name cannot exceed 200 characters' })
  documentName?: string;

  @ApiPropertyOptional({
    description: 'Document description',
    example: 'Official birth certificate issued by local authorities',
  })
  @IsOptional()
  @IsString({ message: 'Document description must be a string' })
  documentDescription?: string;

  @ApiPropertyOptional({
    description: 'Document status',
    example: 'verified',
    enum: ['pending', 'submitted', 'under_review', 'verified', 'rejected', 'expired', 'archived'],
  })
  @IsOptional()
  @IsEnum(['pending', 'submitted', 'under_review', 'verified', 'rejected', 'expired', 'archived'], { message: 'Invalid document status' })
  status?: string;

  @ApiPropertyOptional({
    description: 'Document number',
    example: 'BC123456789',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Document number must be a string' })
  @MaxLength(100, { message: 'Document number cannot exceed 100 characters' })
  documentNumber?: string;

  @ApiPropertyOptional({
    description: 'Issuing authority',
    example: 'Local Civil Registry',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Issuing authority must be a string' })
  @MaxLength(200, { message: 'Issuing authority cannot exceed 200 characters' })
  issuingAuthority?: string;

  @ApiPropertyOptional({
    description: 'Issue date',
    example: '2020-03-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Issue date must be a valid date' })
  issueDate?: string;

  @ApiPropertyOptional({
    description: 'Expiry date',
    example: '2030-03-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Expiry date must be a valid date' })
  expiryDate?: string;

  @ApiPropertyOptional({
    description: 'Whether the document is confidential',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Confidential must be a boolean' })
  isConfidential?: boolean;

  @ApiPropertyOptional({
    description: 'Allowed roles for access',
    example: ['admin', 'teacher', 'parent'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Allowed roles must be an array' })
  @IsString({ each: true, message: 'Each role must be a string' })
  allowedRoles?: string[];
}