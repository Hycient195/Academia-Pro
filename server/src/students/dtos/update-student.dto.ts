// Academia Pro - Update Student DTO
// Data Transfer Object for updating student information

import { PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { IUpdateStudentRequest } from '../../../../common/src/types/student/student.types';

// Create a named base class to resolve TypeScript portability issue (TS2742)
const BaseUpdateStudentDto = PartialType(CreateStudentDto) as any;

export class UpdateStudentDto extends BaseUpdateStudentDto implements IUpdateStudentRequest {}