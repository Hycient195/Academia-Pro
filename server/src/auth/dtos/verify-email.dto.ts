// Academia Pro - Verify Email DTO
// Data Transfer Object for email verification

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IVerifyEmailRequest } from '../../../../common/src/types';

export class VerifyEmailDto implements IVerifyEmailRequest {
  @ApiProperty({
    description: 'Email verification token',
    example: 'abc123def456ghi789',
  })
  @IsString({ message: 'Token must be a string' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}