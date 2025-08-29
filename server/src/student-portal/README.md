# Student Portal Module

## Overview

The Student Portal module provides students with a personalized, secure digital environment for academic engagement, self-service capabilities, and access to educational resources. This module enables independent learning and student empowerment through a comprehensive dashboard and API endpoints.

## Current Implementation Status

### ✅ Completed Features (Phase 1A - Core Infrastructure)
- **Module Structure**: Complete NestJS module setup with proper organization
- **Database Entities**: Core entities for student portal access and comprehensive student profiles
- **Dashboard Service**: Complete dashboard service with 320+ lines of implementation
- **Dashboard Controller**: REST API endpoints with Swagger documentation
- **Academic Service**: Comprehensive academic data access service (520+ lines)
- **Academic Controller**: Complete REST API for academic functionality (320+ lines)

### ✅ Completed Features (Phase 1B - Academic Integration)
- **Grade Management**: Complete grade book access with filtering and summaries
- **Attendance Tracking**: Attendance records with patterns and statistics
- **Assignment Management**: Assignment access, submission, and tracking
- **Timetable Access**: Class schedule and daily timetable functionality
- **Academic Progress**: Progress tracking with goals and recommendations
- **Academic Reports**: Report generation and access capabilities

### 🚧 In Development
- **Academic Controller**: Access to grades, attendance, assignments, timetable
- **Communication Controller**: Messaging and collaboration features
- **Learning Controller**: Digital learning platform integration
- **Activities Controller**: Extracurricular activity management
- **Health Controller**: Wellness and health tracking
- **Career Controller**: Career planning and future guidance

### 📋 Planned Features
- **Real-time Notifications**: Push notifications and alerts
- **Mobile Optimization**: Responsive design for mobile devices
- **Offline Access**: Content access without internet connection
- **AI-Powered Recommendations**: Personalized learning suggestions
- **Social Features**: Study groups and peer collaboration

## API Endpoints

### Dashboard Endpoints

All dashboard endpoints require authentication and validate student access levels.

#### `GET /student-portal/dashboard`
Returns a comprehensive dashboard overview including:
- Student profile information
- Access level and permissions
- Overview with schedule, tasks, and achievements
- Quick statistics across all areas
- Recent activity feed
- Upcoming events and deadlines
- Active alerts and notifications

#### `GET /student-portal/dashboard/overview`
Returns the main dashboard overview with:
- Welcome message and current focus
- Today's class schedule
- Pending tasks and assignments
- Recent achievements and badges
- Motivational quotes

#### `GET /student-portal/dashboard/quick-stats`
Returns key performance indicators including:
- Academic metrics (GPA, credits, courses)
- Attendance statistics and patterns
- Assignment completion rates
- Extracurricular activities
- Digital learning progress
- Wellness indicators

#### `GET /student-portal/dashboard/recent-activity`
Returns recent activities and achievements:
- Assignment submissions and grades
- Attendance records and streaks
- Digital course completions
- Study group participation
- Achievement badges earned

Query parameters:
- `limit`: Number of activities to return (default: 20, max: 50)

#### `GET /student-portal/dashboard/upcoming-events`
Returns upcoming events and deadlines:
- Class schedules and appointments
- Assignment due dates
- School events and activities
- Sports practices and competitions

Query parameters:
- `days`: Number of days to look ahead (default: 30, max: 90)

#### `GET /student-portal/dashboard/alerts`
Returns active alerts and notifications:
- Assignment due soon reminders
- New badge availability
- Study group invitations
- Wellness check-ins
- Important announcements

#### `GET /student-portal/dashboard/children`
Returns overview for parental access (when parents view student data).

### Academic Endpoints

All academic endpoints require authentication and validate student access levels.

#### Grade Management
```
GET    /student-portal/academic/:studentId/grades
GET    /student-portal/academic/:studentId/grades/summary
```

#### Attendance Management
```
GET    /student-portal/academic/:studentId/attendance
GET    /student-portal/academic/:studentId/attendance/summary
```

#### Assignment Management
```
GET    /student-portal/academic/:studentId/assignments
POST   /student-portal/academic/:studentId/assignments/:assignmentId/submit
```

