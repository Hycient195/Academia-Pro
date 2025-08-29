// Academia Pro - Create Parent DTO
// Data Transfer Object for creating new parent profiles

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsObject, IsOptional, IsBoolean, IsArray, IsEmail, IsPhoneNumber, IsDateString, ValidateNested, Min, Max } from 'class-validator';
import {
  TParentRelationship,
  TPortalAccessLevel,
  ICreateParentRequest,
  INotificationPreferences,
  IParentContact,
  IParentProfile,
  IParentChildRequest
} from '../../../../common/src/types/parent/parent.types';

export class CreateParentDto implements ICreateParentRequest {
  @ApiProperty({
    description: 'User ID associated with this parent',
    example: 'user-uuid-123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Relationship to the child(ren)',
    example: 'father',
    enum: TParentRelationship,
  })
  @IsEnum(TParentRelationship)
  relationship: TParentRelationship;

  @ApiProperty({
    description: 'Whether this is the primary contact person',
    example: true,
  })
  @IsBoolean()
  isPrimaryContact: boolean;

  @ApiProperty({
    description: 'Whether this parent is an emergency contact',
    example: true,
  })
  @IsBoolean()
  emergencyContact: boolean;

  @ApiProperty({
    description: 'Portal access level',
    example: 'full_access',
    enum: TPortalAccessLevel,
  })
  @IsEnum(TPortalAccessLevel)
  portalAccessLevel: TPortalAccessLevel;

  @ApiProperty({
    description: 'Notification preferences',
    type: Object,
  })
  @IsObject()
  notificationPreferences: INotificationPreferences;

  @ApiProperty({
    description: 'Children associated with this parent',
    type: [Object],
  })
  @IsArray()
  children: IParentChildRequest[];

  @ApiProperty({
    description: 'Contact information',
    type: Object,
  })
  @IsObject()
  contactInformation: IParentContact;

  @ApiProperty({
    description: 'Parent profile information',
    type: Object,
  })
  @IsObject()
  profile: IParentProfile;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsString()
  schoolId: string;
}

// Nested DTOs for complex objects
export class NotificationPreferencesDto implements INotificationPreferences {
  @ApiProperty({
    description: 'Receive notifications via email',
    example: true,
  })
  @IsBoolean()
  email: boolean;

  @ApiProperty({
    description: 'Receive notifications via SMS',
    example: true,
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
    description: 'Receive grade notifications',
    example: true,
  })
  @IsBoolean()
  grades: boolean;

  @ApiProperty({
    description: 'Receive attendance notifications',
    example: true,
  })
  @IsBoolean()
  attendance: boolean;

  @ApiProperty({
    description: 'Receive assignment notifications',
    example: true,
  })
  @IsBoolean()
  assignments: boolean;

  @ApiProperty({
    description: 'Receive event notifications',
    example: true,
  })
  @IsBoolean()
  events: boolean;

  @ApiProperty({
    description: 'Receive emergency notifications',
    example: true,
  })
  @IsBoolean()
  emergencies: boolean;

  @ApiProperty({
    description: 'Receive general notifications',
    example: true,
  })
  @IsBoolean()
  general: boolean;
}

export class ParentContactDto implements IParentContact {
  @ApiProperty({
    description: 'Primary email address',
    example: 'parent@example.com',
  })
  @IsEmail()
  primaryEmail: string;

  @ApiPropertyOptional({
    description: 'Secondary email address',
    example: 'parent.secondary@example.com',
  })
  @IsOptional()
  @IsEmail()
  secondaryEmail?: string;

  @ApiProperty({
    description: 'Primary phone number',
    example: '+1234567890',
  })
  @IsString()
  primaryPhone: string;

  @ApiPropertyOptional({
    description: 'Secondary phone number',
    example: '+0987654321',
  })
  @IsOptional()
  @IsString()
  secondaryPhone?: string;

  @ApiProperty({
    description: 'Home address',
    type: Object,
  })
  @IsObject()
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @ApiPropertyOptional({
    description: 'Work contact information',
    type: Object,
  })
  @IsOptional()
  @IsObject()
  workContact?: {
    company?: string;
    position?: string;
    workPhone?: string;
    workEmail?: string;
  };
}

export class ParentProfileDto implements IParentProfile {
  @ApiProperty({
    description: 'First name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Date of birth',
    example: '1980-01-15T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    description: 'Occupation',
    example: 'Software Engineer',
  })
  @IsOptional()
  @IsString()
  occupation?: string;

  @ApiPropertyOptional({
    description: 'Education level',
    example: 'Bachelor\'s Degree',
  })
  @IsOptional()
  @IsString()
  educationLevel?: string;

