// Academia Pro - Create Notice DTO
// Data Transfer Object for notice/announcement creation

import { IsString, IsOptional, IsEnum, IsUUID, IsObject, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TNoticeType, TMessagePriority, ICreateNoticeRequest } from '../../../../common/src/types/communication/communication.types';

export class CreateNoticeDto implements ICreateNoticeRequest {
  @ApiProperty({
    description: 'School ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  schoolId: string;

  @ApiProperty({
    description: 'Notice type',
    enum: TNoticeType,
    example: 'announcement',
  })
  @IsEnum(TNoticeType)
  noticeType: TNoticeType;

  @ApiPropertyOptional({
    description: 'Notice priority',
    enum: TMessagePriority,
    default: TMessagePriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(TMessagePriority)
  priority?: TMessagePriority = TMessagePriority.NORMAL;

  @ApiProperty({
    description: 'Notice title',
    example: 'School Holiday Announcement',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notice content',
    example: 'School will be closed for winter holidays from Dec 20th to Jan 5th.',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Short summary of the notice',
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({
    description: 'Visibility level',
    default: 'public',
  })
  @IsOptional()
  visibilityLevel?: string = 'public';

  @ApiPropertyOptional({
    description: 'Target audience specification',
  })
  @IsOptional()
  @IsObject()
  targetAudience?: {
    allUsers?: boolean;
    specificRoles?: string[];
    specificGrades?: string[];
    specificSections?: string[];
    specificUsers?: string[];
  };

  @ApiPropertyOptional({
    description: 'Whether comments are allowed',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  allowComments?: boolean = true;

  @ApiPropertyOptional({
    description: 'Whether comments need moderation',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  moderateComments?: boolean = false;

  @ApiPropertyOptional({
    description: 'Whether to send notifications',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  sendNotifications?: boolean = true;

  @ApiPropertyOptional({
    description: 'Expiration date for the notice',
  })
  @IsOptional()
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Tags for categorization',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'File attachments',
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
  }>;

  @ApiPropertyOptional({
    description: 'Whether to publish immediately',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  publishImmediately?: boolean = false;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}