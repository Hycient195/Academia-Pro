import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsArray, IsNumber, IsDateString, IsObject, IsBoolean, ValidateNested, Min, Max, IsUrl, IsUUID } from 'class-validator';

// Enums
export enum ResourceType {
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  PRESENTATION = 'presentation',
  INTERACTIVE = 'interactive',
  WORKSHEET = 'worksheet',
  QUIZ = 'quiz',
  LESSON_PLAN = 'lesson_plan',
  STUDY_GUIDE = 'study_guide',
  REFERENCE = 'reference',
  ASSESSMENT = 'assessment',
}

export enum ResourceCategory {
  CURRICULUM = 'curriculum',
  HOMEWORK = 'homework',
  STUDY_MATERIALS = 'study_materials',
  EXTRACURRICULAR = 'extracurricular',
  PARENT_RESOURCES = 'parent_resources',
  SCHOOL_POLICIES = 'school_policies',
  FORMS = 'forms',
  NEWSLETTERS = 'newsletters',
  EVENTS = 'events',
  HEALTH_SAFETY = 'health_safety',
  CAREER_GUIDANCE = 'career_guidance',
  LIBRARY_RESOURCES = 'library_resources',
}

export enum AccessLevel {
  PUBLIC = 'public',
  SCHOOL_ONLY = 'school_only',
  GRADE_SPECIFIC = 'grade_specific',
  CLASS_SPECIFIC = 'class_specific',
  STUDENT_SPECIFIC = 'student_specific',
  PARENT_ONLY = 'parent_only',
}

export enum ResourceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  PENDING_REVIEW = 'pending_review',
  REJECTED = 'rejected',
}

export enum ResourceLanguage {
  ENGLISH = 'en',
  SPANISH = 'es',
  FRENCH = 'fr',
  GERMAN = 'de',
  CHINESE = 'zh',
  JAPANESE = 'ja',
  ARABIC = 'ar',
  HINDI = 'hi',
  PORTUGUESE = 'pt',
  RUSSIAN = 'ru',
}

// Response DTOs
export class ResourceResponseDto {
  @ApiProperty({
    description: 'Resource ID',
    example: 'resource-001',
  })
  resourceId: string;

  @ApiProperty({
    description: 'Resource title',
    example: 'Introduction to Algebra',
  })
  title: string;

  @ApiProperty({
    description: 'Resource description',
    example: 'Comprehensive guide to basic algebraic concepts',
  })
  description: string;

  @ApiProperty({
    description: 'Resource type',
    enum: ResourceType,
  })
  type: ResourceType;

  @ApiProperty({
    description: 'Resource category',
    enum: ResourceCategory,
  })
  category: ResourceCategory;

  @ApiProperty({
    description: 'Access level',
    enum: AccessLevel,
  })
  accessLevel: AccessLevel;

  @ApiProperty({
    description: 'Resource status',
    enum: ResourceStatus,
  })
  status: ResourceStatus;

  @ApiProperty({
    description: 'Resource language',
    enum: ResourceLanguage,
    example: ResourceLanguage.ENGLISH,
  })
  language: ResourceLanguage;

  @ApiProperty({
    description: 'File information',
  })
  fileInfo: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    thumbnailUrl?: string;
  };

  @ApiProperty({
    description: 'Metadata',
  })
  metadata: {
    subject?: string;
    grade?: string;
    topic?: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    estimatedDuration?: number; // minutes
    tags: string[];
    prerequisites?: string[];
    learningObjectives?: string[];
  };

  @ApiProperty({
    description: 'Usage statistics',
  })
  statistics: {
    viewCount: number;
    downloadCount: number;
    bookmarkCount: number;
    shareCount: number;
    averageRating: number;
    totalRatings: number;
  };

  @ApiProperty({
    description: 'Upload information',
  })
  uploadInfo: {
    uploadedBy: string;
    uploadedByName: string;
    uploadedAt: Date;
    lastModified: Date;
    version: number;
  };

  @ApiProperty({
    description: 'Access control',
  })
  accessControl: {
    isBookmarked: boolean;
    canDownload: boolean;
    canShare: boolean;
    canEdit: boolean;
    expirationDate?: Date;
  };

  @ApiProperty({
    description: 'Related resources',
    type: [Object],
  })
  relatedResources: Array<{
    resourceId: string;
    title: string;
    type: ResourceType;
    relevance: number;
  }>;

  @ApiProperty({
    description: 'Comments and reviews',
    type: [Object],
  })
  comments: Array<{
    commentId: string;
    userId: string;
    userName: string;
    comment: string;
    rating?: number;
    createdAt: Date;
  }>;
}

