import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IamService } from '../services/iam.service';

@Injectable()
export class PermissionGuard implements CanActivate {
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

    // If user is super admin, allow all
    if (user.role === 'super-admin') {
      return true;
    }

    // Check if user has a delegated account
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
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}