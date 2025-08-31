import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SecurityService } from '../services/security.service';
import { AuditAction, AuditSeverity } from '../services/audit.service';

@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(
    private reflector: Reflector,
    private securityService: SecurityService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    try {
      // Get required roles from route metadata
      const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRoles || requiredRoles.length === 0) {
        // No specific roles required, allow access
        return true;
      }

      // Check if user has required roles
      const hasRequiredRole = this.checkUserRoles(user.roles, requiredRoles);

      if (!hasRequiredRole) {
        await this.logAccessDenied(request, user, requiredRoles);
        throw new ForbiddenException('Insufficient permissions');
      }

      // Check for additional permissions if specified
      const requiredPermissions = this.reflector.getAllAndOverride<string[]>('permissions', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (requiredPermissions && requiredPermissions.length > 0) {
        const hasRequiredPermissions = this.checkUserPermissions(user.permissions, requiredPermissions);

        if (!hasRequiredPermissions) {
          await this.logAccessDenied(request, user, [], requiredPermissions);
          throw new ForbiddenException('Insufficient permissions');
        }
      }

      // Check resource ownership if applicable
      const resourceOwnerCheck = this.reflector.getAllAndOverride<boolean>('resourceOwnerOnly', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (resourceOwnerCheck) {
        const isResourceOwner = await this.checkResourceOwnership(request, user);
        if (!isResourceOwner) {
          await this.logAccessDenied(request, user, [], [], 'Resource ownership required');
          throw new ForbiddenException('Access denied: Resource ownership required');
        }
      }

      // Log successful authorization
      await this.logAccessGranted(request, user, requiredRoles);

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }

      this.logger.error(`Authorization error for user ${user.id}: ${error.message}`, error.stack);
      await this.logAuthorizationError(request, user, error.message);
      throw new ForbiddenException('Authorization check failed');
    }
  }

  private checkUserRoles(userRoles: string[], requiredRoles: string[]): boolean {
    if (!userRoles || userRoles.length === 0) {
      return false;
    }

    // Check for exact role matches
    const hasExactMatch = requiredRoles.some(role => userRoles.includes(role));
    if (hasExactMatch) {
      return true;
    }

    // Check for role hierarchy (admin roles can access lower-level roles)
    const roleHierarchy = {
      'super-admin': ['admin', 'school-admin', 'teacher', 'student', 'parent'],
      'admin': ['school-admin', 'teacher', 'student', 'parent'],
      'school-admin': ['teacher', 'student', 'parent'],
      'teacher': ['student'],
    };

    for (const userRole of userRoles) {
      if (roleHierarchy[userRole]) {
        const accessibleRoles = roleHierarchy[userRole];
        if (requiredRoles.some(role => accessibleRoles.includes(role))) {
          return true;
        }
      }
    }

    return false;
  }

  private checkUserPermissions(userPermissions: string[], requiredPermissions: string[]): boolean {
    if (!userPermissions || userPermissions.length === 0) {
      return false;
    }

    // Check for wildcard permissions (e.g., 'users:*' covers 'users:read', 'users:write')
    const expandedUserPermissions = this.expandWildcardPermissions(userPermissions);

    return requiredPermissions.every(permission => {
      // Check exact match
      if (expandedUserPermissions.includes(permission)) {
        return true;
      }

      // Check wildcard match (e.g., 'users:read' matches 'users:*')
      const [resource, action] = permission.split(':');
      const wildcardPermission = `${resource}:*`;
      return expandedUserPermissions.includes(wildcardPermission);
    });
  }

  private expandWildcardPermissions(permissions: string[]): string[] {
    const expanded: string[] = [...permissions];

    permissions.forEach(permission => {
      if (permission.endsWith(':*')) {
        const resource = permission.slice(0, -2);
        // Add common actions for this resource
        ['read', 'write', 'create', 'update', 'delete'].forEach(action => {
          expanded.push(`${resource}:${action}`);
        });
      }
    });

    return [...new Set(expanded)]; // Remove duplicates
  }

  private async checkResourceOwnership(request: any, user: any): Promise<boolean> {
    const resourceId = this.extractResourceId(request);
    const resourceType = this.extractResourceType(request);

    if (!resourceId || !resourceType) {
      return false;
    }

    // Mock resource ownership check - in real implementation, query database
    const mockOwnership = {
      'student-001': { ownerId: 'user-001', type: 'student' },
      'student-002': { ownerId: 'user-002', type: 'student' },
      'class-001': { ownerId: 'user-002', type: 'class' },
      'report-001': { ownerId: 'user-001', type: 'report' },
    };

    const resource = mockOwnership[resourceId];
    if (!resource) {
      return false;
    }

    // Check if user owns the resource
    if (resource.ownerId === user.id) {
      return true;
    }

    // Check if user has admin privileges over the resource type
    const adminRoles = ['super-admin', 'admin', 'school-admin'];
    if (adminRoles.some(role => user.roles.includes(role))) {
      return true;
    }

    // Check for teacher-student relationships
    if (resourceType === 'student' && user.roles.includes('teacher')) {
      // In real implementation, check if teacher teaches this student
      return this.checkTeacherStudentRelationship(user.id, resourceId);
    }

    return false;
  }

  private extractResourceId(request: any): string | null {
    // Extract resource ID from URL parameters
    const params = request.params;
    if (params.id) {
      return params.id;
    }
    if (params.studentId) {
      return params.studentId;
    }
    if (params.classId) {
      return params.classId;
    }
    if (params.userId) {
      return params.userId;
    }

    // Extract from request body
    const body = request.body;
    if (body && body.id) {
      return body.id;
    }

    return null;
  }

  private extractResourceType(request: any): string | null {
    // Extract resource type from URL path
    const path = request.route?.path || request.url;

    if (path.includes('/students')) {
      return 'student';
    }
    if (path.includes('/classes')) {
      return 'class';
    }
    if (path.includes('/reports')) {
      return 'report';
    }
    if (path.includes('/users')) {
      return 'user';
    }
    if (path.includes('/schools')) {
      return 'school';
    }

    return null;
  }

  private async checkTeacherStudentRelationship(teacherId: string, studentId: string): Promise<boolean> {
    // Mock teacher-student relationship check
    const mockRelationships = {
      'user-002': ['student-001', 'student-002'], // teacher teaches these students
    };

    return mockRelationships[teacherId]?.includes(studentId) || false;
  }

  private async logAccessGranted(request: any, user: any, roles: string[]): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.DATA_ACCESSED,
        user.id,
        AuditSeverity.LOW,
        'Access granted',
        {
          authorization: 'granted',
          requiredRoles: roles,
          route: request.route?.path,
          method: request.method,
          resourceType: this.extractResourceType(request),
          resourceId: this.extractResourceId(request),
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log access granted', error);
    }
  }

  private async logAccessDenied(
    request: any,
    user: any,
    roles: string[] = [],
    permissions: string[] = [],
    reason: string = 'Insufficient permissions',
  ): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHORIZATION_FAILED,
        user.id,
        AuditSeverity.MEDIUM,
        `Access denied: ${reason}`,
        {
          authorization: 'denied',
          requiredRoles: roles,
          requiredPermissions: permissions,
          userRoles: user.roles,
          userPermissions: user.permissions,
          reason,
          route: request.route?.path,
          method: request.method,
          resourceType: this.extractResourceType(request),
          resourceId: this.extractResourceId(request),
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (error) {
      this.logger.error('Failed to log access denied', error);
    }
  }

  private async logAuthorizationError(request: any, user: any, error: string): Promise<void> {
    try {
      await this.securityService.logSecurityEvent(
        AuditAction.AUTHORIZATION_FAILED,
        user.id,
        AuditSeverity.HIGH,
        `Authorization error: ${error}`,
        {
          authorization: 'error',
          error,
          route: request.route?.path,
          method: request.method,
        },
        this.getClientIp(request),
        request.headers['user-agent'],
      );
    } catch (logError) {
      this.logger.error('Failed to log authorization error', logError);
    }
  }

  private getClientIp(request: any): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return realIp;
    }

    return request.connection?.remoteAddress ||
           request.socket?.remoteAddress ||
           request.connection?.socket?.remoteAddress ||
           'unknown';
  }
}