export class ResourceListResponseDto {
  @ApiProperty({
    description: 'List of resources',
    type: [ResourceResponseDto],
  })
  resources: ResourceResponseDto[];

  @ApiProperty({
    description: 'Total number of resources',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Page size',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Search filters applied',
  })
  filters: {
    query?: string;
    category?: ResourceCategory;
    type?: ResourceType;
    grade?: string;
    subject?: string;
    language?: ResourceLanguage;
  };

  @ApiProperty({
    description: 'Sort options',
  })
  sort: {
    field: string;
    order: 'asc' | 'desc';
  };
}

export class ResourceCategoryResponseDto {
  @ApiProperty({
    description: 'Category ID',
    example: 'category-001',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Category name',
    example: 'Mathematics',
  })
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Resources related to mathematics education',
  })
  description: string;

  @ApiProperty({
    description: 'Parent category',
  })
  parentCategory?: {
    categoryId: string;
    name: string;
  };

  @ApiProperty({
    description: 'Subcategories',
    type: [Object],
  })
  subcategories: Array<{
    categoryId: string;
    name: string;
    description: string;
    resourceCount: number;
  }>;

  @ApiProperty({
    description: 'Resource count in this category',
    example: 45,
  })
  resourceCount: number;

  @ApiProperty({
    description: 'Category icon URL',
    example: 'https://example.com/icons/math.png',
  })
  iconUrl: string;

  @ApiProperty({
    description: 'Category color',
    example: '#FF6B6B',
  })
  color: string;

  @ApiProperty({
    description: 'Display order',
    example: 1,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Is category active',
    example: true,
  })
  isActive: boolean;
}

export class ResourceDownloadResponseDto {
  @ApiProperty({
    description: 'Download ID',
    example: 'download-001',
  })
  downloadId: string;

  @ApiProperty({
    description: 'Resource ID',
    example: 'resource-001',
  })
  resourceId: string;

  @ApiProperty({
    description: 'Download URL',
    example: 'https://storage.example.com/resources/resource-001.pdf',
  })
  downloadUrl: string;

  @ApiProperty({
    description: 'File name',
    example: 'algebra-guide.pdf',
  })
  fileName: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 2048576,
  })
  fileSize: number;

  @ApiProperty({
    description: 'Content type',
    example: 'application/pdf',
  })
  contentType: string;

  @ApiProperty({
    description: 'Download expiration time',
  })
  expiresAt: Date;

  @ApiProperty({
    description: 'Download limit',
    example: 5,
  })
  downloadLimit: number;

  @ApiProperty({
    description: 'Downloads remaining',
    example: 4,
  })
  downloadsRemaining: number;

  @ApiProperty({
    description: 'Requires authentication',
    example: true,
  })
  requiresAuth: boolean;
}

export class ResourceAccessLogResponseDto {
  @ApiProperty({
    description: 'Access log ID',
    example: 'access-001',
  })
  accessId: string;

  @ApiProperty({
    description: 'Resource ID',
    example: 'resource-001',
  })
  resourceId: string;

  @ApiProperty({
    description: 'User ID who accessed the resource',
    example: 'user-001',
  })
  userId: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  userName: string;

  @ApiProperty({
    description: 'Access type',
    enum: ['view', 'download', 'bookmark', 'share', 'edit'],
  })
  accessType: 'view' | 'download' | 'bookmark' | 'share' | 'edit';

  @ApiProperty({
    description: 'Access timestamp',
  })
  accessedAt: Date;

  @ApiProperty({
    description: 'IP address',
    example: '192.168.1.100',
  })
  ipAddress: string;

