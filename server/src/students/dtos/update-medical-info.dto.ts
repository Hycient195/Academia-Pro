// Academia Pro - Update Medical Info DTO
// Data Transfer Object for updating student medical information

import { IsOptional, IsArray, IsString, MaxLength, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IUpdateMedicalInfoRequest } from '../../../../common/src/types/student/student.types';

export class UpdateMedicalInfoDto implements IUpdateMedicalInfoRequest {
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
    description: 'Student medications',
    example: ['asthma inhaler', 'antihistamine'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Medications must be an array' })
  @IsString({ each: true, message: 'Each medication must be a string' })
  medications?: string[];

  @ApiPropertyOptional({
    description: 'Medical conditions',
    example: ['asthma', 'allergies'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Conditions must be an array' })
  @IsString({ each: true, message: 'Each condition must be a string' })
  conditions?: string[];

  @ApiPropertyOptional({
    description: 'Emergency contact information',
    example: {
      name: 'Jane Doe',
      phone: '+1234567891',
      relation: 'Mother',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Emergency contact must be an object' })
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };

  @ApiPropertyOptional({
    description: 'Doctor information',
    example: {
      name: 'Dr. Smith',
      phone: '+1234567892',
      clinic: 'City Medical Center',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Doctor info must be an object' })
  doctorInfo?: {
    name: string;
    phone: string;
    clinic: string;
  };

  @ApiPropertyOptional({
    description: 'Insurance information',
    example: {
      provider: 'Health Insurance Co.',
      policyNumber: 'POL123456',
      expiryDate: '2025-12-31',
    },
  })
  @IsOptional()
  @IsObject({ message: 'Insurance info must be an object' })
  insuranceInfo?: {
    provider: string;
    policyNumber: string;
    expiryDate: Date;
  };
}