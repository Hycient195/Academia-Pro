// Academia Pro - Update School DTO
// Data Transfer Object for updating school information

import { PartialType } from '@nestjs/swagger';
import { CreateSchoolDto } from './create-school.dto';

export class UpdateSchoolDto extends PartialType(CreateSchoolDto) {}