# Academia Pro - Redis Caching System

This directory contains the Redis caching implementation for the Academia Pro application, providing high-performance caching capabilities throughout the entire system.

## Overview

The Redis caching system consists of several components:

- **RedisService**: Low-level Redis operations
- **CacheService**: High-level caching abstraction
- **Cache Decorators**: Declarative caching for methods
- **Cache Interceptor**: Automatic HTTP response caching
- **Redis Module**: NestJS module for dependency injection

## Environment Variables

Add these variables to your `.env` file:

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_URL=redis://localhost:6379
REDIS_TTL=3600
REDIS_KEY_PREFIX=academia_pro:
```

## Installation

```bash
npm install ioredis @types/ioredis
```

## Basic Usage

### 1. Inject CacheService

```typescript
import { CacheService } from './redis/cache.service';

@Injectable()
export class MyService {
  constructor(private readonly cacheService: CacheService) {}

  async getData(key: string) {
    return this.cacheService.getOrSet(
      key,
      async () => {
        // Expensive operation
        return await this.fetchFromDatabase(key);
      },
      { ttl: 3600 } // 1 hour
    );
  }
}
```

### 2. Use Cache Decorators

```typescript
import { Cache, UserCache, SchoolCache, CacheInvalidate } from './redis/cache.decorators';

@Injectable()
export class UserService {
  @Cache('user-profile', 1800) // Cache for 30 minutes
  async getUserProfile(userId: string) {
    return await this.userRepository.findOne(userId);
  }

  @UserCache(3600) // User-specific cache for 1 hour
  async getUserPreferences(userId: string) {
    return await this.preferencesRepository.findByUser(userId);
  }

  @SchoolCache(7200) // School-specific cache for 2 hours
  async getSchoolSettings(schoolId: string) {
    return await this.schoolRepository.findOne(schoolId);
  }

  @CacheInvalidate('user-profile:*')
  async updateUserProfile(userId: string, updates: any) {
    await this.userRepository.update(userId, updates);
    // Cache will be automatically invalidated
  }
}
```

### 3. API Response Caching

```typescript
import { CacheEndpoint } from './redis/cache.interceptor';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @CacheEndpoint('user-detail', 300) // Cache for 5 minutes
  async getUser(@Param('id') id: string) {
    return this.userService.getUserProfile(id);
  }
}
```

## Cache Patterns

### 1. Method Result Caching

```typescript
@Cache('method-result', 1800)
async expensiveOperation(param1: string, param2: number) {
  // This method's result will be cached
  return await this.computeResult(param1, param2);
}
```

### 2. User-Specific Caching

```typescript
@UserCache(3600)
async getUserData(userId: string) {
  // Cache key will be automatically prefixed with user ID
  return await this.userRepository.findOne(userId);
}
```

### 3. School-Specific Caching

```typescript
@SchoolCache(7200)
async getSchoolData(schoolId: string) {
  // Cache key will be automatically prefixed with school ID
  return await this.schoolRepository.findOne(schoolId);
}
```

### 4. Cache Invalidation

```typescript
@CacheInvalidate('user:*')
async updateUser(userId: string, data: any) {
  await this.userRepository.update(userId, data);
  // All user-related cache will be invalidated
}
```

### 5. API Response Caching

```typescript
@ApiCache(600)
async getDashboardData(userId: string) {
  // HTTP responses will be cached
  return await this.analyticsService.generateDashboard(userId);
}
```

## Advanced Features

### Custom Cache Keys

```typescript
async getCustomCachedData(param1: string, param2: string) {
  const key = `custom:${param1}:${param2}`;

  return this.cacheService.getOrSet(
    key,
    async () => await this.computeData(param1, param2),
    { ttl: 1800 }
  );
}
```

### Cache with Fallback

```typescript
async getDataWithFallback(key: string) {
  return this.cacheService.getOrSet(
    key,
    async () => {
      // Fallback function - executed if not in cache
      return await this.expensiveOperation();
    },
    { ttl: 3600 }
  );
}
```

### Manual Cache Management

```typescript
async manualCacheOperations() {
  // Set cache
  await this.cacheService.set('my-key', { data: 'value' }, { ttl: 1800 });

  // Get cache
  const data = await this.cacheService.get('my-key');

  // Delete cache
  await this.cacheService.del('my-key');

  // Check existence
  const exists = await this.cacheService.exists('my-key');
}
```

## Cache Strategies

### 1. Cache-Aside Pattern

```typescript
async getUser(userId: string) {
  // Try cache first
  let user = await this.cacheService.get(`user:${userId}`);

  if (!user) {
    // Cache miss - fetch from database
    user = await this.userRepository.findOne(userId);

    // Store in cache
    await this.cacheService.set(`user:${userId}`, user, { ttl: 3600 });
  }

  return user;
}
```

### 2. Write-Through Pattern

```typescript
async updateUser(userId: string, data: any) {
  // Update database
  await this.userRepository.update(userId, data);

  // Update cache
  await this.cacheService.set(`user:${userId}`, data, { ttl: 3600 });
}
```

### 3. Cache Invalidation

```typescript
async deleteUser(userId: string) {
  // Delete from database
  await this.userRepository.delete(userId);

  // Invalidate cache
  await this.cacheService.del(`user:${userId}`);
}
```

## Cache Keys Convention

- Use descriptive, hierarchical keys: `user:profile:123`
- Include relevant parameters: `report:monthly:school-456:2024-01`
- Use consistent prefixes: `api:`, `user:`, `school:`, `query:`

## Monitoring and Maintenance

### Cache Statistics

```typescript
async getCacheStats() {
  const stats = await this.cacheService.getStats();
  console.log('Cache Statistics:', stats);
  // Output: { totalKeys: 150, memoryUsage: 'N/A', connected: true }
}
```

### Cache Clearing

```typescript
// Clear user cache
await this.cacheService.clearUserCache(userId);

// Clear school cache
await this.cacheService.clearSchoolCache(schoolId);

// Clear all cache
await this.cacheService.clearAll();
```

## Best Practices

1. **TTL Strategy**: Set appropriate TTL values based on data volatility
2. **Key Naming**: Use consistent, descriptive key names
3. **Error Handling**: Always handle cache failures gracefully
4. **Memory Management**: Monitor cache size and implement eviction policies
5. **Cache Warming**: Pre-populate frequently accessed data
6. **Invalidation**: Implement proper cache invalidation strategies

## Performance Considerations

- Use connection pooling for high-traffic applications
- Implement circuit breakers for Redis failures
- Monitor cache hit/miss ratios
- Use Redis clustering for horizontal scaling
- Implement cache compression for large objects

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check Redis server status and network connectivity
2. **Memory Issues**: Monitor Redis memory usage and implement eviction policies
3. **Cache Invalidation**: Ensure proper cache invalidation after data updates
4. **Key Conflicts**: Use unique key prefixes to avoid conflicts

### Health Checks

```typescript
async checkRedisHealth() {
  const isConnected = await this.redisService.ping();
  if (!isConnected) {
    console.error('Redis connection failed');
  }
  return isConnected;
}
```

## Integration with Existing Services

To integrate caching into existing services:

1. Inject `CacheService` into your service
2. Add cache decorators to methods
3. Implement cache invalidation in update/delete operations
4. Monitor cache performance and adjust TTL values as needed

The caching system is designed to be non-intrusive and can be gradually adopted across the application without breaking existing functionality.