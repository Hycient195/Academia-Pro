import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  MaxLength,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export enum AppointmentType {
  PARENT_TEACHER = 'parent_teacher',
  PARENT_COUNSELOR = 'parent_counselor',
  PARENT_PRINCIPAL = 'parent_principal',
  PARENT_SPECIALIST = 'parent_specialist',
  GROUP_MEETING = 'group_meeting',
  IEP_MEETING = 'iep_meeting',
  DISCIPLINARY = 'disciplinary',
  ACADEMIC_REVIEW = 'academic_review',
}

export enum AppointmentStatus {
  REQUESTED = 'requested',
  CONFIRMED = 'confirmed',
  RESCHEDULED = 'rescheduled',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
}

export enum MeetingFormat {
  IN_PERSON = 'in_person',
  VIRTUAL = 'virtual',
  PHONE = 'phone',
}

export class VirtualMeetingDetails {
  @ApiProperty({
    description: 'Meeting platform',
    example: 'Zoom',
  })
  platform: string;

  @ApiProperty({
    description: 'Meeting URL',
    example: 'https://zoom.us/j/123456789',
  })
  meetingUrl: string;

  @ApiProperty({
    description: 'Meeting ID',
    example: '123-456-789',
  })
  meetingId: string;

  @ApiProperty({
    description: 'Meeting password',
    example: 'abc123',
  })
  password: string;

