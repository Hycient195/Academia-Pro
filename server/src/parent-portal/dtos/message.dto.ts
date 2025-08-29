import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsArray, IsOptional, MaxLength, IsUUID } from 'class-validator';

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  ARCHIVED = 'archived',
}

export enum MessageType {
  GENERAL = 'general',
  ACADEMIC = 'academic',
  BEHAVIORAL = 'behavioral',
  EMERGENCY = 'emergency',
  APPOINTMENT = 'appointment',
}

export class AttachmentDto {
  @ApiProperty({
    description: 'Original filename',
    example: 'homework.pdf',
  })
  @IsString()
  filename: string;

  @ApiProperty({
    description: 'File MIME type',
    example: 'application/pdf',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  size: number;

  @ApiProperty({
    description: 'File URL for download',
    example: 'https://storage.example.com/attachments/homework.pdf',
  })
  @IsString()
  url: string;
}

export class CreateMessageDto {
  @ApiProperty({
    description: 'Recipient ID (teacher or staff member)',
    example: 'teacher-123',
  })
  @IsNotEmpty()
  @IsUUID()
  recipientId: string;

  @ApiProperty({
    description: 'Message subject',
    example: 'Question about Math homework',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hi, I wanted to ask about the math homework due tomorrow...',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  message: string;

  @ApiPropertyOptional({
    description: 'Message priority level',
    enum: MessagePriority,
    example: MessagePriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(MessagePriority)
  priority?: MessagePriority;

  @ApiPropertyOptional({
    description: 'Message type/category',
    enum: MessageType,
    example: MessageType.ACADEMIC,
  })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @ApiPropertyOptional({
    description: 'Related student ID (if message is about a specific student)',
    example: 'student-456',
  })
  @IsOptional()
  @IsUUID()
  relatedStudentId?: string;

  @ApiPropertyOptional({
    description: 'File attachments',
    type: [AttachmentDto],
  })
  @IsOptional()
  @IsArray()
  attachments?: AttachmentDto[];
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: 'msg-123',
  })
  id: string;

  @ApiProperty({
    description: 'Conversation thread ID',
    example: 'conv-456',
  })
  conversationId: string;

  @ApiProperty({
    description: 'Sender information',
  })
  sender: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };

  @ApiProperty({
    description: 'Recipient information',
  })
  recipient: {
    id: string;
    name: string;
    role: string;
    department?: string;
  };

  @ApiProperty({
    description: 'Message subject',
    example: 'Question about Math homework',
  })
  subject: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hi, I wanted to ask about the math homework due tomorrow...',
  })
  message: string;

  @ApiProperty({
    description: 'Message priority',
    enum: MessagePriority,
    example: MessagePriority.NORMAL,
  })
  priority: MessagePriority;

  @ApiProperty({
    description: 'Message type',
    enum: MessageType,
    example: MessageType.ACADEMIC,
  })
  messageType: MessageType;

  @ApiProperty({
    description: 'Message status',
    enum: MessageStatus,
    example: MessageStatus.SENT,
  })
  status: MessageStatus;

  @ApiProperty({
    description: 'Message sent timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  sentAt: Date;

  @ApiPropertyOptional({
    description: 'Message read timestamp',
    example: '2024-08-29T10:45:00Z',
  })
  readAt?: Date;

  @ApiPropertyOptional({
    description: 'Related student information',
  })
  relatedStudent?: {
    id: string;
    name: string;
    grade: string;
  };

  @ApiProperty({
    description: 'File attachments',
    type: [AttachmentDto],
  })
  attachments: AttachmentDto[];

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  timestamp: Date;
}

export class ConversationResponseDto {
  @ApiProperty({
    description: 'Conversation ID',
    example: 'conv-456',
  })
  id: string;

  @ApiProperty({
    description: 'Conversation participants',
  })
  participants: Array<{
    id: string;
    name: string;
    role: string;
  }>;

  @ApiProperty({
    description: 'Conversation subject',
    example: 'Math homework questions',
  })
  subject: string;

  @ApiProperty({
    description: 'Last message preview',
    example: 'Thank you for the clarification...',
  })
  lastMessage: string;

  @ApiProperty({
    description: 'Last message timestamp',
    example: '2024-08-29T10:45:00Z',
  })
  lastMessageAt: Date;

  @ApiProperty({
    description: 'Unread message count',
    example: 2,
  })
  unreadCount: number;

  @ApiProperty({
    description: 'Total message count',
    example: 5,
  })
  totalMessages: number;

  @ApiProperty({
    description: 'Related student (if applicable)',
  })
  relatedStudent?: {
    id: string;
    name: string;
  };

  @ApiProperty({
    description: 'Conversation creation timestamp',
    example: '2024-08-25T09:00:00Z',
  })
  createdAt: Date;
}

export class MessageFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by message status',
    enum: MessageStatus,
    example: MessageStatus.SENT,
  })
  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @ApiPropertyOptional({
    description: 'Filter by message priority',
    enum: MessagePriority,
    example: MessagePriority.HIGH,
  })
  @IsOptional()
  @IsEnum(MessagePriority)
  priority?: MessagePriority;

  @ApiPropertyOptional({
    description: 'Filter by message type',
    enum: MessageType,
    example: MessageType.ACADEMIC,
  })
  @IsOptional()
  @IsEnum(MessageType)
  messageType?: MessageType;

  @ApiPropertyOptional({
    description: 'Filter by recipient ID',
    example: 'teacher-123',
  })
  @IsOptional()
  @IsUUID()
  recipientId?: string;

  @ApiPropertyOptional({
    description: 'Filter by related student ID',
    example: 'student-456',
  })
  @IsOptional()
  @IsUUID()
  relatedStudentId?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering',
    example: '2024-08-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    example: '2024-08-29',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}