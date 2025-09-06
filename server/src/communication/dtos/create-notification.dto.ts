// Academia Pro - Create Notification DTO
// Data Transfer Object for notification creation

import { IsString, IsOptional, IsEnum, IsUUID, IsObject, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TNotificationType, TMessagePriority, ICreateNotificationRequest } from '@academia-pro/types/communication';

export class CreateNotificationDto implements ICreateNotificationRequest {
  @ApiProperty({
    description: 'School ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  schoolId: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Assignment Due Reminder',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Notification type',
    enum: TNotificationType,
    example: 'email',
  })
  @IsEnum(TNotificationType)
  type: TNotificationType;

  @ApiProperty({
    description: 'Notification type',
    enum: TNotificationType,
    example: 'email',
  })
  @IsEnum(TNotificationType)
  notificationType: TNotificationType;

  @ApiProperty({
    description: 'Notification category',
    example: 'academic',
  })
  category: string;

  @ApiPropertyOptional({
    description: 'Notification priority',
    enum: TMessagePriority,
    default: TMessagePriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(TMessagePriority)
  priority?: TMessagePriority = TMessagePriority.NORMAL;

  @ApiProperty({
    description: 'Notification subject/title',
    example: 'Assignment Due Reminder',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Notification message content',
    example: 'Your assignment is due tomorrow. Please submit it on time.',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Recipient ID',
  })
  @IsOptional()
  @IsString()
  recipientId?: string;

  @ApiPropertyOptional({
    description: 'Recipient name',
  })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({
    description: 'Recipient email (for email notifications)',
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({
    description: 'Recipient phone number (for SMS notifications)',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Device token (for push notifications)',
  })
  @IsOptional()
  @IsString()
  deviceToken?: string;

  @ApiPropertyOptional({
    description: 'WhatsApp number',
  })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiPropertyOptional({
    description: 'Telegram chat ID',
  })
  @IsOptional()
  @IsString()
  telegramChatId?: string;

  @ApiPropertyOptional({
    description: 'User preferences for notification delivery',
  })
  @IsOptional()
  @IsObject()
  userPreferences?: {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
    whatsappEnabled?: boolean;
    telegramEnabled?: boolean;
  };

  @ApiPropertyOptional({
    description: 'Whether to schedule the notification',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isScheduled?: boolean = false;

  @ApiPropertyOptional({
    description: 'Scheduled send date',
  })
  @IsOptional()
  scheduledSendAt?: Date;

  @ApiPropertyOptional({
    description: 'Template ID to use',
  })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}