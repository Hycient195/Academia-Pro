// Academia Pro - Create School DTO
// Data Transfer Object for creating new schools

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsEmail, IsUrl, IsInt, Min, MaxLength, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateSchoolRequest, TSchoolType, IAddress } from '@academia-pro/common/schools';
import { Type } from 'class-transformer';

export class CreateSchoolDto {
  @ApiProperty({
    description: 'School name',
    example: 'Green Valley International School',
    maxLength: 255,
  })
  @IsString({ message: 'School name must be a string' })
  @IsNotEmpty({ message: 'School name is required' })
  @MaxLength(255, { message: 'School name cannot exceed 255 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Unique school code (auto-generated if not provided)',
    example: 'GVIS001',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'School code must be a string' })
  @MaxLength(100, { message: 'School code cannot exceed 100 characters' })
  code?: string;

  @ApiPropertyOptional({
    description: 'School description',
    example: 'A premier international school offering quality education',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'School type',
    example: 'mixed',
    enum: ['primary', 'secondary', 'mixed'],
  })
  @IsOptional()
  @IsEnum(TSchoolType, {
    message: 'School type must be one of: primary, secondary, mixed'
  })
  type?: TSchoolType;

  @ApiPropertyOptional({
    description: 'School phone number',
    example: '+1-555-0123',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone cannot exceed 20 characters' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'School email address',
    example: 'info@greenvalley.edu',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiPropertyOptional({
    description: 'School website URL',
    example: 'https://www.greenvalley.edu',
    format: 'url',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  website?: string;

  @ApiPropertyOptional({
    description: 'School address information',
    example: {
      street: '123 Education Street',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  address?: IAddress;

  @ApiPropertyOptional({
    description: 'Principal name',
    example: 'Dr. Sarah Johnson',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Principal name must be a string' })
  @MaxLength(255, { message: 'Principal name cannot exceed 255 characters' })
  principalName?: string;

  @ApiPropertyOptional({
    description: 'Principal phone number',
    example: '+1-555-0124',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Principal phone must be a string' })
  @MaxLength(20, { message: 'Principal phone cannot exceed 20 characters' })
  principalPhone?: string;

  @ApiPropertyOptional({
    description: 'Principal email address',
    example: 'principal@greenvalley.edu',
    format: 'email',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address for principal' })
  principalEmail?: string;

  @ApiPropertyOptional({
    description: 'Total number of students',
    example: 1200,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Total students must be an integer' })
  @Min(0, { message: 'Total students cannot be negative' })
  totalStudents?: number;

  @ApiPropertyOptional({
    description: 'Total number of teachers',
    example: 80,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Total teachers must be an integer' })
  @Min(0, { message: 'Total teachers cannot be negative' })
  totalTeachers?: number;

  @ApiPropertyOptional({
    description: 'Total number of staff',
    example: 120,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'Total staff must be an integer' })
  @Min(0, { message: 'Total staff cannot be negative' })
  totalStaff?: number;
}