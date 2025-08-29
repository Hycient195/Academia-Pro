# Academia Pro - Complete Database Schema

## Overview
Complete PostgreSQL database schema for Academia Pro based on the selected technology stack:
- **Database**: PostgreSQL 15+ with advanced features
- **ORM**: TypeORM (Nest.js compatible)
- **Features**: JSONB, full-text search, partitioning, advanced indexing

## Database Configuration

### **Connection Settings**
```typescript
// database.config.ts
export const databaseConfig = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: 'academia_pro',
  ssl: process.env.NODE_ENV === 'production',
  logging: process.env.NODE_ENV === 'development',
  synchronize: false, // Use migrations in production
  migrationsRun: true,
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  subscribers: ['dist/subscribers/*{.ts,.js}'],
};
```

### **Database Extensions**
```sql
-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_buffercache";
CREATE EXTENSION IF NOT EXISTS "pg_prewarm";
```

---

## Core Tables

### **1. Schools Table**
```sql
CREATE TABLE schools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address JSONB NOT NULL, -- {street, city, state, country, postal_code}
    contact_info JSONB NOT NULL, -- {phone, email, website, fax}
    settings JSONB DEFAULT '{}', -- School-specific settings
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(3) DEFAULT 'USD',
    language VARCHAR(10) DEFAULT 'en',
    logo_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Indexes
    INDEX idx_schools_code ON schools(code),
    INDEX idx_schools_status ON schools(status),
    INDEX idx_schools_name_gin ON schools USING gin(to_tsvector('english', name))
);

-- Partitioning by status for better performance
CREATE TABLE schools_active PARTITION OF schools FOR VALUES FROM ('active') TO ('inactive');
CREATE TABLE schools_inactive PARTITION OF schools FOR VALUES FROM ('inactive') TO ('suspended');
CREATE TABLE schools_suspended PARTITION OF schools FOR VALUES FROM ('suspended') TO (MAXVALUE);
```

### **2. Users Table**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    password_hash VARCHAR(255),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT false,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    avatar_url VARCHAR(500),
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'school_admin', 'principal', 'vice_principal', 'teacher', 'student', 'parent', 'support_staff', 'librarian', 'transport_coordinator', 'hostel_warden')),
    employee_id VARCHAR(50) UNIQUE,
    student_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    job_title VARCHAR(100),
    hire_date DATE,
    preferences JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Indexes
    INDEX idx_users_school_id ON users(school_id),
    INDEX idx_users_email ON users(email),
    INDEX idx_users_role ON users(role),
    INDEX idx_users_is_active ON users(is_active),
    INDEX idx_users_employee_id ON users(employee_id),
    INDEX idx_users_student_id ON users(student_id),
    INDEX idx_users_full_name ON users USING gin(to_tsvector('english', first_name || ' ' || last_name)),
    INDEX idx_users_last_login ON users(last_login_at DESC),

    -- Partial indexes for performance
    INDEX idx_users_active_students ON users(school_id, student_id) WHERE role = 'student' AND is_active = true,
    INDEX idx_users_active_teachers ON users(school_id, employee_id) WHERE role = 'teacher' AND is_active = true
);
```

### **3. Students Table**
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    admission_number VARCHAR(50) UNIQUE,
    admission_date DATE NOT NULL,
    enrollment_status VARCHAR(20) DEFAULT 'active' CHECK (enrollment_status IN ('active', 'inactive', 'graduated', 'transferred', 'withdrawn', 'suspended')),

    -- Personal Information
    nationality VARCHAR(100),
    religion VARCHAR(50),
    caste VARCHAR(50),
    blood_group VARCHAR(5) CHECK (blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    mother_tongue VARCHAR(50),

    -- Contact Information
    address JSONB NOT NULL,
    emergency_contacts JSONB NOT NULL, -- Array of emergency contact objects
    medical_info JSONB, -- Allergies, medications, conditions, doctor info

    -- Academic Information
    current_grade_id UUID,
    current_class_id UUID,
    roll_number VARCHAR(20),
    stream VARCHAR(50), -- Science, Commerce, Arts, etc.

    -- Family Information
    father_name VARCHAR(100),
    father_occupation VARCHAR(100),
    father_phone VARCHAR(20),
    father_email VARCHAR(255),
    mother_name VARCHAR(100),
    mother_occupation VARCHAR(100),
    mother_phone VARCHAR(20),
    mother_email VARCHAR(255),

    -- Transport & Hostel
    transport_required BOOLEAN DEFAULT false,
    transport_route_id UUID,
    hostel_required BOOLEAN DEFAULT false,
    hostel_room_id UUID,

    -- Financial Information
    fee_category VARCHAR(50),
    scholarship_applicable BOOLEAN DEFAULT false,
    sibling_discount BOOLEAN DEFAULT false,

    -- Documents
    documents JSONB DEFAULT '[]', -- Array of document objects with URLs and metadata

    -- System Fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    UNIQUE(school_id, student_id),
    FOREIGN KEY (current_grade_id) REFERENCES grades(id),
    FOREIGN KEY (current_class_id) REFERENCES classes(id),
    FOREIGN KEY (transport_route_id) REFERENCES transport_routes(id),
    FOREIGN KEY (hostel_room_id) REFERENCES hostel_rooms(id),

    -- Indexes
    INDEX idx_students_school_id ON students(school_id),
    INDEX idx_students_user_id ON students(user_id),
    INDEX idx_students_student_id ON students(student_id),
    INDEX idx_students_enrollment_status ON students(enrollment_status),
    INDEX idx_students_current_grade ON students(current_grade_id),
    INDEX idx_students_current_class ON students(current_class_id),
    INDEX idx_students_admission_date ON students(admission_date),
    INDEX idx_students_full_name ON students USING gin(to_tsvector('english', (SELECT first_name || ' ' || last_name FROM users WHERE id = students.user_id))),
    INDEX idx_students_transport ON students(transport_required) WHERE transport_required = true,
    INDEX idx_students_hostel ON students(hostel_required) WHERE hostel_required = true,

    -- JSONB indexes for complex queries
    INDEX idx_students_address_gin ON students USING gin(address),
    INDEX idx_students_emergency_contacts_gin ON students USING gin(emergency_contacts),
    INDEX idx_students_medical_info_gin ON students USING gin(medical_info),
    INDEX idx_students_documents_gin ON students USING gin(documents)
);
```