  @ApiProperty({
    description: 'User agent',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  userAgent: string;

  @ApiProperty({
    description: 'Session ID',
    example: 'session-abc123',
  })
  sessionId: string;

  @ApiProperty({
    description: 'Device information',
  })
  deviceInfo: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
    screenResolution?: string;
  };

  @ApiProperty({
    description: 'Location information',
  })
  location?: {
    country: string;
    region: string;
    city: string;
    coordinates?: [number, number];
  };

  @ApiProperty({
    description: 'Access duration in seconds',
    example: 300,
  })
  duration?: number;

  @ApiProperty({
    description: 'Completion status',
    example: 85,
  })
  completionPercentage?: number;

  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Error message if access failed',
  })
  errorMessage?: string;
}

export class EducationalMaterialResponseDto {
  @ApiProperty({
    description: 'Material ID',
    example: 'material-001',
  })
  materialId: string;

  @ApiProperty({
    description: 'Material title',
    example: 'Quadratic Equations Study Guide',
  })
  title: string;

  @ApiProperty({
    description: 'Subject',
    example: 'Mathematics',
  })
  subject: string;

  @ApiProperty({
    description: 'Grade level',
    example: '9',
  })
  grade: string;

  @ApiProperty({
    description: 'Topic',
    example: 'Quadratic Equations',
  })
  topic: string;

  @ApiProperty({
    description: 'Material type',
    enum: ResourceType,
  })
  type: ResourceType;

  @ApiProperty({
    description: 'Difficulty level',
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  @ApiProperty({
    description: 'Estimated study time in minutes',
    example: 60,
  })
  estimatedTime: number;

  @ApiProperty({
    description: 'Learning objectives',
    type: [String],
  })
  learningObjectives: string[];

  @ApiProperty({
    description: 'Prerequisites',
    type: [String],
  })
  prerequisites: string[];

  @ApiProperty({
    description: 'Tags',
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'File information',
  })
  fileInfo: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    thumbnailUrl?: string;
  };

  @ApiProperty({
    description: 'Usage statistics',
  })
  statistics: {
    viewCount: number;
    downloadCount: number;
    averageRating: number;
    completionRate: number;
  };

  @ApiProperty({
    description: 'Related materials',
    type: [Object],
  })
  relatedMaterials: Array<{
    materialId: string;
    title: string;
    type: ResourceType;
    difficulty: string;
  }>;

  @ApiProperty({
    description: 'Is material recommended',
    example: true,
  })
  isRecommended: boolean;

  @ApiProperty({
    description: 'Last updated',
  })
  lastUpdated: Date;
}

export class DocumentResponseDto {
  @ApiProperty({
    description: 'Document ID',
    example: 'document-001',
  })
  documentId: string;

  @ApiProperty({
    description: 'Document title',
    example: 'School Attendance Policy',
  })
  title: string;

  @ApiProperty({
    description: 'Document category',
    example: 'policies',
  })
  category: string;

  @ApiProperty({
    description: 'Document type',
    example: 'policy',
  })
  documentType: string;

  @ApiProperty({
    description: 'Description',
    example: 'Official school attendance policy and procedures',
  })
  description: string;

  @ApiProperty({
    description: 'File information',
  })
  fileInfo: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    thumbnailUrl?: string;
  };

  @ApiProperty({
    description: 'Document metadata',
  })
  metadata: {
    version: string;
    effectiveDate: Date;
    reviewDate?: Date;
    approvalRequired: boolean;
    confidential: boolean;
  };

  @ApiProperty({
    description: 'Access information',
  })
  accessInfo: {
    requiresSignature: boolean;
    signatureDeadline?: Date;
    isMandatory: boolean;
    targetAudience: string[];
  };

  @ApiProperty({
    description: 'Usage statistics',
  })
  statistics: {
    viewCount: number;
    downloadCount: number;
    signatureCount: number;
  };

  @ApiProperty({
    description: 'Last updated',
  })
  lastUpdated: Date;

  @ApiProperty({
    description: 'Created by',
  })
  createdBy: {
    userId: string;
    name: string;
    role: string;
  };
}

export class ResourceSearchResponseDto {
  @ApiProperty({
    description: 'Search results',
    type: [ResourceResponseDto],
  })
  results: ResourceResponseDto[];

  @ApiProperty({
    description: 'Total number of matching resources',
    example: 45,
  })
  total: number;

