// Academia Pro - School Context Guard
// Guard for multi-school architecture and data isolation via x-school-id header

import { Injectable, CanActivate, ExecutionContext, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { SchoolContextService } from '../../schools/school-context.service';

@Injectable()
export class SchoolContextGuard implements CanActivate {
  private readonly logger = new Logger(SchoolContextGuard.name);

  constructor(private readonly schoolContextService: SchoolContextService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { user, method } = request;

    // Always allow preflight and unprotected system endpoints
    if (method === 'OPTIONS' || this.isBypassedRoute(request)) {
      return true;
    }

    if (!user) {
      // Defer to auth guards (e.g., JwtAuthGuard) so unauthenticated requests receive 401 from the auth layer
      return true;
    }

    try {
      // Prioritize x-school-id header for explicit scoping
      const headerSchoolId = (request.headers?.['x-school-id'] as string) || undefined;

      // Fall back to other request locations if header is absent
      const requestSchoolId = headerSchoolId || this.extractSchoolId(request);

      if (!requestSchoolId) {
        // For school-scoped endpoints, an explicit school id is required
        throw new BadRequestException('x-school-id header is required for school-scoped endpoints');
      }

      // Get school context for the user within the requested school
      const schoolContext = await this.schoolContextService.getSchoolContext(user.id, requestSchoolId);

      if (!schoolContext) {
        this.logger.warn(`No school context found for user ${user.id} with school ${requestSchoolId}`);
        throw new ForbiddenException('Unable to resolve school context');
      }

      // Validate access to the requested school
      const hasAccess = await this.schoolContextService.validateSchoolAccess(user.id, requestSchoolId);
      if (!hasAccess) {
        this.logger.warn(`User ${user.id} does not have access to school ${requestSchoolId}`);
        throw new ForbiddenException('Access to requested school is denied');
      }

      // Attach school context and schoolId for downstream access (services, interceptors, audit)
      request.schoolContext = schoolContext;
      request.schoolId = schoolContext.schoolId;

      return true;
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error in SchoolContextGuard: ${error?.message || error}`);
      throw new ForbiddenException('Failed to verify school context');
    }
  }

  private extractSchoolId(request: any): string | undefined {
    const { params, body, query } = request;

    if (params?.schoolId) return params.schoolId;
    if (body?.schoolId) return body.schoolId;
    if (query?.schoolId) return query.schoolId;

    return undefined;
  }

  private isBypassedRoute(request: any): boolean {
    const url: string = (request.url || '').toLowerCase();
    const id = request.user?.id;

    // System and socket endpoints
    if (id === 'system' || url.includes('/socket.io') || url.includes('/audit')) {
      return true;
    }

    // Auth and cross-school administration/system endpoints
    const bypassPrefixes = [
      '/api/v1/auth',
      '/api/v1/super-admin',
      '/api/v1/system',
      '/api/v1/health',
      '/api/v1/iam-proxy',
    ];

    return bypassPrefixes.some(prefix => url.startsWith(prefix));
  }
}