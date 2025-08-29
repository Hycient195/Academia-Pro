// Academia Pro - Update Subject DTO
// Data Transfer Object for updating subject information

import { PartialType } from '@nestjs/swagger';
import { CreateSubjectDto } from './create-subject.dto';
import { IUpdateSubjectRequest } from '../../../../common/src/types/academic/academic.types';

export class UpdateSubjectDto extends PartialType(CreateSubjectDto) implements IUpdateSubjectRequest {}