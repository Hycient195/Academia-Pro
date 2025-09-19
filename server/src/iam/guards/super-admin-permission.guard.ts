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

    console.log(`[SuperAdminPermissionGuard] Required permissions:`, requiredPermissions);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log(`[SuperAdminPermissionGuard] User:`, user);

    if (!user) {
      console.log(`[SuperAdminPermissionGuard] No user found - throwing authentication error`);
      throw new ForbiddenException('User not authenticated');
    }

    console.log(`[SuperAdminPermissionGuard] User roles:`, user.roles);

    // If user is super admin, allow all operations
    if (user.roles?.includes(EUserRole.SUPER_ADMIN)) {
      console.log(`[SuperAdminPermissionGuard] User is super admin - allowing access`);
      return true;
    }

    // If user is delegated super admin, check permissions
    if (user.roles?.includes(EUserRole.DELEGATED_SUPER_ADMIN)) {
      console.log(`[SuperAdminPermissionGuard] User is delegated super admin - checking permissions`);
      const email = user.email;
      console.log(`[SuperAdminPermissionGuard] User email:`, email);
      let hasPermission = false;

      for (const permission of requiredPermissions) {
        console.log(`[SuperAdminPermissionGuard] Checking permission:`, permission);
        const hasAccess = await this.iamService.checkDelegatedAccountAccess(email, permission);
        console.log(`[SuperAdminPermissionGuard] Permission check result for ${permission}:`, hasAccess);
        if (hasAccess) {
          hasPermission = true;
          break;
        }
      }

      if (!hasPermission) {
        console.log(`[SuperAdminPermissionGuard] No required permissions found - denying access`);
        throw new ForbiddenException(
          `Access denied. Required permissions: ${requiredPermissions.join(', ')}`
        );
      }

      console.log(`[SuperAdminPermissionGuard] Permission check passed - allowing access`);
      return true;
    }

    console.log(`[SuperAdminPermissionGuard] User doesn't have required roles - denying access`);
    // If user doesn't have super admin or delegated super admin role, deny access
    throw new ForbiddenException('Access denied. Super admin or delegated super admin role required');
  }
}