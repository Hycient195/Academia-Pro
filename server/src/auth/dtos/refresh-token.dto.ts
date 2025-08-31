// Academia Pro - Refresh Token DTO
// Data Transfer Object for token refresh

import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IRefreshTokenRequest } from '@academia-pro/common/auth';

export class RefreshTokenDto implements IRefreshTokenRequest {
  @ApiProperty({
    description: 'Refresh token for generating new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'Refresh token must be a string' })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refreshToken: string;
}