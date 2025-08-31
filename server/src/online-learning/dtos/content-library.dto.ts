// Academia Pro - Content Library DTO
// DTO for online learning content library endpoints

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IGetContentLibraryResponse,
  IContent,
  TContentType,
  TContentStatus,
  TDifficultyLevel
} from '@academia-pro/common/online-learning';

export class ContentItemDto implements Omit<IContent, 'createdBy' | 'updatedBy'> {
  @ApiProperty({
    description: 'Content ID',
    example: 'content-1',
  })
  id: string;

  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  schoolId: string;

  @ApiProperty({
    description: 'Content title',
    example: 'Introduction to Algebra',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Content description',
    example: 'Comprehensive introduction to algebraic concepts',
  })
  description?: string;

  @ApiProperty({
    description: 'Content type',
    example: TContentType.VIDEO,
    enum: TContentType,
  })
  type: TContentType;

  @ApiProperty({
    description: 'Subject category',
    example: 'Mathematics',
  })
  subject: string;

  @ApiProperty({
    description: 'Grade level',
    example: '9',
  })
  gradeLevel: string;

  @ApiProperty({
    description: 'Difficulty level',
    example: TDifficultyLevel.INTERMEDIATE,
    enum: TDifficultyLevel,
  })
  difficulty: TDifficultyLevel;

  @ApiPropertyOptional({
    description: 'Duration in minutes',
    example: 45,
  })
  duration?: number;

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 250000000,
  })
  fileSize?: number;

  @ApiProperty({
    description: 'Content URL',
    example: '/content/videos/algebra-intro.mp4',
  })
  contentUrl: string;

  @ApiPropertyOptional({
    description: 'Thumbnail URL',
    example: '/content/thumbnails/algebra-intro.jpg',
  })
  thumbnailUrl?: string;

  @ApiPropertyOptional({
    description: 'Transcript URL',
    example: '/content/transcripts/algebra-intro.txt',
  })
  transcriptUrl?: string;

  @ApiProperty({
    description: 'Content tags',
    example: ['algebra', 'equations', 'variables'],
    type: [String],
  })
  tags: string[];

  @ApiProperty({
    description: 'Learning objectives',
    example: ['Understand variables and constants', 'Solve linear equations'],
    type: [String],
  })
  learningObjectives: string[];

  @ApiProperty({
    description: 'Prerequisites',
    example: ['Basic arithmetic'],
    type: [String],
  })
  prerequisites: string[];

  @ApiProperty({
    description: 'Content status',
    example: TContentStatus.PUBLISHED,
    enum: TContentStatus,
  })
  status: TContentStatus;

  @ApiProperty({
    description: 'Public visibility',
    example: true,
  })
  isPublic: boolean;

  @ApiProperty({
    description: 'Requires enrollment',
    example: false,
  })
  requiresEnrollment: boolean;

  @ApiProperty({
    description: 'Metadata information',
    type: Object,
  })
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    version: string;
    license?: string;
    copyright?: string;
    language: string;
    format: string;
    resolution?: string;
  };

  @ApiProperty({
    description: 'Content statistics',
    type: Object,
  })
  statistics: {
    viewCount: number;
    completionCount: number;
    averageRating: number;
    totalRatings: number;
    favoriteCount: number;
    shareCount: number;
    downloadCount: number;
  };

  @ApiProperty({
    description: 'Related content',
    type: [Object],
  })
  relatedContent: Array<{
    id: string;
    title: string;
    type: TContentType;
    relevance: number;
  }>;
}

export class ContentLibraryFiltersDto {
  @ApiProperty({
    description: 'Available subjects',
    example: ['Mathematics', 'Science', 'English'],
    type: [String],
  })
  subjects: string[];

  @ApiProperty({
    description: 'Available grade levels',
    example: ['6', '7', '8', '9', '10'],
    type: [String],
  })
  grades: string[];

  @ApiProperty({
    description: 'Available content types',
    example: [TContentType.VIDEO, TContentType.DOCUMENT],
    enum: TContentType,
    type: [String],
  })
  types: TContentType[];

  @ApiProperty({
    description: 'Available difficulty levels',
    example: [TDifficultyLevel.BEGINNER, TDifficultyLevel.INTERMEDIATE],
    enum: TDifficultyLevel,
    type: [String],
  })
  difficulties: TDifficultyLevel[];
}

export class ContentLibraryStatisticsDto {
  @ApiProperty({
    description: 'Total number of videos',
    example: 450,
  })
  totalVideos: number;

  @ApiProperty({
    description: 'Total number of documents',
    example: 320,
  })
  totalDocuments: number;

  @ApiProperty({
    description: 'Total number of interactive content',
    example: 180,
  })
  totalInteractive: number;

  @ApiProperty({
    description: 'Total number of presentations',
    example: 150,
  })
  totalPresentations: number;

  @ApiProperty({
    description: 'Total number of assessments',
    example: 150,
  })
  totalAssessments: number;
}

export class GetContentLibraryResponseDto implements IGetContentLibraryResponse {
  @ApiProperty({
    description: 'Total number of items',
    example: 1250,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Content items',
    type: [ContentItemDto],
  })
  @Type(() => ContentItemDto)
  items: ContentItemDto[];

  @ApiProperty({
    description: 'Available filters',
    type: ContentLibraryFiltersDto,
  })
  @Type(() => ContentLibraryFiltersDto)
  filters: ContentLibraryFiltersDto;

  @ApiProperty({
    description: 'Content statistics',
    type: ContentLibraryStatisticsDto,
  })
  @Type(() => ContentLibraryStatisticsDto)
  statistics: ContentLibraryStatisticsDto;
}