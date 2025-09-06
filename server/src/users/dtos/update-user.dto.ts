// Academia Pro - Update User DTO
// Data Transfer Object for updating user information

import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IUpdateUserRequest } from '@academia-pro/types/users';

export class UpdateUserDto extends PartialType(CreateUserDto) implements Partial<IUpdateUserRequest> {}