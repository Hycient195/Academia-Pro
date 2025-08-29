# Parent Portal Module Architecture Design

## Overview
The Parent Portal module provides parents with secure, real-time access to their children's academic progress, school activities, and communication channels. This comprehensive design covers all aspects of the parent portal functionality as specified in the requirements.

## Current System Analysis

### Existing Architecture Patterns
- **Framework**: NestJS with TypeORM
- **Database**: PostgreSQL with TypeORM entities
- **Authentication**: JWT-based with role-based access control
- **API Design**: RESTful with Swagger documentation
- **Module Structure**: Feature-based modules with controllers, services, entities, and DTOs
- **Common Types**: Shared type definitions in `/common` directory

### Existing Modules
- **Academic Module**: Subjects, curriculum, classes, learning objectives
- **Student Module**: Student management with comprehensive data model
- **Parent Module**: Basic parent CRUD operations (already implemented)
- **Auth Module**: JWT authentication and authorization
- **User Module**: User management

## Parent Portal Module Structure

### 1. Module Organization
```
server/src/parent-portal/
├── parent-portal.module.ts
├── controllers/
│   ├── dashboard.controller.ts
│   ├── academic.controller.ts
│   ├── communication.controller.ts
│   ├── appointment.controller.ts
│   ├── fee.controller.ts
│   ├── transportation.controller.ts
│   └── resource.controller.ts
├── services/
│   ├── dashboard.service.ts
│   ├── academic.service.ts
│   ├── communication.service.ts
│   ├── appointment.service.ts
│   ├── fee.service.ts
│   ├── transportation.service.ts
│   └── resource.service.ts
├── entities/
│   ├── communication.entity.ts
│   ├── appointment.entity.ts
│   ├── fee.entity.ts
│   ├── payment.entity.ts
│   ├── transportation.entity.ts
│   ├── resource.entity.ts
│   └── portal-access-log.entity.ts
├── dtos/
│   ├── dashboard/
│   ├── academic/
│   ├── communication/
│   ├── appointment/
│   ├── fee/
│   ├── transportation/
│   └── resource/
└── guards/
    ├── parent-access.guard.ts
    └── child-access.guard.ts
```

### 2. Database Schema Design

#### Core Entities

**Communication Entity**
```sql
CREATE TABLE communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id),
  student_id UUID REFERENCES students(id),
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  sender_id UUID NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_role VARCHAR(100) NOT NULL,
  attachments JSONB DEFAULT '[]',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  requires_response BOOLEAN DEFAULT false,
  response TEXT,
  response_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  school_id UUID NOT NULL
);

-- Indexes
CREATE INDEX idx_communications_parent ON communications(parent_id);
CREATE INDEX idx_communications_student ON communications(student_id);
CREATE INDEX idx_communications_type ON communications(type);
CREATE INDEX idx_communications_school ON communications(school_id);
```

**Appointment Entity**
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id),
  student_id UUID NOT NULL REFERENCES students(id),
  teacher_id UUID NOT NULL REFERENCES staff(id),
  subject VARCHAR(255) NOT NULL,
  purpose TEXT NOT NULL,
  requested_date DATE NOT NULL,
  requested_time VARCHAR(20) NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  status VARCHAR(50) DEFAULT 'requested',
  location VARCHAR(255) NOT NULL,
  notes TEXT,
  teacher_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  school_id UUID NOT NULL
);

-- Indexes
CREATE INDEX idx_appointments_parent ON appointments(parent_id);
CREATE INDEX idx_appointments_student ON appointments(student_id);
CREATE INDEX idx_appointments_teacher ON appointments(teacher_id);
CREATE INDEX idx_appointments_date ON appointments(requested_date);
CREATE INDEX idx_appointments_status ON appointments(status);
```

**Fee Entity**
```sql
CREATE TABLE fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  fee_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  term VARCHAR(50),
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  school_id UUID NOT NULL
);

-- Indexes
CREATE INDEX idx_fees_student ON fees(student_id);
CREATE INDEX idx_fees_due_date ON fees(due_date);
CREATE INDEX idx_fees_status ON fees(status);
CREATE INDEX idx_fees_academic_year ON fees(academic_year);
```

**Payment Entity**
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  fee_id UUID REFERENCES fees(id),
  parent_id UUID REFERENCES parents(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(50) DEFAULT 'pending',
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  receipt_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  school_id UUID NOT NULL
);

-- Indexes
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_fee ON payments(fee_id);
CREATE INDEX idx_payments_parent ON payments(parent_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_status ON payments(status);
```

**Transportation Entity**
```sql
CREATE TABLE transportation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  route_id UUID NOT NULL,
  stop_id UUID NOT NULL,
  pickup_time VARCHAR(20),
  drop_time VARCHAR(20),
  pickup_date DATE NOT NULL,
  status VARCHAR(50) DEFAULT 'scheduled',
  driver_id UUID,
  driver_name VARCHAR(255),
  vehicle_number VARCHAR(50),
  actual_pickup_time TIMESTAMP,
  actual_drop_time TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  school_id UUID NOT NULL
);

-- Indexes
CREATE INDEX idx_transportation_student ON transportation_records(student_id);
CREATE INDEX idx_transportation_date ON transportation_records(pickup_date);
CREATE INDEX idx_transportation_route ON transportation_records(route_id);
CREATE INDEX idx_transportation_status ON transportation_records(status);
```

