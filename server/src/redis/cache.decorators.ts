// Academia Pro - Cache Decorators
// Decorators for caching method results and invalidating cache

import { Inject } from '@nestjs/common';
import 'reflect-metadata';

export const CACHE_SERVICE = Symbol('CACHE_SERVICE');

// Cache decorator for method results
export function Cache(keyPrefix: string, ttl?: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = (this as any).cacheService;
      if (!cacheService) {
        console.warn(`Cache service not available for ${propertyKey}`);
        return method.apply(this, args);
      }

      const key = generateCacheKey(propertyKey, args);
      const fullKey = `${keyPrefix}:${key}`;

      // Try to get from cache first
      const cachedResult = await cacheService.get(fullKey);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cacheService.set(fullKey, result, { ttl });

      return result;
    };

    return descriptor;
  };
}

// Cache with custom key generator
export function CacheWithKey(keyGenerator: (...args: any[]) => string, ttl?: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = (this as any).cacheService;
      if (!cacheService) {
        console.warn(`Cache service not available for ${propertyKey}`);
        return method.apply(this, args);
      }

      const key = keyGenerator(...args);

      // Try to get from cache first
      const cachedResult = await cacheService.get(key);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cacheService.set(key, result, { ttl });

      return result;
    };

    return descriptor;
  };
}

// Cache invalidation decorator
export function CacheInvalidate(pattern: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);

      // Invalidate cache after method execution
      const cacheService = (this as any).cacheService;
      if (cacheService) {
        await cacheService.invalidatePattern(pattern);
      }

      return result;
    };

    return descriptor;
  };
}

// Cache invalidation with custom pattern generator
export function CacheInvalidateWithPattern(patternGenerator: (...args: any[]) => string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const result = await method.apply(this, args);

      // Invalidate cache after method execution
      const cacheService = (this as any).cacheService;
      if (cacheService) {
        const pattern = patternGenerator(...args);
        await cacheService.invalidatePattern(pattern);
      }

      return result;
    };

    return descriptor;
  };
}

// User-specific cache decorator
export function UserCache(ttl?: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = (this as any).cacheService;
      if (!cacheService) {
        console.warn(`Cache service not available for ${propertyKey}`);
        return method.apply(this, args);
      }

      // Assume first argument is userId or extract from context
      const userId = extractUserId(args, this);
      if (!userId) {
        return method.apply(this, args);
      }

      const key = generateCacheKey(propertyKey, args);

      // Try to get from user cache first
      const cachedResult = await cacheService.getUserCache(userId, key);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cacheService.setUserCache(userId, key, result, ttl);

      return result;
    };

    return descriptor;
  };
}

// School-specific cache decorator
export function SchoolCache(ttl?: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = (this as any).cacheService;
      if (!cacheService) {
        console.warn(`Cache service not available for ${propertyKey}`);
        return method.apply(this, args);
      }

      // Assume first argument is schoolId or extract from context
      const schoolId = extractSchoolId(args, this);
      if (!schoolId) {
        return method.apply(this, args);
      }

      const key = generateCacheKey(propertyKey, args);

      // Try to get from school cache first
      const cachedResult = await cacheService.getSchoolCache(schoolId, key);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cacheService.setSchoolCache(schoolId, key, result, ttl);

      return result;
    };

    return descriptor;
  };
}

// API response cache decorator
export function ApiCache(ttl?: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheService = (this as any).cacheService;
      if (!cacheService) {
        console.warn(`Cache service not available for ${propertyKey}`);
        return method.apply(this, args);
      }

      // Extract request context
      const request = (this as any).request || args[0];
      if (!request) {
        return method.apply(this, args);
      }

      const method_name = request.method || 'GET';
      const url = request.url || request.path || '';
      const params = { ...request.query, ...request.params, ...request.body };

      // Try to get from API cache first
      const cachedResult = await cacheService.getApiResponse(method_name, url, params);
      if (cachedResult !== null) {
        return cachedResult;
      }

      // Execute method and cache result
      const result = await method.apply(this, args);
      await cacheService.cacheApiResponse(method_name, url, params, result, ttl);

      return result;
    };

    return descriptor;
  };
}

// Helper functions
function generateCacheKey(methodName: string, args: any[]): string {
  const argsString = args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      // Create a stable string representation of objects
      return JSON.stringify(arg, Object.keys(arg).sort());
    }
    return String(arg);
  }).join('|');

  return `${methodName}:${argsString}`;
}

function extractUserId(args: any[], context: any): string | null {
  // Try to extract userId from various sources
  if (args[0] && typeof args[0] === 'string') {
    return args[0]; // Assume first arg is userId
  }

  if (context.userId) {
    return context.userId;
  }

  if (context.request && context.request.user && context.request.user.id) {
    return context.request.user.id;
  }

  return null;
}

function extractSchoolId(args: any[], context: any): string | null {
  // Try to extract schoolId from various sources
  if (args[1] && typeof args[1] === 'string') {
    return args[1]; // Assume second arg is schoolId
  }

  if (context.schoolId) {
    return context.schoolId;
  }

  if (context.request && context.request.user && context.request.user.schoolId) {
    return context.request.user.schoolId;
  }

  return null;
}