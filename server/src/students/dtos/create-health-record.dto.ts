// Academia Pro - Create Health Record DTO
// DTO for creating new student health records

import { IsNotEmpty, IsOptional, IsString, IsArray, IsObject, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmergencyContactDto {
  @ApiProperty({
    description: 'Emergency contact first name',
    example: 'Jane',
  })
  @IsNotEmpty({ message: 'Emergency contact first name is required' })
  @IsString({ message: 'Emergency contact first name must be a string' })
  firstName: string;

  @ApiProperty({
    description: 'Emergency contact last name',
    example: 'Doe',
  })
  @IsNotEmpty({ message: 'Emergency contact last name is required' })
  @IsString({ message: 'Emergency contact last name must be a string' })
  lastName: string;

  @ApiProperty({
    description: 'Emergency contact phone number',
    example: '+1234567890',
  })
  @IsNotEmpty({ message: 'Emergency contact phone is required' })
  @IsString({ message: 'Emergency contact phone must be a string' })
  phone: string;

  @ApiPropertyOptional({
    description: 'Emergency contact email address',
    example: 'emergency@example.com',
  })
  @IsOptional()
  @IsString({ message: 'Emergency contact email must be a string' })
  email?: string;

  @ApiProperty({
    description: 'Emergency contact relation to student',
    example: 'Mother',
  })
  @IsNotEmpty({ message: 'Emergency contact relation is required' })
  @IsString({ message: 'Emergency contact relation must be a string' })
  relation: string;
}

export class DoctorInfoDto {
  @ApiPropertyOptional({
    description: 'Doctor first name',
    example: 'John',
  })
  @IsOptional()
  @IsString({ message: 'Doctor first name must be a string' })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'Doctor last name',
    example: 'Smith',
  })
  @IsOptional()
  @IsString({ message: 'Doctor last name must be a string' })
  lastName?: string;

  @ApiPropertyOptional({
    description: 'Doctor phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Doctor phone must be a string' })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Clinic name',
    example: 'City Medical Center',
  })
  @IsOptional()
  @IsString({ message: 'Clinic name must be a string' })
  clinic?: string;

  @ApiPropertyOptional({
    description: 'Doctor occupation/specialty',
    example: 'Pediatrician',
  })
  @IsOptional()
  @IsString({ message: 'Doctor occupation must be a string' })
  occupation?: string;
}

export class InsuranceInfoDto {
  @ApiPropertyOptional({
    description: 'Insurance provider name',
    example: 'Health Insurance Corp',
  })
  @IsOptional()
  @IsString({ message: 'Insurance provider must be a string' })
  provider?: string;

  @ApiPropertyOptional({
    description: 'Insurance policy number',
    example: 'POL123456789',
  })
  @IsOptional()
  @IsString({ message: 'Policy number must be a string' })
  policyNumber?: string;

  @ApiPropertyOptional({
    description: 'Insurance expiry date',
    example: '2025-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Insurance expiry date must be a valid date' })
  expiryDate?: string;
}

export class CreateHealthRecordDto {
  @ApiPropertyOptional({
    description: 'Student allergies',
    example: ['peanuts', 'dust', 'pollen'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Allergies must be an array' })
  @IsString({ each: true, message: 'Each allergy must be a string' })
  allergies?: string[];

  @ApiPropertyOptional({
    description: 'Current medications',
    example: ['asthma inhaler', 'vitamin D'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Medications must be an array' })
  @IsString({ each: true, message: 'Each medication must be a string' })
  medications?: string[];

  @ApiPropertyOptional({
    description: 'Medical conditions',
    example: ['asthma', 'diabetes'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Conditions must be an array' })
  @IsString({ each: true, message: 'Each condition must be a string' })
  conditions?: string[];

  @ApiProperty({
    description: 'Emergency contact information',
    type: EmergencyContactDto,
  })
  @IsNotEmpty({ message: 'Emergency contact is required' })
  @IsObject({ message: 'Emergency contact must be an object' })
  emergencyContact: EmergencyContactDto;

  @ApiPropertyOptional({
    description: 'Doctor information',
    type: DoctorInfoDto,
  })
  @IsOptional()
  @IsObject({ message: 'Doctor info must be an object' })
  doctorInfo?: DoctorInfoDto;

  @ApiPropertyOptional({
    description: 'Insurance information',
    type: InsuranceInfoDto,
  })
  @IsOptional()
  @IsObject({ message: 'Insurance info must be an object' })
  insuranceInfo?: InsuranceInfoDto;

  @ApiPropertyOptional({
    description: 'Additional health notes',
    example: 'Student has seasonal allergies during spring',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}

export class UpdateHealthRecordDto {
  @ApiPropertyOptional({
    description: 'Student allergies',
    example: ['peanuts', 'dust', 'pollen'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Allergies must be an array' })
  @IsString({ each: true, message: 'Each allergy must be a string' })
  allergies?: string[];

  @ApiPropertyOptional({
    description: 'Current medications',
    example: ['asthma inhaler', 'vitamin D'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Medications must be an array' })
  @IsString({ each: true, message: 'Each medication must be a string' })
  medications?: string[];

  @ApiPropertyOptional({
    description: 'Medical conditions',
    example: ['asthma', 'diabetes'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Conditions must be an array' })
  @IsString({ each: true, message: 'Each condition must be a string' })
  conditions?: string[];

  @ApiPropertyOptional({
    description: 'Emergency contact information',
    type: EmergencyContactDto,
  })
  @IsOptional()
  @IsObject({ message: 'Emergency contact must be an object' })
  emergencyContact?: EmergencyContactDto;

  @ApiPropertyOptional({
    description: 'Doctor information',
    type: DoctorInfoDto,
  })
  @IsOptional()
  @IsObject({ message: 'Doctor info must be an object' })
  doctorInfo?: DoctorInfoDto;

  @ApiPropertyOptional({
    description: 'Insurance information',
    type: InsuranceInfoDto,
  })
  @IsOptional()
  @IsObject({ message: 'Insurance info must be an object' })
  insuranceInfo?: InsuranceInfoDto;

  @ApiPropertyOptional({
    description: 'Additional health notes',
    example: 'Student has seasonal allergies during spring',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;
}