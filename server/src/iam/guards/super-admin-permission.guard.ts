import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IamService } from '../services/iam.service';
import { EUserRole } from '@academia-pro/types/users';

@Injectable()
export class SuperAdminPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private iamService: IamService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // If user is super admin, allow all operations
    if (user.roles?.includes(EUserRole.SUPER_ADMIN)) {
      return true;
    }

    // If user is delegated super admin, check permissions
    if (user.roles?.includes(EUserRole.DELEGATED_SUPER_ADMIN)) {
      const email = user.email;
      let hasPermission = false;

      for (const permission of requiredPermissions) {
        const hasAccess = await this.iamService.checkDelegatedAccountAccess(email, permission);
        if (hasAccess) {
          hasPermission = true;
          break;
        }
      }

      if (!hasPermission) {
        throw new ForbiddenException(
          `Access denied. Required permissions: ${requiredPermissions.join(', ')}`
        );
      }

      return true;
    }

    // If user doesn't have super admin or delegated super admin role, deny access
    throw new ForbiddenException('Access denied. Super admin or delegated super admin role required');
  }
}