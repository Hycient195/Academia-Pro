// Academia Pro - Student Response DTO
// Response Data Transfer Object for student data (safe for frontend consumption)

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StudentResponseDto {
  @ApiProperty({
    description: 'Unique student identifier',
    example: 'student-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Admission number',
    example: 'ADM2024001',
  })
  admissionNumber: string;

  @ApiProperty({
    description: 'Student first name',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Student last name',
    example: 'Doe',
  })
  lastName: string;

  @ApiPropertyOptional({
    description: 'Student middle name',
    example: 'Michael',
  })
  middleName?: string;

  @ApiProperty({
    description: 'Date of birth',
    example: '2005-03-15T00:00:00Z',
  })
  dateOfBirth: Date;

  @ApiProperty({
    description: 'Gender',
    example: 'male',
    enum: ['male', 'female', 'other'],
  })
  gender: 'male' | 'female' | 'other';

  @ApiProperty({
    description: 'Student email',
    example: 'john.doe@school.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Student phone number',
    example: '+1234567890',
  })
  phone?: string;

  @ApiProperty({
    description: 'Student address',
  })
  address: any; // IAddress

  @ApiPropertyOptional({
    description: 'Blood group',
    example: 'O+',
  })
  bloodGroup?: any; // TBloodGroup

  @ApiProperty({
    description: 'Current grade',
    example: 'Grade 10',
  })
  currentGrade: string;

  @ApiProperty({
    description: 'Current section',
    example: 'A',
  })
  currentSection: string;


  @ApiProperty({
    description: 'Admission date',
    example: '2024-08-01T00:00:00Z',
  })
  admissionDate: Date;

  @ApiProperty({
    description: 'Enrollment type',
    example: 'regular',
  })
  enrollmentType: any; // TEnrollmentType

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  schoolId: string;

  @ApiPropertyOptional({
    description: 'User ID',
    example: 'user-uuid-456',
  })
  userId?: string;

  @ApiProperty({
    description: 'Student status',
    example: 'active',
  })
  status: any; // TStudentStatus

  @ApiProperty({
    description: 'Emergency contact information',
  })
  emergencyContact: any; // IEmergencyContact

  @ApiPropertyOptional({
    description: 'Parent information',
  })
  parents?: any; // IParentsInfo

  @ApiPropertyOptional({
    description: 'Medical information',
  })
  medicalInfo?: any; // IMedicalInfo

  @ApiPropertyOptional({
    description: 'Transportation information',
  })
  transportation?: any; // ITransportationInfo

  @ApiPropertyOptional({
    description: 'Hostel information',
  })
  hostel?: any; // IHostelInfo

  @ApiProperty({
    description: 'Financial information',
  })
  financialInfo: any; // IFinancialInfo

  @ApiProperty({
    description: 'Uploaded documents',
    type: [Object],
  })
  documents: any[]; // IDocument[]

  @ApiProperty({
    description: 'Student preferences',
  })
  preferences: any; // IStudentPreferences

  @ApiPropertyOptional({
    description: 'GPA',
    example: 3.8,
  })
  gpa?: number;

  @ApiPropertyOptional({
    description: 'Total credits',
    example: 120,
  })
  totalCredits?: number;

  @ApiProperty({
    description: 'Academic standing',
  })
  academicStanding: any; // IAcademicStanding

  @ApiProperty({
    description: 'Record creation timestamp',
    example: '2024-08-01T00:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Record last update timestamp',
    example: '2024-08-01T00:00:00Z',
  })
  updatedAt: Date;

  // Computed fields
  @ApiProperty({
    description: 'Full name (computed)',
    example: 'John Michael Doe',
  })
  fullName: string;

  @ApiProperty({
    description: 'Age in years (computed)',
    example: 19,
  })
  age: number;

  @ApiProperty({
    description: 'Grade and section combined (computed)',
    example: 'Grade 10 - A',
  })
  gradeSection: string;

  @ApiProperty({
    description: 'Whether student is currently active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Whether student requires transportation',
    example: true,
  })
  hasTransportation: boolean;

  @ApiProperty({
    description: 'Whether student requires hostel accommodation',
    example: false,
  })
  hasHostel: boolean;

  @ApiProperty({
    description: 'Whether student has scholarship',
    example: true,
  })
  hasScholarship: boolean;

  constructor(partial: Partial<StudentResponseDto>) {
    Object.assign(this, partial);
  }

  // Static factory method to create from entity
  static fromEntity(entity: any): StudentResponseDto {
    const now = new Date();
    const birthDate = new Date(entity.dateOfBirth);
    const age = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));

    return new StudentResponseDto({
      id: entity.id,
      admissionNumber: entity.admissionNumber,
      firstName: entity.firstName,
      lastName: entity.lastName,
      middleName: entity.middleName,
      dateOfBirth: entity.dateOfBirth,
      gender: entity.gender,
      email: entity.email,
      phone: entity.phone,
      address: entity.address,
      bloodGroup: entity.bloodGroup,
      currentGrade: entity.currentGrade,
      currentSection: entity.currentSection,
      admissionDate: entity.admissionDate,
      enrollmentType: entity.enrollmentType,
      schoolId: entity.schoolId,
      userId: entity.userId,
      status: entity.status,
      emergencyContact: entity.medicalInfo?.emergencyContact || {},
      parents: entity.parents,
      medicalInfo: entity.medicalInfo,
      transportation: entity.transportation,
      hostel: entity.hostel,
      financialInfo: entity.financialInfo,
      documents: entity.documents || [],
      preferences: entity.preferences,
      gpa: entity.gpa,
      totalCredits: entity.totalCredits,
      academicStanding: entity.academicStanding,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      fullName: `${entity.firstName} ${entity.middleName ? entity.middleName + ' ' : ''}${entity.lastName}`,
      age,
      gradeSection: `${entity.currentGrade} - ${entity.currentSection}`,
      isActive: entity.status === 'active',
      hasTransportation: entity.transportation?.required || false,
      hasHostel: entity.hostel?.required || false,
      hasScholarship: entity.financialInfo?.scholarship ? true : false,
    });
  }
}

export class StudentsListResponseDto {
  @ApiProperty({
    description: 'List of students',
    type: [StudentResponseDto],
  })
  students: StudentResponseDto[];

  @ApiProperty({
    description: 'Total number of students',
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

  constructor(partial: Partial<StudentsListResponseDto>) {
    Object.assign(this, partial);
  }
}

export class StudentStatisticsResponseDto {
  @ApiProperty({
    description: 'Total number of students',
    example: 150,
  })
  totalStudents: number;

  @ApiProperty({
    description: 'Number of active students',
    example: 145,
  })
  activeStudents: number;

  @ApiProperty({
    description: 'Students grouped by grade',
    example: { 'Grade 10': 45, 'Grade 11': 38, 'Grade 12': 32 },
  })
  studentsByGrade: Record<string, number>;

  @ApiProperty({
    description: 'Students grouped by status',
    example: { active: 145, inactive: 3, graduated: 2 },
  })
  studentsByStatus: Record<string, number>;

  @ApiProperty({
    description: 'Students grouped by enrollment type',
    example: { regular: 120, special_needs: 15, gifted: 10, international: 5 },
  })
  studentsByEnrollmentType: Record<string, number>;

  constructor(partial: Partial<StudentStatisticsResponseDto>) {
    Object.assign(this, partial);
  }
}