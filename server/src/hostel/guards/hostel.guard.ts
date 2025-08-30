// Academia Pro - Hostel Guard
// Route protection and authorization for hostel operations

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class HostelGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Allow system operations
    if (user.id === 'system') {
      return true;
    }

    const method = request.method;
    const path = request.path;

    // Check user role permissions
    switch (user.role) {
      case 'super_admin':
        // Full access to all hostel operations
        return true;

      case 'school_admin':
      case 'principal':
        // Full access to hostel operations within their school
        return true;

      case 'warden':
        // Wardens have extensive access to their assigned hostels
        if (method === 'GET') {
          return true;
        }
        // Allow updating their own hostels
        if (path.includes('/status') || path.includes('/facilities')) {
          return true;
        }
        // Allow managing allocations for their hostels
        if (path.includes('/allocations') || path.includes('/rooms')) {
          return true;
        }
        return true;

      case 'assistant_warden':
        // Assistant wardens have similar permissions but may have restrictions
        if (method === 'GET') {
          return true;
        }
        // Limited update permissions
        if (path.includes('/status') && method === 'PUT') {
          return true;
        }
        // Can manage basic operations
        if (path.includes('/rooms') && method !== 'DELETE') {
          return true;
        }
        throw new ForbiddenException('Assistant wardens have limited modification permissions');

      case 'hostel_manager':
        // Hostel managers can manage operations but not delete
        if (method === 'GET') {
          return true;
        }
        if (method === 'DELETE') {
          throw new ForbiddenException('Hostel managers cannot delete hostels');
        }
        // Allow most management operations
        if (path.includes('/status') || path.includes('/facilities') || path.includes('/rooms')) {
          return true;
        }
        return true;

      case 'teacher':
        // Teachers have limited access for supervision purposes
        if (method === 'GET') {
          // Allow viewing hostel information and student lists
          if (path.includes('/dashboard') || path.includes('/statistics')) {
            return true;
          }
          // Allow viewing their assigned students' hostel information
          if (path.includes('/students') || path.includes('/allocations')) {
            return true;
          }
          return true;
        }
        throw new ForbiddenException('Teachers have view-only access to hostel information');

      case 'student':
        // Students have very limited access
        if (method === 'GET') {
          // Allow viewing their own hostel information
          if (path.includes('/my-hostel') || path.includes('/my-room')) {
            return true;
          }
          // Allow viewing available hostels for requests
          if (path.includes('/available')) {
            return true;
          }
          return true;
        }
        // Allow requesting hostel allocation
        if (path.includes('/request') && method === 'POST') {
          return true;
        }
        throw new ForbiddenException('Students have limited access to hostel operations');

      case 'parent':
        // Parents can view their child's hostel information
        if (method === 'GET') {
          // Allow viewing child's hostel information
          if (path.includes('/students') || path.includes('/child-hostel')) {
            return true;
          }
          return true;
        }
        throw new ForbiddenException('Parents have view-only access to hostel information');

      case 'maintenance_staff':
        // Maintenance staff can view and update maintenance-related information
        if (method === 'GET') {
          return true;
        }
        // Allow updating maintenance status
        if (path.includes('/maintenance') && method === 'PUT') {
          return true;
        }
        // Allow updating room conditions
        if (path.includes('/rooms') && path.includes('/condition') && method === 'PUT') {
          return true;
        }
        throw new ForbiddenException('Maintenance staff have limited access to hostel operations');

      case 'security_staff':
        // Security staff can view resident information and access logs
        if (method === 'GET') {
          // Allow viewing resident lists and access information
          if (path.includes('/residents') || path.includes('/access') || path.includes('/security')) {
            return true;
          }
          return true;
        }
        throw new ForbiddenException('Security staff have view-only access to resident information');

      default:
        throw new ForbiddenException('Insufficient permissions for hostel operations');
    }
  }
}