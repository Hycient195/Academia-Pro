// Academia Pro - Cache Service
// High-level caching service with TTL management and cache invalidation

import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from './redis.service';

export interface CacheOptions {
  ttl?: number;
  keyPrefix?: string;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTtl = parseInt(process.env.REDIS_TTL || '3600');

  constructor(private readonly redisService: RedisService) {}

  // Generate cache key with prefix
  private generateKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || 'cache';
    return `${keyPrefix}:${key}`;
  }

  // Set cache with optional TTL
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    try {
      const cacheKey = this.generateKey(key, options.keyPrefix);
      const ttl = options.ttl || this.defaultTtl;
      await this.redisService.setJson(cacheKey, data, ttl);
      this.logger.debug(`Cache set: ${cacheKey} (TTL: ${ttl}s)`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  // Get cache
  async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(key, prefix);
      const data = await this.redisService.getJson<T>(cacheKey);
      if (data) {
        this.logger.debug(`Cache hit: ${cacheKey}`);
      } else {
        this.logger.debug(`Cache miss: ${cacheKey}`);
      }
      return data;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  // Delete cache
  async del(key: string, prefix?: string): Promise<void> {
    try {
      const cacheKey = this.generateKey(key, prefix);
      await this.redisService.del(cacheKey);
      this.logger.debug(`Cache deleted: ${cacheKey}`);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  // Check if cache exists
  async exists(key: string, prefix?: string): Promise<boolean> {
    try {
      const cacheKey = this.generateKey(key, prefix);
      return await this.redisService.exists(cacheKey);
    } catch (error) {
      this.logger.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  // Get cache TTL
  async getTtl(key: string, prefix?: string): Promise<number> {
    try {
      const cacheKey = this.generateKey(key, prefix);
      return await this.redisService.ttl(cacheKey);
    } catch (error) {
      this.logger.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  // Set cache TTL
  async setTtl(key: string, ttl: number, prefix?: string): Promise<void> {
    try {
      const cacheKey = this.generateKey(key, prefix);
      await this.redisService.expire(cacheKey, ttl);
      this.logger.debug(`Cache TTL set: ${cacheKey} (${ttl}s)`);
    } catch (error) {
      this.logger.error(`Cache set TTL error for key ${key}:`, error);
    }
  }

  // Cache with fallback function
  async getOrSet<T>(
    key: string,
    fallbackFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cachedData = await this.get<T>(key, options.keyPrefix);
      if (cachedData !== null) {
        return cachedData;
      }

      // If not in cache, execute fallback function
      this.logger.debug(`Executing fallback function for key: ${key}`);
      const data = await fallbackFn();

      // Cache the result
      await this.set(key, data, options);

      return data;
    } catch (error) {
      this.logger.error(`Cache getOrSet error for key ${key}:`, error);
      // If caching fails, still return the data
      return await fallbackFn();
    }
  }

  // Invalidate cache by pattern
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const fullPattern = `${process.env.REDIS_KEY_PREFIX || 'academia_pro:'}${pattern}`;
      await this.redisService.invalidatePattern(fullPattern);
    } catch (error) {
      this.logger.error(`Cache invalidate pattern error for ${pattern}:`, error);
    }
  }

  // Clear all cache
  async clearAll(): Promise<void> {
    try {
      await this.redisService.flushdb();
      this.logger.warn('All cache cleared');
    } catch (error) {
      this.logger.error('Cache clear all error:', error);
    }
  }

  // Cache statistics
  async getStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    connected: boolean;
  }> {
    try {
      const keys = await this.redisService.keys('*');
      const connected = await this.redisService.ping();

      return {
        totalKeys: keys.length,
        memoryUsage: 'N/A', // Would need Redis INFO command
        connected,
      };
    } catch (error) {
      this.logger.error('Cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'N/A',
        connected: false,
      };
    }
  }

  // User-specific cache methods
  async getUserCache<T>(userId: string, key: string): Promise<T | null> {
    return this.get<T>(key, `user:${userId}`);
  }

  async setUserCache<T>(userId: string, key: string, data: T, ttl?: number): Promise<void> {
    await this.set(key, data, { keyPrefix: `user:${userId}`, ttl });
  }

  async clearUserCache(userId: string): Promise<void> {
    await this.invalidatePattern(`user:${userId}:*`);
  }

  // School-specific cache methods
  async getSchoolCache<T>(schoolId: string, key: string): Promise<T | null> {
    return this.get<T>(key, `school:${schoolId}`);
  }

  async setSchoolCache<T>(schoolId: string, key: string, data: T, ttl?: number): Promise<void> {
    await this.set(key, data, { keyPrefix: `school:${schoolId}`, ttl });
  }

  async clearSchoolCache(schoolId: string): Promise<void> {
    await this.invalidatePattern(`school:${schoolId}:*`);
  }

  // API response caching
  async cacheApiResponse<T>(
    method: string,
    url: string,
    params: Record<string, any>,
    data: T,
    ttl?: number
  ): Promise<void> {
    const key = this.generateApiKey(method, url, params);
    await this.set(key, data, { keyPrefix: 'api', ttl: ttl || 300 }); // 5 minutes default
  }

  async getApiResponse<T>(
    method: string,
    url: string,
    params: Record<string, any>
  ): Promise<T | null> {
    const key = this.generateApiKey(method, url, params);
    return this.get<T>(key, 'api');
  }

  private generateApiKey(method: string, url: string, params: Record<string, any>): string {
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return `${method}:${url}:${paramString}`;
  }

  // Database query result caching
  async cacheQueryResult<T>(
    query: string,
    params: any[],
    result: T,
    ttl?: number
  ): Promise<void> {
    const key = this.generateQueryKey(query, params);
    await this.set(key, result, { keyPrefix: 'query', ttl: ttl || 600 }); // 10 minutes default
  }

  async getQueryResult<T>(query: string, params: any[]): Promise<T | null> {
    const key = this.generateQueryKey(query, params);
    return this.get<T>(key, 'query');
  }

  private generateQueryKey(query: string, params: any[]): string {
    const paramHash = require('crypto').createHash('md5').update(JSON.stringify(params)).digest('hex');
    return `${query}:${paramHash}`;
  }
}