import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsEnum, IsString, IsUUID, MaxLength } from 'class-validator';

export enum NotificationType {
  ACADEMIC = 'academic',
  ATTENDANCE = 'attendance',
  ASSIGNMENT = 'assignment',
  APPOINTMENT = 'appointment',
  EVENT = 'event',
  ANNOUNCEMENT = 'announcement',
  EMERGENCY = 'emergency',
  SYSTEM = 'system',
  GRADE = 'grade',
  BEHAVIOR = 'behavior',
  FEE = 'fee',
  TRANSPORT = 'transport',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  CRITICAL = 'critical',
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export class NotificationPreferencesDto {
  @ApiProperty({
    description: 'Receive notifications via email',
    example: true,
  })
  @IsBoolean()
  email: boolean;

  @ApiProperty({
    description: 'Receive notifications via SMS',
    example: false,
  })
  @IsBoolean()
  sms: boolean;

  @ApiProperty({
    description: 'Receive push notifications',
    example: true,
  })
  @IsBoolean()
  push: boolean;

  @ApiProperty({
    description: 'Receive in-app notifications',
    example: true,
  })
  @IsBoolean()
  inApp: boolean;

  @ApiProperty({
    description: 'Academic-related notifications (grades, assignments)',
    example: true,
  })
  @IsBoolean()
  academic: boolean;

  @ApiProperty({
    description: 'Attendance-related notifications',
    example: true,
  })
  @IsBoolean()
  attendance: boolean;

  @ApiProperty({
    description: 'Assignment-related notifications',
    example: true,
  })
  @IsBoolean()
  assignments: boolean;

  @ApiProperty({
    description: 'Appointment-related notifications',
    example: true,
  })
  @IsBoolean()
  appointments: boolean;

  @ApiProperty({
    description: 'School event notifications',
    example: true,
  })
  @IsBoolean()
  events: boolean;

  @ApiProperty({
    description: 'General announcements',
    example: false,
  })
  @IsBoolean()
  announcements: boolean;

  @ApiProperty({
    description: 'Emergency notifications',
    example: true,
  })
  @IsBoolean()
  emergencies: boolean;

  @ApiProperty({
    description: 'Fee and payment notifications',
    example: true,
  })
  @IsBoolean()
  fees: boolean;

  @ApiProperty({
    description: 'Transportation-related notifications',
    example: false,
  })
  @IsBoolean()
  transport: boolean;

  @ApiProperty({
    description: 'Grade-related notifications',
    example: true,
  })
  @IsBoolean()
  grades: boolean;

  @ApiProperty({
    description: 'Behavioral notifications',
    example: true,
  })
  @IsBoolean()
  behavior: boolean;

  @ApiProperty({
    description: 'System maintenance notifications',
    example: false,
  })
  @IsBoolean()
  system: boolean;
}

export class NotificationResponseDto {
  @ApiProperty({
    description: 'Notification ID',
    example: 'notif-123',
  })
  id: string;

  @ApiProperty({
    description: 'Notification type',
    enum: NotificationType,
    example: NotificationType.ACADEMIC,
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Notification title',
    example: 'New Grade Posted',
  })
  title: string;

  @ApiProperty({
    description: 'Notification message',
    example: 'Your child received an A- in Mathematics',
  })
  message: string;

