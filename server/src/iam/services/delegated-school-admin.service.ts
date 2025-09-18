import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DelegatedSchoolAdmin, DelegatedSchoolAdminStatus } from '../entities/delegated-school-admin.entity';
import { CreateDelegatedSchoolAdminDto } from '../dtos/create-delegated-school-admin.dto';
import { UpdateDelegatedSchoolAdminDto } from '../dtos/update-delegated-school-admin.dto';
import { User } from '../../users/user.entity';
import { School } from '../../schools/school.entity';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';

@Injectable()
export class DelegatedSchoolAdminService {
  constructor(
    @InjectRepository(DelegatedSchoolAdmin)
    private delegatedSchoolAdminRepository: Repository<DelegatedSchoolAdmin>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
  ) {}

  // Delegated School Admin methods
  async createDelegatedSchoolAdmin(
    dto: CreateDelegatedSchoolAdminDto,
    createdBy: string | null
  ): Promise<DelegatedSchoolAdmin> {
    // Check if email already exists (only if email is provided)
    if (dto.email) {
      const existing = await this.delegatedSchoolAdminRepository.findOne({
        where: { email: dto.email }
      });

      if (existing) {
        throw new ConflictException('Delegated school admin with this email already exists');
      }
    }

    // Validate permissions exist (we'll implement this later)
    await this.validatePermissions(dto.permissions);

    // Verify school exists
    const school = await this.schoolRepository.findOne({ where: { id: dto.schoolId } });
    if (!school) {
      throw new NotFoundException('School not found');
    }

    let userId = dto.userId;

    // If userId not provided but user details are, create a new user
    if (!userId && dto.firstName && dto.lastName) {
      const newUser = this.userRepository.create({
        firstName: dto.firstName,
        lastName: dto.lastName,
        middleName: dto.middleName,
        email: dto.email,
        // Set default roles for delegated school admins
        roles: [EUserRole.DELEGATED_SCHOOL_ADMIN],
        status: EUserStatus.ACTIVE,
        schoolId: dto.schoolId,
        // No password for delegated accounts - they use API keys/tokens
        passwordHash: null,
        isEmailVerified: true, // Auto-verify since no password setup needed
      });

      const savedUser = await this.userRepository.save(newUser);
      userId = savedUser.id;
    } else if (!userId) {
      throw new BadRequestException('Either userId or user details (firstName, lastName) must be provided');
    }

    // If userId provided, verify user exists and belongs to the school
    if (userId) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      if (user.schoolId !== dto.schoolId) {
        throw new BadRequestException('User does not belong to the specified school');
      }
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

    const delegatedSchoolAdmin = this.delegatedSchoolAdminRepository.create({
      userId,
      schoolId: dto.schoolId,
      email: dto.email || '',
      permissions: dto.permissions,
      expiryDate: expiryDate || null,
      createdBy,
      notes: dto.notes,
    });

    return this.delegatedSchoolAdminRepository.save(delegatedSchoolAdmin);
  }

  async getDelegatedSchoolAdmins(schoolId: string): Promise<DelegatedSchoolAdmin[]> {
    return this.delegatedSchoolAdminRepository.find({
      where: { schoolId },
      order: { createdAt: 'DESC' }
    });
  }

  async getDelegatedSchoolAdminById(id: string, schoolId: string): Promise<DelegatedSchoolAdmin> {
    const account = await this.delegatedSchoolAdminRepository.findOne({
      where: { id, schoolId }
    });

    if (!account) {
      throw new NotFoundException('Delegated school admin not found');
    }

    return account;
  }

  async updateDelegatedSchoolAdmin(
    id: string,
    schoolId: string,
    dto: UpdateDelegatedSchoolAdminDto,
    updatedBy: string | null
  ): Promise<DelegatedSchoolAdmin> {
    const account = await this.getDelegatedSchoolAdminById(id, schoolId);

    if (dto.permissions) {
      await this.validatePermissions(dto.permissions);
    }

    if (dto.expiryDate) {
      dto.expiryDate = new Date(dto.expiryDate) as any;
    }

    await this.delegatedSchoolAdminRepository.update(id, {
      ...dto,
      updatedAt: new Date(),
    });

    return this.getDelegatedSchoolAdminById(id, schoolId);
  }

