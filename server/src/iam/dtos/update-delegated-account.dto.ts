import { PartialType } from '@nestjs/mapped-types';
import { CreateDelegatedAccountDto } from './create-delegated-account.dto';
import { IsOptional, IsEnum } from 'class-validator';
import { DelegatedAccountStatus } from '../entities/delegated-account.entity';

export class UpdateDelegatedAccountDto extends PartialType(CreateDelegatedAccountDto) {
  @IsOptional()
  @IsEnum(DelegatedAccountStatus)
  status?: DelegatedAccountStatus;
}