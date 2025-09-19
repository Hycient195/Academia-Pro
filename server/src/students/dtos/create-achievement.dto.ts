// Academia Pro - Create Achievement DTO
// DTO for creating new student achievements

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsBoolean, IsArray, IsNumber, IsObject, MinLength, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AchievementType, AchievementLevel, AchievementStatus } from '../entities/student-achievement.entity';

export class SupportingDocumentDto {
  @ApiProperty({
    description: 'Type of supporting document',
    example: 'certificate',
  })
  @IsNotEmpty({ message: 'Document type is required' })
  @IsString({ message: 'Document type must be a string' })
  documentType: string;

  @ApiProperty({
    description: 'Name of the document',
    example: 'Achievement Certificate.pdf',
  })
  @IsNotEmpty({ message: 'Document name is required' })
  @IsString({ message: 'Document name must be a string' })
  documentName: string;

  @ApiProperty({
    description: 'URL to access the document',
    example: 'https://storage.example.com/documents/cert123.pdf',
  })
  @IsNotEmpty({ message: 'Document URL is required' })
  @IsString({ message: 'Document URL must be a string' })
  documentUrl: string;

  @ApiPropertyOptional({
    description: 'Upload date of the document',
    example: '2024-03-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Upload date must be a valid date' })
  uploadDate?: string;
}

export class SocialMediaUrlDto {
  @ApiProperty({
    description: 'Social media platform',
    example: 'facebook',
  })
  @IsNotEmpty({ message: 'Platform is required' })
  @IsString({ message: 'Platform must be a string' })
  platform: string;

  @ApiProperty({
    description: 'URL of the social media post',
    example: 'https://facebook.com/posts/123456',
  })
  @IsNotEmpty({ message: 'URL is required' })
  @IsString({ message: 'URL must be a string' })
  url: string;

  @ApiPropertyOptional({
    description: 'Date when the post was made',
    example: '2024-03-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Post date must be a valid date' })
  postDate?: string;
}

export class PressCoverageDto {
  @ApiProperty({
    description: 'Publication name',
    example: 'Local News Daily',
  })
  @IsNotEmpty({ message: 'Publication is required' })
  @IsString({ message: 'Publication must be a string' })
  publication: string;

  @ApiProperty({
    description: 'Date of publication',
    example: '2024-03-15T10:30:00Z',
  })
  @IsNotEmpty({ message: 'Publication date is required' })
  @IsDateString({}, { message: 'Publication date must be a valid date' })
  date: string;

  @ApiPropertyOptional({
    description: 'URL to the publication',
    example: 'https://news.example.com/article123',
  })
  @IsOptional()
  @IsString({ message: 'URL must be a string' })
  url?: string;
}

export class AchievementMetadataDto {
  @ApiPropertyOptional({
    description: 'Achievement category',
    example: 'academic',
  })
  @IsOptional()
  @IsString({ message: 'Category must be a string' })
  category?: string;

  @ApiPropertyOptional({
    description: 'Achievement subcategory',
    example: 'science_fair',
  })
  @IsOptional()
  @IsString({ message: 'Subcategory must be a string' })
  subcategory?: string;

  @ApiPropertyOptional({
    description: 'Priority level',
    example: 'high',
    enum: ['low', 'normal', 'high'],
  })
  @IsOptional()
  @IsEnum(['low', 'normal', 'high'], { message: 'Priority must be low, normal, or high' })
  priority?: 'low' | 'normal' | 'high';

