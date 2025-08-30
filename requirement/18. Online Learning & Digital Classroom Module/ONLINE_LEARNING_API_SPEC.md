# Online Learning & Digital Classroom Module - API Specifications

## Overview

This document defines the REST API and WebSocket specifications for the Online Learning & Digital Classroom Module, providing comprehensive endpoints for virtual classrooms, content management, assessments, and analytics.

## 1. Authentication

All API endpoints require JWT authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## 2. Virtual Classroom APIs

### 2.1 Classroom Management

#### Create Virtual Classroom
```http
POST /api/online-learning/classrooms
Content-Type: application/json
Authorization: Bearer <token>

{
  "schoolId": "uuid",
  "courseId": "uuid",
  "classroomName": "Advanced Mathematics - Session 1",
  "description": "Weekly virtual classroom session",
  "instructorId": "uuid",
  "maxParticipants": 50,
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:30:00Z",
  "recordingEnabled": true,
  "interactiveTools": {
    "whiteboard": true,
    "polling": true,
    "breakoutRooms": true,
    "screenSharing": true
  },
  "settings": {
    "allowGuests": false,
    "muteOnEntry": true,
    "waitingRoom": true
  }
}
```

**Response:**
```json
{
  "classroomId": "uuid",
  "meetingUrl": "https://meet.academia-pro.com/room/uuid",
  "status": "scheduled",
  "createdAt": "2024-01-10T09:00:00Z"
}
```

#### Get Classroom Details
```http
GET /api/online-learning/classrooms/{classroomId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "classroomId": "uuid",
  "schoolId": "uuid",
  "courseId": "uuid",
  "classroomName": "Advanced Mathematics - Session 1",
  "description": "Weekly virtual classroom session",
  "instructorId": "uuid",
  "instructor": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@school.com"
  },
  "maxParticipants": 50,
  "currentParticipants": 0,
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:30:00Z",
  "status": "scheduled",
  "recordingEnabled": true,
  "recordingUrl": null,
  "interactiveTools": {
    "whiteboard": true,
    "polling": true,
    "breakoutRooms": true,
    "screenSharing": true
  },
  "participants": [],
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-10T09:00:00Z"
}
```

#### Join Classroom Session
```http
POST /api/online-learning/classrooms/{classroomId}/join
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "uuid",
  "userType": "student",
  "deviceInfo": {
    "type": "desktop",
    "browser": "Chrome",
    "os": "Windows"
  }
}
```

**Response:**
```json
{
  "sessionToken": "jwt_session_token",
  "webrtcConfig": {
    "iceServers": [...],
    "turnServers": [...]
  },
  "permissions": {
    "canShareScreen": true,
    "canUseWhiteboard": true,
    "canModerate": false
  }
}
```

#### Update Classroom
```http
PUT /api/online-learning/classrooms/{classroomId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "classroomName": "Updated Classroom Name",
  "description": "Updated description",
  "maxParticipants": 75,
  "startTime": "2024-01-15T11:00:00Z",
  "endTime": "2024-01-15T12:30:00Z"
}
```

#### Delete Classroom
```http
DELETE /api/online-learning/classrooms/{classroomId}
Authorization: Bearer <token>
```

### 2.2 Classroom Sessions

#### Get Session Participants
```http
GET /api/online-learning/classrooms/{classroomId}/participants
Authorization: Bearer <token>
```

**Response:**
```json
{
  "participants": [
    {
      "userId": "uuid",
      "userType": "student",
      "firstName": "Alice",
      "lastName": "Smith",
      "joinTime": "2024-01-15T10:05:00Z",
      "leaveTime": null,
      "isMuted": false,
      "isVideoOn": true,
      "handRaised": false,
      "engagementScore": 85.5
    }
  ],
  "totalCount": 25,
  "activeCount": 23
}
```

#### End Classroom Session
```http
POST /api/online-learning/classrooms/{classroomId}/end
Authorization: Bearer <token>
```

## 3. Digital Content Management APIs

### 3.1 Content Upload and Management

