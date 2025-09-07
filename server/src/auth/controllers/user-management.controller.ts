// Academia Pro - User Management Controller
// Handles user profiles, roles, permissions, and account management

import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards, Request, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UsersService } from '../../users/users.service';

@ApiTags('User Management')
@Controller('auth/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserManagementController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('profile')
  @ApiOperation({
    summary: 'Get user profile',
    description: 'Get current user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async getProfile(@Request() req: any) {
    const userId = req.user.id;

    return {
      id: userId,
      email: 'john.doe@school.edu',
      firstName: 'John',
      lastName: 'Doe',
      role: 'student',
      profile: {
        avatar: '/avatars/john-doe.jpg',
        bio: 'High school student passionate about mathematics and science.',
        dateOfBirth: '2008-05-15',
        gender: 'male',
        phoneNumber: '+1-555-0123',
        address: {
          street: '123 Main Street',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA',
        },
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Mother',
          phoneNumber: '+1-555-0124',
          email: 'jane.doe@email.com',
        },
      },
      academic: {
        studentId: 'STU2024001',
        grade: '10',
        section: 'A',
        enrollmentDate: '2023-09-01',
        graduationYear: '2026',
        gpa: 3.8,
        subjects: ['Mathematics', 'Physics', 'Chemistry', 'English', 'History'],
      },
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'America/New_York',
        notifications: {
          email: true,
          push: true,
          sms: false,
        },
        privacy: {
          profileVisibility: 'school',
          showGrades: true,
          showActivities: true,
        },
      },
      account: {
        status: 'active',
        emailVerified: true,
        mfaEnabled: true,
        lastLogin: new Date('2024-01-20T10:00:00Z'),
        accountCreated: new Date('2023-08-15T09:00:00Z'),
        passwordLastChanged: new Date('2024-01-01T14:30:00Z'),
      },
      permissions: [
        'read_profile',
        'update_profile',
        'view_grades',
        'submit_assignments',
        'access_library',
        'join_clubs',
      ],
    };
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user profile',
    description: 'Update current user profile information',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
  })
  async updateProfile(@Request() req: any, @Body() profileData: any) {
    const userId = req.user.id;

    return {
      id: userId,
      updatedFields: Object.keys(profileData),
      updatedAt: new Date(),
      message: 'Profile updated successfully',
    };
  }

  @Put('preferences')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update user preferences',
    description: 'Update user preferences and settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Preferences updated successfully',
  })
  async updatePreferences(@Request() req: any, @Body() preferences: any) {
    const userId = req.user.id;

    return {
      id: userId,
      preferences,
      updatedAt: new Date(),
      message: 'Preferences updated successfully',
    };
  }

  @Get('roles')
  @ApiOperation({
    summary: 'Get user roles and permissions',
    description: 'Get current user roles and associated permissions',
  })
  @ApiResponse({
    status: 200,
    description: 'User roles and permissions retrieved successfully',
  })
  async getUserRoles(@Request() req: any) {
    const userId = req.user.id;

    return {
      userId,
      primaryRole: 'student',
      roles: [
        {
          id: 'role_student',
          name: 'Student',
          description: 'Basic student role with access to academic features',
          permissions: [
            'read_profile',
            'update_profile',
            'view_grades',
            'submit_assignments',
            'access_library',
            'join_clubs',
            'view_timetable',
            'access_online_learning',
          ],
          assignedAt: new Date('2023-08-15'),
          assignedBy: 'System',
        },
        {
          id: 'role_class_representative',
          name: 'Class Representative',
          description: 'Additional permissions for class leadership',
          permissions: [
            'create_announcements',
            'moderate_discussions',
            'organize_events',
            'represent_class',
          ],
          assignedAt: new Date('2023-09-01'),
          assignedBy: 'Teacher',
        },
      ],
      effectivePermissions: [
        'read_profile',
        'update_profile',
        'view_grades',
        'submit_assignments',
        'access_library',
        'join_clubs',
        'view_timetable',
        'access_online_learning',
        'create_announcements',
        'moderate_discussions',
        'organize_events',
        'represent_class',
      ],
      restrictions: [],
    };
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Get user activity log',
    description: 'Get user activity history and engagement metrics',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of records to return' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Start date for activity log' })
  @ApiQuery({ name: 'endDate', required: false, description: 'End date for activity log' })
  @ApiResponse({
    status: 200,
    description: 'User activity log retrieved successfully',
  })
  async getUserActivity(
    @Request() req: any,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const userId = req.user.id;

    return {
      userId,
      dateRange: {
        start: startDate || '2024-01-01',
        end: endDate || '2024-01-31',
      },
      totalActivities: 245,
      activities: [
        {
          id: 'activity_1',
          type: 'login',
          description: 'Logged into the system',
          timestamp: new Date('2024-01-20T10:00:00Z'),
          ipAddress: '192.168.1.100',
          device: 'Chrome on macOS',
          location: 'New York, US',
        },
        {
          id: 'activity_2',
          type: 'assignment_submit',
          description: 'Submitted "Math Problem Set 3"',
          timestamp: new Date('2024-01-20T09:30:00Z'),
          resource: 'assignments',
          resourceId: 'assignment_123',
          score: 45,
          maxScore: 50,
        },
        {
          id: 'activity_3',
          type: 'content_view',
          description: 'Viewed "Introduction to Algebra" video',
          timestamp: new Date('2024-01-19T16:45:00Z'),
          resource: 'learning_content',
          resourceId: 'content_456',
          duration: 1800, // seconds
          completionRate: 100,
        },
        {
          id: 'activity_4',
          type: 'quiz_attempt',
          description: 'Completed "Chemistry Elements Quiz"',
          timestamp: new Date('2024-01-19T14:20:00Z'),
          resource: 'quizzes',
          resourceId: 'quiz_789',
          score: 18,
          maxScore: 20,
          timeSpent: 1500, // seconds
        },
        {
          id: 'activity_5',
          type: 'profile_update',
          description: 'Updated profile information',
          timestamp: new Date('2024-01-18T11:15:00Z'),
          resource: 'user_profile',
          changes: ['phone_number', 'emergency_contact'],
        },
      ],
      summary: {
        loginCount: 28,
        contentViews: 67,
        assignmentsSubmitted: 12,
        quizzesCompleted: 8,
        discussionsParticipated: 15,
        totalTimeSpent: '45.5 hours',
        averageSessionDuration: '1.8 hours',
        mostActiveDay: 'Wednesday',
        mostActiveHour: '7-8 PM',
      },
      engagement: {
        overallScore: 85,
        consistency: 78,
        participation: 92,
        improvement: 12, // percentage increase
        streak: {
          current: 12,
          longest: 28,
          lastBreak: new Date('2024-01-08'),
        },
      },
    };
  }

  @Get('notifications')
  @ApiOperation({
    summary: 'Get user notifications',
    description: 'Get user notifications and alerts',
  })
  @ApiQuery({ name: 'status', required: false, enum: ['unread', 'read', 'archived'], description: 'Filter by status' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by notification type' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of notifications to return' })
  @ApiResponse({
    status: 200,
    description: 'User notifications retrieved successfully',
  })
  async getNotifications(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: number,
  ) {
    const userId = req.user.id;

    return {
      userId,
      totalNotifications: 45,
      unreadCount: 8,
      notifications: [
        {
          id: 'notif_1',
          type: 'assignment_due',
          title: 'Assignment Due Soon',
          message: 'Your "Chemistry Lab Report" is due in 2 hours',
          timestamp: new Date('2024-01-20T12:30:00Z'),
          priority: 'high',
          status: 'unread',
          actionUrl: '/assignments/chemistry-lab-report',
          actionText: 'View Assignment',
          expiresAt: new Date('2024-01-20T14:30:00Z'),
        },
        {
          id: 'notif_2',
          type: 'grade_posted',
          title: 'Grade Posted',
          message: 'Your English essay received an A- (92%)',
          timestamp: new Date('2024-01-19T16:20:00Z'),
          priority: 'medium',
          status: 'unread',
          actionUrl: '/grades/english-essay',
          actionText: 'View Grade',
        },
        {
          id: 'notif_3',
          type: 'event_reminder',
          title: 'Upcoming Event',
          message: 'Science Fair preparation meeting tomorrow at 3 PM',
          timestamp: new Date('2024-01-19T14:00:00Z'),
          priority: 'medium',
          status: 'read',
          actionUrl: '/events/science-fair-meeting',
          actionText: 'View Event',
        },
        {
          id: 'notif_4',
          type: 'system_update',
          title: 'New Feature Available',
          message: 'Interactive chemistry simulations are now available',
          timestamp: new Date('2024-01-18T10:00:00Z'),
          priority: 'low',
          status: 'read',
          actionUrl: '/features/chemistry-simulations',
          actionText: 'Explore Feature',
        },
      ],
      settings: {
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '07:00',
        },
        categories: {
          academic: { enabled: true, priority: 'high' },
          social: { enabled: true, priority: 'medium' },
          system: { enabled: false, priority: 'low' },
        },
      },
    };
  }

  @Post('notifications/:notificationId/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark notification as read',
    description: 'Mark a specific notification as read',
  })
  @ApiParam({ name: 'notificationId', description: 'Notification identifier' })
  @ApiResponse({
    status: 200,
    description: 'Notification marked as read',
  })
  async markNotificationRead(
    @Request() req: any,
    @Param('notificationId') notificationId: string,
  ) {
    const userId = req.user.id;

    return {
      notificationId,
      readAt: new Date(),
      message: 'Notification marked as read',
    };
  }

  @Post('notifications/mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Mark all notifications as read',
    description: 'Mark all unread notifications as read',
  })
  @ApiResponse({
    status: 200,
    description: 'All notifications marked as read',
  })
  async markAllNotificationsRead(@Request() req: any) {
    const userId = req.user.id;

    return {
      markedCount: 8,
      markedAt: new Date(),
      message: 'All notifications marked as read',
    };
  }

  @Get('privacy')
  @ApiOperation({
    summary: 'Get privacy settings',
    description: 'Get user privacy and data sharing settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Privacy settings retrieved successfully',
  })
  async getPrivacySettings(@Request() req: any) {
    const userId = req.user.id;

    return {
      userId,
      privacySettings: {
        profileVisibility: {
          current: 'school',
          options: ['public', 'school', 'private'],
          description: 'Who can see your profile information',
        },
        gradeVisibility: {
          current: 'parents_teachers',
          options: ['parents_teachers', 'teachers_only', 'private'],
          description: 'Who can see your grades and academic performance',
        },
        activityVisibility: {
          current: 'school',
          options: ['public', 'school', 'private'],
          description: 'Who can see your activity and achievements',
        },
        contactVisibility: {
          current: 'private',
          options: ['public', 'school', 'private'],
          description: 'Who can see your contact information',
        },
        dataSharing: {
          analytics: true,
          research: false,
          thirdParty: false,
          marketing: false,
        },
        dataRetention: {
          deleteAfterGraduation: false,
          anonymizeData: true,
          exportData: true,
        },
      },
      dataRequests: [
        {
          id: 'request_1',
          type: 'data_export',
          status: 'completed',
          requestedAt: new Date('2024-01-10'),
          completedAt: new Date('2024-01-12'),
          downloadUrl: '/downloads/user-data-export.zip',
        },
        {
          id: 'request_2',
          type: 'data_deletion',
          status: 'pending',
          requestedAt: new Date('2024-01-15'),
          estimatedCompletion: '2024-01-22',
        },
      ],
      consentHistory: [
        {
          id: 'consent_1',
          type: 'terms_of_service',
          version: '2.1',
          consentedAt: new Date('2023-08-15'),
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome 118.0',
        },
        {
          id: 'consent_2',
          type: 'privacy_policy',
          version: '1.3',
          consentedAt: new Date('2023-08-15'),
          ipAddress: '192.168.1.100',
          userAgent: 'Chrome 118.0',
        },
      ],
    };
  }

  @Put('privacy')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update privacy settings',
    description: 'Update user privacy and data sharing settings',
  })
  @ApiResponse({
    status: 200,
    description: 'Privacy settings updated successfully',
  })
  async updatePrivacySettings(@Request() req: any, @Body() privacyData: any) {
    const userId = req.user.id;

    return {
      userId,
      updatedSettings: privacyData,
      updatedAt: new Date(),
      message: 'Privacy settings updated successfully',
    };
  }

  @Post('data-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request data action',
    description: 'Request data export, deletion, or other data actions',
  })
  @ApiResponse({
    status: 200,
    description: 'Data request submitted successfully',
  })
  async requestDataAction(@Request() req: any, @Body() requestData: any) {
    const userId = req.user.id;

    return {
      requestId: 'request_' + Date.now(),
      type: requestData.type,
      status: 'submitted',
      submittedAt: new Date(),
      estimatedCompletion: '5-7 business days',
      message: 'Your data request has been submitted. You will receive an email when it is processed.',
    };
  }

  @Get('security')
  @ApiOperation({
    summary: 'Get security settings',
    description: 'Get user security settings and account protection options',
  })
  @ApiResponse({
    status: 200,
    description: 'Security settings retrieved successfully',
  })
  async getSecuritySettings(@Request() req: any) {
    const userId = req.user.id;

    return {
      userId,
      securitySettings: {
        password: {
          lastChanged: new Date('2024-01-01'),
          strength: 'strong',
          requiresChange: false,
          changeFrequency: '90 days',
        },
        twoFactorAuth: {
          enabled: true,
          method: 'totp',
          configuredAt: new Date('2023-09-01'),
          lastUsed: new Date('2024-01-20'),
          backupCodesRemaining: 6,
        },
        loginAlerts: {
          newDevice: true,
          newLocation: true,
          suspiciousActivity: true,
          failedAttempts: true,
        },
        sessionManagement: {
          autoLogout: true,
          maxSessionDuration: '8 hours',
          concurrentSessions: 3,
          rememberDevice: true,
        },
        trustedDevices: [
          {
            id: 'device_1',
            name: 'Home Desktop',
            type: 'desktop',
            browser: 'Chrome',
            os: 'macOS',
            lastUsed: new Date('2024-01-20'),
            trusted: true,
          },
          {
            id: 'device_2',
            name: 'School Laptop',
            type: 'laptop',
            browser: 'Firefox',
            os: 'Windows',
            lastUsed: new Date('2024-01-19'),
            trusted: true,
          },
        ],
        securityQuestions: {
          configured: true,
          questionsCount: 3,
          lastUpdated: new Date('2023-09-01'),
        },
        accountRecovery: {
          emailRecovery: true,
          phoneRecovery: false,
          securityQuestions: true,
          backupCodes: true,
        },
      },
      securityScore: {
        overall: 95,
        factors: {
          passwordStrength: 100,
          twoFactorEnabled: 100,
          loginAlerts: 90,
          sessionSecurity: 85,
          trustedDevices: 100,
        },
        recommendations: [
          'Consider enabling phone number recovery for additional security',
          'Review and update trusted devices regularly',
        ],
      },
    };
  }

  @Post('deactivate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Deactivate account',
    description: 'Request account deactivation',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deactivation request submitted',
  })
  async deactivateAccount(@Request() req: any, @Body() deactivationData: any) {
    const userId = req.user.id;

    return {
      userId,
      deactivationRequested: true,
      requestedAt: new Date(),
      effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      status: 'pending_review',
      message: 'Account deactivation request submitted. Your account will be deactivated in 30 days.',
    };
  }

  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete account',
    description: 'Permanently delete user account (admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Account deletion initiated',
  })
  async deleteAccount(@Request() req: any, @Param('userId') userId: string) {
    // This would typically require admin privileges
    return {
      userId,
      deletedAt: new Date(),
      status: 'deletion_initiated',
      message: 'Account deletion process initiated',
    };
  }

  @Post('reset-first-time-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset first-time login password',
    description: 'Reset password for users logging in for the first time',
  })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
  })
  async resetFirstTimePassword(
    @Request() req: any,
    @Body() body: { newPassword: string }
  ) {
    const userId = req.user.id;
    const { newPassword } = body;

    const updatedUser = await this.usersService.resetFirstTimePassword(userId, newPassword);

    return {
      userId,
      message: 'Password reset successfully. Your account is now active.',
      status: updatedUser.status,
      isFirstLogin: updatedUser.isFirstLogin,
      updatedAt: updatedUser.updatedAt,
    };
  }
}