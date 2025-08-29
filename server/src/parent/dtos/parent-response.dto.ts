// Academia Pro - Parent Response DTO
// Safe response format for parent data (frontend consumption)

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Parent } from '../parent.entity';
import { TParentRelationship, TPortalAccessLevel } from '../../../../common/src/types/parent/parent.types';

export class ParentResponseDto {
  @ApiProperty({
    description: 'Unique parent identifier',
    example: 'parent-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'User ID associated with this parent',
    example: 'user-uuid-123',
  })
  userId: string;

  @ApiProperty({
    description: 'Relationship to the child(ren)',
    example: 'father',
    enum: TParentRelationship,
  })
  relationship: TParentRelationship;

  @ApiProperty({
    description: 'Whether this is the primary contact person',
    example: true,
  })
  isPrimaryContact: boolean;

  @ApiProperty({
    description: 'Whether this parent is an emergency contact',
    example: true,
  })
  emergencyContact: boolean;

  @ApiProperty({
    description: 'Portal access level',
    example: 'full_access',
    enum: TPortalAccessLevel,
  })
  portalAccessLevel: TPortalAccessLevel;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  schoolId: string;

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2024-01-15T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2024-08-01T00:00:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Last login timestamp',
    example: '2024-08-01T10:30:00Z',
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'Whether the parent account is active',
    example: true,
  })
  isActive: boolean;

  // Computed fields
  @ApiProperty({
    description: 'Children summary',
    type: Object,
  })
  childrenSummary: {
    count: number;
    primaryChildren: string[];
    grades: string[];
  };

  @ApiProperty({
    description: 'Contact summary',
    type: Object,
  })
  contactSummary: {
    primaryEmail: string;
    primaryPhone: string;
    city: string;
    state: string;
  };

  @ApiProperty({
    description: 'Profile summary',
    type: Object,
  })
  profileSummary: {
    fullName: string;
    occupation?: string;
    languages: string[];
  };

  @ApiProperty({
    description: 'Portal statistics',
    type: Object,
  })
  portalStats: {
    lastLoginAt?: Date;
    totalLogins: number;
    unreadMessages: number;
    upcomingAppointments: number;
  };

  @ApiProperty({
    description: 'User information',
    type: Object,
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
  };

  @ApiProperty({
    description: 'Full name',
    example: 'John Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Primary email',
    example: 'john.doe@example.com',
  })
  primaryEmail: string;

  @ApiProperty({
    description: 'Primary phone',
    example: '+1234567890',
  })
  primaryPhone: string;

  @ApiProperty({
    description: 'Number of children',
    example: 2,
  })
  childrenCount: number;

  @ApiProperty({
    description: 'Number of primary children',
    example: 1,
  })
  primaryChildrenCount: number;

  @ApiProperty({
    description: 'Grades of children',
    example: ['Grade 5', 'Grade 8'],
  })
  grades: string[];

  @ApiProperty({
    description: 'Classes of children',
    example: ['5A', '8B'],
  })
  classes: string[];

  @ApiProperty({
    description: 'Whether parent has full access',
    example: true,
  })
  hasFullAccess: boolean;

  @ApiProperty({
    description: 'Whether parent can view grades',
    example: true,
  })
  canViewGrades: boolean;

  @ApiProperty({
    description: 'Whether parent can view attendance',
    example: true,
  })
  canViewAttendance: boolean;

  @ApiProperty({
    description: 'Whether parent can contact teachers',
    example: true,
  })
  canContactTeachers: boolean;

  @ApiProperty({
    description: 'Whether parent can schedule meetings',
    example: true,
  })
  canScheduleMeetings: boolean;

  @ApiProperty({
    description: 'Preferred notification method',
    example: 'email',
  })
  preferredNotificationMethod: string;

  @ApiProperty({
    description: 'Address summary',
    example: '123 Main Street, New York, NY 10001, USA',
  })
  address: string;

  @ApiPropertyOptional({
    description: 'Parent age',
    example: 45,
  })
  age?: number;

  @ApiProperty({
    description: 'Days since last login',
    example: 5,
  })
  daysSinceLastLogin: number;

  @ApiProperty({
    description: 'Whether parent is recently active',
    example: true,
  })
  isRecentlyActive: boolean;

  @ApiProperty({
    description: 'Whether parent is inactive',
    example: false,
  })
  isInactive: boolean;

  @ApiProperty({
    description: 'Number of emergency contacts',
    example: 2,
  })
  emergencyContactsCount: number;

  @ApiProperty({
    description: 'Languages spoken',
    example: ['English', 'Spanish'],
  })
  languages: string[];

  @ApiProperty({
    description: 'Whether parent has work contact',
    example: true,
  })
  hasWorkContact: boolean;

  @ApiPropertyOptional({
    description: 'Work email',
    example: 'john.work@example.com',
  })
  workEmail?: string;

  @ApiPropertyOptional({
    description: 'Work phone',
    example: '+1234567890',
  })
  workPhone?: string;

  constructor(partial: Partial<ParentResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(parent: Parent): ParentResponseDto {
    const dto = new ParentResponseDto({});
    dto.id = parent.id;
    dto.userId = parent.userId;
    dto.relationship = parent.relationship;
    dto.isPrimaryContact = parent.isPrimaryContact;
    dto.emergencyContact = parent.emergencyContact;
    dto.portalAccessLevel = parent.portalAccessLevel;
    dto.schoolId = parent.schoolId;
    dto.createdAt = parent.createdAt;
    dto.updatedAt = parent.updatedAt;
    dto.lastLoginAt = parent.lastLoginAt;
    dto.isActive = parent.isActive;

    // Computed fields
    dto.childrenSummary = {
      count: parent.childrenCount,
      primaryChildren: parent.primaryChildren.map(child => child.studentName),
      grades: parent.grades,
    };

    dto.contactSummary = {
      primaryEmail: parent.primaryEmail,
      primaryPhone: parent.primaryPhone,
      city: parent.contactInformation.address.city,
      state: parent.contactInformation.address.state,
    };

    dto.profileSummary = {
      fullName: parent.fullName,
      occupation: parent.profile.occupation,
      languages: parent.languages,
    };

    dto.portalStats = {
      lastLoginAt: parent.lastLoginAt,
      totalLogins: 0, // Would be calculated from login history
      unreadMessages: 0, // Would be calculated from communications
      upcomingAppointments: 0, // Would be calculated from appointments
    };

    // User information (would be populated from user service)
    dto.user = {
      id: parent.userId,
      email: parent.primaryEmail,
      firstName: parent.profile.firstName,
      lastName: parent.profile.lastName,
      phone: parent.primaryPhone,
    };

    dto.fullName = parent.fullName;
    dto.primaryEmail = parent.primaryEmail;
    dto.primaryPhone = parent.primaryPhone;
    dto.childrenCount = parent.childrenCount;
    dto.primaryChildrenCount = parent.primaryChildrenCount;
    dto.grades = parent.grades;
    dto.classes = parent.classes;
    dto.hasFullAccess = parent.hasFullAccess;
    dto.canViewGrades = parent.canViewGrades;
    dto.canViewAttendance = parent.canViewAttendance;
    dto.canContactTeachers = parent.canContactTeachers;
    dto.canScheduleMeetings = parent.canScheduleMeetings;
    dto.preferredNotificationMethod = parent.preferredNotificationMethod;
    dto.address = parent.address;
    dto.age = parent.age;
    dto.daysSinceLastLogin = parent.daysSinceLastLogin;
    dto.isRecentlyActive = parent.isRecentlyActive;
    dto.isInactive = parent.isInactive;
    dto.emergencyContactsCount = parent.emergencyContactsCount;
    dto.languages = parent.languages;
    dto.hasWorkContact = parent.hasWorkContact;
    dto.workEmail = parent.workEmail;
    dto.workPhone = parent.workPhone;

    return dto;
  }
}

export class ParentListResponseDto {
  @ApiProperty({
    description: 'List of parents',
    type: [ParentResponseDto],
  })
  parents: ParentResponseDto[];

  @ApiProperty({
    description: 'Total number of parents',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Summary statistics',
    type: Object,
  })
  summary: {
    activeParents: number;
    primaryContacts: number;
    totalChildren: number;
    averageChildrenPerParent: number;
  };

  constructor(partial: Partial<ParentListResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ParentStatisticsResponseDto {
  @ApiProperty({
    description: 'Total number of parents',
    example: 150,
  })
  totalParents: number;

  @ApiProperty({
    description: 'Number of active parents',
    example: 145,
  })
  activeParents: number;

  @ApiProperty({
    description: 'Parents grouped by relationship',
    example: { father: 75, mother: 70, guardian: 5 },
  })
  parentsByRelationship: Record<TParentRelationship, number>;

  @ApiProperty({
    description: 'Parents grouped by access level',
    example: { full_access: 120, limited_access: 20, view_only: 5 },
  })
  parentsByAccessLevel: Record<TPortalAccessLevel, number>;

  @ApiProperty({
    description: 'Communication statistics',
    type: Object,
  })
  communicationStats: {
    totalCommunications: number;
    unreadCommunications: number;
    averageResponseTime: number;
    communicationsByType: Record<string, number>;
  };

  @ApiProperty({
    description: 'Appointment statistics',
    type: Object,
  })
  appointmentStats: {
    totalAppointments: number;
    upcomingAppointments: number;
    completedAppointments: number;
    averageWaitTime: number;
  };

  @ApiProperty({
    description: 'Engagement statistics',
    type: Object,
  })
  engagementStats: {
    averageLoginsPerWeek: number;
    mostActiveTime: string;
    topFeaturesUsed: string[];
    parentSatisfactionScore: number;
  };

  @ApiProperty({
    description: 'Children statistics',
    type: Object,
  })
  childrenStats: {
    totalChildren: number;
    averageChildrenPerParent: number;
    childrenByGrade: Record<string, number>;
    childrenByClass: Record<string, number>;
  };

  constructor(partial: Partial<ParentStatisticsResponseDto>) {
    Object.assign(this, partial);
  }
}