---

## Academic Management Tables

### **4. Grades Table**
```sql
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    grade_name VARCHAR(50) NOT NULL,
    grade_level INTEGER NOT NULL, -- 1 for Grade 1, 12 for Grade 12
    display_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    academic_year VARCHAR(20) NOT NULL,
    curriculum JSONB, -- Grade-specific curriculum structure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(school_id, grade_name, academic_year),
    INDEX idx_grades_school_id ON grades(school_id),
    INDEX idx_grades_level ON grades(grade_level),
    INDEX idx_grades_active ON grades(is_active),
    INDEX idx_grades_academic_year ON grades(academic_year)
);
```

### **5. Subjects Table**
```sql
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    subject_name VARCHAR(100) NOT NULL,
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- Core, Elective, Co-curricular
    description TEXT,
    credit_hours DECIMAL(4,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT true,
    syllabus_url VARCHAR(500),
    learning_objectives JSONB DEFAULT '[]',
    prerequisites JSONB DEFAULT '[]', -- Array of subject IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(school_id, subject_code),
    INDEX idx_subjects_school_id ON subjects(school_id),
    INDEX idx_subjects_category ON subjects(category),
    INDEX idx_subjects_active ON subjects(is_active),
    INDEX idx_subjects_name_gin ON subjects USING gin(to_tsvector('english', subject_name))
);
```

### **6. Classes Table**
```sql
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
    class_name VARCHAR(50) NOT NULL,
    section VARCHAR(10) NOT NULL, -- A, B, C, etc.
    capacity INTEGER NOT NULL DEFAULT 30,
    current_strength INTEGER DEFAULT 0,
    class_teacher_id UUID REFERENCES users(id),
    room_id UUID REFERENCES rooms(id),
    academic_year VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    schedule JSONB DEFAULT '[]', -- Weekly schedule structure
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(school_id, grade_id, class_name, section, academic_year),
    INDEX idx_classes_school_id ON classes(school_id),
    INDEX idx_classes_grade_id ON classes(grade_id),
    INDEX idx_classes_teacher ON classes(class_teacher_id),
    INDEX idx_classes_room ON classes(room_id),
    INDEX idx_classes_academic_year ON classes(academic_year),
    INDEX idx_classes_active ON classes(is_active),

    -- Check constraints
    CHECK (current_strength <= capacity),
    CHECK (capacity > 0)
);
```

