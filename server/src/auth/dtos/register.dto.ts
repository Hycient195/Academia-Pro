// Academia Pro - Register DTO
// Data Transfer Object for user registration

import { IsEmail, IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IRegisterRequest } from '@academia-pro/types/auth';
import { EUserRole } from '@academia-pro/types/users';

export class RegisterDto implements IRegisterRequest {
  @ApiProperty({
    description: 'User email address',
    example: 'student@school.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name is required' })
  @MinLength(1, { message: 'First name cannot be empty' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
  })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name is required' })
  @MinLength(1, { message: 'Last name cannot be empty' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  lastName: string;

  @ApiPropertyOptional({
    description: 'User middle name',
    example: 'Michael',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Middle name must be a string' })
  @MaxLength(50, { message: 'Middle name cannot exceed 50 characters' })
  middleName?: string;

  @ApiPropertyOptional({
    description: 'User roles',
    example: ['student'],
    type: [String],
    enum: ['super-admin', 'delegated-super-admin', 'school-admin', 'delegated-school-admin', 'staff', 'student', 'parent'],
  })
  @IsOptional()
  roles?: EUserRole[];

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Phone must be a string' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'User date of birth',
    example: '2000-01-15',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: string;

  @ApiPropertyOptional({
    description: 'School ID for school-specific users',
    example: 'school-uuid-123',
  })
  @IsOptional()
  @IsString({ message: 'School ID must be a string' })
  schoolId?: string;
}