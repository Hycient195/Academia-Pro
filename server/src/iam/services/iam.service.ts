import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DelegatedAccount, DelegatedAccountStatus } from '../entities/delegated-account.entity';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';
import { CreateDelegatedAccountDto } from '../dtos/create-delegated-account.dto';
import { UpdateDelegatedAccountDto } from '../dtos/update-delegated-account.dto';
import { User } from '../../users/user.entity';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';

@Injectable()
export class IamService {
  constructor(
    @InjectRepository(DelegatedAccount)
    private delegatedAccountRepository: Repository<DelegatedAccount>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Delegated Account methods
  async createDelegatedAccount(
    dto: CreateDelegatedAccountDto,
    createdBy: string | null
  ): Promise<DelegatedAccount> {
    // Check if email already exists (only if email is provided)
    if (dto.email) {
      const existing = await this.delegatedAccountRepository.findOne({
        where: { email: dto.email }
      });

      if (existing) {
        throw new ConflictException('Delegated account with this email already exists');
      }
    }

    // Validate permissions exist
    await this.validatePermissions(dto.permissions);

    let userId = dto.userId;

    // If userId not provided but user details are, create a new user
    if (!userId && dto.firstName && dto.lastName) {
      const newUser = this.userRepository.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        email: dto.email,
        // Set default roles for delegated accounts
        roles: [EUserRole.SCHOOL_ADMIN], // Delegated accounts typically have admin-level access
        status: EUserStatus.ACTIVE,
        // No password for delegated accounts - they use API keys/tokens
        passwordHash: null,
        isEmailVerified: true, // Auto-verify since no password setup needed
      });

      const savedUser = await this.userRepository.save(newUser);
      userId = savedUser.id;
    } else if (!userId) {
      throw new BadRequestException('Either userId or user details (firstName, lastName) must be provided');
    }

    // If userId provided, verify user exists and get email
    let userEmail = dto.email;
    if (userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      userEmail = user.email;
    }

    // Handle expiry date logic
    let expiryDate: Date | undefined;

    // If end date is provided, use it as expiry
    if (dto.endDate) {
      expiryDate = new Date(dto.endDate);
      if (dto.endTime) {
        const [hours, minutes] = dto.endTime.split(':');
        expiryDate.setHours(parseInt(hours), parseInt(minutes));
      }
    } else if (dto.expiryDate) {
      // Fallback to provided expiry date for backward compatibility
      expiryDate = new Date(dto.expiryDate);
    }
    // If neither endDate nor expiryDate is provided, expiryDate remains undefined (infinite account)

    const delegatedAccount = this.delegatedAccountRepository.create({
      userId,
      email: userEmail,
      permissions: dto.permissions,
      expiryDate: expiryDate || null,
      createdBy,
      notes: dto.notes,
    });

    return this.delegatedAccountRepository.save(delegatedAccount);
  }

  async getDelegatedAccounts(): Promise<DelegatedAccount[]> {
    return this.delegatedAccountRepository.find({
      order: { createdAt: 'DESC' }
    });
  }

  async getDelegatedAccountById(id: string): Promise<DelegatedAccount> {
    const account = await this.delegatedAccountRepository.findOne({
      where: { id }
    });

    if (!account) {
      throw new NotFoundException('Delegated account not found');
    }

    return account;
  }

  async updateDelegatedAccount(
    id: string,
    dto: UpdateDelegatedAccountDto,
    updatedBy: string | null
  ): Promise<DelegatedAccount> {
    const account = await this.getDelegatedAccountById(id);

    if (dto.permissions) {
      await this.validatePermissions(dto.permissions);
    }

    if (dto.expiryDate) {
      dto.expiryDate = new Date(dto.expiryDate) as any;
    }

    await this.delegatedAccountRepository.update(id, {
      ...dto,
      updatedAt: new Date(),
    });

    return this.getDelegatedAccountById(id);
  }

  async revokeDelegatedAccount(id: string, revokedBy: string | null): Promise<DelegatedAccount> {
    const account = await this.getDelegatedAccountById(id);

    await this.delegatedAccountRepository.update(id, {
      status: DelegatedAccountStatus.REVOKED,
      revokedBy,
      revokedAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getDelegatedAccountById(id);
  }

  async deleteDelegatedAccount(id: string): Promise<void> {
    const account = await this.getDelegatedAccountById(id);
    await this.delegatedAccountRepository.remove(account);
  }

  // Permission methods
  async getAllPermissions(): Promise<Permission[]> {
    return this.permissionRepository.find({
      order: { resource: 'ASC', action: 'ASC' }
    });
  }

  async createPermission(name: string, description?: string): Promise<Permission> {
    const [resource, action] = name.split(':');
    if (!resource || !action) {
      throw new BadRequestException('Permission name must be in format "resource:action"');
    }

    const permission = this.permissionRepository.create({
      name,
      description,
      resource: resource as any,
      action: action as any,
    });

    return this.permissionRepository.save(permission);
  }

  // Role methods
  async getAllRoles(): Promise<Role[]> {
    return this.roleRepository.find({
      relations: ['permissions'],
      order: { name: 'ASC' }
    });
  }

  async createRole(name: string, description?: string, permissionIds?: string[]): Promise<Role> {
    const role = this.roleRepository.create({
      name,
      description,
    });

    if (permissionIds && permissionIds.length > 0) {
      const permissions = await this.permissionRepository.findByIds(permissionIds);
      role.permissions = permissions;
    }

    return this.roleRepository.save(role);
  }

  // Helper methods
  private async validatePermissions(permissionNames: string[]): Promise<void> {
    for (const name of permissionNames) {
      const permission = await this.permissionRepository.findOne({ where: { name } });
      if (!permission) {
        throw new BadRequestException(`Permission '${name}' does not exist`);
      }
    }
  }

  async checkDelegatedAccountAccess(email: string, requiredPermission: string): Promise<boolean> {
    const account = await this.delegatedAccountRepository.findOne({
      where: { email, status: DelegatedAccountStatus.ACTIVE }
    });

    if (!account) {
      return false;
    }

    // Check if account is expired (only if expiryDate is set)
    if (account.expiryDate && account.expiryDate < new Date()) {
      await this.delegatedAccountRepository.update(account.id, {
        status: DelegatedAccountStatus.EXPIRED
      });
      return false;
    }

    // Check if account has the required permission
    return account.permissions.includes(requiredPermission) ||
           account.permissions.includes('*') ||
           account.permissions.some(p => this.matchesPermission(p, requiredPermission));
  }

  private matchesPermission(granted: string, required: string): boolean {
    const [grantedResource, grantedAction] = granted.split(':');
    const [requiredResource, requiredAction] = required.split(':');

    return (grantedResource === '*' || grantedResource === requiredResource) &&
           (grantedAction === '*' || grantedAction === requiredAction);
  }
}