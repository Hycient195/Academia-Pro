// Academia Pro - Library DTOs
// Export all library-related Data Transfer Objects

export {
  CreateBookDto,
  UpdateBookDto,
  AdditionalImageDto,
  AwardDto,
  SeriesInfoDto,
  BookMetadataDto,
} from './create-book.dto';

// Re-export types for convenience
export type {
  BookCategory,
  BookFormat,
  Language,
  AcquisitionMethod,
  BookCondition,
  BookStatus,
} from '../entities/book.entity';