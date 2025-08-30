// Academia Pro - Communication Guard
// Authorization guard for communication operations

import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CommunicationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const { method, url } = request;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check if user has required role for communication operations
    const allowedRoles = [
      'super_admin',
      'school_admin',
      'principal',
      'vice_principal',
      'teacher',
      'counselor',
      'librarian',
      'admin_staff',
      'communication_officer',
    ];

    const hasRequiredRole = allowedRoles.some(role => user.roles?.includes(role));

    if (!hasRequiredRole) {
      throw new ForbiddenException('Insufficient permissions for communication operations');
    }

    // Additional checks based on operation type
    if (this.isEmergencyOperation(url)) {
      return this.checkEmergencyPermissions(user);
    }

    if (this.isBulkOperation(url)) {
      return this.checkBulkOperationPermissions(user);
    }

    if (this.isNoticeBoardOperation(url)) {
      return this.checkNoticeBoardPermissions(user, method, url);
    }

    // Check school-level access
    const schoolId = this.extractSchoolId(request);
    if (schoolId && !this.hasSchoolAccess(user, schoolId)) {
      throw new ForbiddenException('Access denied for this school');
    }

    return true;
  }

  private isEmergencyOperation(url: string): boolean {
    return url.includes('/emergency-alert');
  }

  private isBulkOperation(url: string): boolean {
    return url.includes('/bulk') || url.includes('/quick-message');
  }

  private isNoticeBoardOperation(url: string): boolean {
    return url.includes('/notices');
  }

  private checkEmergencyPermissions(user: any): boolean {
    const emergencyRoles = [
      'super_admin',
      'school_admin',
      'principal',
      'vice_principal',
      'communication_officer',
    ];

    return emergencyRoles.some(role => user.roles?.includes(role));
  }

  private checkBulkOperationPermissions(user: any): boolean {
    const bulkRoles = [
      'super_admin',
      'school_admin',
      'principal',
      'vice_principal',
      'communication_officer',
      'admin_staff',
    ];

    return bulkRoles.some(role => user.roles?.includes(role));
  }

  private checkNoticeBoardPermissions(user: any, method: string, url?: string): boolean {
    // Teachers can create notices but only admins can publish
    if (method === 'POST' || method === 'PUT') {
      const publishRoles = [
        'super_admin',
        'school_admin',
        'principal',
        'vice_principal',
        'communication_officer',
      ];

      if (method === 'PUT' && url && url.includes('/publish')) {
        return publishRoles.some(role => user.roles?.includes(role));
      }

      // For creating notices, teachers are also allowed
      const createRoles = [...publishRoles, 'teacher', 'counselor'];
      return createRoles.some(role => user.roles?.includes(role));
    }

    return true;
  }

  private extractSchoolId(request: any): string | null {
    const { params, query, body } = request;

    return (
      params.schoolId ||
      query.schoolId ||
      body.schoolId ||
      body.messageData?.schoolId ||
      body.notificationData?.schoolId ||
      body.noticeData?.schoolId ||
      null
    );
  }

  private hasSchoolAccess(user: any, schoolId: string): boolean {
    if (user.roles?.includes('super_admin')) {
      return true;
    }

    return user.schoolIds?.includes(schoolId) || false;
  }
}