### **7. Teacher-Subject Assignments Table**
```sql
CREATE TABLE teacher_subject_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    assignment_type VARCHAR(20) DEFAULT 'primary' CHECK (assignment_type IN ('primary', 'secondary', 'substitute')),
    workload_hours DECIMAL(4,2) DEFAULT 1.0,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(teacher_id, subject_id, class_id, start_date),
    INDEX idx_teacher_assignments_school ON teacher_subject_assignments(school_id),
    INDEX idx_teacher_assignments_teacher ON teacher_subject_assignments(teacher_id),
    INDEX idx_teacher_assignments_subject ON teacher_subject_assignments(subject_id),
    INDEX idx_teacher_assignments_class ON teacher_subject_assignments(class_id),
    INDEX idx_teacher_assignments_active ON teacher_subject_assignments(is_active),
    INDEX idx_teacher_assignments_date_range ON teacher_subject_assignments(start_date, end_date)
);
```

---

## Attendance Management Tables

### **8. Attendance Records Table**
```sql
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id),
    attendance_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused', 'half_day')),
    marked_by UUID REFERENCES users(id),
    device_info JSONB, -- Device fingerprint, IP, location
    remarks TEXT,
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(student_id, attendance_date, subject_id),
    INDEX idx_attendance_school ON attendance_records(school_id),
    INDEX idx_attendance_student ON attendance_records(student_id),
    INDEX idx_attendance_class ON attendance_records(class_id),
    INDEX idx_attendance_subject ON attendance_records(subject_id),
    INDEX idx_attendance_date ON attendance_records(attendance_date),
    INDEX idx_attendance_status ON attendance_records(status),
    INDEX idx_attendance_verified ON attendance_records(is_verified),

    -- Partitioning by date for performance
    PARTITION BY RANGE (attendance_date)
);

-- Create monthly partitions (example for 2024)
CREATE TABLE attendance_records_2024_01 PARTITION OF attendance_records FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE attendance_records_2024_02 PARTITION OF attendance_records FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... continue for all months
```

### **9. Leave Requests Table**
```sql
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES users(id), -- Parent or student
    leave_type VARCHAR(20) NOT NULL CHECK (leave_type IN ('casual', 'medical', 'emergency', 'vacation')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    reason TEXT NOT NULL,
    supporting_documents JSONB DEFAULT '[]', -- Array of document URLs
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    comments TEXT,
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_leave_requests_school ON leave_requests(school_id),
    INDEX idx_leave_requests_student ON leave_requests(student_id),
    INDEX idx_leave_requests_status ON leave_requests(status),
    INDEX idx_leave_requests_date_range ON leave_requests(start_date, end_date),
    INDEX idx_leave_requests_requested_by ON leave_requests(requested_by),
    INDEX idx_leave_requests_approved_by ON leave_requests(approved_by),

    CHECK (end_date >= start_date),
    CHECK (total_days > 0)
);
```

---

## Examination & Assessment Tables

### **10. Examinations Table**
```sql
CREATE TABLE examinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    examination_name VARCHAR(255) NOT NULL,
    examination_type VARCHAR(50) NOT NULL CHECK (examination_type IN ('unit_test', 'term_exam', 'final_exam', 'entrance', 'practical')),
    academic_year VARCHAR(20) NOT NULL,
    term VARCHAR(20), -- Term 1, Term 2, etc.
    grade_ids UUID[] NOT NULL, -- Array of grade IDs
    subject_ids UUID[] NOT NULL, -- Array of subject IDs
    schedule JSONB NOT NULL, -- Examination schedule with dates and times
    settings JSONB DEFAULT '{}', -- Exam settings (duration, instructions, etc.)
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'ongoing', 'completed', 'cancelled')),
    total_marks DECIMAL(6,2),
    passing_marks DECIMAL(6,2),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_examinations_school ON examinations(school_id),
    INDEX idx_examinations_type ON examinations(examination_type),
    INDEX idx_examinations_academic_year ON examinations(academic_year),
    INDEX idx_examinations_status ON examinations(status),
    INDEX idx_examinations_published ON examinations(is_published),
    INDEX idx_examinations_grade_ids ON examinations USING gin(grade_ids),
    INDEX idx_examinations_subject_ids ON examinations USING gin(subject_ids),
    INDEX idx_examinations_schedule ON examinations USING gin(schedule)
);
```

