// Academia Pro - Library Module
// Comprehensive library management system for book collections and circulation

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { LibraryController } from './controllers/library.controller';

// Services
import { LibraryService } from './services/library.service';

// Entities
import { Book } from './entities/book.entity';

// Guards
import { LibraryGuard } from './guards/library.guard';

// Interceptors
import { LibraryInterceptor } from './interceptors/library.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book]),
  ],
  controllers: [LibraryController],
  providers: [
    LibraryService,
    LibraryGuard,
    LibraryInterceptor,
  ],
  exports: [
    LibraryService,
    LibraryGuard,
    LibraryInterceptor,
  ],
})
export class LibraryModule {}