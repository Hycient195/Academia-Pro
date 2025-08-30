// Academia Pro - Student Document Controller
// REST API endpoints for managing student documents and verification

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentDocumentService } from '../services/document.service';
import { CreateDocumentDto, UpdateDocumentDto } from '../dtos/create-document.dto';
import { StudentManagementGuard } from '../guards/student-management.guard';

@ApiTags('Student Document Management')
@ApiBearerAuth()
@Controller('students/:studentId/documents')
@UseGuards(StudentManagementGuard)
export class StudentDocumentController {
  constructor(private readonly documentService: StudentDocumentService) {}

  @Post('upload')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload document',
    description: 'Upload a new document for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Document upload data',
    type: CreateDocumentDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Document uploaded successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async uploadDocument(
    @Param('studentId') studentId: string,
    @Body() createDto: CreateDocumentDto,
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    const uploadedBy = req.user?.id || 'system';
    const uploadedByName = req.user?.name || 'System';
    const uploadIpAddress = req.ip || req.connection?.remoteAddress;

    // In a real implementation, you would:
    // 1. Upload the file to cloud storage (AWS S3, etc.)
    // 2. Generate a secure file URL
    // 3. Create a file hash for integrity
    // For now, we'll simulate this

    const fileUrl = `https://storage.example.com/documents/${file?.filename || 'uploaded_file'}`;
    const fileSizeBytes = file?.size || createDto.fileSizeBytes;
    const mimeType = file?.mimetype || createDto.mimeType;

    const documentData = {
      ...createDto,
      fileUrl,
      fileSizeBytes,
      mimeType,
    };

    return this.documentService.uploadDocument(
      studentId,
      documentData,
      uploadedBy,
      uploadedByName,
      uploadIpAddress,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create document record',
    description: 'Create a document record without file upload (for existing files)',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 201,
    description: 'Document record created successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Student not found',
  })
  async createDocumentRecord(
    @Param('studentId') studentId: string,
    @Body() createDto: CreateDocumentDto,
    @Request() req: any,
  ) {
    const uploadedBy = req.user?.id || 'system';
    const uploadedByName = req.user?.name || 'System';
    const uploadIpAddress = req.ip || req.connection?.remoteAddress;

    return this.documentService.uploadDocument(
      studentId,
      createDto,
      uploadedBy,
      uploadedByName,
      uploadIpAddress,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get student documents',
    description: 'Retrieve all documents for a specific student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by document status',
    example: 'verified',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter by document type',
    example: 'birth_certificate',
  })
  @ApiQuery({
    name: 'verificationStatus',
    required: false,
    description: 'Filter by verification status',
    example: 'verified',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limit number of documents',
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset for pagination',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
  })
  async getStudentDocuments(
    @Param('studentId') studentId: string,
    @Query() query: any,
  ) {
    const options = {
      status: query.status,
      type: query.type,
      verificationStatus: query.verificationStatus,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };
    return this.documentService.getStudentDocuments(studentId, options);
  }

