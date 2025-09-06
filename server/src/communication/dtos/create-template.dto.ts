// Academia Pro - Create Template DTO
// Data Transfer Object for communication template creation

import { IsString, IsOptional, IsEnum, IsUUID, IsObject, IsBoolean, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TTemplateType, ICreateTemplateRequest } from '@academia-pro/types/communication';

export class TemplateVariableDto {
  @ApiProperty({
    description: 'Variable name',
    example: 'studentName',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Variable type',
    enum: ['string', 'number', 'date', 'boolean'],
    example: 'string',
  })
  @IsEnum(['string', 'number', 'date', 'boolean'])
  type: 'string' | 'number' | 'date' | 'boolean';

  @ApiProperty({
    description: 'Variable description',
    example: 'Name of the student',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Whether the variable is required',
    example: true,
  })
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional({
    description: 'Default value for the variable',
  })
  @IsOptional()
  defaultValue?: any;
}

export class CreateTemplateDto implements ICreateTemplateRequest {
  @ApiProperty({
    description: 'School ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  schoolId: string;

  @ApiProperty({
    description: 'Template name',
    example: 'Assignment Reminder',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Template description',
    example: 'Template for reminding students about upcoming assignments',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Template type',
    enum: TTemplateType,
    example: 'email',
  })
  @IsEnum(TTemplateType)
  templateType: TTemplateType;

  @ApiPropertyOptional({
    description: 'Template category',
  })
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Subject template with variables',
    example: 'Assignment Due: {{assignmentName}}',
  })
  @IsString()
  subjectTemplate: string;

  @ApiProperty({
    description: 'Content template with variables',
    example: 'Dear {{studentName}}, your assignment "{{assignmentName}}" is due on {{dueDate}}. Please submit it before the deadline.',
  })
  @IsString()
  contentTemplate: string;

  @ApiPropertyOptional({
    description: 'Short content template for SMS/push notifications',
  })
  @IsOptional()
  @IsString()
  shortContentTemplate?: string;

  @ApiPropertyOptional({
    description: 'HTML template for email notifications',
  })
  @IsOptional()
  @IsString()
  htmlTemplate?: string;

  @ApiPropertyOptional({
    description: 'Template variables',
    type: [TemplateVariableDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TemplateVariableDto)
  variables?: TemplateVariableDto[];

  @ApiPropertyOptional({
    description: 'Whether the template is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiPropertyOptional({
    description: 'Template tags for organization',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Template preview data for testing',
  })
  @IsOptional()
  @IsObject()
  previewData?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}