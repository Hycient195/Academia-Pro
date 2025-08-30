import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentDocument } from '../entities/student-document.entity';
import { DocumentStatus } from '../entities/student-document.entity';

@Injectable()
export class DocumentAccessGuard implements CanActivate {
  constructor(
    @InjectRepository(StudentDocument)
    private studentDocumentRepository: Repository<StudentDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const documentId = request.params.documentId || request.params.id;

    if (!documentId) {
      return true; // Allow if no specific document is being accessed
    }

    // Get the document
    const document = await this.studentDocumentRepository.findOne({
      where: { id: documentId },
      relations: ['student'],
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check if document is accessible
    if (document.status !== DocumentStatus.VERIFIED && document.status !== DocumentStatus.SUBMITTED) {
      throw new ForbiddenException('Document is not in an accessible state');
    }

    // Check if document has expired
    if (document.expiryDate && document.expiryDate < new Date()) {
      throw new ForbiddenException('Document has expired');
    }

    // Check access restrictions
    if (document.accessExpiresAt && document.accessExpiresAt < new Date()) {
      throw new ForbiddenException('Document access has expired');
    }

    // Check user role permissions
    if (!this.hasRoleAccess(user.role, document.allowedRoles)) {
      throw new ForbiddenException('Insufficient permissions to access this document');
    }

    // Check confidentiality restrictions
    if (document.isConfidential && !this.canAccessConfidential(user.role)) {
      throw new ForbiddenException('Access denied to confidential document');
    }

    // Attach document to request for use in controllers
    request.document = document;

    return true;
  }

  private hasRoleAccess(userRole: string, allowedRoles: string[]): boolean {
    return allowedRoles.includes(userRole) ||
           allowedRoles.includes('admin') ||
           (userRole === 'super-admin');
  }

  private canAccessConfidential(userRole: string): boolean {
    const confidentialAccessRoles = ['super-admin', 'school-admin', 'principal', 'counselor', 'medical-officer'];
    return confidentialAccessRoles.includes(userRole);
  }
}