  @Get(':documentId')
  @ApiOperation({
    summary: 'Get specific document',
    description: 'Retrieve a specific document by ID',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    example: 'document-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Document retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async getDocument(@Param('documentId') documentId: string) {
    return this.documentService.getDocument(documentId);
  }

  @Put(':documentId')
  @ApiOperation({
    summary: 'Update document',
    description: 'Update a specific document',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    example: 'document-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Document updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async updateDocument(
    @Param('documentId') documentId: string,
    @Body() updateDto: UpdateDocumentDto,
  ) {
    return this.documentService.updateDocument(documentId, updateDto);
  }

  @Delete(':documentId')
  @ApiOperation({
    summary: 'Delete document',
    description: 'Delete a specific document',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    example: 'document-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Document deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async deleteDocument(@Param('documentId') documentId: string) {
    await this.documentService.deleteDocument(documentId);
    return { message: 'Document deleted successfully' };
  }

  @Get('type/:documentType')
  @ApiOperation({
    summary: 'Get documents by type',
    description: 'Retrieve documents of a specific type for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'documentType',
    description: 'Document type',
    example: 'birth_certificate',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
  })
  async getDocumentsByType(
    @Param('studentId') studentId: string,
    @Param('documentType') documentType: string,
  ) {
    return this.documentService.getDocumentsByType(studentId, documentType);
  }

  @Get('status/:status')
  @ApiOperation({
    summary: 'Get documents by status',
    description: 'Retrieve documents of a specific status for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'status',
    description: 'Document status',
    example: 'verified',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents retrieved successfully',
  })
  async getDocumentsByStatus(
    @Param('studentId') studentId: string,
    @Param('status') status: string,
  ) {
    return this.documentService.getDocumentsByStatus(studentId, status);
  }

  @Get('verified/all')
  @ApiOperation({
    summary: 'Get verified documents',
    description: 'Retrieve all verified documents for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Verified documents retrieved successfully',
  })
  async getVerifiedDocuments(@Param('studentId') studentId: string) {
    return this.documentService.getVerifiedDocuments(studentId);
  }

  @Get('verification/pending')
  @ApiOperation({
    summary: 'Get documents requiring verification',
    description: 'Retrieve documents that require verification for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents requiring verification retrieved successfully',
  })
  async getDocumentsRequiringVerification(@Param('studentId') studentId: string) {
    return this.documentService.getDocumentsRequiringVerification(studentId);
  }

  @Get('expired/all')
  @ApiOperation({
    summary: 'Get expired documents',
    description: 'Retrieve all expired documents for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Expired documents retrieved successfully',
  })
  async getExpiredDocuments(@Param('studentId') studentId: string) {
    return this.documentService.getExpiredDocuments(studentId);
  }

  @Get('renewal/required')
  @ApiOperation({
    summary: 'Get documents requiring renewal',
    description: 'Retrieve documents that require renewal for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Documents requiring renewal retrieved successfully',
  })
  async getDocumentsRequiringRenewal(@Param('studentId') studentId: string) {
    return this.documentService.getDocumentsRequiringRenewal(studentId);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search documents',
    description: 'Search documents by term for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search term',
    example: 'birth certificate',
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchDocuments(
    @Param('studentId') studentId: string,
    @Query('q') searchTerm: string,
  ) {
    return this.documentService.searchDocuments(studentId, searchTerm);
  }

  @Put(':documentId/verify')
  @ApiOperation({
    summary: 'Verify document',
    description: 'Verify a document and update its status',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    example: 'document-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Document verified successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async verifyDocument(
    @Param('documentId') documentId: string,
    @Body() body: { verificationMethod: string; verificationNotes?: string },
    @Request() req: any,
  ) {
    const verifiedBy = req.user?.id || 'system';
    const verifiedByName = req.user?.name || 'System';

    return this.documentService.verifyDocument(
      documentId,
      verifiedBy,
      verifiedByName,
      body.verificationMethod as any,
      body.verificationNotes,
    );
  }

  @Put(':documentId/reject')
  @ApiOperation({
    summary: 'Reject document',
    description: 'Reject a document with reason',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    example: 'document-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Document rejected successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Document not found',
  })
  async rejectDocument(
    @Param('documentId') documentId: string,
    @Body() body: { rejectionReason: string },
    @Request() req: any,
  ) {
    const rejectedBy = req.user?.id || 'system';
    const rejectedByName = req.user?.name || 'System';

    return this.documentService.rejectDocument(
      documentId,
      body.rejectionReason,
      rejectedBy,
      rejectedByName,
    );
  }

  @Put(':documentId/access')
  @ApiOperation({
    summary: 'Record document access',
    description: 'Record when a document is viewed or downloaded',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    example: 'document-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Document access recorded successfully',
  })
  async recordDocumentAccess(
    @Param('documentId') documentId: string,
    @Body() body: { accessType: 'view' | 'download' },
    @Request() req: any,
  ) {
    const accessedBy = req.user?.id || 'system';
    await this.documentService.recordDocumentAccess(documentId, body.accessType, accessedBy);
    return { message: 'Document access recorded successfully' };
  }

  @Get(':documentId/access-check')
  @ApiOperation({
    summary: 'Check document access',
    description: 'Check if a user has access to a document',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiParam({
    name: 'documentId',
    description: 'Document ID',
    example: 'document-uuid-456',
  })
  @ApiResponse({
    status: 200,
    description: 'Access check completed',
  })
  async checkDocumentAccess(
    @Param('documentId') documentId: string,
    @Request() req: any,
  ) {
    const userRole = req.user?.role || 'student';
    const hasAccess = await this.documentService.isDocumentAccessible(documentId, userRole);
    return { hasAccess };
  }

  @Get('statistics/overview')
  @ApiOperation({
    summary: 'Get document statistics',
    description: 'Get document statistics for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Document statistics retrieved successfully',
  })
  async getDocumentStatistics(@Param('studentId') studentId: string) {
    return this.documentService.getDocumentStatistics(studentId);
  }

  @Post('check-expired')
  @ApiOperation({
    summary: 'Check for expired documents',
    description: 'Check and mark expired documents for a student',
  })
  @ApiParam({
    name: 'studentId',
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Expired documents check completed',
  })
  async checkExpiredDocuments(@Param('studentId') studentId: string) {
    const expiredDocuments = await this.documentService.checkExpiredDocuments(studentId);
    return {
      message: 'Expired documents check completed',
      expiredDocumentsCount: expiredDocuments.length,
      expiredDocuments,
    };
  }
}