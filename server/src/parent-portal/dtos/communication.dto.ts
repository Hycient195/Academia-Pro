import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsDateString, IsObject, IsBoolean, ValidateNested, IsNumber, Min, Max } from 'class-validator';
import {
  CommunicationCategory,
  CommunicationPriority,
  CommunicationType,
  CommunicationDirection,
  CommunicationStatus,
} from '../entities/communication-record.entity';
import {
  AppointmentType,
  AppointmentStatus,
  AppointmentPriority,
} from '../entities/appointment.entity';

// Request DTOs
export class SendMessageDto {
  @ApiPropertyOptional({
    description: 'Student ID if message is about a specific student',
    example: 'student-123',
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiProperty({
    description: 'Recipient ID (teacher, admin, etc.)',
    example: 'teacher-456',
  })
  @IsString()
  recipientId: string;

  @ApiProperty({
    description: 'Type of recipient',
    enum: ['teacher', 'admin', 'school'],
    example: 'teacher',
  })
  @IsEnum(['teacher', 'admin', 'school'])
  recipientType: 'teacher' | 'admin' | 'school';

  @ApiProperty({
    description: 'Message subject',
    example: 'Question about homework assignment',
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Could you please clarify the requirements for the math homework?',
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Message category',
    enum: CommunicationCategory,
    example: CommunicationCategory.ACADEMIC,
  })
  @IsOptional()
  @IsEnum(CommunicationCategory)
  category?: CommunicationCategory;

  @ApiPropertyOptional({
    description: 'Message priority',
    enum: CommunicationPriority,
    example: CommunicationPriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(CommunicationPriority)
  priority?: CommunicationPriority;

  @ApiPropertyOptional({
    description: 'File attachments',
    type: [Object],
  })
  @IsOptional()
  @IsArray()
  attachments?: Array<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
  }>;
}

export class RequestAppointmentDto {
  @ApiProperty({
    description: 'Student ID for the appointment',
    example: 'student-123',
  })
  @IsString()
  studentId: string;

  @ApiProperty({
    description: 'Type of appointment',
    enum: AppointmentType,
    example: AppointmentType.PARENT_TEACHER_CONFERENCE,
  })
  @IsEnum(AppointmentType)
  appointmentType: AppointmentType;

  @ApiProperty({
    description: 'Preferred appointment date and time',
    example: '2024-01-15T14:00:00Z',
  })
  @IsDateString()
  preferredDate: Date;

  @ApiPropertyOptional({
    description: 'Preferred time (if different from date)',
    example: '14:00',
  })
  @IsOptional()
  @IsString()
  preferredTime?: string;

  @ApiPropertyOptional({
    description: 'Expected duration in minutes',
    example: 30,
    minimum: 15,
    maximum: 120,
  })
  @IsOptional()
  @IsNumber()
  @Min(15)
  @Max(120)
  durationMinutes?: number;

  @ApiProperty({
    description: 'Appointment title',
    example: 'Discuss math performance',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Appointment description',
    example: 'Review recent test results and discuss improvement strategies',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Appointment urgency',
    enum: ['low', 'normal', 'high', 'urgent'],
    example: 'normal',
  })
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  urgency: 'low' | 'normal' | 'high' | 'urgent';

  @ApiProperty({
    description: 'Name of person requesting appointment',
    example: 'John Doe',
  })
  @IsString()
  requestedBy: string;

  @ApiPropertyOptional({
    description: 'Contact phone number',
    example: '+1-555-0123',
  })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiPropertyOptional({
    description: 'Special requirements or notes',
    example: 'Student has difficulty with fractions',
  })
  @IsOptional()
  @IsString()
  specialRequirements?: string;
}

// Query DTOs
export class MessageThreadsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by communication category',
    enum: CommunicationCategory,
  })
  @IsOptional()
  @IsEnum(CommunicationCategory)
  category?: CommunicationCategory;

  @ApiPropertyOptional({
    description: 'Filter by thread status',
    enum: ['active', 'archived', 'resolved'],
  })
  @IsOptional()
  @IsEnum(['active', 'archived', 'resolved'])
  status?: 'active' | 'archived' | 'resolved';