### **11. Exam Results Table**
```sql
CREATE TABLE exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    examination_id UUID REFERENCES examinations(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    marks_obtained DECIMAL(6,2) NOT NULL,
    total_marks DECIMAL(6,2) NOT NULL,
    grade VARCHAR(5), -- A+, A, B+, B, etc.
    grade_points DECIMAL(3,2), -- GPA points
    percentage DECIMAL(5,2),
    remarks TEXT,
    is_absent BOOLEAN DEFAULT false,
    submitted_by UUID REFERENCES users(id),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(examination_id, student_id, subject_id),
    INDEX idx_exam_results_examination ON exam_results(examination_id),
    INDEX idx_exam_results_student ON exam_results(student_id),
    INDEX idx_exam_results_subject ON exam_results(subject_id),
    INDEX idx_exam_results_grade ON exam_results(grade),
    INDEX idx_exam_results_percentage ON exam_results(percentage),
    INDEX idx_exam_results_verified ON exam_results(verified_at),

    CHECK (marks_obtained >= 0),
    CHECK (marks_obtained <= total_marks),
    CHECK (percentage >= 0 AND percentage <= 100)
);
```

### **12. Assessments Table**
```sql
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assessment_type VARCHAR(50) NOT NULL CHECK (assessment_type IN ('quiz', 'assignment', 'project', 'presentation', 'homework')),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    class_ids UUID[] NOT NULL, -- Array of class IDs
    created_by UUID REFERENCES users(id),
    total_marks DECIMAL(6,2) NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    instructions TEXT,
    attachments JSONB DEFAULT '[]', -- Array of attachment URLs
    rubric JSONB, -- Assessment rubric structure
    settings JSONB DEFAULT '{}', -- Assessment settings
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_assessments_school ON assessments(school_id),
    INDEX idx_assessments_subject ON assessments(subject_id),
    INDEX idx_assessments_type ON assessments(assessment_type),
    INDEX idx_assessments_due_date ON assessments(due_date),
    INDEX idx_assessments_published ON assessments(is_published),
    INDEX idx_assessments_class_ids ON assessments USING gin(class_ids),
    INDEX idx_assessments_attachments ON assessments USING gin(attachments)
);
```

---

## Fee Management Tables

### **13. Fee Structures Table**
```sql
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    structure_name VARCHAR(255) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    total_amount DECIMAL(10,2) NOT NULL,
    components JSONB NOT NULL, -- Array of fee components
    installment_plan JSONB, -- Installment structure
    discounts JSONB DEFAULT '[]', -- Available discounts
    late_fees JSONB DEFAULT '{}', -- Late fee structure
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(school_id, grade_id, academic_year),
    INDEX idx_fee_structures_school ON fee_structures(school_id),
    INDEX idx_fee_structures_grade ON fee_structures(grade_id),
    INDEX idx_fee_structures_academic_year ON fee_structures(academic_year),
    INDEX idx_fee_structures_active ON fee_structures(is_active),
    INDEX idx_fee_structures_components ON fee_structures USING gin(components)
);
```

### **14. Student Fee Bills Table**
```sql
CREATE TABLE student_fee_bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE CASCADE,
    academic_year VARCHAR(20) NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    components JSONB NOT NULL, -- Detailed fee breakdown
    discounts_applied JSONB DEFAULT '[]', -- Applied discounts
    scholarships_applied JSONB DEFAULT '[]', -- Applied scholarships
    installment_plan JSONB, -- Installment details
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid', 'overdue', 'cancelled')),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(student_id, academic_year),
    INDEX idx_fee_bills_school ON student_fee_bills(school_id),
    INDEX idx_fee_bills_student ON student_fee_bills(student_id),
    INDEX idx_fee_bills_status ON student_fee_bills(status),
    INDEX idx_fee_bills_due_date ON student_fee_bills(due_date),
    INDEX idx_fee_bills_academic_year ON student_fee_bills(academic_year)
);
```

