// Academia Pro - Create Book DTO
// DTO for creating new library books

import { IsNotEmpty, IsOptional, IsString, IsEnum, IsEmail, IsDateString, IsBoolean, IsNumber, Min, Max, MaxLength, IsArray, IsObject, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ICreateBookRequest,
  IAdditionalImage,
  IAward,
  ISeriesInfo,
  IBookMetadata,
  TBookCategory,
  TBookFormat,
  TLanguage,
  TAcquisitionMethod,
  TBookCondition
} from '@academia-pro/types/library';

export class AdditionalImageDto implements IAdditionalImage {
  @ApiProperty({
    description: 'Image URL',
    example: 'https://storage.example.com/books/image1.jpg',
  })
  @IsNotEmpty({ message: 'Image URL is required' })
  @IsString({ message: 'Image URL must be a string' })
  url: string;

  @ApiPropertyOptional({
    description: 'Image caption',
    example: 'Front cover of the book',
  })
  @IsOptional()
  @IsString({ message: 'Caption must be a string' })
  caption?: string;

  @ApiPropertyOptional({
    description: 'Whether this is the primary image',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is primary must be a boolean' })
  isPrimary?: boolean;
}

export class AwardDto implements IAward {
  @ApiProperty({
    description: 'Award name',
    example: 'Pulitzer Prize',
  })
  @IsNotEmpty({ message: 'Award name is required' })
  @IsString({ message: 'Award name must be a string' })
  name: string;

  @ApiProperty({
    description: 'Award year',
    example: 2020,
  })
  @IsNotEmpty({ message: 'Award year is required' })
  @IsNumber({}, { message: 'Award year must be a number' })
  @Min(1800, { message: 'Award year must be 1800 or later' })
  @Max(new Date().getFullYear(), { message: 'Award year cannot be in the future' })
  year: number;

  @ApiProperty({
    description: 'Awarding organization',
    example: 'Pulitzer Prize Board',
  })
  @IsNotEmpty({ message: 'Awarding organization is required' })
  @IsString({ message: 'Awarding organization must be a string' })
  organization: string;
}

export class SeriesInfoDto implements ISeriesInfo {
  @ApiProperty({
    description: 'Series name',
    example: 'Harry Potter',
  })
  @IsNotEmpty({ message: 'Series name is required' })
  @IsString({ message: 'Series name must be a string' })
  seriesName: string;

  @ApiProperty({
    description: 'Position in series',
    example: 1,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Position is required' })
  @IsNumber({}, { message: 'Position must be a number' })
  @Min(1, { message: 'Position must be at least 1' })
  position: number;

  @ApiProperty({
    description: 'Total books in series',
    example: 7,
    minimum: 1,
  })
  @IsNotEmpty({ message: 'Total books is required' })
  @IsNumber({}, { message: 'Total books must be a number' })
  @Min(1, { message: 'Total books must be at least 1' })
  totalBooks: number;
}

export class BookMetadataDto implements IBookMetadata {
  @ApiPropertyOptional({
    description: 'Dewey Decimal Classification',
    example: '813.54',
  })
  @IsOptional()
  @IsString({ message: 'Dewey Decimal must be a string' })
  deweyDecimal?: string;

  @ApiPropertyOptional({
    description: 'Library of Congress Classification',
    example: 'PS3569.T8',
  })
  @IsOptional()
  @IsString({ message: 'LCC must be a string' })
  lccClassification?: string;

  @ApiPropertyOptional({
    description: 'Book genres',
    example: ['fantasy', 'young adult'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Genres must be an array' })
  @IsString({ each: true, message: 'Each genre must be a string' })
  genre?: string[];

  @ApiPropertyOptional({
    description: 'Target audience',
    example: 'young adult',
  })
  @IsOptional()
  @IsString({ message: 'Target audience must be a string' })
  targetAudience?: string;

  @ApiPropertyOptional({
    description: 'Reading level',
    example: 'advanced',
  })
  @IsOptional()
  @IsString({ message: 'Reading level must be a string' })
  readingLevel?: string;

  @ApiPropertyOptional({
    description: 'Curriculum alignment',
    example: ['english-literature', 'creative-writing'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Curriculum alignment must be an array' })
  @IsString({ each: true, message: 'Each curriculum item must be a string' })
  curriculumAlignment?: string[];

  @ApiPropertyOptional({
    description: 'Book awards',
    type: [AwardDto],
  })
  @IsOptional()
  @IsArray({ message: 'Awards must be an array' })
  @ValidateNested({ each: true })
  awards?: AwardDto[];

  @ApiPropertyOptional({
    description: 'Related book IDs',
    example: ['book-uuid-1', 'book-uuid-2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Related books must be an array' })
  @IsString({ each: true, message: 'Each related book must be a string' })
  relatedBooks?: string[];

  @ApiPropertyOptional({
    description: 'Series information',
    type: SeriesInfoDto,
  })
  @IsOptional()
  @ValidateNested()
  seriesInfo?: SeriesInfoDto;
}

export class CreateBookDto implements ICreateBookRequest {
  @ApiProperty({
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @IsNotEmpty({ message: 'School ID is required' })
  @IsString({ message: 'School ID must be a string' })
  schoolId: string;

  @ApiProperty({
    description: 'Book title',
    example: 'The Great Gatsby',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'Title is required' })
  @IsString({ message: 'Title must be a string' })
  @MaxLength(500, { message: 'Title cannot exceed 500 characters' })
  title: string;

  @ApiPropertyOptional({
    description: 'Book subtitle',
    example: 'A Novel',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Subtitle must be a string' })
  @MaxLength(500, { message: 'Subtitle cannot exceed 500 characters' })
  subtitle?: string;

  @ApiProperty({
    description: 'Primary author',
    example: 'F. Scott Fitzgerald',
    maxLength: 300,
  })
  @IsNotEmpty({ message: 'Author is required' })
  @IsString({ message: 'Author must be a string' })
  @MaxLength(300, { message: 'Author cannot exceed 300 characters' })
  author: string;

  @ApiPropertyOptional({
    description: 'Co-authors',
    example: ['Co-author 1', 'Co-author 2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Co-authors must be an array' })
  @IsString({ each: true, message: 'Each co-author must be a string' })
  coAuthors?: string[];

  @ApiPropertyOptional({
    description: 'Book editor',
    example: 'Maxwell Perkins',
    maxLength: 300,
  })
  @IsOptional()
  @IsString({ message: 'Editor must be a string' })
  @MaxLength(300, { message: 'Editor cannot exceed 300 characters' })
  editor?: string;

  @ApiPropertyOptional({
    description: 'Book translator',
    example: 'John Doe',
    maxLength: 300,
  })
  @IsOptional()
  @IsString({ message: 'Translator must be a string' })
  @MaxLength(300, { message: 'Translator cannot exceed 300 characters' })
  translator?: string;

  @ApiPropertyOptional({
    description: 'Book illustrator',
    example: 'Jane Smith',
    maxLength: 300,
  })
  @IsOptional()
  @IsString({ message: 'Illustrator must be a string' })
  @MaxLength(300, { message: 'Illustrator cannot exceed 300 characters' })
  illustrator?: string;

  @ApiPropertyOptional({
    description: 'ISBN (10 or 13 digits)',
    example: '9780743273565',
  })
  @IsOptional()
  @IsString({ message: 'ISBN must be a string' })
  isbn?: string;

  @ApiPropertyOptional({
    description: 'ISBN-13',
    example: '9780743273565',
  })
  @IsOptional()
  @IsString({ message: 'ISBN-13 must be a string' })
  isbn13?: string;

  @ApiPropertyOptional({
    description: 'Accession number (auto-generated if not provided)',
    example: 'ACC20240001',
  })
  @IsOptional()
  @IsString({ message: 'Accession number must be a string' })
  accessionNumber?: string;

  @ApiPropertyOptional({
    description: 'Call number',
    example: 'F FIT',
  })
  @IsOptional()
  @IsString({ message: 'Call number must be a string' })
  callNumber?: string;

  @ApiPropertyOptional({
    description: 'Barcode',
    example: '1234567890123',
  })
  @IsOptional()
  @IsString({ message: 'Barcode must be a string' })
  barcode?: string;

  @ApiPropertyOptional({
    description: 'RFID tag',
    example: 'RFID123456',
  })
  @IsOptional()
  @IsString({ message: 'RFID tag must be a string' })
  rfidTag?: string;

  @ApiPropertyOptional({
    description: 'Publisher',
    example: 'Scribner',
    maxLength: 300,
  })
  @IsOptional()
  @IsString({ message: 'Publisher must be a string' })
  @MaxLength(300, { message: 'Publisher cannot exceed 300 characters' })
  publisher?: string;

  @ApiPropertyOptional({
    description: 'Publication place',
    example: 'New York',
    maxLength: 200,
  })
  @IsOptional()
  @IsString({ message: 'Publication place must be a string' })
  @MaxLength(200, { message: 'Publication place cannot exceed 200 characters' })
  publicationPlace?: string;

  @ApiPropertyOptional({
    description: 'Publication year',
    example: 1925,
    minimum: 1000,
    maximum: 2100,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Publication year must be a number' })
  @Min(1000, { message: 'Publication year must be 1000 or later' })
  @Max(2100, { message: 'Publication year cannot be in the future' })
  publicationYear?: number;

  @ApiPropertyOptional({
    description: 'Edition',
    example: 'First Edition',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Edition must be a string' })
  @MaxLength(50, { message: 'Edition cannot exceed 50 characters' })
  edition?: string;

  @ApiPropertyOptional({
    description: 'Volume',
    example: 'Volume 1',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Volume must be a string' })
  @MaxLength(50, { message: 'Volume cannot exceed 50 characters' })
  volume?: string;

  @ApiPropertyOptional({
    description: 'Series name',
    example: 'Great American Novels',
    maxLength: 300,
  })
  @IsOptional()
  @IsString({ message: 'Series must be a string' })
  @MaxLength(300, { message: 'Series cannot exceed 300 characters' })
  series?: string;

  @ApiPropertyOptional({
    description: 'Series number',
    example: 'Book 1',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Series number must be a string' })
  @MaxLength(50, { message: 'Series number cannot exceed 50 characters' })
  seriesNumber?: string;

  @ApiPropertyOptional({
    description: 'Number of pages',
    example: 180,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Pages must be a number' })
  @Min(1, { message: 'Pages must be at least 1' })
  pages?: number;

  @ApiPropertyOptional({
    description: 'Book height in cm',
    example: 20.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Height must be a number' })
  @Min(0, { message: 'Height cannot be negative' })
  heightCm?: number;

  @ApiPropertyOptional({
    description: 'Book width in cm',
    example: 13.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Width must be a number' })
  @Min(0, { message: 'Width cannot be negative' })
  widthCm?: number;

  @ApiPropertyOptional({
    description: 'Book thickness in cm',
    example: 2.0,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Thickness must be a number' })
  @Min(0, { message: 'Thickness cannot be negative' })
  thicknessCm?: number;

  @ApiPropertyOptional({
    description: 'Book weight in grams',
    example: 350,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Weight must be a number' })
  @Min(0, { message: 'Weight cannot be negative' })
  weightGrams?: number;

  @ApiPropertyOptional({
    description: 'Book category',
    example: TBookCategory.FICTION,
    enum: TBookCategory,
  })
  @IsOptional()
  @IsEnum(TBookCategory, { message: 'Invalid book category' })
  category?: TBookCategory;

  @ApiPropertyOptional({
    description: 'Book subcategory',
    example: 'Classic Literature',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Subcategory must be a string' })
  @MaxLength(100, { message: 'Subcategory cannot exceed 100 characters' })
  subcategory?: string;

  @ApiPropertyOptional({
    description: 'Keywords',
    example: ['american literature', 'jazz age', 'wealth'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Keywords must be an array' })
  @IsString({ each: true, message: 'Each keyword must be a string' })
  keywords?: string[];

  @ApiPropertyOptional({
    description: 'Subjects',
    example: ['Literature', 'American History'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Subjects must be an array' })
  @IsString({ each: true, message: 'Each subject must be a string' })
  subjects?: string[];

  @ApiPropertyOptional({
    description: 'Book language',
    example: TLanguage.ENGLISH,
    enum: TLanguage,
  })
  @IsOptional()
  @IsEnum(TLanguage, { message: 'Invalid language' })
  language?: TLanguage;

  @ApiPropertyOptional({
    description: 'Book format',
    example: TBookFormat.HARDCOVER,
    enum: TBookFormat,
  })
  @IsOptional()
  @IsEnum(TBookFormat, { message: 'Invalid book format' })
  format?: TBookFormat;

  @ApiPropertyOptional({
    description: 'Book description',
    example: 'A classic American novel about the Jazz Age',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Table of contents',
    example: 'Chapter 1: The Valley of Ashes...',
  })
  @IsOptional()
  @IsString({ message: 'Table of contents must be a string' })
  tableOfContents?: string;

  @ApiPropertyOptional({
    description: 'Book summary',
    example: 'The story follows Nick Carraway...',
  })
  @IsOptional()
  @IsString({ message: 'Summary must be a string' })
  summary?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Signed first edition',
  })
  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Acquisition method',
    example: TAcquisitionMethod.PURCHASE,
    enum: TAcquisitionMethod,
  })
  @IsOptional()
  @IsEnum(TAcquisitionMethod, { message: 'Invalid acquisition method' })
  acquisitionMethod?: TAcquisitionMethod;

  @ApiProperty({
    description: 'Acquisition date',
    example: '2024-01-15',
  })
  @IsNotEmpty({ message: 'Acquisition date is required' })
  @IsDateString({}, { message: 'Acquisition date must be a valid date' })
  acquisitionDate: string;

  @ApiPropertyOptional({
    description: 'Acquisition cost',
    example: 25.99,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Acquisition cost must be a number' })
  @Min(0, { message: 'Acquisition cost cannot be negative' })
  acquisitionCost?: number;

  @ApiPropertyOptional({
    description: 'Acquisition currency',
    example: 'USD',
    maxLength: 3,
  })
  @IsOptional()
  @IsString({ message: 'Acquisition currency must be a string' })
  @MaxLength(3, { message: 'Acquisition currency cannot exceed 3 characters' })
  acquisitionCurrency?: string;

  @ApiPropertyOptional({
    description: 'Supplier name',
    example: 'Book Distributors Inc.',
    maxLength: 300,
  })
  @IsOptional()
  @IsString({ message: 'Supplier name must be a string' })
  @MaxLength(300, { message: 'Supplier name cannot exceed 300 characters' })
  supplierName?: string;

  @ApiPropertyOptional({
    description: 'Supplier invoice number',
    example: 'INV20240001',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Supplier invoice number must be a string' })
  @MaxLength(100, { message: 'Supplier invoice number cannot exceed 100 characters' })
  supplierInvoiceNumber?: string;

  @ApiPropertyOptional({
    description: 'Donor name',
    example: 'John Smith',
    maxLength: 300,
  })
  @IsOptional()
  @IsString({ message: 'Donor name must be a string' })
  @MaxLength(300, { message: 'Donor name cannot exceed 300 characters' })
  donorName?: string;

  @ApiPropertyOptional({
    description: 'Book condition',
    example: TBookCondition.GOOD,
    enum: TBookCondition,
  })
  @IsOptional()
  @IsEnum(TBookCondition, { message: 'Invalid book condition' })
  condition?: TBookCondition;

  @ApiPropertyOptional({
    description: 'Condition notes',
    example: 'Minor wear on cover',
  })
  @IsOptional()
  @IsString({ message: 'Condition notes must be a string' })
  conditionNotes?: string;

  @ApiPropertyOptional({
    description: 'Location shelf',
    example: 'A-12',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Location shelf must be a string' })
  @MaxLength(50, { message: 'Location shelf cannot exceed 50 characters' })
  locationShelf?: string;

  @ApiPropertyOptional({
    description: 'Location row',
    example: 'Row 3',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Location row must be a string' })
  @MaxLength(50, { message: 'Location row cannot exceed 50 characters' })
  locationRow?: string;

  @ApiPropertyOptional({
    description: 'Location section',
    example: 'Fiction Section',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Location section must be a string' })
  @MaxLength(100, { message: 'Location section cannot exceed 100 characters' })
  locationSection?: string;

  @ApiPropertyOptional({
    description: 'Location floor',
    example: 'Ground Floor',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Location floor must be a string' })
  @MaxLength(50, { message: 'Location floor cannot exceed 50 characters' })
  locationFloor?: string;

  @ApiPropertyOptional({
    description: 'Location building',
    example: 'Main Library',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Location building must be a string' })
  @MaxLength(100, { message: 'Location building cannot exceed 100 characters' })
  locationBuilding?: string;

  @ApiPropertyOptional({
    description: 'Whether the book is circulating',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is circulating must be a boolean' })
  isCirculating?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the book is reference only',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is reference only must be a boolean' })
  isReferenceOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Loan period in days',
    example: 14,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Loan period must be a number' })
  @Min(1, { message: 'Loan period must be at least 1 day' })
  loanPeriodDays?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of renewals',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Max renewals must be a number' })
  @Min(0, { message: 'Max renewals cannot be negative' })
  maxRenewals?: number;

  @ApiPropertyOptional({
    description: 'Overdue fine per day',
    example: 0.50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Overdue fine must be a number' })
  @Min(0, { message: 'Overdue fine cannot be negative' })
  overdueFinePerDay?: number;

  @ApiPropertyOptional({
    description: 'Replacement cost',
    example: 25.99,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Replacement cost must be a number' })
  @Min(0, { message: 'Replacement cost cannot be negative' })
  replacementCost?: number;

  @ApiPropertyOptional({
    description: 'Whether the book has a digital version',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Has digital version must be a boolean' })
  hasDigitalVersion?: boolean;

  @ApiPropertyOptional({
    description: 'Digital format',
    example: 'PDF',
  })
  @IsOptional()
  @IsString({ message: 'Digital format must be a string' })
  digitalFormat?: string;

  @ApiPropertyOptional({
    description: 'Digital version URL',
    example: 'https://digital.library.com/books/gatsby.pdf',
  })
  @IsOptional()
  @IsString({ message: 'Digital URL must be a string' })
  digitalUrl?: string;

  @ApiPropertyOptional({
    description: 'Digital file size in MB',
    example: 5.2,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Digital file size must be a number' })
  @Min(0, { message: 'Digital file size cannot be negative' })
  digitalFileSizeMb?: number;

  @ApiPropertyOptional({
    description: 'Cover image URL',
    example: 'https://storage.example.com/books/gatsby-cover.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Cover image URL must be a string' })
  coverImageUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional images',
    type: [AdditionalImageDto],
  })
  @IsOptional()
  @IsArray({ message: 'Additional images must be an array' })
  @ValidateNested({ each: true })
  additionalImages?: AdditionalImageDto[];

  @ApiPropertyOptional({
    description: 'Book tags',
    example: ['classic', 'american-literature', 'jazz-age'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata',
    type: BookMetadataDto,
  })
  @IsOptional()
  @ValidateNested()
  metadata?: BookMetadataDto;

  @ApiPropertyOptional({
    description: 'Internal notes for library staff',
    example: 'Rare first edition - handle with care',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}

export class UpdateBookDto {
  @ApiPropertyOptional({
    description: 'Book title',
    example: 'The Great Gatsby',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  @MaxLength(500, { message: 'Title cannot exceed 500 characters' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Book subtitle',
    example: 'A Novel',
    maxLength: 500,
  })
  @IsOptional()
  @IsString({ message: 'Subtitle must be a string' })
  @MaxLength(500, { message: 'Subtitle cannot exceed 500 characters' })
  subtitle?: string;

  @ApiPropertyOptional({
    description: 'Primary author',
    example: 'F. Scott Fitzgerald',
    maxLength: 300,
  })
  @IsOptional()
  @IsString({ message: 'Author must be a string' })
  @MaxLength(300, { message: 'Author cannot exceed 300 characters' })
  author?: string;

  @ApiPropertyOptional({
    description: 'Co-authors',
    example: ['Co-author 1', 'Co-author 2'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Co-authors must be an array' })
  @IsString({ each: true, message: 'Each co-author must be a string' })
  coAuthors?: string[];

  @ApiPropertyOptional({
    description: 'Book category',
    example: TBookCategory.FICTION,
    enum: TBookCategory,
  })
  @IsOptional()
  @IsEnum(TBookCategory, { message: 'Invalid book category' })
  category?: TBookCategory;

  @ApiPropertyOptional({
    description: 'Book status',
    example: 'available',
    enum: ['available', 'checked_out', 'reserved', 'lost', 'damaged', 'under_maintenance', 'discarded', 'reference_only'],
  })
  @IsOptional()
  @IsEnum(['available', 'checked_out', 'reserved', 'lost', 'damaged', 'under_maintenance', 'discarded', 'reference_only'], { message: 'Invalid book status' })
  status?: string;

  @ApiPropertyOptional({
    description: 'Book condition',
    example: TBookCondition.GOOD,
    enum: TBookCondition,
  })
  @IsOptional()
  @IsEnum(TBookCondition, { message: 'Invalid book condition' })
  condition?: TBookCondition;

  @ApiPropertyOptional({
    description: 'Location shelf',
    example: 'A-12',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Location shelf must be a string' })
  @MaxLength(50, { message: 'Location shelf cannot exceed 50 characters' })
  locationShelf?: string;

  @ApiPropertyOptional({
    description: 'Location row',
    example: 'Row 3',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Location row must be a string' })
  @MaxLength(50, { message: 'Location row cannot exceed 50 characters' })
  locationRow?: string;

  @ApiPropertyOptional({
    description: 'Location section',
    example: 'Fiction Section',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Location section must be a string' })
  @MaxLength(100, { message: 'Location section cannot exceed 100 characters' })
  locationSection?: string;

  @ApiPropertyOptional({
    description: 'Location floor',
    example: 'Ground Floor',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({ message: 'Location floor must be a string' })
  @MaxLength(50, { message: 'Location floor cannot exceed 50 characters' })
  locationFloor?: string;

  @ApiPropertyOptional({
    description: 'Location building',
    example: 'Main Library',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'Location building must be a string' })
  @MaxLength(100, { message: 'Location building cannot exceed 100 characters' })
  locationBuilding?: string;

  @ApiPropertyOptional({
    description: 'Whether the book is circulating',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is circulating must be a boolean' })
  isCirculating?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the book is reference only',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is reference only must be a boolean' })
  isReferenceOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Loan period in days',
    example: 14,
    minimum: 1,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Loan period must be a number' })
  @Min(1, { message: 'Loan period must be at least 1 day' })
  loanPeriodDays?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of renewals',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Max renewals must be a number' })
  @Min(0, { message: 'Max renewals cannot be negative' })
  maxRenewals?: number;

  @ApiPropertyOptional({
    description: 'Overdue fine per day',
    example: 0.50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Overdue fine must be a number' })
  @Min(0, { message: 'Overdue fine cannot be negative' })
  overdueFinePerDay?: number;

  @ApiPropertyOptional({
    description: 'Replacement cost',
    example: 25.99,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Replacement cost must be a number' })
  @Min(0, { message: 'Replacement cost cannot be negative' })
  replacementCost?: number;

  @ApiPropertyOptional({
    description: 'Book tags',
    example: ['classic', 'american-literature', 'jazz-age'],
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Tags must be an array' })
  @IsString({ each: true, message: 'Each tag must be a string' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Internal notes for library staff',
    example: 'Updated condition after repair',
  })
  @IsOptional()
  @IsString({ message: 'Internal notes must be a string' })
  internalNotes?: string;
}