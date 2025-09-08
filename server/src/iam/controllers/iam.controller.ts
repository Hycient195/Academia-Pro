import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req
} from '@nestjs/common';
import { Request } from 'express';
import { IamService } from '../services/iam.service';
import { CreateDelegatedAccountDto } from '../dtos/create-delegated-account.dto';
import { UpdateDelegatedAccountDto } from '../dtos/update-delegated-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { EUserRole } from '@academia-pro/types/users';

@Controller('super-admin/iam')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(EUserRole.SUPER_ADMIN)
export class IamController {
  constructor(private readonly iamService: IamService) {}

  // Delegated Accounts
  @Post('delegated-accounts')
  @HttpCode(HttpStatus.CREATED)
  async createDelegatedAccount(
    @Body() dto: CreateDelegatedAccountDto,
    @Req() request: Request
  ) {
    const createdBy = (request.user as any)?.id || null;
    return this.iamService.createDelegatedAccount(dto, createdBy);
  }

  @Get('delegated-accounts')
  async getDelegatedAccounts() {
    return this.iamService.getDelegatedAccounts();
  }

  @Get('delegated-accounts/:id')
  async getDelegatedAccountById(@Param('id') id: string) {
    return this.iamService.getDelegatedAccountById(id);
  }

  @Put('delegated-accounts/:id')
  async updateDelegatedAccount(
    @Param('id') id: string,
    @Body() dto: UpdateDelegatedAccountDto,
    @Req() request: Request
  ) {
    const updatedBy = (request.user as any)?.id || null;
    return this.iamService.updateDelegatedAccount(id, dto, updatedBy);
  }

  @Post('delegated-accounts/:id/revoke')
  @HttpCode(HttpStatus.OK)
  async revokeDelegatedAccount(@Param('id') id: string, @Req() request: Request) {
    const revokedBy = (request.user as any)?.id || null;
    return this.iamService.revokeDelegatedAccount(id, revokedBy);
  }

  @Post('delegated-accounts/:id/suspend')
  @HttpCode(HttpStatus.OK)
  async suspendDelegatedAccount(@Param('id') id: string, @Req() request: Request) {
    const suspendedBy = (request.user as any)?.id || null;
    return this.iamService.suspendDelegatedAccount(id, suspendedBy);
  }

  @Post('delegated-accounts/:id/unsuspend')
  @HttpCode(HttpStatus.OK)
  async unsuspendDelegatedAccount(@Param('id') id: string) {
    return this.iamService.unsuspendDelegatedAccount(id);
  }

  @Delete('delegated-accounts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDelegatedAccount(@Param('id') id: string) {
    await this.iamService.deleteDelegatedAccount(id);
  }

  // Permissions
  @Get('permissions')
  async getAllPermissions() {
    return this.iamService.getAllPermissions();
  }

  @Post('permissions')
  @HttpCode(HttpStatus.CREATED)
  async createPermission(
    @Body() body: { name: string; description?: string }
  ) {
    return this.iamService.createPermission(body.name, body.description);
  }

  // Roles
  @Get('roles')
  async getAllRoles() {
    return this.iamService.getAllRoles();
  }

  @Post('roles')
  @HttpCode(HttpStatus.CREATED)
  async createRole(
    @Body() body: { name: string; description?: string; permissionIds?: string[] }
  ) {
    return this.iamService.createRole(body.name, body.description, body.permissionIds);
  }

  @Get('roles/:id')
  async getRoleById(@Param('id') id: string) {
    return this.iamService.getRoleById(id);
  }

  @Put('roles/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() body: { name?: string; description?: string; permissionIds?: string[] }
  ) {
    return this.iamService.updateRole(id, body.name, body.description, body.permissionIds);
  }

  @Delete('roles/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRole(@Param('id') id: string) {
    await this.iamService.deleteRole(id);
  }
}