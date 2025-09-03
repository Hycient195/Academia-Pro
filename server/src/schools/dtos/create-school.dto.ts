// Academia Pro - Create School DTO
// Data Transfer Object for creating new schools

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsEmail, IsUrl, IsInt, Min, MaxLength, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateSchoolRequest, TSchoolType } from '@academia-pro/common/super-admin';
import { Type } from 'class-transformer';

export class CreateSchoolDto implements ICreateSchoolRequest {
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

  @ApiProperty({
    description: 'School type',
    example: 'mixed',
    enum: TSchoolType,
  })
  @IsNotEmpty({ message: 'School type is required' })
  @IsEnum(TSchoolType, { message: 'Invalid school type' })
  type: TSchoolType;

  @ApiProperty({
    description: 'School phone number',
    example: '+1-555-0123',
    maxLength: 20,
  })
  @IsString({ message: 'Phone must be a string' })
  @MaxLength(20, { message: 'Phone cannot exceed 20 characters' })
  @IsNotEmpty({ message: 'School phone is required' })
  phone: string;

  @ApiProperty({
    description: 'School email address',
    example: 'info@greenvalley.edu',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'School email is required' })
  email: string;

  @ApiPropertyOptional({
    description: 'School website URL',
    example: 'https://www.greenvalley.edu',
    format: 'url',
  })
  @IsOptional()
  @IsUrl({}, { message: 'Please provide a valid URL' })
  website?: string;

  @ApiProperty({
    description: 'School address',
    example: '123 Education Street, Springfield, IL 62701, USA',
  })
  @IsString({ message: 'Address must be a string' })
  @IsNotEmpty({ message: 'School address is required' })
  address: string;

  @ApiProperty({
    description: 'School city',
    example: 'Springfield',
  })
  @IsString({ message: 'City must be a string' })
  @IsNotEmpty({ message: 'School city is required' })
  city: string;

  @ApiProperty({
    description: 'School state',
    example: 'IL',
  })
  @IsString({ message: 'State must be a string' })
  @IsNotEmpty({ message: 'School state is required' })
  state: string;

  @ApiProperty({
    description: 'School country',
    example: 'USA',
  })
  @IsString({ message: 'Country must be a string' })
  @IsNotEmpty({ message: 'School country is required' })
  country: string;

  @ApiProperty({
    description: 'Subscription plan',
    example: 'premium',
  })
  @IsString({ message: 'Subscription plan must be a string' })
  @IsNotEmpty({ message: 'Subscription plan is required' })
  subscriptionPlan: string;

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