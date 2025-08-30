// Academia Pro - Staff Guard
// Route protection and authorization for staff management operations

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class StaffGuard implements CanActivate {
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
        // Full access to all staff operations
        return true;

      case 'school_admin':
      case 'principal':
        // Full access to staff operations within their school
        return true;

      case 'hr_manager':
        // HR managers have full access to staff management
        return true;

      case 'department_head':
        // Department heads can view and manage staff in their department
        if (method === 'GET') {
          return true; // Can view all staff
        }

        // For POST/PUT/DELETE, check if they're managing staff in their department
        if (['POST', 'PUT', 'DELETE'].includes(method)) {
          const body = request.body;
          const params = request.params;

          // Check if the operation is for their department
          if (body?.department === user.department || params?.department === user.department) {
            return true;
          }

          // Allow updating their own profile
          if (params?.id === user.id) {
            return true;
          }

          throw new ForbiddenException('Department heads can only manage staff in their department');
        }

        return true;

      case 'teacher':
      case 'staff':
        // Regular staff can only view their own information and update their profile
        if (method === 'GET') {
          // Allow viewing general staff lists and their own profile
          if (path.includes('/staff/') && request.params?.id === user.id) {
            return true;
          }
          // Allow viewing general statistics and reports
          if (path.includes('/statistics') || path.includes('/dashboard') || path.includes('/reports')) {
            return true;
          }
          return true; // Allow viewing staff lists
        }

        // Allow updating their own profile
        if (method === 'PUT' && request.params?.id === user.id) {
          return true;
        }

        // Allow processing their own leave requests
        if (path.includes('/leave') && request.params?.id === user.id) {
          return true;
        }

        throw new ForbiddenException('You can only access your own staff information');

      default:
        throw new ForbiddenException('Insufficient permissions for staff management operations');
    }
  }
}