  @ApiProperty({
    description: 'Notification priority',
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @ApiProperty({
    description: 'Whether notification has been read',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Notification creation timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Notification read timestamp',
    example: '2024-08-29T10:45:00Z',
  })
  readAt?: Date;

  @ApiPropertyOptional({
    description: 'Action URL for notification',
    example: '/parent-portal/academic/grades/student-456',
  })
  actionUrl?: string;

  @ApiPropertyOptional({
    description: 'Notification expiration date',
    example: '2024-09-29T10:30:00Z',
  })
  expiresAt?: Date;

  @ApiPropertyOptional({
    description: 'Related entity information',
  })
  relatedEntity?: {
    type: string;
    id: string;
    name: string;
  };

  @ApiProperty({
    description: 'Delivery channels used',
    enum: NotificationChannel,
    example: [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
  })
  channels: NotificationChannel[];

  @ApiProperty({
    description: 'Delivery status for each channel',
    example: {
      email: 'delivered',
      in_app: 'delivered',
      sms: 'pending'
    },
  })
  deliveryStatus: Record<NotificationChannel, 'pending' | 'delivered' | 'failed'>;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  timestamp: Date;
}

export class NotificationFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by notification type',
    enum: NotificationType,
    example: NotificationType.ACADEMIC,
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    enum: NotificationPriority,
    example: NotificationPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({
    description: 'Filter by read status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by related student ID',
    example: 'student-456',
  })
  @IsOptional()
  @IsUUID()
  relatedStudentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by related staff ID',
    example: 'teacher-123',
  })
  @IsOptional()
  @IsUUID()
  relatedStaffId?: string;

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

  @ApiPropertyOptional({
    description: 'Search term for notification content',
    example: 'mathematics',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class EmergencyMessageDto {
  @ApiProperty({
    description: 'Emergency message subject',
    example: 'URGENT: Student Health Emergency',
  })
  @IsString()
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    description: 'Emergency message content',
    example: 'Please contact the school immediately regarding your child\'s health situation.',
  })
  @IsString()
  @MaxLength(1000)
  message: string;

  @ApiProperty({
    description: 'Emergency type',
    enum: ['health', 'safety', 'behavioral', 'academic', 'other'],
    example: 'health',
  })
  @IsEnum(['health', 'safety', 'behavioral', 'academic', 'other'])
  emergencyType: 'health' | 'safety' | 'behavioral' | 'academic' | 'other';

  @ApiProperty({
    description: 'Related student ID',
    example: 'student-456',
  })
  @IsUUID()
  studentId: string;

  @ApiProperty({
    description: 'Emergency contact priority',
    enum: ['immediate', 'urgent', 'routine'],
    example: 'immediate',
  })
  @IsEnum(['immediate', 'urgent', 'routine'])
  priority: 'immediate' | 'urgent' | 'routine';

  @ApiPropertyOptional({
    description: 'Additional emergency details',
    example: 'Student has reported severe headache and nausea',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;
}

export class EmergencyContactResponseDto {
  @ApiProperty({
    description: 'Emergency contact ID',
    example: 'contact-123',
  })
  id: string;

  @ApiProperty({
    description: 'Contact name',
    example: 'Dr. Sarah Johnson',
  })
  name: string;

  @ApiProperty({
    description: 'Contact relationship',
    example: 'School Nurse',
  })
  relationship: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+1-555-123-4567',
  })
  phone: string;

  @ApiPropertyOptional({
    description: 'Contact email',
    example: 'nurse@school.edu',
  })
  email?: string;

  @ApiProperty({
    description: 'Contact priority level',
    enum: ['primary', 'secondary', 'tertiary'],
    example: 'primary',
  })
  priority: 'primary' | 'secondary' | 'tertiary';

  @ApiProperty({
    description: 'Available hours',
    example: 'Mon-Fri 8:00-16:00',
  })
  availableHours: string;

  @ApiProperty({
    description: 'Emergency contact categories',
    example: ['health', 'safety'],
  })
  categories: string[];

  @ApiProperty({
    description: 'Contact is active',
    example: true,
  })
  isActive: boolean;
}

export class NotificationSettingsResponseDto {
  @ApiProperty({
    description: 'Parent ID',
    example: 'parent-123',
  })
  parentId: string;

  @ApiProperty({
    description: 'Notification preferences',
  })
  preferences: NotificationPreferencesDto;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  lastUpdated: Date;

  @ApiProperty({
    description: 'Settings update timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  timestamp: Date;
}