  @ApiPropertyOptional({
    description: 'Filter by specific student ID',
    example: 'student-123',
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Number of threads to retrieve',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class MessagesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by specific thread ID',
    example: 'math_homework_student-123',
  })
  @IsOptional()
  @IsString()
  threadId?: string;

  @ApiPropertyOptional({
    description: 'Number of messages to retrieve',
    example: 50,
    minimum: 1,
    maximum: 200,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({
    description: 'Start date for filtering messages',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering messages',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class AppointmentsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by specific student ID',
    example: 'student-123',
  })
  @IsOptional()
  @IsString()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by appointment status',
    enum: AppointmentStatus,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Start date for filtering',
    example: '2024-01-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    example: '2024-01-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Number of appointments to retrieve',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

export class AppointmentSlotsQueryDto {
  @ApiProperty({
    description: 'Start date for availability check',
    example: '2024-01-15',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'End date for availability check',
    example: '2024-01-21',
  })
  @IsDateString()
  endDate: string;
}

export class CommunicationStatsQueryDto {
  @ApiPropertyOptional({
    description: 'Time range for statistics',
    enum: ['week', 'month', 'quarter', 'year'],
    example: 'month',
  })
  @IsOptional()
  @IsEnum(['week', 'month', 'quarter', 'year'])
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
}

// Response DTOs
export class MessageThreadResponseDto {
  @ApiProperty({
    description: 'Thread ID',
    example: 'math_homework_student-123',
  })
  threadId: string;

  @ApiProperty({
    description: 'Thread participants',
    type: [Object],
  })
  participants: Array<{
    id: string;
    name: string;
    type: 'parent' | 'teacher' | 'admin' | 'system';
    avatar?: string;
  }>;

  @ApiProperty({
    description: 'Thread subject',
    example: 'Mathematics Homework Questions',
  })
  subject: string;

  @ApiProperty({
    description: 'Communication category',
    enum: CommunicationCategory,
  })
  category: CommunicationCategory;

  @ApiProperty({
    description: 'Message priority',
    enum: CommunicationPriority,
  })
  priority: CommunicationPriority;

  @ApiProperty({
    description: 'Thread status',
    enum: ['active', 'archived', 'resolved'],
  })
  status: 'active' | 'archived' | 'resolved';

  @ApiProperty({
    description: 'Last message in thread',
  })
  lastMessage: {
    content: string;
    senderId: string;
    senderName: string;
    timestamp: Date;
    isRead: boolean;
  };

  @ApiProperty({
    description: 'Total message count in thread',
    example: 5,
  })
  messageCount: number;

  @ApiProperty({
    description: 'Unread message count',
    example: 2,
  })
  unreadCount: number;

  @ApiProperty({
    description: 'Thread creation date',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Thread last update date',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Associated student ID',
    example: 'student-123',
  })
  studentId?: string;
}

export class MessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: 'msg-123',
  })
  messageId: string;

  @ApiProperty({
    description: 'Thread ID',
    example: 'math_homework_student-123',
  })
  threadId: string;

  @ApiProperty({
    description: 'Sender ID',
    example: 'parent-456',
  })
  senderId: string;

  @ApiProperty({
    description: 'Sender name',
    example: 'John Doe',
  })
  senderName: string;

  @ApiProperty({
    description: 'Sender type',
    enum: ['parent', 'teacher', 'admin', 'system'],
  })
  senderType: 'parent' | 'teacher' | 'admin' | 'system';

  @ApiProperty({
    description: 'Recipient ID',
    example: 'teacher-789',
  })
  recipientId: string;

  @ApiProperty({
    description: 'Recipient name',
    example: 'Ms. Johnson',
  })
  recipientName: string;