### **15. Fee Payments Table**
```sql
CREATE TABLE fee_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    fee_bill_id UUID REFERENCES student_fee_bills(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'online', 'cheque', 'card', 'mobile_money')),
    reference_number VARCHAR(100),
    transaction_id VARCHAR(100),
    gateway_response JSONB, -- Payment gateway response
    bank_details JSONB, -- Bank transfer details
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded', 'cancelled')),
    processed_by UUID REFERENCES users(id),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_fee_payments_school ON fee_payments(school_id),
    INDEX idx_fee_payments_student ON fee_payments(student_id),
    INDEX idx_fee_payments_bill ON fee_payments(fee_bill_id),
    INDEX idx_fee_payments_date ON fee_payments(payment_date),
    INDEX idx_fee_payments_method ON fee_payments(payment_method),
    INDEX idx_fee_payments_status ON fee_payments(status),
    INDEX idx_fee_payments_reference ON fee_payments(reference_number),
    INDEX idx_fee_payments_transaction ON fee_payments(transaction_id)
);
```

---

## Communication & Notification Tables

### **16. Messages Table**
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'general' CHECK (message_type IN ('general', 'announcement', 'circular', 'reminder', 'alert')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    attachments JSONB DEFAULT '[]', -- Array of attachment objects
    recipient_type VARCHAR(50) NOT NULL CHECK (recipient_type IN ('individual', 'group', 'role', 'all')),
    recipient_ids UUID[], -- Array of recipient user IDs
    group_ids UUID[], -- Array of group IDs
    role_ids UUID[], -- Array of role IDs
    channels JSONB NOT NULL, -- Communication channels (email, sms, push, in_app)
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    delivery_stats JSONB DEFAULT '{}', -- Delivery statistics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_messages_school ON messages(school_id),
    INDEX idx_messages_sender ON messages(sender_id),
    INDEX idx_messages_type ON messages(message_type),
    INDEX idx_messages_priority ON messages(priority),
    INDEX idx_messages_status ON messages(status),
    INDEX idx_messages_sent_at ON messages(sent_at),
    INDEX idx_messages_scheduled_at ON messages(scheduled_at),
    INDEX idx_messages_recipient_ids ON messages USING gin(recipient_ids),
    INDEX idx_messages_channels ON messages USING gin(channels)
);
```

### **17. Notifications Table**
```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('academic', 'attendance', 'fee', 'transport', 'hostel', 'exam', 'announcement', 'emergency')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    data JSONB DEFAULT '{}', -- Additional notification data
    action_url VARCHAR(500), -- URL to redirect on click
    channels JSONB NOT NULL, -- Delivery channels
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN DEFAULT false,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_notifications_school ON notifications(school_id),
    INDEX idx_notifications_user ON notifications(user_id),
    INDEX idx_notifications_type ON notifications(notification_type),
    INDEX idx_notifications_priority ON notifications(priority),
    INDEX idx_notifications_is_read ON notifications(is_read),
    INDEX idx_notifications_sent_at ON notifications(sent_at),
    INDEX idx_notifications_expires_at ON notifications(expires_at),
    INDEX idx_notifications_channels ON notifications USING gin(channels)
);
```

---

## Library Management Tables

### **18. Books Table**
```sql
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    isbn VARCHAR(20),
    title VARCHAR(500) NOT NULL,
    authors JSONB NOT NULL, -- Array of author objects
    publisher VARCHAR(255),
    publication_year INTEGER,
    edition VARCHAR(50),
    category VARCHAR(100) NOT NULL,
    sub_category VARCHAR(100),
    description TEXT,
    language VARCHAR(50) DEFAULT 'English',
    pages INTEGER,
    price DECIMAL(8,2),
    quantity INTEGER NOT NULL DEFAULT 1,
    available_quantity INTEGER NOT NULL DEFAULT 1,
    location_shelf VARCHAR(50),
    location_row VARCHAR(20),
    location_section VARCHAR(20),
    condition_status VARCHAR(20) DEFAULT 'good' CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
    cover_image_url VARCHAR(500),
    digital_copy_url VARCHAR(500),
    tags JSONB DEFAULT '[]', -- Array of tags for search
    metadata JSONB DEFAULT '{}', -- Additional metadata
    is_active BOOLEAN DEFAULT true,
    added_by UUID REFERENCES users(id),
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_books_school ON books(school_id),
    INDEX idx_books_isbn ON books(isbn),
    INDEX idx_books_category ON books(category),
    INDEX idx_books_available ON books(available_quantity),
    INDEX idx_books_active ON books(is_active),
    INDEX idx_books_title_gin ON books USING gin(to_tsvector('english', title)),
    INDEX idx_books_authors_gin ON books USING gin(authors),
    INDEX idx_books_tags_gin ON books USING gin(tags),

    CHECK (available_quantity <= quantity),
    CHECK (available_quantity >= 0),
    CHECK (quantity > 0)
);
```

### **19. Book Circulation Table**
```sql
CREATE TABLE book_circulation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    circulation_type VARCHAR(20) NOT NULL CHECK (circulation_type IN ('checkout', 'return', 'renew', 'reserve')),
    checkout_date TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE,
    return_date TIMESTAMP WITH TIME ZONE,
    actual_return_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue', 'lost', 'damaged')),
    fine_amount DECIMAL(6,2) DEFAULT 0,
    fine_paid BOOLEAN DEFAULT false,
    fine_paid_date TIMESTAMP WITH TIME ZONE,
    condition_on_return VARCHAR(20) CHECK (condition_on_return IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
    damage_description TEXT,
    processed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_circulation_school ON book_circulation(school_id),
    INDEX idx_circulation_book ON book_circulation(book_id),
    INDEX idx_circulation_user ON book_circulation(user_id),
    INDEX idx_circulation_type ON book_circulation(circulation_type),
    INDEX idx_circulation_status ON book_circulation(status),
    INDEX idx_circulation_due_date ON book_circulation(due_date),
    INDEX idx_circulation_checkout_date ON book_circulation(checkout_date),
    INDEX idx_circulation_return_date ON book_circulation(return_date)
);
```

---

## Transportation Management Tables

### **20. Transport Routes Table**
```sql
CREATE TABLE transport_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    route_name VARCHAR(255) NOT NULL,
    route_code VARCHAR(50) UNIQUE NOT NULL,
    route_type VARCHAR(20) DEFAULT 'regular' CHECK (route_type IN ('regular', 'express', 'special')),
    description TEXT,
    start_point JSONB NOT NULL, -- {name, latitude, longitude, address}
    end_point JSONB NOT NULL, -- {name, latitude, longitude, address}
    stops JSONB NOT NULL, -- Array of stop objects
    distance_km DECIMAL(6,2),
    estimated_duration_minutes INTEGER,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    vehicle_id UUID REFERENCES vehicles(id),
    driver_id UUID REFERENCES users(id),
    attendant_id UUID REFERENCES users(id),
    schedule JSONB NOT NULL, -- Route schedule
    fare_amount DECIMAL(8,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(school_id, route_code),
    INDEX idx_transport_routes_school ON transport_routes(school_id),
    INDEX idx_transport_routes_type ON transport_routes(route_type),
    INDEX idx_transport_routes_active ON transport_routes(is_active),
    INDEX idx_transport_routes_vehicle ON transport_routes(vehicle_id),
    INDEX idx_transport_routes_driver ON transport_routes(driver_id),
    INDEX idx_transport_routes_stops ON transport_routes USING gin(stops),
    INDEX idx_transport_routes_schedule ON transport_routes USING gin(schedule),

    CHECK (current_occupancy <= capacity),
    CHECK (capacity > 0)
);
```

### **21. Vehicles Table**
```sql
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    vehicle_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('bus', 'van', 'car', 'other')),
    model VARCHAR(100),
    manufacturer VARCHAR(100),
    year_of_manufacture INTEGER,
    registration_number VARCHAR(50) UNIQUE,
    registration_expiry DATE,
    insurance_policy_number VARCHAR(100),
    insurance_expiry DATE,
    capacity INTEGER NOT NULL,
    fuel_type VARCHAR(20) DEFAULT 'diesel' CHECK (fuel_type IN ('petrol', 'diesel', 'cng', 'electric')),
    gps_device_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive', 'retired')),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    mileage INTEGER,
    documents JSONB DEFAULT '[]', -- Vehicle documents
    features JSONB DEFAULT '[]', -- Vehicle features
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_vehicles_school ON vehicles(school_id),
    INDEX idx_vehicles_type ON vehicles(vehicle_type),
    INDEX idx_vehicles_status ON vehicles(status),
    INDEX idx_vehicles_registration ON vehicles(registration_number),
    INDEX idx_vehicles_gps ON vehicles(gps_device_id),
    INDEX idx_vehicles_maintenance ON vehicles(next_maintenance_date),

    CHECK (capacity > 0),
    CHECK (year_of_manufacture >= 2000)
);
```

---

## Security & Audit Tables

### **22. Audit Logs Table**
```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    session_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id UUID,
    action_details JSONB,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    location JSONB, -- Geographic location
    risk_score DECIMAL(3,2), -- 0.0 to 1.0
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_audit_logs_school ON audit_logs(school_id),
    INDEX idx_audit_logs_user ON audit_logs(user_id),
    INDEX idx_audit_logs_action ON audit_logs(action),
    INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id),
    INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC),
    INDEX idx_audit_logs_risk_score ON audit_logs(risk_score),

    -- Partitioning by month for performance
    PARTITION BY RANGE (timestamp)
);

