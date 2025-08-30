// Academia Pro - Library Controller
// REST API endpoints for managing library books and operations

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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { LibraryService } from '../services/library.service';
import { CreateBookDto, UpdateBookDto } from '../dtos';
import { BookCategory, BookStatus, BookCondition, BookFormat } from '../entities/book.entity';

@ApiTags('Library Management')
@ApiBearerAuth()
@Controller('library')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Post('books')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new book',
    description: 'Add a new book to the library collection',
  })
  @ApiResponse({
    status: 201,
    description: 'Book created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Book with this ISBN already exists',
  })
  async createBook(
    @Body() dto: CreateBookDto,
    @Request() req: any,
  ) {
    const createdBy = req.user?.id || 'system';
    return this.libraryService.createBook(dto, createdBy);
  }

  @Get('books/:id')
  @ApiOperation({
    summary: 'Get book by ID',
    description: 'Retrieve a specific book with full details',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 'book-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Book retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  async getBookById(@Param('id', ParseUUIDPipe) bookId: string) {
    return this.libraryService.getBookById(bookId);
  }

  @Get('books/accession/:accessionNumber')
  @ApiOperation({
    summary: 'Get book by accession number',
    description: 'Retrieve a book using its accession number',
  })
  @ApiParam({
    name: 'accessionNumber',
    description: 'Accession number',
    example: 'ACC20240001',
  })
  @ApiResponse({
    status: 200,
    description: 'Book retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  async getBookByAccessionNumber(@Param('accessionNumber') accessionNumber: string) {
    return this.libraryService.getBookByAccessionNumber(accessionNumber);
  }

  @Put('books/:id')
  @ApiOperation({
    summary: 'Update book',
    description: 'Update an existing book\'s information',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 'book-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Book updated successfully',
  })
  async updateBook(
    @Param('id', ParseUUIDPipe) bookId: string,
    @Body() dto: UpdateBookDto,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.libraryService.updateBook(bookId, dto, updatedBy);
  }

  @Delete('books/:id')
  @ApiOperation({
    summary: 'Delete book',
    description: 'Remove a book from the library collection',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 'book-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Book deleted successfully',
  })
  async deleteBook(@Param('id', ParseUUIDPipe) bookId: string) {
    await this.libraryService.deleteBook(bookId);
    return { message: 'Book deleted successfully' };
  }

  @Get('schools/:schoolId/books')
  @ApiOperation({
    summary: 'Get books by school',
    description: 'Retrieve all books for a specific school',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by book category',
    enum: BookCategory,
    example: BookCategory.FICTION,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by book status',
    enum: BookStatus,
    example: BookStatus.AVAILABLE,
  })
  @ApiQuery({
    name: 'author',
    required: false,
    description: 'Filter by author',
    example: 'F. Scott Fitzgerald',
  })
  @ApiQuery({
    name: 'title',
    required: false,
    description: 'Filter by title',
    example: 'The Great Gatsby',
  })
  @ApiQuery({
    name: 'isbn',
    required: false,
    description: 'Filter by ISBN',
    example: '9780743273565',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search across title, author, ISBN, and description',
    example: 'Gatsby',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Books retrieved successfully',
  })
  async getBooksBySchool(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query() query: any,
  ) {
    const options = {
      category: query.category,
      status: query.status,
      author: query.author,
      title: query.title,
      isbn: query.isbn,
      search: query.search,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.libraryService.getBooksBySchool(schoolId, options);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search books',
    description: 'Search books across multiple fields',
  })
  @ApiQuery({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'query',
    description: 'Search query',
    example: 'Harry Potter',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
    enum: BookCategory,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: BookStatus,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Search results retrieved successfully',
  })
  async searchBooks(@Query() query: any) {
    const options = {
      category: query.category,
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.libraryService.searchBooks(query.schoolId, query.query, options);
  }

  @Get('categories/:schoolId/:category')
  @ApiOperation({
    summary: 'Get books by category',
    description: 'Retrieve all books in a specific category',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiParam({
    name: 'category',
    description: 'Book category',
    enum: BookCategory,
    example: BookCategory.FICTION,
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: BookStatus,
    example: BookStatus.AVAILABLE,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Books retrieved successfully',
  })
  async getBooksByCategory(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Param('category') category: BookCategory,
    @Query() query: any,
  ) {
    const options = {
      status: query.status,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.libraryService.getBooksByCategory(schoolId, category, options);
  }

  @Get('available/:schoolId')
  @ApiOperation({
    summary: 'Get available books',
    description: 'Retrieve all available books for circulation',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
    enum: BookCategory,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search query',
    example: 'science fiction',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Available books retrieved successfully',
  })
  async getAvailableBooks(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query() query: any,
  ) {
    const options = {
      category: query.category,
      search: query.search,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.libraryService.getAvailableBooks(schoolId, options);
  }

  @Get('popular/:schoolId')
  @ApiOperation({
    summary: 'Get popular books',
    description: 'Retrieve most popular books based on checkouts and ratings',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of books to return',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Popular books retrieved successfully',
  })
  async getPopularBooks(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.libraryService.getPopularBooks(schoolId, limit);
  }

  @Get('new-acquisitions/:schoolId')
  @ApiOperation({
    summary: 'Get new acquisitions',
    description: 'Retrieve recently acquired books',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to look back',
    example: 30,
  })
  @ApiResponse({
    status: 200,
    description: 'New acquisitions retrieved successfully',
  })
  async getNewAcquisitions(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query('days') days: number = 30,
  ) {
    return this.libraryService.getNewAcquisitions(schoolId, days);
  }

  @Put('books/:id/condition')
  @ApiOperation({
    summary: 'Update book condition',
    description: 'Update the physical condition of a book',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 'book-uuid-123',
  })
  @ApiQuery({
    name: 'condition',
    description: 'New condition',
    enum: BookCondition,
    example: BookCondition.GOOD,
  })
  @ApiQuery({
    name: 'notes',
    description: 'Condition notes',
    example: 'Minor wear on cover',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Book condition updated successfully',
  })
  async updateBookCondition(
    @Param('id', ParseUUIDPipe) bookId: string,
    @Query('condition') condition: BookCondition,
    @Query('notes') notes: string,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.libraryService.updateBookCondition(bookId, condition, updatedBy, notes);
  }

  @Put('books/:id/lost')
  @ApiOperation({
    summary: 'Mark book as lost',
    description: 'Mark a book as lost and update its status',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 'book-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Book marked as lost successfully',
  })
  async markBookAsLost(
    @Param('id', ParseUUIDPipe) bookId: string,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.libraryService.markBookAsLost(bookId, updatedBy);
  }

  @Put('books/:id/damaged')
  @ApiOperation({
    summary: 'Mark book as damaged',
    description: 'Mark a book as damaged and update its condition',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 'book-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Book marked as damaged successfully',
  })
  async markBookAsDamaged(
    @Param('id', ParseUUIDPipe) bookId: string,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.libraryService.markBookAsDamaged(bookId, updatedBy);
  }

  @Put('books/:id/discarded')
  @ApiOperation({
    summary: 'Mark book as discarded',
    description: 'Mark a book as discarded and remove from circulation',
  })
  @ApiParam({
    name: 'id',
    description: 'Book ID',
    example: 'book-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Book marked as discarded successfully',
  })
  async markBookAsDiscarded(
    @Param('id', ParseUUIDPipe) bookId: string,
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.libraryService.markBookAsDiscarded(bookId, updatedBy);
  }

  @Get('statistics/:schoolId')
  @ApiOperation({
    summary: 'Get library statistics',
    description: 'Retrieve comprehensive library statistics and analytics',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Library statistics retrieved successfully',
  })
  async getLibraryStatistics(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    return this.libraryService.getLibraryStatistics(schoolId);
  }

  @Post('bulk-import/:schoolId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk import books',
    description: 'Import multiple books at once',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Books imported successfully',
  })
  async bulkImportBooks(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Body() body: { books: CreateBookDto[] },
    @Request() req: any,
  ) {
    const createdBy = req.user?.id || 'system';
    return this.libraryService.bulkImportBooks(schoolId, body.books, createdBy);
  }

  @Post('bulk-update-locations/:schoolId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk update book locations',
    description: 'Update locations for multiple books at once',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Book locations updated successfully',
  })
  async bulkUpdateLocations(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Body() body: {
      updates: Array<{
        bookId: string;
        locationShelf?: string;
        locationRow?: string;
        locationSection?: string;
        locationFloor?: string;
        locationBuilding?: string;
      }>;
    },
    @Request() req: any,
  ) {
    const updatedBy = req.user?.id || 'system';
    return this.libraryService.bulkUpdateLocations(schoolId, body.updates, updatedBy);
  }

  @Get('condition-check/:schoolId')
  @ApiOperation({
    summary: 'Get books due for condition check',
    description: 'Retrieve books that are due for condition inspection',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Books due for condition check retrieved successfully',
  })
  async getBooksDueForConditionCheck(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    return this.libraryService.getBooksDueForConditionCheck(schoolId);
  }

  @Get('publication-years/:schoolId')
  @ApiOperation({
    summary: 'Get books by publication year range',
    description: 'Retrieve books published within a specific year range',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'startYear',
    description: 'Start year',
    example: 2000,
  })
  @ApiQuery({
    name: 'endYear',
    description: 'End year',
    example: 2020,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by category',
    enum: BookCategory,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of records to return',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Number of records to skip',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Books retrieved successfully',
  })
  async getBooksByPublicationYearRange(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query() query: any,
  ) {
    const options = {
      category: query.category,
      limit: query.limit ? parseInt(query.limit) : undefined,
      offset: query.offset ? parseInt(query.offset) : undefined,
    };

    return this.libraryService.getBooksByPublicationYearRange(
      schoolId,
      parseInt(query.startYear),
      parseInt(query.endYear),
      options,
    );
  }

  @Get('dashboard/:schoolId')
  @ApiOperation({
    summary: 'Get library dashboard overview',
    description: 'Retrieve dashboard data for library management',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Library dashboard overview retrieved successfully',
  })
  async getLibraryDashboard(@Param('schoolId', ParseUUIDPipe) schoolId: string) {
    const [statistics, popularBooks, newAcquisitions, conditionCheckBooks] = await Promise.all([
      this.libraryService.getLibraryStatistics(schoolId),
      this.libraryService.getPopularBooks(schoolId, 5),
      this.libraryService.getNewAcquisitions(schoolId, 30),
      this.libraryService.getBooksDueForConditionCheck(schoolId),
    ]);

    return {
      summary: statistics,
      alerts: {
        booksDueForConditionCheck: conditionCheckBooks.length,
        newAcquisitionsThisMonth: newAcquisitions.length,
        lowStockCategories: [], // Would need category-wise availability tracking
      },
      recentData: {
        popularBooks,
        newAcquisitions: newAcquisitions.slice(0, 5),
        conditionCheckBooks: conditionCheckBooks.slice(0, 5),
      },
      period: {
        generatedAt: new Date().toISOString(),
      },
    };
  }

  @Get('reports/circulation/:schoolId')
  @ApiOperation({
    summary: 'Get circulation report',
    description: 'Generate comprehensive circulation report',
  })
  @ApiParam({
    name: 'schoolId',
    description: 'School ID',
    example: 'school-uuid-123',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Start date for report',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'End date for report',
    example: '2024-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Circulation report generated successfully',
  })
  async getCirculationReport(
    @Param('schoolId', ParseUUIDPipe) schoolId: string,
    @Query() query: {
      startDate?: string;
      endDate?: string;
    },
  ) {
    const books = await this.libraryService.getBooksBySchool(schoolId);

    const report = {
      totalBooks: books.length,
      availableBooks: books.filter(b => b.status === BookStatus.AVAILABLE).length,
      checkedOutBooks: books.filter(b => b.status === BookStatus.CHECKED_OUT).length,
      reservedBooks: books.filter(b => b.status === BookStatus.RESERVED).length,
      circulationRate: books.length > 0
        ? (books.filter(b => b.totalCheckouts > 0).length / books.length) * 100
        : 0,
      mostPopularBooks: books
        .sort((a, b) => b.totalCheckouts - a.totalCheckouts)
        .slice(0, 10)
        .map(b => ({
          title: b.title,
          author: b.author,
          totalCheckouts: b.totalCheckouts,
          currentStatus: b.status,
        })),
      categoryWiseCirculation: books.reduce((acc, book) => {
        if (!acc[book.category]) {
          acc[book.category] = {
            total: 0,
            checkedOut: 0,
            available: 0,
          };
        }
        acc[book.category].total++;
        if (book.status === BookStatus.CHECKED_OUT) {
          acc[book.category].checkedOut++;
        } else if (book.status === BookStatus.AVAILABLE) {
          acc[book.category].available++;
        }
        return acc;
      }, {} as Record<string, { total: number; checkedOut: number; available: number }>),
      generatedAt: new Date().toISOString(),
      period: {
        startDate: query.startDate || 'All time',
        endDate: query.endDate || 'Present',
      },
    };

    return report;
  }
}