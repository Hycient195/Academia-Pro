// Academia Pro - Create Template DTO
// Data Transfer Object for communication template creation

import { IsString, IsOptional, IsEnum, IsUUID, IsObject, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TemplateType, TemplateStatus, TemplateCategory } from '../entities/template.entity';

export class CreateTemplateDto {
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
    enum: TemplateType,
    example: 'email',
  })
  @IsEnum(TemplateType)
  templateType: TemplateType;

  @ApiPropertyOptional({
    description: 'Template category',
    enum: TemplateCategory,
  })
  @IsOptional()
  @IsEnum(TemplateCategory)
  category?: TemplateCategory;

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
    description: 'Template variables definition',
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  variables?: Array<{
    name: string;
    type: 'string' | 'number' | 'date' | 'boolean';
    description: string;
    required: boolean;
    defaultValue?: any;
  }>;

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