import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentPortalAccess, ParentPortalStatus, ParentPortalAccessLevel } from '../entities/parent-portal-access.entity';
import { ParentStudentLink } from '../entities/parent-student-link.entity';

@Injectable()
export class ParentPortalGuard implements CanActivate {
  private readonly logger = new Logger(ParentPortalGuard.name);

  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    @InjectRepository(ParentPortalAccess)
    private parentPortalAccessRepository: Repository<ParentPortalAccess>,
    @InjectRepository(ParentStudentLink)
    private parentStudentLinkRepository: Repository<ParentStudentLink>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No authentication token provided');
    }

    try {
      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);

      // Validate parent portal access
      const parentPortalAccess = await this.parentPortalAccessRepository.findOne({
        where: { id: payload.parentPortalAccessId },
        relations: ['parent'],
      });

      if (!parentPortalAccess) {
        throw new UnauthorizedException('Parent portal access not found');
      }

      if (parentPortalAccess.status !== ParentPortalStatus.ACTIVE) {
        throw new ForbiddenException('Parent portal access is not active');
      }

      if (parentPortalAccess.isLocked()) {
        throw new ForbiddenException('Account is temporarily locked due to failed login attempts');
      }

      // Check if emergency access is still valid
      if (parentPortalAccess.emergencyAccessGranted &&
          parentPortalAccess.emergencyAccessExpires &&
          parentPortalAccess.emergencyAccessExpires < new Date()) {
        // Reset emergency access
        parentPortalAccess.emergencyAccessGranted = false;
        parentPortalAccess.emergencyAccessExpires = null;
        await this.parentPortalAccessRepository.save(parentPortalAccess);
      }

      // Get student links for this parent
      const studentLinks = await this.parentStudentLinkRepository.find({
        where: {
          parentPortalAccessId: parentPortalAccess.id,
          isActive: true,
        },
      });

      // Attach user info to request
      request.parentPortalAccess = parentPortalAccess;
      request.studentLinks = studentLinks;
      request.user = {
        userId: parentPortalAccess.parentId,
        parentPortalAccessId: parentPortalAccess.id,
        schoolId: parentPortalAccess.schoolId,
        accessLevel: parentPortalAccess.accessLevel,
        studentIds: studentLinks.map(link => link.studentId),
        roles: ['parent'],
      };

      // Log successful authentication
      this.logger.log(`Parent portal access granted for parent: ${parentPortalAccess.parentId}`);

      return true;
    } catch (error) {
      this.logger.error(`Parent portal authentication failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}