import { IsNotEmpty, IsOptional, IsString, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ICreateDepartmentRequest, EDepartmentType } from '@academia-pro/types/staff';

export class CreateDepartmentDto implements ICreateDepartmentRequest {
  @ApiProperty({
    description: 'Department type',
    example: EDepartmentType.TEACHING,
    enum: EDepartmentType,
  })
  @IsNotEmpty({ message: 'Department type is required' })
  @IsEnum(EDepartmentType, { message: 'Invalid department type' })
  type: EDepartmentType;

  @ApiProperty({
    description: 'Department name',
    example: 'Mathematics Department',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Department name is required' })
  @IsString({ message: 'Department name must be a string' })
  @MaxLength(100, { message: 'Department name cannot exceed 100 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Department description',
    example: 'Responsible for teaching mathematics to students from grades 1-12',
  })
  @IsOptional()
  @IsString({ message: 'Department description must be a string' })
  description?: string;
}