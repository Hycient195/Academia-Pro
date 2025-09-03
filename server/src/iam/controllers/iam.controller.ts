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
  HttpStatus
} from '@nestjs/common';
import { IamService } from '../services/iam.service';
import { CreateDelegatedAccountDto } from '../dtos/create-delegated-account.dto';
import { UpdateDelegatedAccountDto } from '../dtos/update-delegated-account.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
// TODO: Add SuperAdmin guard

@Controller('super-admin/iam')
@UseGuards(JwtAuthGuard) // TODO: Add SuperAdminGuard
export class IamController {
  constructor(private readonly iamService: IamService) {}

  // Delegated Accounts
  @Post('delegated-accounts')
  @HttpCode(HttpStatus.CREATED)
  async createDelegatedAccount(
    @Body() dto: CreateDelegatedAccountDto,
    // TODO: Get user from request
  ) {
    const createdBy = 'super-admin-id'; // TODO: Get from authenticated user
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
  ) {
    const updatedBy = 'super-admin-id'; // TODO: Get from authenticated user
    return this.iamService.updateDelegatedAccount(id, dto, updatedBy);
  }

  @Post('delegated-accounts/:id/revoke')
  @HttpCode(HttpStatus.OK)
  async revokeDelegatedAccount(@Param('id') id: string) {
    const revokedBy = 'super-admin-id'; // TODO: Get from authenticated user
    return this.iamService.revokeDelegatedAccount(id, revokedBy);
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
}