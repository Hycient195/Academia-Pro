// Academia Pro - Throttler Guard
// Rate limiting guard for API endpoints

import { Injectable } from '@nestjs/common';
import { ThrottlerGuard as BaseThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerGuard extends BaseThrottlerGuard {
  // Custom throttler guard implementation
  // Extends the base ThrottlerGuard from @nestjs/throttler
}