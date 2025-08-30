import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentPortalAccess } from '../entities/student-portal-access.entity';
import { StudentPortalAccessLevel } from '../entities/student-portal-access.entity';

@Injectable()
export class StudentAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(StudentPortalAccess)
    private studentPortalAccessRepository: Repository<StudentPortalAccess>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const studentId = request.studentId;
    const schoolId = request.schoolId;

    if (!studentId || !schoolId) {
      throw new ForbiddenException('Student authentication required');
    }

    // Get student's portal access record
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId, schoolId },
    });

    if (!portalAccess) {
      throw new NotFoundException('Student portal access not found');
    }

    // Check if portal access is active
    if (portalAccess.status !== 'active') {
      throw new ForbiddenException('Student portal access is not active');
    }

    // Check if account is locked
    if (portalAccess.accountLockedUntil && portalAccess.accountLockedUntil > new Date()) {
      throw new ForbiddenException('Account is temporarily locked');
    }

    // Check access level for specific resources
    const requiredLevel = this.getRequiredAccessLevel(context);
    if (!this.hasRequiredAccessLevel(portalAccess.accessLevel, requiredLevel)) {
      throw new ForbiddenException('Insufficient access level for this resource');
    }

    // Attach portal access to request for use in controllers
    request.portalAccess = portalAccess;

    return true;
  }

  private getRequiredAccessLevel(context: ExecutionContext): StudentPortalAccessLevel {
    const handler = context.getHandler();
    const controller = context.getClass();

    // Check for access level metadata on the handler
    const handlerLevel = Reflect.getMetadata('accessLevel', handler);
    if (handlerLevel) {
      return handlerLevel;
    }

    // Check for access level metadata on the controller
    const controllerLevel = Reflect.getMetadata('accessLevel', controller);
    if (controllerLevel) {
      return controllerLevel;
    }

    // Default to basic access
    return StudentPortalAccessLevel.BASIC;
  }

  private hasRequiredAccessLevel(
    userLevel: StudentPortalAccessLevel,
    requiredLevel: StudentPortalAccessLevel,
  ): boolean {
    const levelHierarchy = {
      [StudentPortalAccessLevel.BASIC]: 1,
      [StudentPortalAccessLevel.STANDARD]: 2,
      [StudentPortalAccessLevel.PREMIUM]: 3,
      [StudentPortalAccessLevel.RESTRICTED]: 0, // Restricted has lowest access
    };

    return levelHierarchy[userLevel] >= levelHierarchy[requiredLevel];
  }
}