#### Upload Content
```http
POST /api/online-learning/content/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

FormData:
- file: <content_file>
- metadata: {
  "title": "Introduction to Algebra",
  "description": "Basic algebra concepts",
  "contentType": "video",
  "courseId": "uuid",
  "moduleId": "uuid",
  "tags": ["algebra", "mathematics", "beginner"],
  "accessLevel": "enrolled",
  "isDownloadable": true
}
```

**Response:**
```json
{
  "contentId": "uuid",
  "uploadId": "upload_uuid",
  "status": "processing",
  "estimatedCompletionTime": "2024-01-10T09:05:00Z"
}
```

#### Get Content Details
```http
GET /api/online-learning/content/{contentId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "contentId": "uuid",
  "title": "Introduction to Algebra",
  "description": "Basic algebra concepts",
  "contentType": "video",
  "filePath": "/content/videos/algebra-intro.mp4",
  "thumbnailPath": "/content/thumbnails/algebra-intro.jpg",
  "durationMinutes": 45,
  "fileSizeBytes": 157286400,
  "metadata": {
    "resolution": "1080p",
    "bitrate": "2000kbps",
    "format": "mp4"
  },
  "tags": ["algebra", "mathematics", "beginner"],
  "accessLevel": "enrolled",
  "viewCount": 1250,
  "averageRating": 4.2,
  "createdBy": "uuid",
  "createdAt": "2024-01-10T09:00:00Z",
  "updatedAt": "2024-01-10T09:00:00Z"
}
```

#### Update Content Metadata
```http
PUT /api/online-learning/content/{contentId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Updated Title",
  "description": "Updated description",
  "tags": ["algebra", "mathematics", "beginner", "updated"],
  "accessLevel": "public"
}
```

#### Stream Content
```http
GET /api/online-learning/content/{contentId}/stream
Authorization: Bearer <token>
Range: bytes=0-1023
```

**Response:** Video stream with appropriate content-type and range headers

#### Get Content Analytics
```http
GET /api/online-learning/content/{contentId}/analytics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "contentId": "uuid",
  "totalViews": 1250,
  "uniqueViewers": 890,
  "averageWatchTime": 32.5,
  "completionRate": 78.5,
  "dropOffPoints": [
    { "timestamp": 300, "dropOffRate": 15.2 },
    { "timestamp": 600, "dropOffRate": 8.7 }
  ],
  "engagementMetrics": {
    "likes": 45,
    "shares": 12,
    "comments": 23
  }
}
```

### 3.2 Content Organization

#### Create Content Module
```http
POST /api/online-learning/modules
Content-Type: application/json
Authorization: Bearer <token>

{
  "courseId": "uuid",
  "moduleTitle": "Algebra Fundamentals",
  "moduleDescription": "Basic algebraic operations and concepts",
  "sequenceOrder": 1,
  "estimatedDurationMinutes": 180,
  "prerequisites": ["Basic Mathematics"],
  "completionCriteria": {
    "requiredContentViews": 5,
    "requiredAssessments": 2,
    "minimumScore": 70.0
  },
  "isMandatory": true
}
```

#### Add Content to Module
```http
POST /api/online-learning/modules/{moduleId}/content
Content-Type: application/json
Authorization: Bearer <token>

{
  "contentId": "uuid",
  "contentOrder": 1,
  "isRequired": true,
  "timeLimitMinutes": 60
}
```

## 4. Assessment APIs

### 4.1 Assessment Management

#### Create Assessment
```http
POST /api/online-learning/assessments
Content-Type: application/json
Authorization: Bearer <token>

{
  "moduleId": "uuid",
  "assessmentTitle": "Algebra Quiz 1",
  "assessmentType": "quiz",
  "instructions": "Complete all questions. You have 30 minutes.",
  "timeLimitMinutes": 30,
  "passingScore": 70.0,
  "maxAttempts": 2,
  "isGraded": true,
  "plagiarismCheckEnabled": true,
  "questions": [
    {
      "questionType": "multiple_choice",
      "questionText": "What is 2 + 2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": 1,
      "points": 10,
      "explanation": "Basic addition: 2 + 2 = 4"
    }
  ],
  "rubric": {
    "criteria": [
      {
        "name": "Accuracy",
        "weight": 60,
        "levels": [
          { "score": 5, "description": "All answers correct" },
          { "score": 3, "description": "Most answers correct" },
          { "score": 1, "description": "Few answers correct" }
        ]
      }
    ]
  }
}
```

