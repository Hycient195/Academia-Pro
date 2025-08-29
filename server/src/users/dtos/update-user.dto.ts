// Academia Pro - Update User DTO
// Data Transfer Object for updating user information

import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}