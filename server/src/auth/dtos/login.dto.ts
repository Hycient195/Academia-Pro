// Academia Pro - Login DTO
// Data Transfer Object for user login

import { IsEmail, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ILoginRequest } from '@academia-pro/common/auth';

export class LoginDto implements ILoginRequest {
  @ApiProperty({
    description: 'User email address',
    example: 'user@school.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @ApiProperty({
    description: 'Remember user for extended session',
    example: true,
    required: false,
  })
  @IsOptional()
  rememberMe?: boolean;
}