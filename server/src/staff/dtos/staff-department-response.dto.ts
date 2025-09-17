import { ApiProperty } from '@nestjs/swagger';
import { DepartmentType } from '../entities/department-type.enum';

export class StaffDepartmentResponseDto {
  @ApiProperty({
    description: 'Department ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Department type',
    enum: DepartmentType,
    example: DepartmentType.TEACHING,
  })
  type: DepartmentType;

  @ApiProperty({
    description: 'Department name',
    example: 'Mathematics Department',
  })
  name: string;

  @ApiProperty({
    description: 'Department description',
    example: 'Responsible for mathematics education',
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: 'Number of staff members in this department',
    example: 5,
  })
  staffCount: number;

  @ApiProperty({
    description: 'When the department was created',
    example: '2025-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the department was last updated',
    example: '2025-01-20T14:45:00Z',
  })
  updatedAt: Date;
}