-- Create monthly partitions
CREATE TABLE audit_logs_2024_01 PARTITION OF audit_logs FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit_logs_2024_02 PARTITION OF audit_logs FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... continue for all months
```

### **23. Security Events Table**
```sql
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('authentication', 'authorization', 'access_attempt', 'data_access', 'system_change', 'suspicious_activity')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    source_system VARCHAR(100),
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,
    location JSONB,
    event_data JSONB,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_security_events_school ON security_events(school_id),
    INDEX idx_security_events_type ON security_events(event_type),
    INDEX idx_security_events_severity ON security_events(severity),
    INDEX idx_security_events_user ON security_events(user_id),
    INDEX idx_security_events_resolved ON security_events(is_resolved),
    INDEX idx_security_events_created ON security_events(created_at DESC)
);
```

---

## Online Learning Tables

### **24. Virtual Classrooms Table**
```sql
CREATE TABLE virtual_classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id),
    classroom_name VARCHAR(255) NOT NULL,
    description TEXT,
    instructor_id UUID REFERENCES users(id),
    max_participants INTEGER DEFAULT 100,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled')),
    meeting_url VARCHAR(500),
    recording_url VARCHAR(500),
    settings JSONB DEFAULT '{}', -- Classroom settings
    whiteboard_data JSONB DEFAULT '[]', -- Whiteboard content
    chat_history JSONB DEFAULT '[]', -- Chat messages
    attendance_data JSONB DEFAULT '[]', -- Participant attendance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_virtual_classrooms_school ON virtual_classrooms(school_id),
    INDEX idx_virtual_classrooms_course ON virtual_classrooms(course_id),
    INDEX idx_virtual_classrooms_instructor ON virtual_classrooms(instructor_id),
    INDEX idx_virtual_classrooms_status ON virtual_classrooms(status),
    INDEX idx_virtual_classrooms_start_time ON virtual_classrooms(start_time),
    INDEX idx_virtual_classrooms_settings ON virtual_classrooms USING gin(settings)
);
```

### **25. Digital Content Table**
```sql
CREATE TABLE digital_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID REFERENCES schools(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('video', 'audio', 'document', 'presentation', 'interactive', 'assessment')),
    file_path VARCHAR(1000),
    thumbnail_path VARCHAR(500),
    duration_minutes INTEGER,
    file_size_bytes BIGINT,
    metadata JSONB DEFAULT '{}',
    tags JSONB DEFAULT '[]',
    access_level VARCHAR(20) DEFAULT 'enrolled' CHECK (access_level IN ('public', 'enrolled', 'private')),
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_digital_content_school ON digital_content(school_id),
    INDEX idx_digital_content_type ON digital_content(content_type),
    INDEX idx_digital_content_access ON digital_content(access_level),
    INDEX idx_digital_content_active ON digital_content(is_active),
    INDEX idx_digital_content_title_gin ON digital_content USING gin(to_tsvector('english', title)),
    INDEX idx_digital_content_tags_gin ON digital_content USING gin(tags),
    INDEX idx_digital_content_metadata_gin ON digital_content USING gin(metadata)
);
```

---

## Database Optimization Features

### **Advanced PostgreSQL Features Used**

#### **1. JSONB for Flexible Data**
```sql
-- Store complex nested data efficiently
CREATE INDEX idx_users_preferences_gin ON users USING gin(preferences);
CREATE INDEX idx_students_medical_info_gin ON students USING gin(medical_info);
```

#### **2. Full-Text Search**
```sql
-- Enable fast text search across multiple fields
CREATE INDEX idx_users_full_name_search ON users USING gin(to_tsvector('english', first_name || ' ' || last_name));
CREATE INDEX idx_books_title_search ON books USING gin(to_tsvector('english', title));
```

#### **3. Table Partitioning**
```sql
-- Partition large tables by date for better performance
CREATE TABLE attendance_records_y2024m01 PARTITION OF attendance_records FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