#### Timetable Management
```
GET    /student-portal/academic/:studentId/timetable
GET    /student-portal/academic/:studentId/timetable/today
```

#### Academic Progress
```
GET    /student-portal/academic/:studentId/progress
```

#### Academic Reports
```
GET    /student-portal/academic/:studentId/reports
```

## Database Schema

### Core Entities

1. **StudentPortalAccess** - Main access control and permissions
   - Student identification and school association
   - Access level management (basic, standard, advanced, full)
   - Content rating and parental controls
   - Screen time limits and device restrictions
   - Feature permissions and privacy settings
   - Behavioral scoring and trust levels

2. **StudentProfile** - Comprehensive student profile information
   - Academic standing and grade level
   - Learning style and personality assessment
   - Strengths, challenges, and interests
   - Career aspirations and learning goals
   - Study preferences and environment
   - Digital skills and social competencies
   - Health and wellness indicators
   - Extracurricular interests and achievements

## Security Features

### Access Control
- **Student Authentication**: Secure login with multi-factor options
- **Age-Appropriate Content**: Content filtering based on grade level and maturity
- **Parental Controls**: Guardian approval for sensitive features
- **Device Management**: Authorized device restrictions and monitoring
- **Session Management**: Automatic timeouts and concurrent session limits

### Data Protection
- **Privacy Settings**: Granular control over data sharing
- **COPPA Compliance**: Children's privacy protection measures
- **FERPA Compliance**: Educational record privacy standards
- **Audit Logging**: Comprehensive activity tracking
- **Data Encryption**: Secure data storage and transmission

### Behavioral Monitoring
- **Trust Scoring**: Dynamic access level adjustment based on behavior
- **Usage Analytics**: Safe usage pattern monitoring
- **Content Filtering**: Age and maturity-appropriate content delivery
- **Emergency Protocols**: Safety and emergency response features

## Authentication

The Student Portal uses JWT-based authentication with the following flow:

1. **Login**: Student authenticates through the main auth system
2. **Token Generation**: Receives JWT token with student access information
3. **API Access**: Uses Bearer token in Authorization header
4. **Access Control**: Guards validate student permissions and parental controls

### Required Headers
```
Authorization: Bearer <jwt_token>
```

### Token Payload Structure
```json
{
  "studentId": "uuid",
  "schoolId": "uuid",
  "accessLevel": "basic|standard|advanced|full",
  "parentalControls": true,
  "contentRating": "G|PG|PG13|R",
  "deviceId": "uuid",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Usage Examples

### Get Complete Dashboard
```typescript
const response = await fetch('/student-portal/dashboard', {
  headers: {
    'Authorization': 'Bearer <jwt_token>',
    'Content-Type': 'application/json'
  }
});

const dashboard = await response.json();
console.log(dashboard.overview, dashboard.quickStats, dashboard.recentActivity);
```

### Get Recent Activity with Limit
```typescript
const response = await fetch('/student-portal/dashboard/recent-activity?limit=10', {
  headers: {
    'Authorization': 'Bearer <jwt_token>'
  }
});

const activities = await response.json();
```

### Get Upcoming Events for Next Week
```typescript
const response = await fetch('/student-portal/dashboard/upcoming-events?days=7', {
  headers: {
    'Authorization': 'Bearer <jwt_token>'
  }
});

