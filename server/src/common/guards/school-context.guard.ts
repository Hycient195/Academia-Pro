// Academia Pro - School Context Guard
// Guard for multi-school architecture and data isolation

import { Injectable, CanActivate, ExecutionContext, Logger } from '@nestjs/common';
import { SchoolContextService } from '../../schools/school-context.service';

@Injectable()
export class SchoolContextGuard implements CanActivate {
  private readonly logger = new Logger(SchoolContextGuard.name);

  constructor(private readonly schoolContextService: SchoolContextService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      this.logger.warn('No user found in request');
      return false;
    }

    try {
      // Extract school ID from request parameters or body
      const schoolId = this.extractSchoolId(request);

      // Get school context for the user
      const schoolContext = await this.schoolContextService.getSchoolContext(user.id, schoolId);

      if (!schoolContext) {
        this.logger.warn(`No school context found for user ${user.id}`);
        return false;
      }

      // Attach school context to request for use in controllers
      request.schoolContext = schoolContext;

      // Validate access to the requested school
      if (schoolId) {
        const hasAccess = await this.schoolContextService.validateSchoolAccess(user.id, schoolId);
        if (!hasAccess) {
          this.logger.warn(`User ${user.id} does not have access to school ${schoolId}`);
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error(`Error in SchoolContextGuard:`, error);
      return false;
    }
  }

  private extractSchoolId(request: any): string | undefined {
    // Try to extract school ID from various sources
    const { params, body, query } = request;

    // Check URL parameters
    if (params.schoolId) {
      return params.schoolId;
    }

    // Check request body
    if (body.schoolId) {
      return body.schoolId;
    }

    // Check query parameters
    if (query.schoolId) {
      return query.schoolId;
    }

    // For super admin routes, school ID might not be required
    return undefined;
  }
}