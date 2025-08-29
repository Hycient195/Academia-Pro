// Academia Pro - Update Student DTO
// Data Transfer Object for updating student information

import { PartialType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { IUpdateStudentRequest } from '../../../../common/src/types/student/student.types';

export class UpdateStudentDto extends PartialType(CreateStudentDto) implements IUpdateStudentRequest {}