#### Get Assessment Details
```http
GET /api/online-learning/assessments/{assessmentId}
Authorization: Bearer <token>
```

#### Submit Assessment
```http
POST /api/online-learning/assessments/{assessmentId}/submit
Content-Type: application/json
Authorization: Bearer <token>

{
  "studentId": "uuid",
  "answers": [
    {
      "questionId": "uuid",
      "answer": 1,
      "timeSpentSeconds": 45
    }
  ],
  "attemptNumber": 1,
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T10:25:00Z"
}
```

**Response:**
```json
{
  "submissionId": "uuid",
  "status": "submitted",
  "submittedAt": "2024-01-15T10:25:00Z",
  "autoGraded": true,
  "score": 85.0,
  "feedback": "Good work! You got 8 out of 10 questions correct."
}
```

#### Get Assessment Results
```http
GET /api/online-learning/assessments/{assessmentId}/results?studentId={studentId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "assessmentId": "uuid",
  "studentId": "uuid",
  "submissions": [
    {
      "submissionId": "uuid",
      "attemptNumber": 1,
      "submittedAt": "2024-01-15T10:25:00Z",
      "score": 85.0,
      "status": "graded",
      "feedback": "Good work! You got 8 out of 10 questions correct.",
      "gradedAt": "2024-01-15T10:30:00Z",
      "answers": [
        {
          "questionId": "uuid",
          "answer": 1,
          "correct": true,
          "points": 10
        }
      ]
    }
  ],
  "bestScore": 85.0,
  "averageScore": 82.5,
  "attemptsRemaining": 1
}
```

### 4.2 Assessment Analytics

#### Get Assessment Statistics
```http
GET /api/online-learning/assessments/{assessmentId}/statistics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "assessmentId": "uuid",
  "totalSubmissions": 45,
  "averageScore": 78.5,
  "medianScore": 80.0,
  "scoreDistribution": {
    "90-100": 12,
    "80-89": 18,
    "70-79": 10,
    "60-69": 4,
    "0-59": 1
  },
  "completionRate": 95.2,
  "averageCompletionTime": 22.5,
  "questionAnalysis": [
    {
      "questionId": "uuid",
      "correctRate": 87.5,
      "averageTimeSpent": 45,
      "difficulty": "easy"
    }
  ]
}
```

## 5. Learning Analytics APIs

### 5.1 Student Analytics

#### Get Student Learning Progress
```http
GET /api/online-learning/analytics/students/{studentId}/progress?courseId={courseId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "studentId": "uuid",
  "courseId": "uuid",
  "overallProgress": 65.5,
  "modulesProgress": [
    {
      "moduleId": "uuid",
      "moduleTitle": "Algebra Fundamentals",
      "progress": 100.0,
      "completedAt": "2024-01-10T15:30:00Z",
      "score": 88.5
    },
    {
      "moduleId": "uuid",
      "moduleTitle": "Advanced Algebra",
      "progress": 45.0,
      "estimatedCompletionDate": "2024-01-25T00:00:00Z",
      "currentScore": 82.0
    }
  ],
  "learningPath": {
    "currentModule": "uuid",
    "recommendedNextModules": ["uuid1", "uuid2"],
    "learningPace": "normal",
    "predictedCompletionDate": "2024-02-15T00:00:00Z"
  },
  "engagementMetrics": {
    "totalStudyTime": 4500, // minutes
    "averageSessionLength": 75,
    "sessionsPerWeek": 5,
    "consistencyScore": 85.0
  }
}
```

