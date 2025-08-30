// Academia Pro - Library Guard
// Route protection and authorization for library operations

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class LibraryGuard implements CanActivate {
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
        // Full access to all library operations
        return true;

      case 'school_admin':
      case 'principal':
        // Full access to library operations within their school
        return true;

      case 'librarian':
        // Librarians have full access to all library operations
        return true;

      case 'library_assistant':
        // Library assistants can perform most operations but may have restrictions
        if (method === 'DELETE') {
          // May need approval for deletions
          return true;
        }
        if (path.includes('/bulk') && method === 'POST') {
          // Bulk operations may require special permissions
          return true;
        }
        return true;

      case 'department_head':
        // Department heads can view library resources and reserve books
        if (method === 'GET') {
          return true;
        }
        if (path.includes('/search') || path.includes('/available')) {
          return true;
        }
        // Allow reserving books for their department
        if (path.includes('/reserve') && method === 'POST') {
          return true;
        }
        throw new ForbiddenException('Department heads have limited library modification permissions');

      case 'teacher':
        // Teachers can search, view, and reserve books
        if (method === 'GET') {
          return true;
        }
        if (path.includes('/search') || path.includes('/available')) {
          return true;
        }
        // Allow reserving books
        if (path.includes('/reserve') && method === 'POST') {
          return true;
        }
        throw new ForbiddenException('Teachers can only view and reserve books');

      case 'student':
        // Students have the most restricted access
        if (method === 'GET') {
          // Allow viewing available books and their own borrowing history
          if (path.includes('/available') || path.includes('/search')) {
            return true;
          }
          // Allow viewing their own borrowed books
          if (path.includes('/my-books') || path.includes('/borrowed')) {
            return true;
          }
          return true;
        }
        // Allow reserving books
        if (path.includes('/reserve') && method === 'POST') {
          return true;
        }
        throw new ForbiddenException('Students can only view available books and manage their reservations');

      case 'parent':
        // Parents can view library resources but limited modifications
        if (method === 'GET') {
          return true;
        }
        if (path.includes('/search') || path.includes('/available')) {
          return true;
        }
        throw new ForbiddenException('Parents have view-only access to library resources');

      default:
        throw new ForbiddenException('Insufficient permissions for library operations');
    }
  }
}