const events = await response.json();
```

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **401**: Unauthorized - Invalid or missing token
- **403**: Forbidden - Insufficient access level or parental controls
- **404**: Not Found - Resource doesn't exist
- **429**: Too Many Requests - Rate limiting exceeded
- **500**: Internal Server Error

### Error Response Format
```json
{
  "statusCode": 403,
  "message": "Access denied - Parental approval required for this feature",
  "error": "Forbidden"
}
```

## Features Overview

### Dashboard Features
- **Personalized Welcome**: Custom greeting based on time and recent activity
- **Current Focus**: Highlighted current subject or priority task
- **Daily Schedule**: Today's class timetable with room information
- **Task Management**: Pending assignments with due dates and priority
- **Achievement System**: Recent badges and certificates earned
- **Motivational Content**: Daily inspirational quotes and messages

### Statistics Tracking
- **Academic Performance**: GPA trends, course completion, credit accumulation
- **Attendance Patterns**: Overall percentage, monthly stats, perfect attendance streaks
- **Assignment Analytics**: Completion rates, average grades, submission patterns
- **Activity Participation**: Sports teams, clubs, volunteer hours, leadership roles
- **Digital Learning**: Online course progress, certificates earned, study time
- **Wellness Metrics**: Sleep patterns, exercise frequency, stress levels, mood tracking

### Activity Monitoring
- **Assignment Tracking**: Submission status, grades received, feedback
- **Attendance Records**: Daily check-ins, tardiness, excused absences
- **Digital Course Progress**: Completion percentages, quiz scores, certificates
- **Study Group Activity**: Participation in collaborative learning
- **Achievement Milestones**: Badge earning, level progression, skill development

### Event Management
- **Academic Calendar**: Class schedules, exam dates, holidays
- **Assignment Deadlines**: Due dates with priority indicators
- **School Events**: Sports meets, cultural programs, parent-teacher conferences
- **Extracurricular Activities**: Club meetings, practice sessions, competitions
- **Personal Appointments**: Counseling sessions, medical appointments

### Notification System
- **Academic Alerts**: Assignment due dates, grade postings, missing work
- **Achievement Notifications**: New badges available, progress milestones
- **Social Invitations**: Study group requests, club membership offers
- **Wellness Reminders**: Health check-ins, exercise prompts, sleep tracking
- **System Announcements**: School news, schedule changes, emergency alerts

## Future Enhancements

### Planned Features
- **Real-time Collaboration**: Study groups with video chat and shared documents
- **AI-Powered Learning**: Personalized study recommendations and adaptive content
- **Gamification**: Achievement systems, leaderboards, and progress tracking
- **Mobile Applications**: Native iOS and Android apps with offline capabilities
- **Voice Assistants**: Voice-activated commands for hands-free operation
- **Virtual Reality**: Immersive learning experiences and virtual field trips
- **Blockchain Credentials**: Digital badges and certificates with verification
- **Predictive Analytics**: Early warning systems for academic or behavioral issues

### Advanced Capabilities
- **Emotion Recognition**: Mood tracking and mental health monitoring
- **Automated Scheduling**: AI-powered study plan generation
- **Smart Content Filtering**: Dynamic content adaptation based on performance
- **Parental Dashboard**: Real-time monitoring and intervention capabilities
- **Integration APIs**: Third-party app integrations (Zoom, Google Classroom, etc.)
- **Advanced Analytics**: Detailed learning pattern analysis and insights

## Technical Architecture

### Module Structure
```
student-portal/
├── controllers/          # API endpoint controllers
│   ├── dashboard.controller.ts
│   ├── academic.controller.ts
│   ├── communication.controller.ts
│   ├── learning.controller.ts
│   ├── activities.controller.ts
│   ├── health.controller.ts
│   └── career.controller.ts
├── services/            # Business logic services
│   ├── dashboard.service.ts
│   ├── academic.service.ts
│   ├── communication.service.ts
│   ├── learning.service.ts
│   ├── activities.service.ts
│   ├── health.service.ts
│   └── career.service.ts
├── entities/            # Database entities
│   ├── student-portal-access.entity.ts
│   ├── student-profile.entity.ts
│   └── [additional entities]
├── guards/              # Authentication guards
│   ├── student-portal.guard.ts
│   └── age-appropriate.guard.ts
├── interceptors/        # Request/response interceptors
├── dtos/               # Data transfer objects
└── README.md           # This documentation
```

### Dependencies
- **NestJS**: Core framework for API development
- **TypeORM**: Database ORM with PostgreSQL support
- **JWT**: Authentication and authorization
- **Swagger**: API documentation
- **Class Validator**: Request validation
- **Redis**: Caching and session management

## Support

For technical support or questions about the Student Portal module:
- Check the API documentation for detailed endpoint specifications
- Review the entity relationships for data structure understanding
- Refer to the authentication guide for access token management
- Contact the development team for feature requests or bug reports

---

**Note**: This module is designed to provide a safe, educational, and engaging digital environment for students while maintaining appropriate security measures and parental oversight capabilities.