**Resource Entity**
```sql
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'document', 'video', 'link', 'article'
  category VARCHAR(100) NOT NULL,
  grade_level VARCHAR(50),
  subject VARCHAR(100),
  file_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  file_size BIGINT,
  mime_type VARCHAR(100),
  is_public BOOLEAN DEFAULT false,
  access_level VARCHAR(50) DEFAULT 'all',
  tags TEXT[],
  created_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  school_id UUID NOT NULL
);

-- Indexes
CREATE INDEX idx_resources_type ON resources(type);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_grade ON resources(grade_level);
CREATE INDEX idx_resources_subject ON resources(subject);
CREATE INDEX idx_resources_public ON resources(is_public);
```

**Portal Access Log Entity**
```sql
CREATE TABLE portal_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id),
  user_id UUID NOT NULL,
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(255) NOT NULL,
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  school_id UUID NOT NULL
);

-- Indexes
CREATE INDEX idx_access_logs_parent ON portal_access_logs(parent_id);
CREATE INDEX idx_access_logs_action ON portal_access_logs(action);
CREATE INDEX idx_access_logs_created ON portal_access_logs(created_at);
CREATE INDEX idx_access_logs_session ON portal_access_logs(session_id);
```

## API Endpoint Architecture

### 1. Dashboard Endpoints
```
GET    /parent-portal/dashboard/:parentId
GET    /parent-portal/dashboard/:parentId/child/:studentId
POST   /parent-portal/dashboard/:parentId/quick-action
GET    /parent-portal/dashboard/:parentId/notifications
PUT    /parent-portal/dashboard/:parentId/notifications/:id/read
```

### 2. Academic Progress Endpoints
```
GET    /parent-portal/academic/:parentId/grades
GET    /parent-portal/academic/:parentId/grades/:studentId
GET    /parent-portal/academic/:parentId/attendance
GET    /parent-portal/academic/:parentId/attendance/:studentId
GET    /parent-portal/academic/:parentId/assignments
GET    /parent-portal/academic/:parentId/assignments/:studentId
GET    /parent-portal/academic/:parentId/timetable
GET    /parent-portal/academic/:parentId/timetable/:studentId
GET    /parent-portal/academic/:parentId/reports
GET    /parent-portal/academic/:parentId/reports/:studentId
```

### 3. Communication Endpoints
```
GET    /parent-portal/communication/:parentId
POST   /parent-portal/communication
GET    /parent-portal/communication/:id
PUT    /parent-portal/communication/:id/read
POST   /parent-portal/communication/:id/response
GET    /parent-portal/communication/:parentId/unread-count
DELETE /parent-portal/communication/:id
```

### 4. Appointment Endpoints
```
GET    /parent-portal/appointment/:parentId
POST   /parent-portal/appointment
GET    /parent-portal/appointment/:id
PUT    /parent-portal/appointment/:id
DELETE /parent-portal/appointment/:id
GET    /parent-portal/appointment/:parentId/availability
POST   /parent-portal/appointment/:id/cancel
```

### 5. Fee and Payment Endpoints
```
GET    /parent-portal/fee/:parentId
GET    /parent-portal/fee/:parentId/:studentId
GET    /parent-portal/fee/:id
POST   /parent-portal/payment
GET    /parent-portal/payment/:parentId
GET    /parent-portal/payment/:parentId/:studentId
GET    /parent-portal/payment/:id/receipt
POST   /parent-portal/payment/webhook
```

### 6. Transportation Endpoints
```
GET    /parent-portal/transportation/:parentId
GET    /parent-portal/transportation/:parentId/:studentId
GET    /parent-portal/transportation/:id
POST   /parent-portal/transportation/:id/track
GET    /parent-portal/transportation/routes
GET    /parent-portal/transportation/stops
```

### 7. Resource Endpoints
```
GET    /parent-portal/resource/:parentId
GET    /parent-portal/resource/:parentId/search
GET    /parent-portal/resource/:id
GET    /parent-portal/resource/:id/download
POST   /parent-portal/resource/:id/view
GET    /parent-portal/resource/categories
```

## Data Models and Relationships