  @ApiPropertyOptional({
    description: 'Whether this is a featured achievement',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Featured must be a boolean' })
  featured?: boolean;

  @ApiPropertyOptional({
    description: 'Press coverage information',
    type: [PressCoverageDto],
  })
  @IsOptional()
  @IsArray({ message: 'Press coverage must be an array' })
  pressCoverage?: PressCoverageDto[];

  @ApiPropertyOptional({
    description: 'Related achievement IDs',
    example: ['achievement-uuid-1', 'achievement-uuid-2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Related achievements must be an array' })
  @IsString({ each: true, message: 'Each related achievement must be a string' })
  relatedAchievements?: string[];

  @ApiPropertyOptional({
    description: 'Skills demonstrated in this achievement',
    example: ['leadership', 'teamwork', 'problem-solving'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Skills demonstrated must be an array' })
  @IsString({ each: true, message: 'Each skill must be a string' })
  skillsDemonstrated?: string[];
}

export class CreateAchievementDto {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-uuid-123',
  })
  @IsNotEmpty({ message: 'Student ID is required' })
  @IsString({ message: 'Student ID must be a string' })
  studentId: string;

  @ApiProperty({
    description: 'Type of achievement',
    example: AchievementType.ACADEMIC,
    enum: AchievementType,
  })
  @IsNotEmpty({ message: 'Achievement type is required' })
  @IsEnum(AchievementType, { message: 'Invalid achievement type' })
  achievementType: AchievementType;

  @ApiProperty({
    description: 'Title of the achievement',
    example: 'First Place in Science Fair',
    minLength: 1,
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Achievement title is required' })
  @IsString({ message: 'Achievement title must be a string' })
  @MinLength(1, { message: 'Achievement title cannot be empty' })
  @MaxLength(200, { message: 'Achievement title cannot exceed 200 characters' })
  achievementTitle: string;

  @ApiProperty({
    description: 'Description of the achievement',
    example: 'Won first place in the annual school science fair for innovative solar panel design',
  })
  @IsNotEmpty({ message: 'Achievement description is required' })
  @IsString({ message: 'Achievement description must be a string' })
  achievementDescription: string;

  @ApiPropertyOptional({
    description: 'Level of achievement',
    example: AchievementLevel.SCHOOL,
    enum: AchievementLevel,
  })
  @IsOptional()
  @IsEnum(AchievementLevel, { message: 'Invalid achievement level' })
  achievementLevel?: AchievementLevel;

  @ApiProperty({
    description: 'Date when the achievement occurred',
    example: '2024-03-15T10:30:00Z',
  })
  @IsNotEmpty({ message: 'Achievement date is required' })
  @IsDateString({}, { message: 'Achievement date must be a valid date' })
  achievementDate: string;

  @ApiPropertyOptional({
    description: 'Date when the achievement was announced',
    example: '2024-03-16T09:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Announcement date must be a valid date' })
  announcementDate?: string;

  @ApiPropertyOptional({
    description: 'Name of the event',
    example: 'Annual Science Fair 2024',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Event name must be a string' })
  @MaxLength(200, { message: 'Event name cannot exceed 200 characters' })
  eventName?: string;

  @ApiPropertyOptional({
    description: 'Name of the event organizer',
    example: 'School Science Department',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Event organizer must be a string' })
  @MaxLength(200, { message: 'Event organizer cannot exceed 200 characters' })
  eventOrganizer?: string;

  @ApiPropertyOptional({
    description: 'Name of the competition',
    example: 'Inter-School Science Competition',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Competition name must be a string' })
  @MaxLength(200, { message: 'Competition name cannot exceed 200 characters' })
  competitionName?: string;

  @ApiPropertyOptional({
    description: 'Position or rank achieved',
    example: '1st Place',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Position rank must be a string' })
  @MaxLength(50, { message: 'Position rank cannot exceed 50 characters' })
  positionRank?: string;

  @ApiPropertyOptional({
    description: 'Number of participants in the event/competition',
    example: 50,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Participants count must be a number' })
  @Min(1, { message: 'Participants count must be at least 1' })
  participantsCount?: number;

  @ApiPropertyOptional({
    description: 'Prize amount received',
    example: 500.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Prize amount must be a number' })
  @Min(0, { message: 'Prize amount cannot be negative' })
  prizeAmount?: number;

  @ApiPropertyOptional({
    description: 'Prize currency code',
    example: 'NGN',
    maxLength: 3,
  })
  @IsOptional()
  @IsString({ message: 'Prize currency must be a string' })
  @MaxLength(3, { message: 'Prize currency cannot exceed 3 characters' })
  prizeCurrency?: string;

  @ApiPropertyOptional({
    description: 'Description of the prize',
    example: 'Cash prize and trophy',
  })
  @IsOptional()
  @IsString({ message: 'Prize description must be a string' })
  prizeDescription?: string;

  @ApiPropertyOptional({
    description: 'Whether a certificate was issued',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Certificate issued must be a boolean' })
  certificateIssued?: boolean;

  @ApiPropertyOptional({
    description: 'Certificate number',
    example: 'CERT-2024-001',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Certificate number must be a string' })
  @MaxLength(100, { message: 'Certificate number cannot exceed 100 characters' })
  certificateNumber?: string;

  @ApiPropertyOptional({
    description: 'URL to access the certificate',
    example: 'https://storage.example.com/certificates/cert123.pdf',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Certificate URL must be a string' })
  @MaxLength(500, { message: 'Certificate URL cannot exceed 500 characters' })
  certificateUrl?: string;

  @ApiPropertyOptional({
    description: 'Certificate issue date',
    example: '2024-03-16T10:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Certificate issue date must be a valid date' })
  certificateIssueDate?: string;

  @ApiPropertyOptional({
    description: 'Supporting documents',
    type: [SupportingDocumentDto],
  })
  @IsOptional()
  @IsArray({ message: 'Supporting documents must be an array' })
  supportingDocuments?: SupportingDocumentDto[];

  @ApiPropertyOptional({
    description: 'Recognition level',
    example: 'Outstanding',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Recognition level must be a string' })
  @MaxLength(50, { message: 'Recognition level cannot exceed 50 characters' })
  recognitionLevel?: string;

  @ApiPropertyOptional({
    description: 'Description of the achievement impact',
    example: 'Inspired other students to participate in science activities',
  })
  @IsOptional()
  @IsString({ message: 'Impact description must be a string' })
  impactDescription?: string;

  @ApiPropertyOptional({
    description: 'Impact on the school',
    example: 'Increased participation in STEM activities by 30%',
  })
  @IsOptional()
  @IsString({ message: 'School impact must be a string' })
  schoolImpact?: string;

  @ApiPropertyOptional({
    description: 'Impact on the community',
    example: 'Raised awareness about renewable energy solutions',
  })
  @IsOptional()
  @IsString({ message: 'Community impact must be a string' })
  communityImpact?: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2023-2024',
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Academic year is required' })
  @IsString({ message: 'Academic year must be a string' })
  @MaxLength(20, { message: 'Academic year cannot exceed 20 characters' })
  academicYear: string;

  @ApiProperty({
    description: 'Grade level at the time of achievement',
    example: 'Grade 10',
    maxLength: 50,
  })
  @IsNotEmpty({ message: 'Grade level is required' })
  @IsString({ message: 'Grade level must be a string' })
  @MaxLength(50, { message: 'Grade level cannot exceed 50 characters' })
  gradeLevel: string;

  @ApiPropertyOptional({
    description: 'Section/class',
    example: 'A',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Section must be a string' })
  @MaxLength(20, { message: 'Section cannot exceed 20 characters' })
  section?: string;

  @ApiPropertyOptional({
    description: 'Whether the achievement is public',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is public must be a boolean' })
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to publish on school website',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Publish on website must be a boolean' })
  publishOnWebsite?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to publish in school newsletter',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Publish in newsletter must be a boolean' })
  publishInNewsletter?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to share with parents',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Share with parents must be a boolean' })
  shareWithParents?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to share with community',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Share with community must be a boolean' })
  shareWithCommunity?: boolean;

  @ApiPropertyOptional({
    description: 'Whether posted on social media',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Social media posted must be a boolean' })
  socialMediaPosted?: boolean;

  @ApiPropertyOptional({
    description: 'Social media post URLs',
    type: [SocialMediaUrlDto],
  })
  @IsOptional()
  @IsArray({ message: 'Social media URLs must be an array' })
  socialMediaUrls?: SocialMediaUrlDto[];

  @ApiPropertyOptional({
    description: 'Whether follow-up is required',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Follow-up required must be a boolean' })
  followUpRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Follow-up date',
    example: '2024-06-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Follow-up date must be a valid date' })
  followUpDate?: string;

  @ApiPropertyOptional({
    description: 'Follow-up notes',
    example: 'Check progress in next semester',
  })
  @IsOptional()
  @IsString({ message: 'Follow-up notes must be a string' })
  followUpNotes?: string;

  @ApiPropertyOptional({
    description: 'Long-term impact description',
    example: 'Student continued to excel in science subjects',
  })
  @IsOptional()
  @IsString({ message: 'Long-term impact must be a string' })
  longTermImpact?: string;

  @ApiPropertyOptional({
    description: 'Achievement tags',
    example: ['science', 'innovation', 'competition'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: AchievementMetadataDto,
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: AchievementMetadataDto;

  @ApiPropertyOptional({
    description: 'Internal notes for staff',
    example: 'Verified with event organizer',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}

export class UpdateAchievementDto {
  @ApiPropertyOptional({
    description: 'Type of achievement',
    example: AchievementType.ACADEMIC,
    enum: AchievementType,
  })
  @IsOptional()
  @IsEnum(AchievementType, { message: 'Invalid achievement type' })
  achievementType?: AchievementType;

  @ApiPropertyOptional({
    description: 'Title of the achievement',
    example: 'First Place in Science Fair',
    minLength: 1,
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Achievement title must be a string' })
  @MinLength(1, { message: 'Achievement title cannot be empty' })
  @MaxLength(200, { message: 'Achievement title cannot exceed 200 characters' })
  achievementTitle?: string;

  @ApiPropertyOptional({
    description: 'Description of the achievement',
    example: 'Won first place in the annual school science fair for innovative solar panel design',
  })
  @IsOptional()
  @IsString({ message: 'Achievement description must be a string' })
  achievementDescription?: string;

  @ApiPropertyOptional({
    description: 'Level of achievement',
    example: AchievementLevel.SCHOOL,
    enum: AchievementLevel,
  })
  @IsOptional()
  @IsEnum(AchievementLevel, { message: 'Invalid achievement level' })
  achievementLevel?: AchievementLevel;

  @ApiPropertyOptional({
    description: 'Status of the achievement',
    example: AchievementStatus.VERIFIED,
    enum: AchievementStatus,
  })
  @IsOptional()
  @IsEnum(AchievementStatus, { message: 'Invalid achievement status' })
  status?: AchievementStatus;

  @ApiPropertyOptional({
    description: 'Date when the achievement occurred',
    example: '2024-03-15T10:30:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Achievement date must be a valid date' })
  achievementDate?: string;

  @ApiPropertyOptional({
    description: 'Date when the achievement was announced',
    example: '2024-03-16T09:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Announcement date must be a valid date' })
  announcementDate?: string;

  @ApiPropertyOptional({
    description: 'Name of the event',
    example: 'Annual Science Fair 2024',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Event name must be a string' })
  @MaxLength(200, { message: 'Event name cannot exceed 200 characters' })
  eventName?: string;

  @ApiPropertyOptional({
    description: 'Name of the event organizer',
    example: 'School Science Department',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Event organizer must be a string' })
  @MaxLength(200, { message: 'Event organizer cannot exceed 200 characters' })
  eventOrganizer?: string;

  @ApiPropertyOptional({
    description: 'Name of the competition',
    example: 'Inter-School Science Competition',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Competition name must be a string' })
  @MaxLength(200, { message: 'Competition name cannot exceed 200 characters' })
  competitionName?: string;

  @ApiPropertyOptional({
    description: 'Position or rank achieved',
    example: '1st Place',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Position rank must be a string' })
  @MaxLength(50, { message: 'Position rank cannot exceed 50 characters' })
  positionRank?: string;

  @ApiPropertyOptional({
    description: 'Number of participants in the event/competition',
    example: 50,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Participants count must be a number' })
  @Min(1, { message: 'Participants count must be at least 1' })
  participantsCount?: number;

  @ApiPropertyOptional({
    description: 'Prize amount received',
    example: 500.00,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Prize amount must be a number' })
  @Min(0, { message: 'Prize amount cannot be negative' })
  prizeAmount?: number;

  @ApiPropertyOptional({
    description: 'Prize currency code',
    example: 'NGN',
    maxLength: 3,
  })
  @IsOptional()
  @IsString({ message: 'Prize currency must be a string' })
  @MaxLength(3, { message: 'Prize currency cannot exceed 3 characters' })
  prizeCurrency?: string;

  @ApiPropertyOptional({
    description: 'Description of the prize',
    example: 'Cash prize and trophy',
  })
  @IsOptional()
  @IsString({ message: 'Prize description must be a string' })
  prizeDescription?: string;

  @ApiPropertyOptional({
    description: 'Whether a certificate was issued',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Certificate issued must be a boolean' })
  certificateIssued?: boolean;

  @ApiPropertyOptional({
    description: 'Certificate number',
    example: 'CERT-2024-001',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Certificate number must be a string' })
  @MaxLength(100, { message: 'Certificate number cannot exceed 100 characters' })
  certificateNumber?: string;

  @ApiPropertyOptional({
    description: 'URL to access the certificate',
    example: 'https://storage.example.com/certificates/cert123.pdf',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Certificate URL must be a string' })
  @MaxLength(500, { message: 'Certificate URL cannot exceed 500 characters' })
  certificateUrl?: string;

  @ApiPropertyOptional({
    description: 'Certificate issue date',
    example: '2024-03-16T10:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Certificate issue date must be a valid date' })
  certificateIssueDate?: string;

  @ApiPropertyOptional({
    description: 'Supporting documents',
    type: [SupportingDocumentDto],
  })
  @IsOptional()
  @IsArray({ message: 'Supporting documents must be an array' })
  supportingDocuments?: SupportingDocumentDto[];

  @ApiPropertyOptional({
    description: 'Recognition level',
    example: 'Outstanding',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Recognition level must be a string' })
  @MaxLength(50, { message: 'Recognition level cannot exceed 50 characters' })
  recognitionLevel?: string;

  @ApiPropertyOptional({
    description: 'Description of the achievement impact',
    example: 'Inspired other students to participate in science activities',
  })
  @IsOptional()
  @IsString({ message: 'Impact description must be a string' })
  impactDescription?: string;

  @ApiPropertyOptional({
    description: 'Impact on the school',
    example: 'Increased participation in STEM activities by 30%',
  })
  @IsOptional()
  @IsString({ message: 'School impact must be a string' })
  schoolImpact?: string;

  @ApiPropertyOptional({
    description: 'Impact on the community',
    example: 'Raised awareness about renewable energy solutions',
  })
  @IsOptional()
  @IsString({ message: 'Community impact must be a string' })
  communityImpact?: string;

  @ApiPropertyOptional({
    description: 'Academic year',
    example: '2023-2024',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Academic year must be a string' })
  @MaxLength(20, { message: 'Academic year cannot exceed 20 characters' })
  academicYear?: string;

  @ApiPropertyOptional({
    description: 'Grade level at the time of achievement',
    example: 'Grade 10',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Grade level must be a string' })
  @MaxLength(50, { message: 'Grade level cannot exceed 50 characters' })
  gradeLevel?: string;

  @ApiPropertyOptional({
    description: 'Section/class',
    example: 'A',
    maxLength: 20,
  })
  @IsOptional()
  @IsString({ message: 'Section must be a string' })
  @MaxLength(20, { message: 'Section cannot exceed 20 characters' })
  section?: string;

  @ApiPropertyOptional({
    description: 'Whether the achievement is public',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is public must be a boolean' })
  isPublic?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to publish on school website',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Publish on website must be a boolean' })
  publishOnWebsite?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to publish in school newsletter',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Publish in newsletter must be a boolean' })
  publishInNewsletter?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to share with parents',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Share with parents must be a boolean' })
  shareWithParents?: boolean;

  @ApiPropertyOptional({
    description: 'Whether to share with community',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Share with community must be a boolean' })
  shareWithCommunity?: boolean;

  @ApiPropertyOptional({
    description: 'Whether posted on social media',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Social media posted must be a boolean' })
  socialMediaPosted?: boolean;

  @ApiPropertyOptional({
    description: 'Social media post URLs',
    type: [SocialMediaUrlDto],
  })
  @IsOptional()
  @IsArray({ message: 'Social media URLs must be an array' })
  socialMediaUrls?: SocialMediaUrlDto[];

  @ApiPropertyOptional({
    description: 'Whether follow-up is required',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Follow-up required must be a boolean' })
  followUpRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Follow-up date',
    example: '2024-06-15T10:00:00Z',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Follow-up date must be a valid date' })
  followUpDate?: string;

  @ApiPropertyOptional({
    description: 'Follow-up notes',
    example: 'Check progress in next semester',
  })
  @IsOptional()
  @IsString({ message: 'Follow-up notes must be a string' })
  followUpNotes?: string;

  @ApiPropertyOptional({
    description: 'Long-term impact description',
    example: 'Student continued to excel in science subjects',
  })
  @IsOptional()
  @IsString({ message: 'Long-term impact must be a string' })
  longTermImpact?: string;

  @ApiPropertyOptional({
    description: 'Achievement tags',
    example: ['science', 'innovation', 'competition'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: AchievementMetadataDto,
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  metadata?: AchievementMetadataDto;

  @ApiPropertyOptional({
    description: 'Internal notes for staff',
    example: 'Verified with event organizer',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}