# Parent Portal Module

## Overview

The Parent Portal module provides parents with secure, real-time access to their children's academic progress, school activities, and communication channels. This module enables active parental involvement in their child's education through a comprehensive dashboard and API endpoints.

## Features

### ✅ Implemented (Phase 1)
- **Dashboard API** - Complete dashboard overview with alerts, activities, and quick stats
- **Authentication** - JWT-based authentication with role-based access control
- **Database Entities** - 8 core entities for comprehensive data management
- **Security Guards** - ParentPortalGuard and ChildAccessGuard for access control

### ✅ Implemented (Phase 2A - Academic Features)
- **Academic Controller** - 8 endpoints for grades, attendance, assignments, timetable
- **Academic Service** - Business logic for data aggregation and processing
- **Request/Response DTOs** - Comprehensive data transfer objects
- **Integration Points** - Ready for Academic and Student module integration
- **Security & Validation** - Access control and data validation

### ✅ Implemented (Phase 2B - Communication System)
- **Communication Controller** - Complete messaging, appointments, and notification management
- **Communication Service** - Business logic for all communication features
- **Message Management** - Send, receive, and manage messages with teachers/staff
- **Appointment Scheduling** - Request, update, and manage parent-teacher meetings
- **Notification System** - Real-time alerts for academic events, assignments, and updates
- **Emergency Communication** - Emergency messaging and contact management
- **Comprehensive DTOs** - Full data transfer objects for all communication features

### 🚧 Planned (Phase 2-4)
- Fee management and payment processing
- Transportation and safety monitoring
- Resource access and educational materials

## API Endpoints

### Dashboard Endpoints

All dashboard endpoints require authentication and return data specific to the authenticated parent.

#### `GET /parent-portal/dashboard`
Returns a comprehensive dashboard overview including:
- Children information
- Active alerts and notifications
- Recent activities
- Quick statistics
- Upcoming events

#### `GET /parent-portal/dashboard/children`
Returns basic information about all children associated with the parent.

#### `GET /parent-portal/dashboard/alerts`
Returns all active alerts and notifications (unread messages, upcoming appointments, pending payments).

#### `GET /parent-portal/dashboard/recent-activity`
Returns recent activity summary with optional limit parameter.
- Query parameter: `?limit=20` (default: 20, max: 50)

#### `GET /parent-portal/dashboard/quick-stats`
Returns quick statistics and key metrics for dashboard display.

#### `GET /parent-portal/dashboard/upcoming-events`
Returns upcoming events and appointments within specified days.
- Query parameter: `?days=30` (default: 30, max: 90)

### Academic Endpoints

All academic endpoints require authentication and validate parent-child relationships.

#### `GET /parent-portal/academic/:parentId/grades`
Returns comprehensive grade information for all children associated with the parent.
- Query parameters: `startDate`, `endDate`, `academicYear`, `includeAssessments`

#### `GET /parent-portal/academic/:parentId/grades/:studentId`
Returns grade information for a specific student.
- Same query parameters as above

#### `GET /parent-portal/academic/:parentId/attendance/:studentId`
Returns attendance records for a specific student.
- Query parameters: `startDate`, `endDate`, `includePatterns`, `includePercentage`

#### `GET /parent-portal/academic/:parentId/assignments/:studentId`
Returns assignment information for a specific student.
- Query parameters: `status`, `startDate`, `endDate`, `includeSubmissions`

#### `GET /parent-portal/academic/:parentId/timetable/:studentId`
Returns class timetable for a specific student.
- Query parameters: `weekStart`, `includeDetails`

#### `GET /parent-portal/academic/:parentId/progress/:studentId`
Returns comprehensive academic progress report for a specific student.
- Query parameters: `academicYear`, `term`

#### `GET /parent-portal/academic/:parentId/reports/:studentId`
Returns academic reports and certificates for a specific student.
- Query parameters: `reportType`, `academicYear`

### Communication Endpoints

All communication endpoints require authentication and validate parent-child relationships.

#### Message Management
```
GET    /parent-portal/communication/:parentId/messages
GET    /parent-portal/communication/:parentId/messages/:messageId
POST   /parent-portal/communication/:parentId/messages
PUT    /parent-portal/communication/:parentId/messages/:messageId/read
GET    /parent-portal/communication/:parentId/messages/conversations
```

