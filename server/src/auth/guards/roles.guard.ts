// Academia Pro - Roles Guard
// Guard to protect routes based on user roles and permissions

import { EUserRole } from '@academia-pro/types/users';
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Check if user has required roles to access the route
   */
  canActivate(context: ExecutionContext): boolean {
    // Get required roles from route metadata
    const requiredRoles = this.reflector.getAllAndOverride<EUserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user from request
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has required role (handle both single role and role array)
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}