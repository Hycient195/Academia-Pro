// Academia Pro - School Isolation Middleware
// Ensures data segregation and access control between schools

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SchoolContextService } from '../../schools/school-context.service';

@Injectable()
export class SchoolIsolationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SchoolIsolationMiddleware.name);

  constructor(
    private readonly schoolContextService: SchoolContextService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract user information from request
      const user = (req as any).user;
      if (!user) {
        this.logger.warn('No user found in request for school isolation');
        return next();
      }

      // Extract school ID from various sources
      const schoolId = this.extractSchoolId(req);

      // Get school context
      const schoolContext = await this.schoolContextService.getSchoolContext(user.id, schoolId);

      if (!schoolContext) {
        this.logger.warn(`No school context found for user ${user.id}`);
        res.status(403).json({
          error: 'Access Denied',
          message: 'Unable to determine school context for this request',
        });
        return;
      }

      // Attach school context to request for use in controllers and services
      (req as any).schoolContext = schoolContext;

      // Add school ID to query parameters for automatic filtering
      if (!req.query.schoolId) {
        req.query.schoolId = schoolContext.schoolId;
      }

      // Log the school context for debugging
      this.logger.debug(`School context set: ${schoolContext.schoolId} for user ${user.id}`);

      next();
    } catch (error) {
      this.logger.error('Error in school isolation middleware:', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Failed to process school context',
      });
    }
  }

  private extractSchoolId(req: Request): string | undefined {
    // Priority order for extracting school ID:
    // 1. Explicit schoolId in query parameters
    // 2. schoolId in request body
    // 3. schoolId in route parameters
    // 4. schoolId from JWT token claims
    // 5. User's default school

    // Check query parameters
    if (req.query.schoolId && typeof req.query.schoolId === 'string') {
      return req.query.schoolId;
    }

    // Check request body
    if (req.body && req.body.schoolId) {
      return req.body.schoolId;
    }

    // Check route parameters
    if (req.params && req.params.schoolId) {
      return req.params.schoolId;
    }

    // Check JWT token claims (if available)
    const user = (req as any).user;
    if (user && user.schoolId) {
      return user.schoolId;
    }

    return undefined;
  }
}