### Entity Relationships Diagram
```
┌─────────────────┐    ┌─────────────────┐
│     Parent      │    │     Student     │
│                 │    │                 │
│ • id            │1   │ • id            │
│ • userId        │────│ • admissionNo   │
│ • relationship  │    │ • firstName     │
│ • children[]    │    │ • grade         │
│ • schoolId      │    │ • class         │
└─────────────────┘    │ • schoolId      │
          │            └─────────────────┘
          │1
          │
          │
          │*
┌─────────────────┐    ┌─────────────────┐
│  Communication  │    │   Appointment   │
│                 │    │                 │
│ • id            │    │ • id            │
│ • parentId      │    │ • parentId      │
│ • studentId     │    │ • studentId     │
│ • type          │    │ • teacherId     │
│ • message       │    │ • subject       │
│ • isRead        │    │ • status        │
└─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│      Fee        │    │    Payment      │
│                 │    │                 │
│ • id            │    │ • id            │
│ • studentId     │    │ • studentId     │
│ • amount        │    │ • feeId         │
│ • dueDate       │    │ • amount        │
│ • status        │    │ • status        │
└─────────────────┘    └─────────────────┘

┌─────────────────┐    ┌─────────────────┐
│ Transportation  │    │    Resource     │
│                 │    │                 │
│ • id            │    │ • id            │
│ • studentId     │    │ • title         │
│ • routeId       │    │ • type          │
│ • pickupTime    │    │ • category      │
│ • status        │    │ • fileUrl       │
└─────────────────┘    └─────────────────┘
```

## Integration Points with Existing Modules

### 1. Student Module Integration
- **Data Access**: Grades, attendance, assignments, timetable
- **Relationship**: Parent-Student linkage through `children` array
- **Access Control**: Permission-based access to student data

### 2. Academic Module Integration
- **Curriculum Access**: Subject information, learning objectives
- **Class Information**: Class schedules, teacher assignments
- **Grade Access**: Grade book integration for progress monitoring

### 3. Authentication Module Integration
- **JWT Tokens**: Parent authentication and authorization
- **Role-based Access**: Parent-specific permissions
- **Session Management**: Portal access logging

### 4. User Module Integration
- **User Profiles**: Parent user account management
- **Contact Information**: Email and phone verification
- **Account Status**: Active/inactive parent accounts

## Security and Authentication Approach

### 1. Authentication Strategy
- **JWT-based Authentication**: Secure token-based access
- **Multi-factor Authentication**: Optional 2FA for enhanced security
- **Session Management**: Automatic logout on inactivity
- **Device Fingerprinting**: Track and limit concurrent sessions

### 2. Authorization Strategy
- **Role-based Access Control**: Parent, Guardian, Emergency Contact roles
- **Permission-based Access**: Granular permissions per child
- **Access Level Hierarchy**:
  - `emergency_only`: Emergency notifications only
  - `view_only`: Read-only access to basic information
  - `limited_access`: Controlled access with restrictions
  - `full_access`: Complete portal access

### 3. Data Security
- **End-to-end Encryption**: All communication encrypted
- **Data Sanitization**: Input validation and sanitization
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content security policies

### 4. Privacy and Compliance
- **GDPR Compliance**: Data protection and privacy regulations
- **Parental Consent**: Explicit consent for data sharing
- **Data Retention**: Configurable data retention policies
- **Audit Logging**: Comprehensive access and activity logging

## Implementation Roadmap and Priorities

### Phase 1: Core Infrastructure (Week 1-2)
1. Create Parent Portal module structure
2. Implement database entities and migrations
3. Set up basic authentication and authorization
4. Create dashboard service and controller

### Phase 2: Academic Features (Week 3-4)
1. Implement academic progress monitoring
2. Create grade and attendance access
3. Build assignment and timetable integration
4. Add progress report generation

### Phase 3: Communication System (Week 5-6)
1. Implement communication entities and services
2. Create messaging system for teacher-parent communication
3. Build appointment scheduling system
4. Add notification management

### Phase 4: Financial Management (Week 7-8)
1. Implement fee management system
2. Create payment processing integration
3. Build payment history and receipts
4. Add financial reporting

### Phase 5: Additional Features (Week 9-10)
1. Implement transportation tracking
2. Create resource library access
3. Build emergency contact system
4. Add analytics and reporting

### Phase 6: Testing and Optimization (Week 11-12)
1. Comprehensive testing suite
2. Performance optimization
3. Security audit and penetration testing
4. User acceptance testing

## Technical Considerations

### Performance Optimization
- **Database Indexing**: Strategic indexes on frequently queried fields
- **Caching Strategy**: Redis caching for frequently accessed data
- **Pagination**: Efficient pagination for large datasets
- **Lazy Loading**: Optimize data loading patterns

### Scalability Considerations
- **Microservices Architecture**: Potential for service decomposition
- **Database Sharding**: Horizontal scaling for large datasets
- **CDN Integration**: Static content delivery optimization
- **Load Balancing**: Distributed request handling

### Monitoring and Analytics
- **Application Metrics**: Response times, error rates, throughput
- **User Analytics**: Portal usage patterns, feature adoption
- **Performance Monitoring**: Database query performance, memory usage
- **Security Monitoring**: Failed login attempts, suspicious activities

This comprehensive architecture design provides a solid foundation for implementing a robust Parent Portal module that meets all specified requirements while maintaining security, performance, and scalability.