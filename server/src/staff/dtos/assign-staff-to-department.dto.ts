import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsString } from 'class-validator';

export class AssignStaffToDepartmentDto {
  @ApiProperty({
    description: 'Staff member ID to assign',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  staffId: string;

  @ApiProperty({
    description: 'Department ID to assign to',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  departmentId: string;

  @ApiProperty({
    description: 'Optional notes about the assignment',
    example: 'Primary assignment for teaching mathematics',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}