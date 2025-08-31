// Academia Pro - School Filters DTO
// Data Transfer Object for school filtering and querying

import { IsOptional, IsString, IsEnum, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TSchoolType, TSchoolStatus, ISchoolFilters } from '@academia-pro/common/schools';
import { Type } from 'class-transformer';

export class SchoolFiltersDto implements ISchoolFilters {
  @ApiPropertyOptional({
    description: 'School type filter',
    enum: TSchoolType,
    example: TSchoolType.MIXED,
  })
  @IsOptional()
  @IsEnum(TSchoolType, { message: 'Invalid school type' })
  type?: TSchoolType;

  @ApiPropertyOptional({
    description: 'School status filter',
    enum: TSchoolStatus,
    example: TSchoolStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(TSchoolStatus, { message: 'Invalid school status' })
  status?: TSchoolStatus;

  @ApiPropertyOptional({
    description: 'City filter',
    example: 'Springfield',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  @MaxLength(100, { message: 'City cannot exceed 100 characters' })
  city?: string;

  @ApiPropertyOptional({
    description: 'State filter',
    example: 'IL',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'State must be a string' })
  @MaxLength(100, { message: 'State cannot exceed 100 characters' })
  state?: string;

  @ApiPropertyOptional({
    description: 'Country filter',
    example: 'USA',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  @MaxLength(100, { message: 'Country cannot exceed 100 characters' })
  country?: string;

  @ApiPropertyOptional({
    description: 'Established after date (YYYY-MM-DD)',
    example: '2000-01-01',
  })
  @IsOptional()
  @IsString({ message: 'Established after must be a date string' })
  establishedAfter?: string;

  @ApiPropertyOptional({
    description: 'Established before date (YYYY-MM-DD)',
    example: '2020-12-31',
  })
  @IsOptional()
  @IsString({ message: 'Established before must be a date string' })
  establishedBefore?: string;

  @ApiPropertyOptional({
    description: 'Minimum number of students',
    example: 100,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Minimum students must be an integer' })
  @Min(0, { message: 'Minimum students cannot be negative' })
  minStudents?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of students',
    example: 2000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Maximum students must be an integer' })
  @Min(0, { message: 'Maximum students cannot be negative' })
  maxStudents?: number;

  @ApiPropertyOptional({
    description: 'Facilities to filter by',
    example: ['wifi', 'library'],
    type: [String],
  })
  @IsOptional()
  @IsString({ each: true, message: 'Each facility must be a string' })
  hasFacilities?: string[];

  @ApiPropertyOptional({
    description: 'Search query for school name or code',
    example: 'Green Valley',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  @MaxLength(255, { message: 'Search query cannot exceed 255 characters' })
  search?: string;
}