  @ApiProperty({
    description: 'Message subject',
    example: 'Question about algebra assignment',
  })
  subject: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Could you please explain problem #5?',
  })
  content: string;

  @ApiProperty({
    description: 'Communication type',
    enum: CommunicationType,
  })
  communicationType: CommunicationType;

  @ApiProperty({
    description: 'Communication category',
    enum: CommunicationCategory,
  })
  category: CommunicationCategory;

  @ApiProperty({
    description: 'Message priority',
    enum: CommunicationPriority,
  })
  priority: CommunicationPriority;

  @ApiProperty({
    description: 'Message status',
    enum: CommunicationStatus,
  })
  status: CommunicationStatus;

  @ApiProperty({
    description: 'Whether message has been read',
    example: true,
  })
  isRead: boolean;

  @ApiPropertyOptional({
    description: 'Date when message was read',
  })
  readAt?: Date;

  @ApiProperty({
    description: 'Message sent date',
  })
  sentAt: Date;

  @ApiPropertyOptional({
    description: 'File attachments',
    type: [Object],
  })
  attachments?: Array<{
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
  }>;

  @ApiPropertyOptional({
    description: 'Additional metadata',
  })
  metadata?: any;
}

export class SendMessageResponseDto {
  @ApiProperty({
    description: 'Message ID',
    example: 'msg-123',
  })
  messageId: string;

  @ApiProperty({
    description: 'Message status',
    example: 'sent',
  })
  status: string;

  @ApiProperty({
    description: 'Message sent timestamp',
  })
  sentAt: Date;
}

export class RequestAppointmentResponseDto {
  @ApiProperty({
    description: 'Appointment ID',
    example: 'appt-123',
  })
  appointmentId: string;

  @ApiProperty({
    description: 'Appointment status',
    example: 'requested',
  })
  status: string;

  @ApiProperty({
    description: 'Appointment request timestamp',
  })
  requestedAt: Date;

  @ApiProperty({
    description: 'Estimated response time',
    example: 'Within 24 hours',
  })
  estimatedResponseTime: string;
}

export class AppointmentSlotResponseDto {
  @ApiProperty({
    description: 'Date for the slots',
    example: '2024-01-15',
  })
  date: Date;

  @ApiProperty({
    description: 'Available time slots',
    type: [Object],
  })
  timeSlots: Array<{
    startTime: string;
    endTime: string;
    available: boolean;
    teacherId?: string;
    teacherName?: string;
  }>;
}

export class AppointmentResponseDto {
  @ApiProperty({
    description: 'Appointment ID',
    example: 'appt-123',
  })
  appointmentId: string;

  @ApiProperty({
    description: 'Student ID',
    example: 'student-456',
  })
  studentId: string;

  @ApiProperty({
    description: 'Appointment type',
    enum: AppointmentType,
  })
  appointmentType: AppointmentType;

  @ApiProperty({
    description: 'Appointment title',
    example: 'Discuss math performance',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Appointment description',
  })
  description?: string;

  @ApiProperty({
    description: 'Appointment date and time',
  })
  appointmentDate: Date;

