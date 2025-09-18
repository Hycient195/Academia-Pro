import { PartialType } from '@nestjs/mapped-types';
import { CreateDelegatedSchoolAdminDto } from './create-delegated-school-admin.dto';
import { IsOptional, IsArray, IsString, IsDateString, IsEnum } from 'class-validator';
import { DelegatedSchoolAdminStatus } from '../entities/delegated-school-admin.entity';

export class UpdateDelegatedSchoolAdminDto extends PartialType(CreateDelegatedSchoolAdminDto) {
  // Additional update-specific fields
  @IsOptional()
  @IsEnum(DelegatedSchoolAdminStatus)
  status?: DelegatedSchoolAdminStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}