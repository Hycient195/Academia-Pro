// Academia Pro - Attendance Response DTOs
// DTOs for attendance API responses

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStatus, AttendanceType, AttendanceMethod } from '../entities/attendance.entity';

export class AttendanceResponseDto {
  @ApiProperty({
    description: 'Attendance record ID',
    example: 'attendance-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-456',
  })
  studentId: string;

  @ApiPropertyOptional({
    description: 'Student name',
    example: 'John Doe',
  })
  studentName?: string;

  @ApiProperty({
    description: 'Attendance status',
    example: AttendanceStatus.PRESENT,
    enum: AttendanceStatus,
  })
  status: AttendanceStatus;

  @ApiProperty({
    description: 'Type of attendance',
    example: AttendanceType.CLASS,
    enum: AttendanceType,
  })
  attendanceType: AttendanceType;

  @ApiProperty({
    description: 'Attendance date',
    example: '2024-03-15',
  })
  attendanceDate: string;

  @ApiPropertyOptional({
    description: 'Check-in time',
    example: '2024-03-15T08:30:00Z',
  })
  checkInTime?: string;

  @ApiPropertyOptional({
    description: 'Check-out time',
    example: '2024-03-15T15:30:00Z',
  })
  checkOutTime?: string;

  @ApiPropertyOptional({
    description: 'Class name',
    example: 'Mathematics 101',
  })
  className?: string;

  @ApiPropertyOptional({
    description: 'Section name',
    example: 'Section A',
  })
  sectionName?: string;

  @ApiPropertyOptional({
    description: 'Subject name',
    example: 'Advanced Mathematics',
  })
  subjectName?: string;

  @ApiPropertyOptional({
    description: 'Teacher name',
    example: 'Ms. Johnson',
  })
  teacherName?: string;

  @ApiPropertyOptional({
    description: 'Period number',
    example: 1,
  })
  periodNumber?: number;

  @ApiPropertyOptional({
    description: 'Event name',
    example: 'Annual Sports Day',
  })
  eventName?: string;

  @ApiPropertyOptional({
    description: 'Location',
    example: 'School Auditorium',
  })
  location?: string;

  @ApiProperty({
    description: 'Attendance method',
    example: AttendanceMethod.MANUAL,
    enum: AttendanceMethod,
  })
  attendanceMethod: AttendanceMethod;

  @ApiPropertyOptional({
    description: 'Late minutes',
    example: 15,
  })
  lateMinutes?: number;

  @ApiPropertyOptional({
    description: 'Absence reason',
    example: 'Medical appointment',
  })
  absenceReason?: string;

  @ApiPropertyOptional({
    description: 'Excuse type',
    example: 'medical',
  })
  excuseType?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Student arrived late due to traffic',
  })
  notes?: string;

  @ApiProperty({
    description: 'Marked by user name',
    example: 'Ms. Johnson',
  })
  markedByName: string;

  @ApiProperty({
    description: 'Marked by user role',
    example: 'Class Teacher',
  })
  markedByRole: string;

  @ApiProperty({
    description: 'Created timestamp',
    example: '2024-03-15T08:30:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2024-03-15T08:35:00Z',
  })
  updatedAt: string;
}

export class AttendanceStatisticsDto {
  @ApiProperty({
    description: 'Total number of attendance records',
    example: 150,
  })
  totalRecords: number;

  @ApiProperty({
    description: 'Number of present students',
    example: 140,
  })
  presentCount: number;

  @ApiProperty({
    description: 'Number of absent students',
    example: 8,
  })
  absentCount: number;

  @ApiProperty({
    description: 'Number of late students',
    example: 2,
  })
  lateCount: number;

  @ApiProperty({
    description: 'Number of excused students',
    example: 0,
  })
  excusedCount: number;

  @ApiProperty({
    description: 'Attendance percentage',
    example: 93.33,
  })
  attendancePercentage: number;

  @ApiProperty({
    description: 'Average late minutes',
    example: 5.5,
  })
  averageLateMinutes: number;

  @ApiProperty({
    description: 'Most common absence reason',
    example: 'Medical',
  })
  commonAbsenceReason?: string;
}

export class StudentAttendanceSummaryDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  studentId: string;

  @ApiProperty({
    description: 'Student name',
    example: 'John Doe',
  })
  studentName: string;

  @ApiProperty({
    description: 'Grade level',
    example: 'Grade 10',
  })
  gradeLevel: string;

  @ApiProperty({
    description: 'Section',
    example: 'Section A',
  })
  section: string;

  @ApiProperty({
    description: 'Total days in period',
    example: 20,
  })
  totalDays: number;

  @ApiProperty({
    description: 'Days present',
    example: 18,
  })
  presentDays: number;

  @ApiProperty({
    description: 'Days absent',
    example: 2,
  })
  absentDays: number;

  @ApiProperty({
    description: 'Days late',
    example: 1,
  })
  lateDays: number;

  @ApiProperty({
    description: 'Days excused',
    example: 0,
  })
  excusedDays: number;

  @ApiProperty({
    description: 'Attendance percentage',
    example: 90.0,
  })
  attendancePercentage: number;

  @ApiProperty({
    description: 'Total late minutes',
    example: 45,
  })
  totalLateMinutes: number;

  @ApiProperty({
    description: 'Consecutive absences',
    example: 0,
  })
  consecutiveAbsences: number;

  @ApiProperty({
    description: 'Absences this month',
    example: 1,
  })
  absencesThisMonth: number;

  @ApiProperty({
    description: 'Absences this year',
    example: 5,
  })
  absencesThisYear: number;
}

export class ClassAttendanceReportDto {
  @ApiProperty({
    description: 'Class ID',
    example: 'class-uuid-123',
  })
  classId: string;

  @ApiProperty({
    description: 'Class name',
    example: 'Mathematics 101',
  })
  className: string;

  @ApiProperty({
    description: 'Section name',
    example: 'Section A',
  })
  sectionName: string;

  @ApiProperty({
    description: 'Report date',
    example: '2024-03-15',
  })
  reportDate: string;

  @ApiProperty({
    description: 'Total students in class',
    example: 30,
  })
  totalStudents: number;

  @ApiProperty({
    description: 'Students present',
    example: 28,
  })
  presentCount: number;

  @ApiProperty({
    description: 'Students absent',
    example: 2,
  })
  absentCount: number;

  @ApiProperty({
    description: 'Students late',
    example: 1,
  })
  lateCount: number;

  @ApiProperty({
    description: 'Students excused',
    example: 0,
  })
  excusedCount: number;

  @ApiProperty({
    description: 'Class attendance percentage',
    example: 93.33,
  })
  attendancePercentage: number;

  @ApiProperty({
    description: 'List of absent students',
    type: [String],
    example: ['John Doe', 'Jane Smith'],
  })
  absentStudents: string[];

  @ApiProperty({
    description: 'List of late students',
    type: [String],
    example: ['Bob Johnson'],
  })
  lateStudents: string[];
}

export class AttendanceListResponseDto {
  @ApiProperty({
    description: 'List of attendance records',
    type: [AttendanceResponseDto],
  })
  data: AttendanceResponseDto[];

  @ApiProperty({
    description: 'Total number of records',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of records per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
  totalPages: number;
}