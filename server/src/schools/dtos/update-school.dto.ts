// Academia Pro - Update School DTO
// Data Transfer Object for updating school information

import { IsString, IsNotEmpty, IsOptional, IsEnum, IsEmail, IsUrl, IsInt, Min, MaxLength, IsObject, ValidateNested, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IUpdateSchoolRequest } from '@academia-pro/types/super-admin';
import { TSchoolType } from '@academia-pro/types/schools';

export class UpdateSchoolDto implements IUpdateSchoolRequest {
  @ApiPropertyOptional({
    description: 'School name',
    example: 'Green Valley International School',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'School name must be a string' })
  @MaxLength(255, { message: 'School name cannot exceed 255 characters' })
  name?: string;

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
    description: 'School types (array of school types)',
    example: ['secondary', 'high_school'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Type must be an array' })
  type?: TSchoolType[];

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
    description: 'School address',
    example: '123 Education Street, Springfield, IL 62701, USA',
  })
  @IsOptional()
  @IsString({ message: 'Address must be a string' })
  address?: string;

  @ApiPropertyOptional({
    description: 'School city',
    example: 'Springfield',
  })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city?: string;

  @ApiPropertyOptional({
    description: 'School state',
    example: 'IL',
  })
  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state?: string;

  @ApiPropertyOptional({
    description: 'School country',
    example: 'USA',
  })
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country?: string;

  @ApiPropertyOptional({
    description: 'Subscription plan',
    example: 'premium',
  })
  @IsOptional()
  @IsString({ message: 'Subscription plan must be a string' })
  subscriptionPlan?: string;

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