  @ApiProperty({
    description: 'Search query used',
    example: 'algebra equations',
  })
  query: string;

  @ApiProperty({
    description: 'Applied filters',
  })
  filters: {
    category?: ResourceCategory;
    type?: ResourceType;
    grade?: string;
    subject?: string;
    language?: ResourceLanguage;
  };

  @ApiProperty({
    description: 'Search suggestions',
    type: [String],
  })
  suggestions: string[];

  @ApiProperty({
    description: 'Search execution time in milliseconds',
    example: 150,
  })
  executionTime: number;

  @ApiProperty({
    description: 'Current page',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Page size',
    example: 20,
  })
  limit: number;
}

export class ResourceBookmarkResponseDto {
  @ApiProperty({
    description: 'Bookmark ID',
    example: 'bookmark-001',
  })
  bookmarkId: string;

  @ApiProperty({
    description: 'Resource ID',
    example: 'resource-001',
  })
  resourceId: string;

  @ApiProperty({
    description: 'Resource title',
    example: 'Introduction to Algebra',
  })
  resourceTitle: string;

  @ApiProperty({
    description: 'Resource type',
    enum: ResourceType,
  })
  resourceType: ResourceType;

  @ApiProperty({
    description: 'Resource category',
    enum: ResourceCategory,
  })
  resourceCategory: ResourceCategory;

  @ApiProperty({
    description: 'Bookmarked at',
  })
  bookmarkedAt: Date;

  @ApiProperty({
    description: 'Bookmark notes',
    example: 'Great resource for homework help',
  })
  notes?: string;

  @ApiProperty({
    description: 'Bookmark tags',
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Access count since bookmarking',
    example: 5,
  })
  accessCount: number;

  @ApiProperty({
    description: 'Last accessed',
  })
  lastAccessed?: Date;
}

export class ResourceShareRequestDto {
  @ApiProperty({
    description: 'Recipients',
    type: [String],
    example: ['parent@example.com', 'teacher@example.com'],
  })
  @IsArray()
  @IsString({ each: true })
  recipients: string[];

  @ApiProperty({
    description: 'Share message',
    example: 'I thought you might find this resource helpful for your child\'s studies.',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'Share permissions',
    enum: ['view', 'download'],
    example: 'view',
  })
  @IsOptional()
  @IsEnum(['view', 'download'])
  permissions?: 'view' | 'download';

  @ApiProperty({
    description: 'Expiration date for shared access',
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: Date;
}

export class ResourceShareResponseDto {
  @ApiProperty({
    description: 'Share ID',
    example: 'share-001',
  })
  shareId: string;

  @ApiProperty({
    description: 'Resource ID',
    example: 'resource-001',
  })
  resourceId: string;

  @ApiProperty({
    description: 'Share URL',
    example: 'https://portal.example.com/shared/resource-001?token=abc123',
  })
  shareUrl: string;

  @ApiProperty({
    description: 'Recipients who received the share',
    type: [String],
  })
  recipients: string[];

  @ApiProperty({
    description: 'Share permissions',
    enum: ['view', 'download'],
  })
  permissions: 'view' | 'download';

  @ApiProperty({
    description: 'Expiration date',
  })
  expirationDate?: Date;

  @ApiProperty({
    description: 'Share created at',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Access count',
    example: 3,
  })
  accessCount: number;

  @ApiProperty({
    description: 'Is share active',
    example: true,
  })
  isActive: boolean;
}

export class ResourceUploadRequestDto {
  @ApiProperty({
    description: 'Resource title',
    example: 'My Child\'s Science Project',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Resource description',
    example: 'A science project about renewable energy',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Resource type',
    enum: ResourceType,
  })
  @IsEnum(ResourceType)
  type: ResourceType;

  @ApiProperty({
    description: 'Resource category',
    enum: ResourceCategory,
  })
  @IsEnum(ResourceCategory)
  category: ResourceCategory;

  @ApiProperty({
    description: 'Access level',
    enum: AccessLevel,
    default: AccessLevel.SCHOOL_ONLY,
  })
  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;

  @ApiProperty({
    description: 'Resource language',
    enum: ResourceLanguage,
    default: ResourceLanguage.ENGLISH,
  })
  @IsOptional()
  @IsEnum(ResourceLanguage)
  language?: ResourceLanguage;

  @ApiProperty({
    description: 'Subject',
    example: 'Science',
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description: 'Grade level',
    example: '8',
  })
  @IsOptional()
  @IsString()
  grade?: string;

  @ApiProperty({
    description: 'Tags',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'File to upload',
  })
  file: any; // This would be handled by multer in the actual implementation

  @ApiProperty({
    description: 'Student ID (if resource is student-specific)',
  })
  @IsOptional()
  @IsString()
  studentId?: string;
}

export class ResourceUploadResponseDto {
  @ApiProperty({
    description: 'Resource ID',
    example: 'resource-001',
  })
  resourceId: string;

  @ApiProperty({
    description: 'Upload status',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'File information',
  })
  fileInfo: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
  };

  @ApiProperty({
    description: 'Processing status',
    example: 'Resource uploaded and is being processed',
  })
  message: string;

  @ApiProperty({
    description: 'Upload timestamp',
  })
  uploadedAt: Date;
}

export class ResourceUpdateRequestDto {
  @ApiProperty({
    description: 'Resource title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: 'Resource description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Resource category',
    enum: ResourceCategory,
  })
  @IsOptional()
  @IsEnum(ResourceCategory)
  category?: ResourceCategory;

