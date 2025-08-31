// Academia Pro - Create User DTO
// Data Transfer Object for creating new users

import { IsEmail, IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, MinLength, MaxLength, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../../../../common/src/types/shared/types';
import { ICreateUserRequest } from '../../../../common/src/types/users';

export class CreateUserDto implements ICreateUserRequest {
  @ApiProperty({
    description: 'User email address',
    example: 'student@school.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiPropertyOptional({
    description: 'User password (required for registration)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsOptional()
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password?: string;

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
    description: 'User role',
    example: 'student',
    enum: ['super-admin', 'school-admin', 'teacher', 'student', 'parent'],
  })
  @IsOptional()
  @IsEnum(['super-admin', 'school-admin', 'teacher', 'student', 'parent'], {
    message: 'Role must be one of: super-admin, school-admin, teacher, student, parent'
  })
  role?: UserRole;

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
    description: 'User gender',
    example: 'male',
    enum: ['male', 'female', 'other'],
  })
  @IsOptional()
  @IsEnum(['male', 'female', 'other'], {
    message: 'Gender must be one of: male, female, other'
  })
  gender?: 'male' | 'female' | 'other';

  @ApiPropertyOptional({
    description: 'School ID for school-specific users',
    example: 'school-uuid-123',
  })
  @IsOptional()
  @IsString({ message: 'School ID must be a string' })
  schoolId?: string;

  @ApiPropertyOptional({
    description: 'User address information',
    example: {
      street: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'USA',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Address must be an object' })
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}