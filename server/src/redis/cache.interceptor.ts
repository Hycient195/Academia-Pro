// Academia Pro - Cache Interceptor
// Automatic caching interceptor for HTTP responses

import {
  Injectable,
  ExecutionContext,
  CallHandler,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CacheService } from './cache.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheService: CacheService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Skip caching for non-GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Check if endpoint has @Cache decorator
    const cacheKey = this.reflector.get<string>('cache:key', context.getHandler());
    const cacheTtl = this.reflector.get<number>('cache:ttl', context.getHandler());

    if (!cacheKey) {
      // No cache decorator, proceed without caching
      return next.handle();
    }

    // Generate cache key from request
    const key = this.generateCacheKey(request, cacheKey);

    try {
      // Try to get from cache first
      const cachedResponse = await this.cacheService.get(key, 'api');
      if (cachedResponse) {
        // Set cache hit header
        response.setHeader('X-Cache-Status', 'HIT');
        return of(cachedResponse);
      }

      // Not in cache, proceed with request
      return next.handle().pipe(
        tap(async (data) => {
          // Cache the response
          await this.cacheService.set(key, data, {
            keyPrefix: 'api',
            ttl: cacheTtl || 300, // 5 minutes default
          });
        }),
        map((data) => {
          // Set cache miss header
          response.setHeader('X-Cache-Status', 'MISS');
          return data;
        }),
      );
    } catch (error) {
      // If caching fails, proceed without caching
      console.warn('Cache interceptor error:', error.message);
      return next.handle();
    }
  }

  private generateCacheKey(request: any, baseKey: string): string {
    const { method, url, query, params, user } = request;

    // Include user ID in cache key for user-specific data
    const userId = user?.id || 'anonymous';

    // Create a stable key from request parameters
    const queryString = Object.keys(query || {})
      .sort()
      .map(key => `${key}=${query[key]}`)
      .join('&');

    const paramsString = Object.keys(params || {})
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${baseKey}:${userId}:${method}:${url}:${queryString}:${paramsString}`;
  }
}

// Decorator to mark endpoints for caching
export function CacheEndpoint(key: string, ttl?: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata('cache:key', key, descriptor.value);
    if (ttl) {
      Reflect.defineMetadata('cache:ttl', ttl, descriptor.value);
    }
    return descriptor;
  };
}