  @ApiProperty({
    description: 'Access level',
    enum: AccessLevel,
  })
  @IsOptional()
  @IsEnum(AccessLevel)
  accessLevel?: AccessLevel;

  @ApiProperty({
    description: 'Tags',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Subject',
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({
    description: 'Grade level',
  })
  @IsOptional()
  @IsString()
  grade?: string;
}

export class ResourceUpdateResponseDto {
  @ApiProperty({
    description: 'Resource ID',
    example: 'resource-001',
  })
  resourceId: string;

  @ApiProperty({
    description: 'Update status',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Updated fields',
    type: [String],
  })
  updatedFields: string[];

  @ApiProperty({
    description: 'Update timestamp',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Version number',
    example: 2,
  })
  version: number;
}

export class ResourceDeleteResponseDto {
  @ApiProperty({
    description: 'Resource ID',
    example: 'resource-001',
  })
  resourceId: string;

  @ApiProperty({
    description: 'Deletion status',
    example: 'success',
  })
  status: string;

  @ApiProperty({
    description: 'Deletion timestamp',
  })
  deletedAt: Date;

  @ApiProperty({
    description: 'Files removed',
    type: [String],
  })
  filesRemoved: string[];
}

export class ResourceStatisticsResponseDto {
  @ApiProperty({
    description: 'Time range for statistics',
    example: 'month',
  })
  timeRange: string;

  @ApiProperty({
    description: 'Overall statistics',
  })
  overall: {
    totalResources: number;
    totalDownloads: number;
    totalViews: number;
    totalBookmarks: number;
    totalShares: number;
    activeUsers: number;
  };

  @ApiProperty({
    description: 'Resource usage by category',
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  usageByCategory: Record<string, number>;

  @ApiProperty({
    description: 'Resource usage by type',
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  usageByType: Record<string, number>;

  @ApiProperty({
    description: 'Top downloaded resources',
    type: [Object],
  })
  topDownloadedResources: Array<{
    resourceId: string;
    title: string;
    downloadCount: number;
    category: ResourceCategory;
  }>;

  @ApiProperty({
    description: 'Most viewed resources',
    type: [Object],
  })
  mostViewedResources: Array<{
    resourceId: string;
    title: string;
    viewCount: number;
    category: ResourceCategory;
  }>;

  @ApiProperty({
    description: 'User engagement metrics',
  })
  engagement: {
    averageSessionDuration: number;
    bounceRate: number;
    returnVisitorRate: number;
    conversionRate: number;
  };

  @ApiProperty({
    description: 'Storage usage',
  })
  storage: {
    totalSize: number;
    usedSize: number;
    availableSize: number;
    averageFileSize: number;
  };

  @ApiProperty({
    description: 'Performance metrics',
  })
  performance: {
    averageLoadTime: number;
    errorRate: number;
    uptimePercentage: number;
  };
}

// Index export
export * from './resource.dto';