#### Get Student Engagement Data
```http
GET /api/online-learning/analytics/students/{studentId}/engagement?startDate={startDate}&endDate={endDate}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "studentId": "uuid",
  "period": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  },
  "dailyEngagement": [
    {
      "date": "2024-01-15",
      "studyTimeMinutes": 120,
      "contentViews": 8,
      "assessmentAttempts": 2,
      "forumPosts": 3,
      "classroomAttendance": 1,
      "engagementScore": 88.5
    }
  ],
  "weeklyTrends": {
    "studyTimeTrend": "increasing",
    "engagementTrend": "stable",
    "performanceTrend": "improving"
  },
  "recommendations": [
    "Consider increasing study time on weekends",
    "Focus more on practical exercises",
    "Join more discussion forums for better engagement"
  ]
}
```

### 5.2 Course Analytics

#### Get Course Performance Analytics
```http
GET /api/online-learning/analytics/courses/{courseId}/performance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "courseId": "uuid",
  "enrolledStudents": 150,
  "activeStudents": 142,
  "completionRate": 68.5,
  "averageProgress": 72.3,
  "averageScore": 78.5,
  "performanceDistribution": {
    "excellent": 25,
    "good": 45,
    "average": 35,
    "needs_improvement": 20,
    "at_risk": 15
  },
  "modulePerformance": [
    {
      "moduleId": "uuid",
      "moduleTitle": "Algebra Fundamentals",
      "completionRate": 85.0,
      "averageScore": 82.5,
      "averageTimeSpent": 180,
      "difficultyRating": 2.5
    }
  ],
  "engagementMetrics": {
    "averageStudyTimePerStudent": 420,
    "forumActivity": 156,
    "assessmentCompletionRate": 89.5
  }
}
```

### 5.3 Predictive Analytics

#### Get At-Risk Students
```http
GET /api/online-learning/analytics/predictive/at-risk?courseId={courseId}&threshold={threshold}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "courseId": "uuid",
  "atRiskStudents": [
    {
      "studentId": "uuid",
      "studentName": "Alice Smith",
      "riskLevel": "high",
      "riskScore": 85.5,
      "riskFactors": [
        "Low engagement (15% below average)",
        "Missed 3 consecutive classes",
        "Assessment scores declining",
        "Study time reduced by 40%"
      ],
      "predictedOutcome": {
        "completionProbability": 45.2,
        "predictedFinalScore": 62.0
      },
      "recommendedActions": [
        "Schedule one-on-one meeting",
        "Provide additional study materials",
        "Monitor attendance closely",
        "Consider learning support interventions"
      ]
    }
  ],
  "summary": {
    "totalAtRisk": 12,
    "highRisk": 5,
    "mediumRisk": 7,
    "interventionSuccessRate": 78.5
  }
}
```

## 6. Collaboration APIs

### 6.1 Discussion Forums

#### Create Discussion Forum
```http
POST /api/online-learning/forums
Content-Type: application/json
Authorization: Bearer <token>

{
  "courseId": "uuid",
  "forumTitle": "General Discussion",
  "forumDescription": "General course discussion forum",
  "isModerated": false,
  "allowAnonymousPosts": false
}
```

#### Create Forum Post
```http
POST /api/online-learning/forums/{forumId}/posts
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Question about Assignment 1",
  "content": "I'm having trouble understanding the requirements for assignment 1. Can someone help?",
  "isPinned": false,
  "tags": ["assignment", "help"]
}
```

#### Get Forum Posts
```http
GET /api/online-learning/forums/{forumId}/posts?page={page}&limit={limit}&sortBy={sortBy}
Authorization: Bearer <token>
```

### 6.2 Collaborative Projects

#### Create Group Project
```http
POST /api/online-learning/projects
Content-Type: application/json
Authorization: Bearer <token>

{
  "courseId": "uuid",
  "projectTitle": "Environmental Science Research Project",
  "description": "Group research project on local environmental issues",
  "maxGroupSize": 4,
  "dueDate": "2024-02-15T23:59:59Z",
  "deliverables": [
    "Research proposal",
    "Data collection report",
    "Final presentation",
    "Peer evaluation"
  ],
  "rubric": {
    "research_quality": 30,
    "presentation": 25,
    "collaboration": 20,
    "innovation": 15,
    "timeliness": 10
  }
}
```