  async revokeDelegatedSchoolAdmin(id: string, schoolId: string, revokedBy: string | null): Promise<DelegatedSchoolAdmin> {
    const account = await this.getDelegatedSchoolAdminById(id, schoolId);

    await this.delegatedSchoolAdminRepository.update(id, {
      status: DelegatedSchoolAdminStatus.REVOKED,
      revokedBy,
      revokedAt: new Date(),
      updatedAt: new Date(),
    });

    return this.getDelegatedSchoolAdminById(id, schoolId);
  }

  async suspendDelegatedSchoolAdmin(id: string, schoolId: string, suspendedBy: string | null): Promise<DelegatedSchoolAdmin> {
    const account = await this.getDelegatedSchoolAdminById(id, schoolId);

    await this.delegatedSchoolAdminRepository.update(id, {
      status: DelegatedSchoolAdminStatus.SUSPENDED,
      updatedAt: new Date(),
    });

    return this.getDelegatedSchoolAdminById(id, schoolId);
  }

  async unsuspendDelegatedSchoolAdmin(id: string, schoolId: string): Promise<DelegatedSchoolAdmin> {
    const account = await this.getDelegatedSchoolAdminById(id, schoolId);

    // Calculate the effective status after unsuspension
    const effectiveStatus = this.calculateEffectiveStatus(account, false, true);

    await this.delegatedSchoolAdminRepository.update(id, {
      status: effectiveStatus,
      updatedAt: new Date(),
    });

    return this.getDelegatedSchoolAdminById(id, schoolId);
  }

  async deleteDelegatedSchoolAdmin(id: string, schoolId: string): Promise<void> {
    const account = await this.getDelegatedSchoolAdminById(id, schoolId);
    await this.delegatedSchoolAdminRepository.remove(account);
  }

  // Helper methods
  private async validatePermissions(permissionNames: string[]): Promise<void> {
    // For now, we'll skip validation as permissions might be defined elsewhere
    // In a real implementation, you'd check against a permissions table
    return;
  }

  async checkDelegatedSchoolAdminAccess(email: string, schoolId: string, requiredPermission: string): Promise<boolean> {
    const account = await this.delegatedSchoolAdminRepository.findOne({
      where: { email, schoolId }
    });

    if (!account) {
      return false;
    }

    // Get the effective status and update if necessary
    const effectiveStatus = await this.getEffectiveStatus(account);

    // Only allow access if account is active
    if (effectiveStatus !== DelegatedSchoolAdminStatus.ACTIVE) {
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

  /**
   * Calculate the effective status of a delegated school admin based on dates and current status
   */
  private calculateEffectiveStatus(account: DelegatedSchoolAdmin, isSuspended: boolean = false, isUnsuspended: boolean = false): DelegatedSchoolAdminStatus {
    const now = new Date();

    // If manually suspended and not being unsuspended, return suspended status
    if ((isSuspended || account.status === DelegatedSchoolAdminStatus.SUSPENDED) && !isUnsuspended) {
      return DelegatedSchoolAdminStatus.SUSPENDED;
    }

    // If account is revoked or expired, keep that status
    if (account.status === DelegatedSchoolAdminStatus.REVOKED || account.status === DelegatedSchoolAdminStatus.EXPIRED) {
      return account.status;
    }

    // Check if start date hasn't passed yet
    if (account.startDate && account.startDate > now) {
      return DelegatedSchoolAdminStatus.INACTIVE;
    }

    // Check if expiry date has passed
    if (account.expiryDate && account.expiryDate < now) {
      return DelegatedSchoolAdminStatus.EXPIRED;
    }

    // If all checks pass, account is active
    return DelegatedSchoolAdminStatus.ACTIVE;
  }

  /**
   * Get the effective status of a delegated school admin, updating it if necessary
   */
  async getEffectiveStatus(account: DelegatedSchoolAdmin): Promise<DelegatedSchoolAdminStatus> {
    const effectiveStatus = this.calculateEffectiveStatus(account);

    // If the effective status is different from the current status, update it
    if (effectiveStatus !== account.status) {
      await this.delegatedSchoolAdminRepository.update(account.id, {
        status: effectiveStatus,
        updatedAt: new Date(),
      });
      account.status = effectiveStatus;
    }

    return effectiveStatus;
  }
}