#### **4. Array Operations**
```sql
-- Efficient querying of array fields
CREATE INDEX idx_examinations_grade_ids_gin ON examinations USING gin(grade_ids);
CREATE INDEX idx_messages_recipient_ids_gin ON messages USING gin(recipient_ids);
```

#### **5. Generated Columns**
```sql
-- Auto-calculated fields for performance
ALTER TABLE exam_results ADD COLUMN percentage DECIMAL(5,2) GENERATED ALWAYS AS ((marks_obtained / total_marks) * 100) STORED;
ALTER TABLE attendance_records ADD COLUMN duration_minutes INTEGER GENERATED ALWAYS AS (EXTRACT(EPOCH FROM (check_out_time - check_in_time))/60) STORED;
```

### **Database Performance Optimizations**

#### **Indexing Strategy**
```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_students_school_grade_class ON students(school_id, current_grade_id, current_class_id);
CREATE INDEX idx_fee_payments_student_date ON fee_payments(student_id, payment_date DESC);

-- Partial indexes for specific conditions
CREATE INDEX idx_users_active_students ON users(school_id, student_id) WHERE role = 'student' AND is_active = true;
CREATE INDEX idx_books_available_only ON books(school_id, category) WHERE available_quantity > 0;
```

#### **Query Optimization**
```sql
-- Use CTEs for complex queries
WITH student_stats AS (
    SELECT
        school_id,
        COUNT(*) as total_students,
        COUNT(CASE WHEN enrollment_status = 'active' THEN 1 END) as active_students
    FROM students
    GROUP BY school_id
)
SELECT * FROM student_stats WHERE active_students > 1000;

-- Use window functions for analytics
SELECT
    student_id,
    attendance_date,
    status,
    COUNT(*) OVER (PARTITION BY student_id ORDER BY attendance_date ROWS BETWEEN 29 PRECEDING AND CURRENT ROW) as last_30_days_present
FROM attendance_records
WHERE status = 'present';
```

