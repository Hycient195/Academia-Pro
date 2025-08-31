// Academia Pro - Cache Example Service
// Example service demonstrating various caching patterns

import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CacheService } from './cache.service';
import { Cache, UserCache, SchoolCache, CacheInvalidate, ApiCache } from './cache.decorators';

@Injectable()
export class CacheExampleService {
  constructor(
    @Inject('CacheService') private readonly cacheService: CacheService,
  ) {}

  // Basic caching with automatic key generation
  @Cache('user-profile', 1800) // Cache for 30 minutes
  async getUserProfile(userId: string) {
    // Simulate database query
    console.log(`Fetching user profile for user: ${userId}`);
    return {
      id: userId,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'student',
      lastLogin: new Date(),
    };
  }

  // User-specific caching
  @UserCache(3600) // Cache for 1 hour, automatically scoped to user
  async getUserPreferences(userId: string) {
    console.log(`Fetching preferences for user: ${userId}`);
    return {
      theme: 'dark',
      language: 'en',
      notifications: true,
      timezone: 'UTC',
    };
  }

  // School-specific caching
  @SchoolCache(7200) // Cache for 2 hours, automatically scoped to school
  async getSchoolSettings(schoolId: string) {
    console.log(`Fetching settings for school: ${schoolId}`);
    return {
      name: 'Example School',
      timezone: 'UTC',
      currency: 'USD',
      academicYear: '2024-2025',
    };
  }

  // Cache invalidation after data modification
  @CacheInvalidate('user-profile:*')
  async updateUserProfile(userId: string, updates: any) {
    console.log(`Updating profile for user: ${userId}`);
    // Simulate database update
    return {
      success: true,
      updatedFields: Object.keys(updates),
    };
  }

  // API response caching
  @ApiCache(600) // Cache API responses for 10 minutes
  async getDashboardData(userId: string, dateRange: string) {
    console.log(`Fetching dashboard data for user: ${userId}, range: ${dateRange}`);
    return {
      totalStudents: 1250,
      activeCourses: 45,
      attendanceRate: 92.5,
      upcomingEvents: 8,
      recentActivities: [
        { type: 'assignment', count: 15 },
        { type: 'quiz', count: 8 },
        { type: 'announcement', count: 3 },
      ],
    };
  }

  // Manual caching with custom logic
  async getCachedDataWithFallback(key: string) {
    return this.cacheService.getOrSet(
      key,
      async () => {
        console.log(`Computing data for key: ${key}`);
        // Simulate expensive computation
        await new Promise(resolve => setTimeout(resolve, 100));
        return {
          computed: true,
          timestamp: new Date(),
          data: `Result for ${key}`,
        };
      },
      { ttl: 1800 } // 30 minutes
    );
  }

  // Cache with custom key generation
  async getClassSchedule(classId: string, weekStart: Date) {
    const key = `class-schedule:${classId}:${weekStart.toISOString().split('T')[0]}`;

    return this.cacheService.getOrSet(
      key,
      async () => {
        console.log(`Fetching schedule for class: ${classId}, week: ${weekStart}`);
        return {
          classId,
          weekStart,
          schedule: [
            { day: 'Monday', subject: 'Mathematics', time: '09:00' },
            { day: 'Tuesday', subject: 'Science', time: '10:00' },
            { day: 'Wednesday', subject: 'English', time: '11:00' },
          ],
        };
      },
      { keyPrefix: 'schedule', ttl: 86400 } // 24 hours
    );
  }

  // Batch cache operations
  async getMultipleUserProfiles(userIds: string[]) {
    const results = [];

    for (const userId of userIds) {
      const profile = await this.getUserProfile(userId);
      results.push(profile);
    }

    return results;
  }

  // Cache statistics and management
  async getCacheStats() {
    return this.cacheService.getStats();
  }

  async clearUserCache(userId: string) {
    await this.cacheService.clearUserCache(userId);
    return { success: true, message: `Cache cleared for user: ${userId}` };
  }

  async clearSchoolCache(schoolId: string) {
    await this.cacheService.clearSchoolCache(schoolId);
    return { success: true, message: `Cache cleared for school: ${schoolId}` };
  }

  async clearAllCache() {
    await this.cacheService.clearAll();
    return { success: true, message: 'All cache cleared' };
  }

  // Cache with conditional logic
  async getReportData(reportId: string, forceRefresh = false) {
    const key = `report:${reportId}`;

    if (forceRefresh) {
      // Force refresh by deleting existing cache
      await this.cacheService.del(key, 'reports');
    }

    return this.cacheService.getOrSet(
      key,
      async () => {
        console.log(`Generating report: ${reportId}`);
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
          reportId,
          generatedAt: new Date(),
          data: {
            totalRecords: 1000,
            summary: 'Report summary data',
            charts: [],
          },
        };
      },
      { keyPrefix: 'reports', ttl: 3600 } // 1 hour
    );
  }
}