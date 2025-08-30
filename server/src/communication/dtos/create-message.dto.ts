// Academia Pro - Create Message DTO
// Data Transfer Object for message creation

import { IsString, IsOptional, IsEnum, IsArray, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MessageType, MessagePriority, RecipientType } from '../entities/message.entity';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Message subject',
    example: 'Important Announcement',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Message content',
    example: 'This is an important message for all students.',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    description: 'Type of message',
    enum: MessageType,
    default: MessageType.DIRECT,
  })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType = MessageType.DIRECT;

  @ApiPropertyOptional({
    description: 'Message priority',
    enum: MessagePriority,
    default: MessagePriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(MessagePriority)
  priority?: MessagePriority = MessagePriority.NORMAL;

  @ApiPropertyOptional({
    description: 'Recipient ID (for direct messages)',
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
    description: 'Recipient role',
  })
  @IsOptional()
  @IsString()
  recipientRole?: string;

  @ApiPropertyOptional({
    description: 'Recipient type',
    enum: RecipientType,
  })
  @IsOptional()
  @IsEnum(RecipientType)
  recipientType?: RecipientType;

  @ApiPropertyOptional({
    description: 'Group ID (for group messages)',
  })
  @IsOptional()
  @IsString()
  groupId?: string;

  @ApiPropertyOptional({
    description: 'Group name',
  })
  @IsOptional()
  @IsString()
  groupName?: string;

  @ApiPropertyOptional({
    description: 'List of recipients',
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  recipientsList?: Array<{
    id: string;
    name: string;
    role: string;
    type: RecipientType;
  }>;

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
    description: 'Whether to send notifications',
    default: true,
  })
  @IsOptional()
  sendNotifications?: boolean = true;

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