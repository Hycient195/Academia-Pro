import { IsEmail, IsArray, IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateDelegatedSchoolAdminDto {
  // For creating new user
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  // For selecting existing user
  @IsOptional()
  @IsUUID()
  userId?: string;

  // School ID (required for delegated school admin)
  @IsUUID()
  schoolId: string;

  // Permissions
  @IsArray()
  @IsString({ each: true })
  permissions: string[]; // Array of permission names

  // Expiry options
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string; // Optional - for backward compatibility, can be undefined for infinite accounts

  // Notes
  @IsOptional()
  @IsString()
  notes?: string;
}