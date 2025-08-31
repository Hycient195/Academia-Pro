// Academia Pro - Redis Service
// Redis caching service for the entire application

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

// Dynamic import for ioredis to handle cases where it's not available
let Redis: any;
try {
  Redis = require('ioredis');
} catch (error) {
  console.warn('ioredis not available, Redis functionality will be disabled');
}

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: any;

  constructor() {
    this.initializeRedis();
  }

  private initializeRedis() {
    try {
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD || undefined,
        db: parseInt(process.env.REDIS_DB || '0'),
        keyPrefix: process.env.REDIS_KEY_PREFIX || 'academia_pro:',
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      };

      this.client = new Redis(redisConfig);

      this.client.on('connect', () => {
        this.logger.log('Connected to Redis');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });

      this.client.on('ready', () => {
        this.logger.log('Redis is ready');
      });

    } catch (error) {
      this.logger.error('Failed to initialize Redis:', error);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      const defaultTtl = parseInt(process.env.REDIS_TTL || '3600');
      await this.client.set(key, value, 'EX', ttl || defaultTtl);
    } catch (error) {
      this.logger.error(`Redis SET error for key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Redis DEL error for key ${key}:`, error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      this.logger.error(`Redis HGET error for key ${key}, field ${field}:`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<void> {
    try {
      await this.client.hset(key, field, value);
    } catch (error) {
      this.logger.error(`Redis HSET error for key ${key}, field ${field}:`, error);
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      this.logger.error(`Redis HGETALL error for key ${key}:`, error);
      return null;
    }
  }

  async hdel(key: string, field: string): Promise<void> {
    try {
      await this.client.hdel(key, field);
    } catch (error) {
      this.logger.error(`Redis HDEL error for key ${key}, field ${field}:`, error);
    }
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<void> {
    try {
      await this.client.lpush(key, ...values);
    } catch (error) {
      this.logger.error(`Redis LPUSH error for key ${key}:`, error);
    }
  }

  async rpush(key: string, ...values: string[]): Promise<void> {
    try {
      await this.client.rpush(key, ...values);
    } catch (error) {
      this.logger.error(`Redis RPUSH error for key ${key}:`, error);
    }
  }

  async lrange(key: string, start: number, end: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, end);
    } catch (error) {
      this.logger.error(`Redis LRANGE error for key ${key}:`, error);
      return [];
    }
  }

  async lpop(key: string): Promise<string | null> {
    try {
      return await this.client.lpop(key);
    } catch (error) {
      this.logger.error(`Redis LPOP error for key ${key}:`, error);
      return null;
    }
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<void> {
    try {
      await this.client.sadd(key, ...members);
    } catch (error) {
      this.logger.error(`Redis SADD error for key ${key}:`, error);
    }
  }

  async srem(key: string, ...members: string[]): Promise<void> {
    try {
      await this.client.srem(key, ...members);
    } catch (error) {
      this.logger.error(`Redis SREM error for key ${key}:`, error);
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      this.logger.error(`Redis SMEMBERS error for key ${key}:`, error);
      return [];
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sismember(key, member);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis SISMEMBER error for key ${key}, member ${member}:`, error);
      return false;
    }
  }

  // Utility methods
  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Redis EXPIRE error for key ${key}:`, error);
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Redis KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  }

  async flushdb(): Promise<void> {
    try {
      await this.client.flushdb();
      this.logger.warn('Redis database flushed');
    } catch (error) {
      this.logger.error('Redis FLUSHDB error:', error);
    }
  }

  // JSON operations (using RedisJSON if available)
  async setJson(key: string, data: any, ttl?: number): Promise<void> {
    try {
      const jsonString = JSON.stringify(data);
      await this.set(key, jsonString, ttl);
    } catch (error) {
      this.logger.error(`Redis setJson error for key ${key}:`, error);
    }
  }

  async getJson<T = any>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.get(key);
      if (!jsonString) return null;
      return JSON.parse(jsonString) as T;
    } catch (error) {
      this.logger.error(`Redis getJson error for key ${key}:`, error);
      return null;
    }
  }

  // Cache management
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        this.logger.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
      }
    } catch (error) {
      this.logger.error(`Redis invalidatePattern error for pattern ${pattern}:`, error);
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.client.ping();
      return result === 'PONG';
    } catch (error) {
      this.logger.error('Redis ping error:', error);
      return false;
    }
  }

  // Get client instance for advanced operations
  getClient(): any {
    return this.client;
  }
}