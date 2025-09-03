import { IsEmail, IsArray, IsString, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateDelegatedAccountDto {
  @IsEmail()
  email: string;

  @IsArray()
  @IsString({ each: true })
  permissions: string[]; // Array of permission names

  @IsDateString()
  expiryDate: string; // ISO date string

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsUUID()
  userId?: string; // If linking to existing user
}