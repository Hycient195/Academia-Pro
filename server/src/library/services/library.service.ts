// Academia Pro - Library Service
// Service for managing library books, circulation, and operations

import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, Like, In } from 'typeorm';
import { Book, BookStatus, BookCategory, BookFormat, Language, AcquisitionMethod, BookCondition } from '../entities/book.entity';
import { CreateBookDto, UpdateBookDto } from '../dtos';

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(LibraryService.name);

  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  /**
   * Create a new book
   */
  async createBook(dto: CreateBookDto, createdBy: string): Promise<Book> {
    // Check if ISBN already exists (if provided)
    if (dto.isbn) {
      const existingBook = await this.bookRepository.findOne({
        where: { isbn: dto.isbn },
      });

      if (existingBook) {
        throw new ConflictException('Book with this ISBN already exists');
      }
    }

    // Generate accession number if not provided
    let accessionNumber = dto.accessionNumber;
    if (!accessionNumber) {
      const year = new Date().getFullYear();
      const count = await this.bookRepository.count({
        where: { schoolId: dto.schoolId },
      });
      accessionNumber = `ACC${year}${(count + 1).toString().padStart(6, '0')}`;
    }

    // Create book
    const book = this.bookRepository.create({
      schoolId: dto.schoolId,
      title: dto.title,
      subtitle: dto.subtitle,
      author: dto.author,
      coAuthors: dto.coAuthors || [],
      editor: dto.editor,
      translator: dto.translator,
      illustrator: dto.illustrator,
      isbn: dto.isbn,
      isbn13: dto.isbn13,
      accessionNumber,
      callNumber: dto.callNumber,
      barcode: dto.barcode,
      rfidTag: dto.rfidTag,
      publisher: dto.publisher,
      publicationPlace: dto.publicationPlace,
      publicationYear: dto.publicationYear,
      edition: dto.edition,
      volume: dto.volume,
      series: dto.series,
      seriesNumber: dto.seriesNumber,
      pages: dto.pages,
      heightCm: dto.heightCm,
      widthCm: dto.widthCm,
      thicknessCm: dto.thicknessCm,
      weightGrams: dto.weightGrams,
      category: dto.category || BookCategory.OTHER,
      subcategory: dto.subcategory,
      keywords: dto.keywords || [],
      subjects: dto.subjects || [],
      language: dto.language || Language.ENGLISH,
      format: dto.format || BookFormat.HARDCOVER,
      description: dto.description,
      tableOfContents: dto.tableOfContents,
      summary: dto.summary,
      notes: dto.notes,
      acquisitionMethod: dto.acquisitionMethod || AcquisitionMethod.PURCHASE,
      acquisitionDate: new Date(dto.acquisitionDate),
      acquisitionCost: dto.acquisitionCost,
      acquisitionCurrency: dto.acquisitionCurrency || 'USD',
      supplierName: dto.supplierName,
      supplierInvoiceNumber: dto.supplierInvoiceNumber,
      donorName: dto.donorName,
      condition: dto.condition || BookCondition.GOOD,
      conditionNotes: dto.conditionNotes,
      locationShelf: dto.locationShelf,
      locationRow: dto.locationRow,
      locationSection: dto.locationSection,
      locationFloor: dto.locationFloor,
      locationBuilding: dto.locationBuilding,
      isCirculating: dto.isCirculating !== undefined ? dto.isCirculating : true,
      isReferenceOnly: dto.isReferenceOnly || false,
      loanPeriodDays: dto.loanPeriodDays || 14,
      maxRenewals: dto.maxRenewals || 2,
      overdueFinePerDay: dto.overdueFinePerDay || 0.50,
      replacementCost: dto.replacementCost,
      hasDigitalVersion: dto.hasDigitalVersion || false,
      digitalFormat: dto.digitalFormat,
      digitalUrl: dto.digitalUrl,
      digitalFileSizeMb: dto.digitalFileSizeMb,
      coverImageUrl: dto.coverImageUrl,
      additionalImages: dto.additionalImages || [],
      tags: dto.tags || [],
      metadata: dto.metadata,
      internalNotes: dto.internalNotes,
      createdBy,
      updatedBy: createdBy,
    });

    const savedBook = await this.bookRepository.save(book);

    this.logger.log(
      `Created book "${savedBook.title}" by ${savedBook.author} (${savedBook.accessionNumber})`
    );

    return savedBook;
  }

  /**
   * Get book by ID
   */
  async getBookById(bookId: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException(`Book with ID ${bookId} not found`);
    }

    return book;
  }

  /**
   * Get book by accession number
   */
  async getBookByAccessionNumber(accessionNumber: string): Promise<Book> {
    const book = await this.bookRepository.findOne({
      where: { accessionNumber },
    });

    if (!book) {
      throw new NotFoundException(`Book with accession number ${accessionNumber} not found`);
    }

    return book;
  }

  /**
   * Get books by school
   */
  async getBooksBySchool(
    schoolId: string,
    options?: {
      category?: BookCategory;
      status?: BookStatus;
      author?: string;
      title?: string;
      isbn?: string;
      search?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<Book[]> {
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .where('book.schoolId = :schoolId', { schoolId })
      .orderBy('book.title', 'ASC')
      .addOrderBy('book.author', 'ASC');

    if (options?.category) {
      queryBuilder.andWhere('book.category = :category', {
        category: options.category,
      });
    }

    if (options?.status) {
      queryBuilder.andWhere('book.status = :status', {
        status: options.status,
      });
    }

    if (options?.author) {
      queryBuilder.andWhere('book.author ILIKE :author', {
        author: `%${options.author}%`,
      });
    }

    if (options?.title) {
      queryBuilder.andWhere('book.title ILIKE :title', {
        title: `%${options.title}%`,
      });
    }

    if (options?.isbn) {
      queryBuilder.andWhere('book.isbn = :isbn', {
        isbn: options.isbn,
      });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(book.title ILIKE :search OR book.author ILIKE :search OR book.isbn ILIKE :search OR book.accessionNumber ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Update book
   */
  async updateBook(bookId: string, dto: UpdateBookDto, updatedBy: string): Promise<Book> {
    const book = await this.getBookById(bookId);

    // Note: ISBN updates are not allowed in UpdateBookDto for data integrity
    // ISBN should only be set during book creation

    // Update location if provided
    if (dto.locationShelf !== undefined || dto.locationRow !== undefined ||
        dto.locationSection !== undefined || dto.locationFloor !== undefined ||
        dto.locationBuilding !== undefined) {
      book.updateLocation(
        dto.locationShelf,
        dto.locationRow,
        dto.locationSection,
        dto.locationFloor,
        dto.locationBuilding,
      );
    }

    // Apply other updates
    Object.assign(book, dto);
    book.updatedBy = updatedBy;

    const updatedBook = await this.bookRepository.save(book);

    this.logger.log(`Updated book ${bookId}`);
    return updatedBook;
  }

  /**
   * Delete book
   */
  async deleteBook(bookId: string): Promise<void> {
    const book = await this.getBookById(bookId);

    // Prevent deletion of checked out books
    if (book.status === BookStatus.CHECKED_OUT) {
      throw new BadRequestException('Cannot delete a checked out book');
    }

    await this.bookRepository.remove(book);
    this.logger.log(`Deleted book ${bookId}`);
  }

  /**
   * Search books
   */
  async searchBooks(
    schoolId: string,
    query: string,
    options?: {
      category?: BookCategory;
      status?: BookStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<Book[]> {
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .where('book.schoolId = :schoolId', { schoolId })
      .andWhere(
        '(book.title ILIKE :query OR book.author ILIKE :query OR book.isbn ILIKE :query OR ' +
        'book.accessionNumber ILIKE :query OR book.description ILIKE :query OR ' +
        'book.subjects::text ILIKE :query OR book.keywords::text ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('book.title', 'ASC')
      .addOrderBy('book.author', 'ASC');

    if (options?.category) {
      queryBuilder.andWhere('book.category = :category', {
        category: options.category,
      });
    }

    if (options?.status) {
      queryBuilder.andWhere('book.status = :status', {
        status: options.status,
      });
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Get books by category
   */
  async getBooksByCategory(
    schoolId: string,
    category: BookCategory,
    options?: {
      status?: BookStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<Book[]> {
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .where('book.schoolId = :schoolId', { schoolId })
      .andWhere('book.category = :category', { category })
      .orderBy('book.title', 'ASC')
      .addOrderBy('book.author', 'ASC');

    if (options?.status) {
      queryBuilder.andWhere('book.status = :status', {
        status: options.status,
      });
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Get available books
   */
  async getAvailableBooks(
    schoolId: string,
    options?: {
      category?: BookCategory;
      search?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<Book[]> {
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .where('book.schoolId = :schoolId', { schoolId })
      .andWhere('book.status = :status', { status: BookStatus.AVAILABLE })
      .andWhere('book.isCirculating = :isCirculating', { isCirculating: true })
      .orderBy('book.title', 'ASC')
      .addOrderBy('book.author', 'ASC');

    if (options?.category) {
      queryBuilder.andWhere('book.category = :category', {
        category: options.category,
      });
    }

    if (options?.search) {
      queryBuilder.andWhere(
        '(book.title ILIKE :search OR book.author ILIKE :search OR book.isbn ILIKE :search)',
        { search: `%${options.search}%` },
      );
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Get overdue books
   */
  async getOverdueBooks(schoolId: string): Promise<Book[]> {
    // This would need a checkout system to be fully implemented
    // For now, return books that are checked out
    return this.bookRepository.find({
      where: {
        schoolId,
        status: BookStatus.CHECKED_OUT,
      },
      order: {
        lastCheckedOut: 'ASC',
      },
    });
  }

  /**
   * Get popular books
   */
  async getPopularBooks(
    schoolId: string,
    limit: number = 10,
  ): Promise<Book[]> {
    return this.bookRepository.find({
      where: { schoolId },
      order: {
        totalCheckouts: 'DESC',
        averageRating: 'DESC',
      },
      take: limit,
    });
  }

  /**
   * Get new acquisitions
   */
  async getNewAcquisitions(
    schoolId: string,
    days: number = 30,
  ): Promise<Book[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return this.bookRepository.find({
      where: {
        schoolId,
        acquisitionDate: MoreThanOrEqual(date),
      },
      order: {
        acquisitionDate: 'DESC',
      },
    });
  }

  /**
   * Update book condition
   */
  async updateBookCondition(
    bookId: string,
    condition: BookCondition,
    updatedBy: string,
    notes?: string,
  ): Promise<Book> {
    const book = await this.getBookById(bookId);

    book.updateCondition(condition, notes);
    book.updatedBy = updatedBy;

    const updatedBook = await this.bookRepository.save(book);

    this.logger.log(`Updated condition of book ${bookId} to ${condition}`);
    return updatedBook;
  }

  /**
   * Mark book as lost
   */
  async markBookAsLost(bookId: string, updatedBy: string): Promise<Book> {
    const book = await this.getBookById(bookId);

    book.markAsLost();
    book.updatedBy = updatedBy;

    const updatedBook = await this.bookRepository.save(book);

    this.logger.log(`Marked book ${bookId} as lost`);
    return updatedBook;
  }

  /**
   * Mark book as damaged
   */
  async markBookAsDamaged(bookId: string, updatedBy: string): Promise<Book> {
    const book = await this.getBookById(bookId);

    book.markAsDamaged();
    book.updatedBy = updatedBy;

    const updatedBook = await this.bookRepository.save(book);

    this.logger.log(`Marked book ${bookId} as damaged`);
    return updatedBook;
  }

  /**
   * Mark book as discarded
   */
  async markBookAsDiscarded(bookId: string, updatedBy: string): Promise<Book> {
    const book = await this.getBookById(bookId);

    book.markAsDiscarded();
    book.updatedBy = updatedBy;

    const updatedBook = await this.bookRepository.save(book);

    this.logger.log(`Marked book ${bookId} as discarded`);
    return updatedBook;
  }

  /**
   * Get library statistics
   */
  async getLibraryStatistics(schoolId: string): Promise<{
    totalBooks: number;
    availableBooks: number;
    checkedOutBooks: number;
    reservedBooks: number;
    lostBooks: number;
    damagedBooks: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    byFormat: Record<string, number>;
    totalValue: number;
    averageBookAge: number;
    popularCategories: Array<{ category: string; count: number }>;
    monthlyAcquisitions: number;
    overdueBooks: number;
  }> {
    const allBooks = await this.bookRepository.find({
      where: { schoolId },
    });

    const totalBooks = allBooks.length;
    const availableBooks = allBooks.filter(b => b.status === BookStatus.AVAILABLE).length;
    const checkedOutBooks = allBooks.filter(b => b.status === BookStatus.CHECKED_OUT).length;
    const reservedBooks = allBooks.filter(b => b.status === BookStatus.RESERVED).length;
    const lostBooks = allBooks.filter(b => b.status === BookStatus.LOST).length;
    const damagedBooks = allBooks.filter(b => b.status === BookStatus.DAMAGED).length;

    // Group by category
    const byCategory = allBooks.reduce((acc, book) => {
      acc[book.category] = (acc[book.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by status
    const byStatus = allBooks.reduce((acc, book) => {
      acc[book.status] = (acc[book.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Group by format
    const byFormat = allBooks.reduce((acc, book) => {
      acc[book.format] = (acc[book.format] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate total value
    const totalValue = allBooks.reduce((sum, book) =>
      sum + (book.replacementCost || book.acquisitionCost || 0), 0
    );

    // Calculate average book age
    const booksWithPublicationYear = allBooks.filter(b => b.publicationYear);
    const averageBookAge = booksWithPublicationYear.length > 0
      ? booksWithPublicationYear.reduce((sum, book) => sum + book.ageInYears, 0) / booksWithPublicationYear.length
      : 0;

    // Get popular categories
    const popularCategories = Object.entries(byCategory)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get monthly acquisitions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const monthlyAcquisitions = allBooks.filter(b =>
      b.acquisitionDate >= thirtyDaysAgo
    ).length;

    return {
      totalBooks,
      availableBooks,
      checkedOutBooks,
      reservedBooks,
      lostBooks,
      damagedBooks,
      byCategory,
      byStatus,
      byFormat,
      totalValue: Math.round(totalValue * 100) / 100,
      averageBookAge: Math.round(averageBookAge * 10) / 10,
      popularCategories,
      monthlyAcquisitions,
      overdueBooks: checkedOutBooks, // Placeholder - would need checkout system
    };
  }

  /**
   * Bulk import books
   */
  async bulkImportBooks(
    schoolId: string,
    books: CreateBookDto[],
    createdBy: string,
  ): Promise<Book[]> {
    const importedBooks: Book[] = [];

    for (const bookDto of books) {
      try {
        // Override schoolId to ensure consistency
        bookDto.schoolId = schoolId;
        const book = await this.createBook(bookDto, createdBy);
        importedBooks.push(book);
      } catch (error) {
        this.logger.error(`Failed to import book "${bookDto.title}":`, error.message);
      }
    }

    this.logger.log(`Bulk imported ${importedBooks.length} books`);
    return importedBooks;
  }

  /**
   * Bulk update book locations
   */
  async bulkUpdateLocations(
    schoolId: string,
    updates: Array<{
      bookId: string;
      locationShelf?: string;
      locationRow?: string;
      locationSection?: string;
      locationFloor?: string;
      locationBuilding?: string;
    }>,
    updatedBy: string,
  ): Promise<Book[]> {
    const updatedBooks: Book[] = [];

    for (const update of updates) {
      try {
        const book = await this.getBookById(update.bookId);

        if (book.schoolId !== schoolId) {
          throw new BadRequestException(`Book ${update.bookId} does not belong to this school`);
        }

        book.updateLocation(
          update.locationShelf,
          update.locationRow,
          update.locationSection,
          update.locationFloor,
          update.locationBuilding,
        );

        book.updatedBy = updatedBy;
        const savedBook = await this.bookRepository.save(book);
        updatedBooks.push(savedBook);
      } catch (error) {
        this.logger.error(`Failed to update location for book ${update.bookId}:`, error.message);
      }
    }

    this.logger.log(`Bulk updated locations for ${updatedBooks.length} books`);
    return updatedBooks;
  }

  /**
   * Get books due for condition check
   */
  async getBooksDueForConditionCheck(schoolId: string): Promise<Book[]> {
    const today = new Date();

    return this.bookRepository
      .createQueryBuilder('book')
      .where('book.schoolId = :schoolId', { schoolId })
      .andWhere('book.nextConditionCheck <= :today', { today })
      .andWhere('book.status NOT IN (:statuses)', {
        statuses: [BookStatus.LOST, BookStatus.DISCARDED],
      })
      .orderBy('book.nextConditionCheck', 'ASC')
      .getMany();
  }

  /**
   * Get books by publication year range
   */
  async getBooksByPublicationYearRange(
    schoolId: string,
    startYear: number,
    endYear: number,
    options?: {
      category?: BookCategory;
      limit?: number;
      offset?: number;
    },
  ): Promise<Book[]> {
    const queryBuilder = this.bookRepository
      .createQueryBuilder('book')
      .where('book.schoolId = :schoolId', { schoolId })
      .andWhere('book.publicationYear BETWEEN :startYear AND :endYear', {
        startYear,
        endYear,
      })
      .orderBy('book.publicationYear', 'DESC')
      .addOrderBy('book.title', 'ASC');

    if (options?.category) {
      queryBuilder.andWhere('book.category = :category', {
        category: options.category,
      });
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Generate accession number
   */
  private generateAccessionNumber(schoolId: string): string {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `ACC${year}${timestamp}`;
  }
}