  @ApiProperty({
    description: 'Dial-in numbers',
    example: '+1-555-123-4567',
  })
  dialInNumber?: string;
}

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Student ID for the appointment',
    example: 'student-456',
  })
  @IsNotEmpty()
  @IsUUID()
  studentId: string;

  @ApiProperty({
    description: 'Teacher or staff member ID',
    example: 'teacher-123',
  })
  @IsNotEmpty()
  @IsUUID()
  staffId: string;

  @ApiProperty({
    description: 'Appointment title',
    example: 'Parent-Teacher Conference',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiPropertyOptional({
    description: 'Appointment description',
    example: 'Discussing student progress in mathematics',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Requested date for appointment',
    example: '2024-09-15',
  })
  @IsNotEmpty()
  @IsDateString()
  requestedDate: string;

  @ApiProperty({
    description: 'Requested time for appointment (HH:mm format)',
    example: '14:30',
  })
  @IsNotEmpty()
  @IsString()
  requestedTime: string;

  @ApiPropertyOptional({
    description: 'Appointment duration in minutes',
    example: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(120)
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Appointment type',
    enum: AppointmentType,
    example: AppointmentType.PARENT_TEACHER,
  })
  @IsOptional()
  @IsEnum(AppointmentType)
  appointmentType?: AppointmentType;

  @ApiPropertyOptional({
    description: 'Preferred meeting format',
    enum: MeetingFormat,
    example: MeetingFormat.IN_PERSON,
  })
  @IsOptional()
  @IsEnum(MeetingFormat)
  preferredFormat?: MeetingFormat;

  @ApiPropertyOptional({
    description: 'Additional notes or special requests',
    example: 'Please bring recent test results',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Urgency level',
    enum: ['normal', 'urgent'],
    example: 'normal',
  })
  @IsOptional()
  @IsEnum(['normal', 'urgent'])
  urgency?: 'normal' | 'urgent';
}

export class UpdateAppointmentDto {
  @ApiPropertyOptional({
    description: 'Updated appointment title',
    example: 'Updated Parent-Teacher Conference',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({
    description: 'Updated appointment description',
    example: 'Updated discussion points',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated requested date',
    example: '2024-09-16',
  })
  @IsOptional()
  @IsDateString()
  requestedDate?: string;

  @ApiPropertyOptional({
    description: 'Updated requested time',
    example: '15:00',
  })
  @IsOptional()
  @IsString()
  requestedTime?: string;

  @ApiPropertyOptional({
    description: 'Updated duration',
    example: 45,
  })
  @IsOptional()
  @IsInt()
  @Min(15)
  @Max(120)
  durationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Updated notes',
    example: 'Updated meeting agenda',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class AppointmentResponseDto {
  @ApiProperty({
    description: 'Appointment ID',
    example: 'appt-123',
  })
  id: string;

  @ApiProperty({
    description: 'Parent ID',
    example: 'parent-789',
  })
  parentId: string;

  @ApiProperty({
    description: 'Student information',
  })
  student: {
    id: string;
    name: string;
    grade: string;
    class: string;
  };

  @ApiProperty({
    description: 'Staff member information',
  })
  staff: {
    id: string;
    name: string;
    role: string;
    department?: string;
    email: string;
    phone?: string;
  };

  @ApiProperty({
    description: 'Appointment title',
    example: 'Parent-Teacher Conference',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Appointment description',
    example: 'Discussing student progress in mathematics',
  })
  description?: string;

  @ApiProperty({
    description: 'Appointment date and time',
    example: '2024-09-15T14:30:00Z',
  })
  appointmentDate: Date;

  @ApiProperty({
    description: 'Appointment duration in minutes',
    example: 30,
  })
  durationMinutes: number;

  @ApiProperty({
    description: 'Appointment type',
    enum: AppointmentType,
    example: AppointmentType.PARENT_TEACHER,
  })
  appointmentType: AppointmentType;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Meeting format',
    enum: MeetingFormat,
    example: MeetingFormat.IN_PERSON,
  })
  meetingFormat: MeetingFormat;

  @ApiPropertyOptional({
    description: 'Meeting location',
    example: 'Room 204, Main Building',
  })
  location?: string;

  @ApiPropertyOptional({
    description: 'Virtual meeting details',
  })
  virtualMeetingDetails?: VirtualMeetingDetails;

  @ApiProperty({
    description: 'Whether parent has confirmed',
    example: true,
  })
  confirmedByParent: boolean;

  @ApiProperty({
    description: 'Whether staff has confirmed',
    example: true,
  })
  confirmedByStaff: boolean;

  @ApiPropertyOptional({
    description: 'Cancellation reason',
    example: 'Schedule conflict',
  })
  cancellationReason?: string;

  @ApiPropertyOptional({
    description: 'Rescheduling notes',
    example: 'Moved to next week due to teacher availability',
  })
  reschedulingNotes?: string;

  @ApiProperty({
    description: 'Appointment creation timestamp',
    example: '2024-08-29T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  timestamp: Date;
}

export class AppointmentFiltersDto {
  @ApiPropertyOptional({
    description: 'Filter by appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiPropertyOptional({
    description: 'Filter by appointment type',
    enum: AppointmentType,
    example: AppointmentType.PARENT_TEACHER,
  })
  @IsOptional()
  @IsEnum(AppointmentType)
  appointmentType?: AppointmentType;

  @ApiPropertyOptional({
    description: 'Filter by staff member ID',
    example: 'teacher-123',
  })
  @IsOptional()
  @IsUUID()
  staffId?: string;

  @ApiPropertyOptional({
    description: 'Filter by student ID',
    example: 'student-456',
  })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'Filter by meeting format',
    enum: MeetingFormat,
    example: MeetingFormat.IN_PERSON,
  })
  @IsOptional()
  @IsEnum(MeetingFormat)
  meetingFormat?: MeetingFormat;

  @ApiPropertyOptional({
    description: 'Start date for filtering',
    example: '2024-08-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
    example: '2024-08-29',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by urgency',
    enum: ['normal', 'urgent'],
    example: 'normal',
  })
  @IsOptional()
  @IsEnum(['normal', 'urgent'])
  urgency?: 'normal' | 'urgent';
}

export class StaffAvailabilityDto {
  @ApiProperty({
    description: 'Staff member ID',
    example: 'teacher-123',
  })
  staffId: string;

  @ApiProperty({
    description: 'Staff member name',
    example: 'Mr. Johnson',
  })
  staffName: string;

  @ApiProperty({
    description: 'Available time slots',
    example: [
      {
        date: '2024-09-15',
        slots: ['09:00', '10:00', '14:00', '15:00']
      }
    ],
  })
  availability: Array<{
    date: string;
    slots: string[];
  }>;

  @ApiProperty({
    description: 'Default appointment duration in minutes',
    example: 30,
  })
  defaultDuration: number;

  @ApiProperty({
    description: 'Supported meeting formats',
    enum: MeetingFormat,
    example: [MeetingFormat.IN_PERSON, MeetingFormat.VIRTUAL],
  })
  supportedFormats: MeetingFormat[];
}