  @ApiProperty({
    description: 'Languages spoken',
    example: ['English', 'Spanish'],
  })
  @IsArray()
  @IsString({ each: true })
  languages: string[];

  @ApiPropertyOptional({
    description: 'Profile picture URL',
    example: 'https://example.com/profile.jpg',
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiPropertyOptional({
    description: 'Bio or description',
    example: 'Dedicated parent interested in child\'s education',
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'Interests and hobbies',
    example: ['Reading', 'Sports', 'Music'],
  })
  @IsArray()
  @IsString({ each: true })
  interests: string[];

  @ApiProperty({
    description: 'Emergency contacts',
    type: [Object],
  })
  @IsArray()
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
    priority: number;
  }>;
}

export class ParentChildRequestDto implements IParentChildRequest {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @IsString()
  studentId: string;

  @ApiProperty({
    description: 'Relationship to this child',
    example: 'father',
    enum: TParentRelationship,
  })
  @IsEnum(TParentRelationship)
  relationship: TParentRelationship;

  @ApiProperty({
    description: 'Whether this parent is the primary guardian',
    example: true,
  })
  @IsBoolean()
  isPrimaryGuardian: boolean;

  @ApiProperty({
    description: 'Whether this parent is an emergency contact for the child',
    example: true,
  })
  @IsBoolean()
  emergencyContact: boolean;

  @ApiProperty({
    description: 'Access permissions for this child',
    type: Object,
  })
  @IsObject()
  accessPermissions: {
    viewGrades: boolean;
    viewAttendance: boolean;
    viewAssignments: boolean;
    viewTimetable: boolean;
    viewFees: boolean;
    viewReports: boolean;
    receiveNotifications: boolean;
    contactTeachers: boolean;
    scheduleMeetings: boolean;
  };
}

export class ChildAccessPermissionsDto {
  @ApiProperty({
    description: 'Can view grades',
    example: true,
  })
  @IsBoolean()
  viewGrades: boolean;

  @ApiProperty({
    description: 'Can view attendance',
    example: true,
  })
  @IsBoolean()
  viewAttendance: boolean;

  @ApiProperty({
    description: 'Can view assignments',
    example: true,
  })
  @IsBoolean()
  viewAssignments: boolean;

  @ApiProperty({
    description: 'Can view timetable',
    example: true,
  })
  @IsBoolean()
  viewTimetable: boolean;

  @ApiProperty({
    description: 'Can view fees',
    example: true,
  })
  @IsBoolean()
  viewFees: boolean;

  @ApiProperty({
    description: 'Can view reports',
    example: true,
  })
  @IsBoolean()
  viewReports: boolean;

  @ApiProperty({
    description: 'Can receive notifications',
    example: true,
  })
  @IsBoolean()
  receiveNotifications: boolean;

  @ApiProperty({
    description: 'Can contact teachers',
    example: true,
  })
  @IsBoolean()
  contactTeachers: boolean;

  @ApiProperty({
    description: 'Can schedule meetings',
    example: true,
  })
  @IsBoolean()
  scheduleMeetings: boolean;
}

export class EmergencyContactDto {
  @ApiProperty({
    description: 'Contact name',
    example: 'Jane Doe',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Relationship to parent',
    example: 'Sister',
  })
  @IsString()
  relationship: string;

  @ApiProperty({
    description: 'Contact phone number',
    example: '+1234567890',
  })
  @IsString()
  phone: string;

  @ApiPropertyOptional({
    description: 'Contact email',
    example: 'jane@example.com',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Contact priority (1 = highest)',
    example: 1,
    minimum: 1,
  })
  @Min(1)
  priority: number;
}

export class AddressDto {
  @ApiProperty({
    description: 'Street address',
    example: '123 Main Street',
  })
  @IsString()
  street: string;

  @ApiProperty({
    description: 'City',
    example: 'New York',
  })
  @IsString()
  city: string;

  @ApiProperty({
    description: 'State or province',
    example: 'NY',
  })
  @IsString()
  state: string;

  @ApiProperty({
    description: 'Postal code',
    example: '10001',
  })
  @IsString()
  postalCode: string;

  @ApiProperty({
    description: 'Country',
    example: 'USA',
  })
  @IsString()
  country: string;
}

export class WorkContactDto {
  @ApiPropertyOptional({
    description: 'Company name',
    example: 'Tech Corp',
  })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({
    description: 'Job position',
    example: 'Manager',
  })
  @IsOptional()
  @IsString()
  position?: string;

  @ApiPropertyOptional({
    description: 'Work phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  workPhone?: string;

  @ApiPropertyOptional({
    description: 'Work email',
    example: 'john.work@example.com',
  })
  @IsOptional()
  @IsEmail()
  workEmail?: string;
}