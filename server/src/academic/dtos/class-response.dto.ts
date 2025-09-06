// Academia Pro - Class Response DTO
// Safe response format for class data (frontend consumption)

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Class } from '../class.entity';
import { TGradeLevel, IClassResponse } from '@academia-pro/types/academic';

export class ClassResponseDto implements IClassResponse {
  @ApiProperty({
    description: 'Unique class identifier',
    example: 'class-uuid-123',
  })
  id: string;

  @ApiProperty({
    description: 'Class name',
    example: 'Grade 10 - Section A',
  })
  name: string;

  @ApiProperty({
    description: 'Grade level',
    example: 'grade_10',
  })
  gradeLevel: TGradeLevel;

  @ApiProperty({
    description: 'Section identifier',
    example: 'A',
  })
  section: string;

  @ApiProperty({
    description: 'Maximum capacity of the class',
    example: 30,
  })
  capacity: number;

  @ApiProperty({
    description: 'Current number of enrolled students',
    example: 28,
  })
  currentEnrollment: number;

  @ApiPropertyOptional({
    description: 'Class teacher ID',
    example: 'teacher-uuid-456',
  })
  classTeacherId?: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  academicYear: string;

  @ApiProperty({
    description: 'Whether the class is currently active',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'School ID this class belongs to',
    example: 'school-uuid-123',
  })
  schoolId: string;

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
  @ApiPropertyOptional({
    description: 'Class teacher information',
    type: Object,
  })
  classTeacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  @ApiProperty({
    description: 'Number of subjects offered in this class',
    example: 8,
  })
  subjectCount: number;

  @ApiProperty({
    description: 'Number of students enrolled in this class',
    example: 28,
  })
  studentCount: number;

  @ApiProperty({
    description: 'Class utilization percentage',
    example: 93.33,
  })
  utilizationPercentage: number;

  constructor(partial: Partial<ClassResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(class_: Class): ClassResponseDto {
    const dto = new ClassResponseDto({});
    dto.id = class_.id;
    dto.name = class_.name;
    dto.gradeLevel = class_.gradeLevel;
    dto.section = class_.section;
    dto.capacity = class_.capacity;
    dto.currentEnrollment = class_.currentEnrollment;
    dto.classTeacherId = class_.classTeacherId;
    dto.academicYear = class_.academicYear;
    dto.isActive = class_.isActive;
    dto.schoolId = class_.schoolId;
    dto.createdAt = class_.createdAt;
    dto.updatedAt = class_.updatedAt;

    // Computed fields
    dto.subjectCount = 0; // To be calculated by service if needed
    dto.studentCount = class_.currentEnrollment;
    dto.utilizationPercentage = class_.capacity > 0
      ? Math.round((class_.currentEnrollment / class_.capacity) * 100 * 100) / 100
      : 0;

    // Class teacher info would be populated by service if needed
    dto.classTeacher = undefined; // To be set by service

    return dto;
  }
}