## 7. WebSocket Events

### 7.1 Real-time Communication Events

#### Classroom Events
```javascript
// Join classroom
socket.emit('classroom:join', {
  classroomId: 'uuid',
  userId: 'uuid',
  userType: 'student'
});

// Receive join confirmation
socket.on('classroom:joined', (data) => {
  console.log('Joined classroom:', data);
});

// Send chat message
socket.emit('classroom:chat', {
  classroomId: 'uuid',
  message: 'Hello everyone!',
  messageType: 'text'
});

// Receive chat message
socket.on('classroom:chat', (data) => {
  console.log('New message:', data);
});

// Raise hand
socket.emit('classroom:raise-hand', {
  classroomId: 'uuid'
});

// Receive hand raised
socket.on('classroom:hand-raised', (data) => {
  console.log('Hand raised by:', data.userId);
});
```

#### Whiteboard Events
```javascript
// Start drawing
socket.emit('whiteboard:draw', {
  classroomId: 'uuid',
  action: 'draw',
  points: [
    { x: 100, y: 100 },
    { x: 150, y: 150 }
  ],
  color: '#000000',
  brushSize: 2
});

// Receive drawing updates
socket.on('whiteboard:update', (data) => {
  // Update local whiteboard
  updateWhiteboard(data);
});

// Clear whiteboard
socket.emit('whiteboard:clear', {
  classroomId: 'uuid'
});
```

#### Polling Events
```javascript
// Create poll
socket.emit('poll:create', {
  classroomId: 'uuid',
  question: 'What is 2 + 2?',
  options: ['3', '4', '5', '6'],
  allowMultiple: false,
  timeLimit: 60
});

// Submit vote
socket.emit('poll:vote', {
  pollId: 'uuid',
  optionIndex: 1
});

// Receive poll results
socket.on('poll:results', (data) => {
  console.log('Poll results:', data);
});
```

### 7.2 Assessment Events
```javascript
// Start assessment
socket.emit('assessment:start', {
  assessmentId: 'uuid',
  studentId: 'uuid'
});

// Submit answer
socket.emit('assessment:answer', {
  assessmentId: 'uuid',
  questionId: 'uuid',
  answer: '4',
  timeSpent: 45
});

// Complete assessment
socket.emit('assessment:complete', {
  assessmentId: 'uuid',
  totalTimeSpent: 1500
});

// Receive assessment update
socket.on('assessment:update', (data) => {
  console.log('Assessment update:', data);
});
```

### 7.3 Analytics Events
```javascript
// Track content view
socket.emit('analytics:content-view', {
  contentId: 'uuid',
  studentId: 'uuid',
  startTime: Date.now(),
  deviceInfo: {
    type: 'desktop',
    browser: 'Chrome'
  }
});

// Track engagement
socket.emit('analytics:engagement', {
  studentId: 'uuid',
  activityType: 'active',
  duration: 300,
  context: {
    classroomId: 'uuid',
    contentId: 'uuid'
  }
});
```

## 8. Error Handling

All API endpoints follow consistent error response format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "classroomName",
      "reason": "Required field is missing"
    }
  },
  "timestamp": "2024-01-15T10:00:00Z",
  "requestId": "req_uuid"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid request parameters
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND_ERROR`: Resource not found
- `CONFLICT_ERROR`: Resource conflict
- `RATE_LIMIT_ERROR`: Rate limit exceeded
- `INTERNAL_ERROR`: Internal server error

## 9. Rate Limiting

API endpoints have different rate limits based on their criticality:

- **Read operations**: 1000 requests per minute
- **Write operations**: 100 requests per minute
- **File uploads**: 10 requests per minute
- **Real-time events**: 5000 events per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

This comprehensive API specification provides all necessary endpoints for implementing a full-featured online learning platform with virtual classrooms, content management, assessments, and analytics capabilities.