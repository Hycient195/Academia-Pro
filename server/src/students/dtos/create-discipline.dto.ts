// Academia Pro - Create Discipline DTO
// DTO for creating new student discipline records

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsBoolean, IsArray, IsObject, IsNumber, Min, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DisciplineType, DisciplineSeverity, DisciplineAction } from '../entities/student-discipline.entity';

export class WitnessDto {
  @ApiProperty({
    description: 'Witness name',
    example: 'John Smith',
  })
  @IsNotEmpty({ message: 'Witness name is required' })
  @IsString({ message: 'Witness name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Witness role',
    example: 'Teacher',
  })
  @IsNotEmpty({ message: 'Witness role is required' })
  @IsString({ message: 'Witness role must be a string' })
  role: string;

  @ApiPropertyOptional({
    description: 'Witness contact information',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString({ message: 'Witness contact must be a string' })
  contact?: string;

  @ApiPropertyOptional({
    description: 'Witness statement',
    example: 'I saw the student involved in the incident',
  })
  @IsOptional()
  @IsString({ message: 'Witness statement must be a string' })
  statement?: string;
}

export class SupportingDocumentDto {
  @ApiProperty({
    description: 'Type of supporting document',
    example: 'incident_report',
  })
  @IsNotEmpty({ message: 'Document type is required' })
  @IsString({ message: 'Document type must be a string' })
  documentType: string;

  @ApiProperty({
    description: 'Name of the document',
    example: 'Incident_Report_001.pdf',
  })
  @IsNotEmpty({ message: 'Document name is required' })
  @IsString({ message: 'Document name must be a string' })
  documentName: string;

  @ApiProperty({
    description: 'URL to access the document',
    example: 'https://storage.example.com/documents/incident001.pdf',
  })
  @IsNotEmpty({ message: 'Document URL is required' })
  @IsString({ message: 'Document URL must be a string' })
  documentUrl: string;

  @ApiPropertyOptional({
    description: 'Upload date of the document',
    example: '2024-03-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Upload date must be a valid date' })
  uploadDate?: string;
}

export class DisciplineMetadataDto {
  @ApiPropertyOptional({
    description: 'Discipline category',
    example: 'behavioral',
  })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @ApiPropertyOptional({
    description: 'Discipline subcategory',
    example: 'classroom_disruption',
  })
  @IsOptional()
  @IsString({ message: 'Subcategory must be a string' })
  subcategory?: string;

  @ApiPropertyOptional({
    description: 'Priority level',
    example: 'high',
    enum: ['low', 'normal', 'high', 'urgent'],
  })
  @IsOptional()
  @IsEnum(['low', 'normal', 'high', 'urgent'], { message: 'Priority must be low, normal, high, or urgent' })
  priority?: 'low' | 'normal' | 'high' | 'urgent';

  @ApiPropertyOptional({
    description: 'Risk level',
    example: 'medium',
    enum: ['low', 'medium', 'high', 'critical'],
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'], { message: 'Risk level must be low, medium, high, or critical' })
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';

  @ApiPropertyOptional({
    description: 'Discipline tags',
    example: ['bullying', 'intervention_required'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Related incident IDs',
    example: ['incident-uuid-1', 'incident-uuid-2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Related incidents must be an array' })
  @IsString({ each: true, message: 'Each related incident must be a string' })
  relatedIncidents?: string[];
}

export class CreateDisciplineDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @IsNotEmpty({ message: 'Student ID is required' })
  @IsString({ message: 'Student ID must be a string' })
  studentId: string;

  @ApiProperty({
    description: 'Type of discipline incident',
    example: DisciplineType.BEHAVIORAL,
    enum: DisciplineType,
  })
  @IsNotEmpty({ message: 'Discipline type is required' })
  @IsEnum(DisciplineType, { message: 'Invalid discipline type' })
  disciplineType: DisciplineType;

  @ApiPropertyOptional({
    description: 'Severity of the incident',
    example: DisciplineSeverity.MINOR,
    enum: DisciplineSeverity,
  })
  @IsOptional()
  @IsEnum(DisciplineSeverity, { message: 'Invalid severity level' })
  severity?: DisciplineSeverity;

  @ApiProperty({
    description: 'Date when the incident occurred',
    example: '2024-03-15T10:30:00Z',
  })
  @IsNotEmpty({ message: 'Incident date is required' })
  @IsDateString({}, { message: 'Incident date must be a valid date' })
  incidentDate: string;

  @ApiPropertyOptional({
    description: 'Time when the incident occurred',
    example: '10:30:00',
  })
  @IsOptional()
  @IsString({ message: 'Incident time must be a string' })
  incidentTime?: string;

  @ApiProperty({
    description: 'Location where the incident occurred',
    example: 'Classroom 101',
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Incident location is required' })
  @IsString({ message: 'Incident location must be a string' })
  @MaxLength(200, { message: 'Incident location cannot exceed 200 characters' })
  incidentLocation: string;

  @ApiProperty({
    description: 'Description of the incident',
    example: 'Student was disruptive during class, talking loudly and not following instructions',
  })
  @IsNotEmpty({ message: 'Incident description is required' })
  @IsString({ message: 'Incident description must be a string' })
  incidentDescription: string;

  @ApiPropertyOptional({
    description: 'Witnesses to the incident',
    type: [WitnessDto],
  })
  @IsOptional()
  @IsArray({ message: 'Witnesses must be an array' })
  witnesses?: WitnessDto[];

  @ApiProperty({
    description: 'Person reporting the incident',
    example: 'teacher-uuid-456',
  })
  @IsNotEmpty({ message: 'Reported by ID is required' })
  @IsString({ message: 'Reported by ID must be a string' })
  reportedBy: string;

  @ApiProperty({
    description: 'Name of the person reporting the incident',
    example: 'Ms. Johnson',
    maxLength: 100,
  })
  @IsNotEmpty({ message: 'Reported by name is required' })
  @IsString({ message: 'Reported by name must be a string' })
  @MaxLength(100, { message: 'Reported by name cannot exceed 100 characters' })
  reportedByName: string;

  @ApiProperty({
    description: 'Role of the person reporting the incident',
    example: 'Class Teacher',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Reported by role is required' })
  @IsString({ message: 'Reported by role must be a string' })
  @MaxLength(50, { message: 'Reported by role cannot exceed 50 characters' })
  reportedByRole: string;

  @ApiPropertyOptional({
    description: 'Additional details about the report',
    example: 'This is the second incident this week',
  })
  @IsOptional()
  @IsString({ message: 'Report details must be a string' })
  reportDetails?: string;

  @ApiPropertyOptional({
    description: 'Whether investigation is required',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Investigation required must be a boolean' })
  investigationRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Disciplinary action taken',
    example: DisciplineAction.WARNING,
    enum: DisciplineAction,
  })
  @IsOptional()
  @IsEnum(DisciplineAction, { message: 'Invalid discipline action' })
  disciplineAction?: DisciplineAction;

  @ApiPropertyOptional({
    description: 'Description of the disciplinary action',
    example: 'Verbal warning given and parent notified',
  })
  @IsOptional()
  @IsString({ message: 'Action description must be a string' })
  actionDescription?: string;

  @ApiPropertyOptional({
    description: 'Start date of the disciplinary action',
    example: '2024-03-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Action start date must be a valid date' })
  actionStartDate?: string;

  @ApiPropertyOptional({
    description: 'End date of the disciplinary action',
    example: '2024-03-20T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Action end date must be a valid date' })
  actionEndDate?: string;

  @ApiPropertyOptional({
    description: 'Duration of the disciplinary action in days',
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Action duration must be a number' })
  @Min(1, { message: 'Action duration must be at least 1 day' })
  actionDurationDays?: number;

  @ApiPropertyOptional({
    description: 'Whether parents have been notified',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Parent notified must be a boolean' })
  parentNotified?: boolean;

  @ApiPropertyOptional({
    description: 'Date when parents were notified',
    example: '2024-03-15T15:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Parent notification date must be a valid date' })
  parentNotificationDate?: string;

  @ApiPropertyOptional({
    description: 'Whether follow-up is required',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Follow-up required must be a boolean' })
  followUpRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Follow-up date',
    example: '2024-03-22T10:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Follow-up date must be a valid date' })
  followUpDate?: string;

  @ApiPropertyOptional({
    description: 'Follow-up notes',
    example: 'Monitor student behavior for next two weeks',
  })
  @IsOptional()
  @IsString({ message: 'Follow-up notes must be a string' })
  followUpNotes?: string;

  @ApiPropertyOptional({
    description: 'Supporting documents',
    type: [SupportingDocumentDto],
  })
  @IsOptional()
  @IsArray({ message: 'Supporting documents must be an array' })
  supportingDocuments?: SupportingDocumentDto[];

  @ApiProperty({
    description: 'Academic year',
    example: '2023-2024',
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Academic year is required' })
  @IsString({ message: 'Academic year must be a string' })
  @MaxLength(20, { message: 'Academic year cannot exceed 20 characters' })
  academicYear: string;

  @ApiProperty({
    description: 'Grade level at the time of incident',
    example: 'Grade 10',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Grade level is required' })
  @IsString({ message: 'Grade level must be a string' })
  @MaxLength(50, { message: 'Grade level cannot exceed 50 characters' })
  gradeLevel: string;

  @ApiPropertyOptional({
    description: 'Section/class',
    example: 'A',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Section must be a string' })
  @MaxLength(20, { message: 'Section cannot exceed 20 characters' })
  section?: string;

  @ApiPropertyOptional({
    description: 'Impact on the student',
    example: 'Student shows remorse and understands the consequences',
  })
  @IsOptional()
  @IsString({ message: 'Impact on student must be a string' })
  impactOnStudent?: string;

  @ApiPropertyOptional({
    description: 'Impact on the class',
    example: 'Disrupted learning for 15 minutes',
  })
  @IsOptional()
  @IsString({ message: 'Impact on class must be a string' })
  impactOnClass?: string;

  @ApiPropertyOptional({
    description: 'Preventive measures taken',
    example: 'Additional supervision during breaks',
  })
  @IsOptional()
  @IsString({ message: 'Preventive measures must be a string' })
  preventiveMeasures?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a repeated offense',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is repeated offense must be a boolean' })
  isRepeatedOffense?: boolean;

  @ApiPropertyOptional({
    description: 'Number of previous offenses',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Previous offenses count must be a number' })
  @Min(0, { message: 'Previous offenses count cannot be negative' })
  previousOffensesCount?: number;

  @ApiPropertyOptional({
    description: 'Whether the record is confidential',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Confidential must be a boolean' })
  confidential?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: DisciplineMetadataDto,
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: DisciplineMetadataDto;

  @ApiPropertyOptional({
    description: 'Internal notes for staff',
    example: 'Student has shown improvement since last incident',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}

export class UpdateDisciplineDto {
  @ApiPropertyOptional({
    description: 'Type of discipline incident',
    example: DisciplineType.BEHAVIORAL,
    enum: DisciplineType,
  })
  @IsOptional()
  @IsEnum(DisciplineType, { message: 'Invalid discipline type' })
  disciplineType?: DisciplineType;

  @ApiPropertyOptional({
    description: 'Severity of the incident',
    example: DisciplineSeverity.MINOR,
    enum: DisciplineSeverity,
  })
  @IsOptional()
  @IsEnum(DisciplineSeverity, { message: 'Invalid severity level' })
  severity?: DisciplineSeverity;

  @ApiPropertyOptional({
    description: 'Status of the discipline case',
    example: 'resolved',
    enum: ['reported', 'under_investigation', 'resolved', 'appealed', 'appeal_upheld', 'appeal_denied', 'dismissed'],
  })
  @IsOptional()
  @IsEnum(['reported', 'under_investigation', 'resolved', 'appealed', 'appeal_upheld', 'appeal_denied', 'dismissed'], { message: 'Invalid status' })
  status?: string;

  @ApiPropertyOptional({
    description: 'Date when the incident occurred',
    example: '2024-03-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Incident date must be a valid date' })
  incidentDate?: string;

  @ApiPropertyOptional({
    description: 'Time when the incident occurred',
    example: '10:30:00',
  })
  @IsOptional()
  @IsString({ message: 'Incident time must be a string' })
  incidentTime?: string;

  @ApiPropertyOptional({
    description: 'Location where the incident occurred',
    example: 'Classroom 101',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Incident location must be a string' })
  @MaxLength(200, { message: 'Incident location cannot exceed 200 characters' })
  incidentLocation?: string;

  @ApiPropertyOptional({
    description: 'Description of the incident',
    example: 'Student was disruptive during class, talking loudly and not following instructions',
  })
  @IsOptional()
  @IsString({ message: 'Incident description must be a string' })
  incidentDescription?: string;

  @ApiPropertyOptional({
    description: 'Witnesses to the incident',
    type: [WitnessDto],
  })
  @IsOptional()
  @IsArray({ message: 'Witnesses must be an array' })
  witnesses?: WitnessDto[];

  @ApiPropertyOptional({
    description: 'Additional details about the report',
    example: 'This is the second incident this week',
  })
  @IsOptional()
  @IsString({ message: 'Report details must be a string' })
  reportDetails?: string;

  @ApiPropertyOptional({
    description: 'Whether investigation is required',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Investigation required must be a boolean' })
  investigationRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Disciplinary action taken',
    example: DisciplineAction.WARNING,
    enum: DisciplineAction,
  })
  @IsOptional()
  @IsEnum(DisciplineAction, { message: 'Invalid discipline action' })
  disciplineAction?: DisciplineAction;

  @ApiPropertyOptional({
    description: 'Description of the disciplinary action',
    example: 'Verbal warning given and parent notified',
  })
  @IsOptional()
  @IsString({ message: 'Action description must be a string' })
  actionDescription?: string;

  @ApiPropertyOptional({
    description: 'Start date of the disciplinary action',
    example: '2024-03-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Action start date must be a valid date' })
  actionStartDate?: string;

  @ApiPropertyOptional({
    description: 'End date of the disciplinary action',
    example: '2024-03-20T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Action end date must be a valid date' })
  actionEndDate?: string;

  @ApiPropertyOptional({
    description: 'Duration of the disciplinary action in days',
    example: 5,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Action duration must be a number' })
  @Min(1, { message: 'Action duration must be at least 1 day' })
  actionDurationDays?: number;

  @ApiPropertyOptional({
    description: 'Whether parents have been notified',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Parent notified must be a boolean' })
  parentNotified?: boolean;

  @ApiPropertyOptional({
    description: 'Date when parents were notified',
    example: '2024-03-15T15:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Parent notification date must be a valid date' })
  parentNotificationDate?: string;

  @ApiPropertyOptional({
    description: 'Whether follow-up is required',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Follow-up required must be a boolean' })
  followUpRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Follow-up date',
    example: '2024-03-22T10:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Follow-up date must be a valid date' })
  followUpDate?: string;

  @ApiPropertyOptional({
    description: 'Follow-up notes',
    example: 'Monitor student behavior for next two weeks',
  })
  @IsOptional()
  @IsString({ message: 'Follow-up notes must be a string' })
  followUpNotes?: string;

  @ApiPropertyOptional({
    description: 'Supporting documents',
    type: [SupportingDocumentDto],
  })
  @IsOptional()
  @IsArray({ message: 'Supporting documents must be an array' })
  supportingDocuments?: SupportingDocumentDto[];

  @ApiPropertyOptional({
    description: 'Academic year',
    example: '2023-2024',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Academic year must be a string' })
  @MaxLength(20, { message: 'Academic year cannot exceed 20 characters' })
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Grade level at the time of incident',
    example: 'Grade 10',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Grade level must be a string' })
  @MaxLength(50, { message: 'Grade level cannot exceed 50 characters' })
  gradeLevel?: string;

  @ApiPropertyOptional({
    description: 'Section/class',
    example: 'A',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Section must be a string' })
  @MaxLength(20, { message: 'Section cannot exceed 20 characters' })
  section?: string;

  @ApiPropertyOptional({
    description: 'Impact on the student',
    example: 'Student shows remorse and understands the consequences',
  })
  @IsOptional()
  @IsString({ message: 'Impact on student must be a string' })
  impactOnStudent?: string;

  @ApiPropertyOptional({
    description: 'Impact on the class',
    example: 'Disrupted learning for 15 minutes',
  })
  @IsOptional()
  @IsString({ message: 'Impact on class must be a string' })
  impactOnClass?: string;

  @ApiPropertyOptional({
    description: 'Preventive measures taken',
    example: 'Additional supervision during breaks',
  })
  @IsOptional()
  @IsString({ message: 'Preventive measures must be a string' })
  preventiveMeasures?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a repeated offense',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is repeated offense must be a boolean' })
  isRepeatedOffense?: boolean;

  @ApiPropertyOptional({
    description: 'Number of previous offenses',
    example: 1,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Previous offenses count must be a number' })
  @Min(0, { message: 'Previous offenses count cannot be negative' })
  previousOffensesCount?: number;

  @ApiPropertyOptional({
    description: 'Whether the record is confidential',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Confidential must be a boolean' })
  confidential?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: DisciplineMetadataDto,
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: DisciplineMetadataDto;

  @ApiPropertyOptional({
    description: 'Internal notes for staff',
    example: 'Student has shown improvement since last incident',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}