### **Database Maintenance**

#### **Automated Maintenance Scripts**
```sql
-- Archive old data
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS void AS $$
BEGIN
    INSERT INTO audit_logs_archive
    SELECT * FROM audit_logs
    WHERE timestamp < CURRENT_DATE - INTERVAL '2 years';

    DELETE FROM audit_logs
    WHERE timestamp < CURRENT_DATE - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Reindex fragmented tables
CREATE OR REPLACE FUNCTION reindex_large_tables()
RETURNS void AS $$
BEGIN
    REINDEX TABLE CONCURRENTLY attendance_records;
    REINDEX TABLE CONCURRENTLY audit_logs;
    REINDEX TABLE CONCURRENTLY fee_payments;
END;
$$ LANGUAGE plpgsql;
```

### **Backup and Recovery Strategy**
```sql
-- Point-in-time recovery setup
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET archive_mode = 'on';
ALTER SYSTEM SET archive_command = 'cp %p /var/lib/postgresql/archive/%f';

-- Automated backup script
CREATE OR REPLACE FUNCTION create_database_backup()
RETURNS text AS $$
DECLARE
    backup_filename text;
BEGIN
    backup_filename := 'academia_pro_' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDD_HH24MI') || '.backup';
    EXECUTE format('pg_dump -Fc academia_pro > /backups/%I', backup_filename);
    RETURN backup_filename;
END;
$$ LANGUAGE plpgsql;
```

This comprehensive database schema provides a solid foundation for Academia Pro with PostgreSQL-specific optimizations, advanced features, and enterprise-grade performance capabilities. The schema is designed to handle the complex relationships between 21 modules while maintaining data integrity, performance, and scalability.