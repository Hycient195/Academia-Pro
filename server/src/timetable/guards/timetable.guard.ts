// Academia Pro - Timetable Guard
// Route protection and authorization for timetable operations

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TimetableGuard implements CanActivate {
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
      case 'school_admin':
      case 'principal':
        // Full access to all timetable operations
        return true;

      case 'teacher':
        // Teachers can view and manage their own schedules
        if (method === 'GET') {
          return true; // Can view all timetables
        }

        // For POST/PUT/DELETE, check if they're managing their own schedule
        if (path.includes('/teacher/') && request.params.teacherId === user.id) {
          return true;
        }

        // Teachers can create/update timetables for their subjects
        if (['POST', 'PUT'].includes(method) && request.body?.teacherId === user.id) {
          return true;
        }

        throw new ForbiddenException('Teachers can only manage their own schedules');

      case 'student':
        // Students can only view timetables
        if (method === 'GET') {
          return true;
        }
        throw new ForbiddenException('Students can only view timetables');

      case 'parent':
        // Parents can view their children's timetables
        if (method === 'GET') {
          return true;
        }
        throw new ForbiddenException('Parents can only view timetables');

      default:
        throw new ForbiddenException('Insufficient permissions for timetable operations');
    }
  }
}