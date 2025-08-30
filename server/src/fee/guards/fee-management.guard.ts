// Academia Pro - Fee Management Guard
// Authorization guard for fee management operations

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class FeeManagementGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has required role for fee management
    const allowedRoles = [
      'super_admin',
      'school_admin',
      'principal',
      'vice_principal',
      'accountant',
      'finance_officer',
      'admin_staff',
    ];

    const hasRequiredRole = allowedRoles.some(role => user.roles?.includes(role));

    if (!hasRequiredRole) {
      throw new ForbiddenException('Insufficient permissions for fee management');
    }

    // Additional school-level access control
    const schoolId = this.extractSchoolId(request);
    if (schoolId && !this.hasSchoolAccess(user, schoolId)) {
      throw new ForbiddenException('Access denied for this school');
    }

    return true;
  }

  private extractSchoolId(request: any): string | null {
    // Extract school ID from various sources
    const { params, query, body } = request;

    return (
      params.schoolId ||
      query.schoolId ||
      body.schoolId ||
      body.feeStructure?.schoolId ||
      null
    );
  }

  private hasSchoolAccess(user: any, schoolId: string): boolean {
    // Check if user has access to the specified school
    if (user.roles?.includes('super_admin')) {
      return true; // Super admin has access to all schools
    }

    // Check if user is assigned to this school
    return user.schoolIds?.includes(schoolId) || false;
  }
}