  @ApiProperty({
    description: 'Duration in minutes',
    example: 30,
  })
  durationMinutes: number;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
  })
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Appointment priority',
    enum: AppointmentPriority,
  })
  priority: AppointmentPriority;

  @ApiPropertyOptional({
    description: 'Assigned teacher name',
  })
  teacherName?: string;

  @ApiPropertyOptional({
    description: 'Appointment location',
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  notes?: string;

  @ApiProperty({
    description: 'Appointment creation date',
  })
  createdAt: Date;
}

export class CommunicationStatsResponseDto {
  @ApiProperty({
    description: 'Total messages sent/received',
    example: 45,
  })
  totalMessages: number;

  @ApiProperty({
    description: 'Unread message count',
    example: 3,
  })
  unreadMessages: number;

  @ApiProperty({
    description: 'Messages sent today',
    example: 2,
  })
  sentToday: number;

  @ApiProperty({
    description: 'Messages received today',
    example: 1,
  })
  receivedToday: number;

  @ApiProperty({
    description: 'Active conversation threads',
    example: 8,
  })
  activeThreads: number;

  @ApiProperty({
    description: 'Average response time in hours',
    example: 4.2,
  })
  averageResponseTime: number;

  @ApiProperty({
    description: 'Messages by category',
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  communicationByCategory: Record<string, number>;

  @ApiProperty({
    description: 'Messages by type',
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  communicationByType: Record<string, number>;

  @ApiProperty({
    description: 'Top communication contacts',
    type: [Object],
  })
  topContacts: Array<{
    contactId: string;
    contactName: string;
    contactType: string;
    messageCount: number;
    lastContact: Date;
  }>;
}

export class CommunicationContactResponseDto {
  @ApiProperty({
    description: 'Contact ID',
    example: 'teacher-123',
  })
  contactId: string;

  @ApiProperty({
    description: 'Contact name',
    example: 'Ms. Johnson',
  })
  name: string;

  @ApiProperty({
    description: 'Contact type',
    enum: ['teacher', 'admin', 'counselor', 'nurse'],
  })
  type: 'teacher' | 'admin' | 'counselor' | 'nurse';

  @ApiProperty({
    description: 'Contact email',
    example: 'johnson@school.com',
  })
  email: string;

  @ApiProperty({
    description: 'Contact phone',
    example: '+1-555-0123',
  })
  phone: string;

  @ApiProperty({
    description: 'Subjects taught (for teachers)',
    type: [String],
    example: ['Mathematics', 'Algebra'],
  })
  subjects: string[];

  @ApiProperty({
    description: 'Whether this is a primary contact',
    example: true,
  })
  isPrimaryContact: boolean;

  @ApiProperty({
    description: 'Last contact date',
  })
  lastContact: Date;

  @ApiProperty({
    description: 'Typical response time',
    example: '2-4 hours',
  })
  responseTime: string;
}

export class EmergencyContactResponseDto {
  @ApiProperty({
    description: 'Emergency contact ID',
    example: 'nurse-001',
  })
  contactId: string;

  @ApiProperty({
    description: 'Contact name',
    example: 'Mrs. Wilson',
  })
  name: string;

  @ApiProperty({
    description: 'Emergency contact type',
    enum: ['nurse', 'counselor', 'security', 'admin'],
  })
  type: 'nurse' | 'counselor' | 'security' | 'admin';

  @ApiProperty({
    description: 'Emergency contact phone',
    example: '+1-555-0001',
  })
  phone: string;

  @ApiProperty({
    description: 'Emergency contact email',
    example: 'nurse@school.com',
  })
  email: string;

  @ApiProperty({
    description: 'Contact priority (1 = highest)',
    example: 1,
  })
  priority: number;

  @ApiProperty({
    description: 'Available hours',
    example: '8:00 AM - 4:00 PM',
  })
  availableHours: string;

  @ApiProperty({
    description: 'Emergency protocols',
    type: [String],
    example: ['Medical emergencies', 'Allergies', 'Injuries'],
  })
  emergencyProtocols: string[];
}

// List Response DTOs
export class MessageThreadsListResponseDto {
  @ApiProperty({
    description: 'Message threads',
    type: [MessageThreadResponseDto],
  })
  threads: MessageThreadResponseDto[];

  @ApiProperty({
    description: 'Total thread count',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Total unread messages',
    example: 5,
  })
  unreadCount: number;
}

export class MessagesListResponseDto {
  @ApiProperty({
    description: 'Messages',
    type: [MessageResponseDto],
  })
  messages: MessageResponseDto[];

  @ApiProperty({
    description: 'Total message count',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Unread message count',
    example: 3,
  })
  unreadCount: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Page size',
    example: 50,
  })
  limit: number;
}

export class AppointmentsListResponseDto {
  @ApiProperty({
    description: 'Appointments',
    type: [AppointmentResponseDto],
  })
  appointments: AppointmentResponseDto[];

  @ApiProperty({
    description: 'Total appointment count',
    example: 12,
  })
  total: number;

  @ApiProperty({
    description: 'Upcoming appointment count',
    example: 3,
  })
  upcomingCount: number;
}

// Index export
export * from './communication.dto';