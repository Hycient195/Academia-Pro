import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ParentPortalAccessLevel } from '../entities/parent-portal-access.entity';
import { AuthorizationLevel } from '../entities/parent-student-link.entity';
import { ParentStudentLink } from '../entities/parent-student-link.entity';

@Injectable()
export class ChildAccessGuard implements CanActivate {
  private readonly logger = new Logger(ChildAccessGuard.name);

  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const studentId = this.extractStudentId(request);

    if (!studentId) {
      // If no student ID is specified, allow access (for general portal features)
      return true;
    }

    const parentPortalAccess = request.parentPortalAccess;
    const studentLinks = request.studentLinks;

    if (!parentPortalAccess || !studentLinks) {
      throw new ForbiddenException('Parent portal access not properly authenticated');
    }

    // Check if parent has access to this specific student
    const studentLink = studentLinks.find((link: ParentStudentLink) => link.studentId === studentId);

    if (!studentLink) {
      throw new ForbiddenException('Access denied: Parent does not have access to this student');
    }

    if (!studentLink.isActive) {
      throw new ForbiddenException('Access denied: Student link is not active');
    }

    // Check if parent has required authorization level for this student
    const requiredLevel = this.getRequiredAccessLevel(request);
    if (!studentLink.isAuthorizedFor(requiredLevel)) {
      throw new ForbiddenException(`Access denied: Insufficient authorization level. Required: ${requiredLevel}`);
    }

    // Check for any access restrictions
    if (studentLink.accessRestrictions) {
      const restrictedTypes = studentLink.getActiveRestrictions();
      const requestedResourceType = this.getRequestedResourceType(request);

      if (restrictedTypes.includes(requestedResourceType)) {
        throw new ForbiddenException('Access denied: Resource type is restricted for this student');
      }
    }

    // Check emergency access
    if (parentPortalAccess.emergencyAccessGranted) {
      this.logger.warn(`Emergency access granted for parent ${parentPortalAccess.parentId} to student ${studentId}`);
    }

    // Attach student link to request for use in controllers
    request.studentLink = studentLink;

    this.logger.log(`Child access granted for parent ${parentPortalAccess.parentId} to student ${studentId}`);

    return true;
  }

  private extractStudentId(request: any): string | null {
    // Try to extract student ID from various sources
    const { params, query, body } = request;

    return params?.studentId ||
           query?.studentId ||
           body?.studentId ||
           params?.id || // For routes like /students/:id
           null;
  }

  private getRequiredAccessLevel(request: any): AuthorizationLevel {
    const { method, route } = request;
    const path = route?.path || '';

    // Define access level requirements based on resource and action
    if (path.includes('/grades') || path.includes('/reports') || path.includes('/academic')) {
      return AuthorizationLevel.VIEW_ONLY;
    }

    if (path.includes('/communication') || path.includes('/appointments')) {
      return AuthorizationLevel.LIMITED;
    }

    if (path.includes('/health') || path.includes('/emergency')) {
      return AuthorizationLevel.FULL;
    }

    // Default to view-only for most resources
    return AuthorizationLevel.VIEW_ONLY;
  }

  private getRequestedResourceType(request: any): string {
    const path = request.route?.path || '';

    if (path.includes('/grades') || path.includes('/academic')) {
      return 'academic';
    }

    if (path.includes('/attendance')) {
      return 'attendance';
    }

    if (path.includes('/health') || path.includes('/medical')) {
      return 'medical';
    }

    if (path.includes('/behavior') || path.includes('/disciplinary')) {
      return 'disciplinary';
    }

    if (path.includes('/financial') || path.includes('/fees')) {
      return 'financial';
    }

    return 'general';
  }
}