#### Appointment Management
```
GET    /parent-portal/communication/:parentId/appointments
GET    /parent-portal/communication/:parentId/appointments/:appointmentId
POST   /parent-portal/communication/:parentId/appointments
PUT    /parent-portal/communication/:parentId/appointments/:appointmentId
DELETE /parent-portal/communication/:parentId/appointments/:appointmentId
GET    /parent-portal/communication/:parentId/staff-availability/:staffId
```

#### Notification Management
```
GET    /parent-portal/communication/:parentId/notifications
PUT    /parent-portal/communication/:parentId/notifications/:notificationId/read
PUT    /parent-portal/communication/:parentId/notifications/preferences
```

#### Emergency Communication
```
POST   /parent-portal/communication/:parentId/emergency
GET    /parent-portal/communication/:parentId/emergency/contacts
```

## Authentication

The Parent Portal uses JWT-based authentication with the following flow:

1. **Login**: Parent authenticates through the main auth system
2. **Token Generation**: Receives JWT token with parent access information
3. **API Access**: Uses Bearer token in Authorization header
4. **Access Control**: Guards validate parent permissions and child access

### Required Headers
```
Authorization: Bearer <jwt_token>
```

### Token Payload Structure
```json
{
  "parentId": "uuid",
  "schoolId": "uuid",
  "accessLevel": "view_only|limited|full",
  "studentLinks": [...],
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Security Features

### Access Levels
- **Emergency**: Emergency contact access only
- **View Only**: Basic information access
- **Limited**: Standard parental access
- **Full**: Complete access to all features

### Data Protection
- End-to-end encryption for sensitive data
- GDPR-compliant data handling
- Comprehensive audit logging
- Role-based access control

## Database Schema

### Core Entities
1. **ParentPortalAccess** - Main access control and permissions
2. **ParentStudentLink** - Parent-child relationships
3. **PortalActivityLog** - Activity tracking and analytics
4. **CommunicationRecord** - Messaging and notifications
5. **Appointment** - Meeting scheduling and management
6. **PaymentRecord** - Fee payments and transactions
7. **EmergencyContact** - Emergency contact management
8. **ResourceAccessLog** - Resource usage tracking

## Integration Points

### Internal Modules
- **Student Management** - Access to student data
- **Academic Module** - Grades, attendance, assignments
- **Communication Module** - Messaging and notifications
- **Fee Management** - Payment processing

### External Systems
- **Payment Gateways** - Fee payment processing
- **SMS/Email Services** - Notification delivery
- **Calendar Systems** - Event synchronization

## Usage Examples

### Get Dashboard Overview
```typescript
const response = await fetch('/parent-portal/dashboard', {
  headers: {
    'Authorization': 'Bearer <jwt_token>',
    'Content-Type': 'application/json'
  }
});

const dashboard = await response.json();
console.log(dashboard.children, dashboard.alerts, dashboard.recentActivities);
```

### Get Recent Activity with Limit
```typescript
const response = await fetch('/parent-portal/dashboard/recent-activity?limit=10', {
  headers: {
    'Authorization': 'Bearer <jwt_token>'
  }
});

const activities = await response.json();
```

## Error Handling

### Common HTTP Status Codes
- **200**: Success
- **401**: Unauthorized - Invalid or missing token
- **403**: Forbidden - Insufficient permissions
- **404**: Not Found - Resource doesn't exist
- **500**: Internal Server Error

### Error Response Format
```json
{
  "statusCode": 401,
  "message": "Unauthorized - Invalid authentication token",
  "error": "Unauthorized"
}
```

## Development Notes

### File Structure
```
parent-portal/
├── controllers/          # API endpoint controllers
├── services/            # Business logic services
├── entities/            # Database entities
├── guards/              # Authentication guards
├── interceptors/        # Request/response interceptors
├── dtos/               # Data transfer objects
└── README.md           # This documentation
```

### Testing
Run the e2e tests:
```bash
npm run test:e2e parent-portal
```

### Future Enhancements
- Real-time notifications via WebSocket
- Mobile app integration
- Advanced analytics and insights
- AI-powered parental recommendations
- Multi-language support

## Support

For technical support or questions about the Parent Portal module:
- Check the API documentation for detailed endpoint specifications
- Review the entity relationships for data structure understanding
- Refer to the authentication guide for access token management