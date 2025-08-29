// Academia Pro - Add Document DTO
// Data Transfer Object for adding documents to student records

import { IsString, IsNotEmpty, IsOptional, IsBoolean, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IAddDocumentRequest } from '../../../../common/src/types/student/student.types';

export class AddDocumentDto implements IAddDocumentRequest {
  @ApiProperty({
    description: 'Document type',
    example: 'birth_certificate',
    enum: [
      'birth_certificate',
      'transcript',
      'photo',
      'medical_certificate',
      'transfer_certificate',
      'character_certificate',
      'id_proof',
      'address_proof',
      'income_certificate',
      'caste_certificate',
      'disability_certificate',
      'other',
    ],
  })
  @IsString({ message: 'Document type must be a string' })
  @IsNotEmpty({ message: 'Document type is required' })
  type: string;

  @ApiProperty({
    description: 'Original file name',
    example: 'john_doe_birth_certificate.pdf',
    maxLength: 255,
  })
  @IsString({ message: 'File name must be a string' })
  @IsNotEmpty({ message: 'File name is required' })
  @MaxLength(255, { message: 'File name cannot exceed 255 characters' })
  fileName: string;

  @ApiProperty({
    description: 'File URL or path',
    example: 'https://storage.example.com/documents/john_doe_birth_certificate.pdf',
    maxLength: 500,
  })
  @IsString({ message: 'File URL must be a string' })
  @IsNotEmpty({ message: 'File URL is required' })
  @MaxLength(500, { message: 'File URL cannot exceed 500 characters' })
  fileUrl: string;

  @ApiPropertyOptional({
    description: 'Document verification status',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Verified must be a boolean' })
  verified?: boolean;

  @ApiPropertyOptional({
    description: 'Document description or notes',
    example: 'Original birth certificate issued by local municipality',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(500, { message: 'Description cannot exceed 500 characters' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Document expiry date (if applicable)',
    example: '2030-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsString({ message: 'Expiry date must be a string' })
  expiryDate?: string;
}