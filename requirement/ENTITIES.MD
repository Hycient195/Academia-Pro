# Academia Pro - Application Entities

## Overview
This document identifies and describes all entities in the Academia Pro School Management System, covering 21 integrated modules and supporting multi-school architecture for enterprise-grade educational management.

## Entity Summary
**Total Entities Identified: 65+**

| Category | Entity Count | Key Purpose |
|----------|-------------|-------------|
| **Core Infrastructure** | 8 entities | System foundation and user management |
| **Academic Management** | 12 entities | Curriculum, classes, and academic structure |
| **Operational Management** | 10 entities | Daily operations and student lifecycle |
| **Support Services** | 9 entities | Library, transportation, and facilities |
| **Digital Learning** | 8 entities | Online education and virtual classrooms |
| **Administrative** | 11 entities | Reporting, security, and system management |
| **Financial Management** | 7 entities | Fee collection and financial operations |

---

## 1. Core Infrastructure Entities

### 1.1 School
**Purpose**: Central entity for multi-school architecture and institutional management
**Module**: Multi-School Architecture
**Key Attributes**:
- `school_id` (Primary Key)
- `name` (School name)
- `address` (Complete address)
- `phone`, `email` (Contact information)
- `type` (Primary/Secondary/Mixed)
- `capacity` (Student capacity)
- `established_date` (Foundation date)
- `registration_number` (Government registration)
- `status` (Active/Inactive/Suspended)

**Relationships**:
- One-to-Many: Users, Students, Staff, Classes, Subjects
- One-to-Many: Facilities, Academic Years, Grade Scales

### 1.2 User
**Purpose**: System users with role-based access across all modules
**Module**: User Management & Authentication
**Key Attributes**:
- `user_id` (Primary Key)
- `username`, `email` (Login credentials)
- `first_name`, `last_name` (Personal details)
- `phone`, `date_of_birth` (Contact & demographics)
- `school_id` (Foreign Key - multi-school support)
- `status` (Active/Inactive/Suspended)
- `last_login` (Authentication tracking)
- `password_hash` (Security)

**Relationships**:
- Many-to-One: School (belongs to)
- One-to-Many: User Roles, User Permissions, Login Sessions
- One-to-Many: Audit Logs, Access Logs

### 1.3 User Role
**Purpose**: Role-based access control definitions
**Module**: User Management & Authentication
**Key Attributes**:
- `role_id` (Primary Key)
- `name` (Role name: Super Admin, School Admin, Teacher, etc.)
- `description` (Role description)
- `school_id` (Foreign Key - school-specific roles)
- `is_system_role` (System vs custom roles)
- `created_date`, `updated_date` (Audit fields)

**Relationships**:
- Many-to-One: School
- Many-to-Many: Users (through User Role Assignments)
- One-to-Many: Permissions

### 1.4 User Permission
**Purpose**: Granular permissions for system access control
**Module**: User Management & Authentication
**Key Attributes**:
- `permission_id` (Primary Key)
- `name` (Permission name)
- `resource` (Module/Resource name)
- `action` (CRUD operations: Create, Read, Update, Delete)
- `description` (Permission description)
- `is_system_permission` (System vs custom)

**Relationships**:
- Many-to-Many: User Roles
- One-to-Many: Role Permissions

### 1.5 Login Session
**Purpose**: User authentication session management
**Module**: User Management & Authentication
**Key Attributes**:
- `session_id` (Primary Key)
- `user_id` (Foreign Key)
- `token` (JWT token)
- `ip_address` (Login source)
- `user_agent` (Device/browser info)
- `login_time`, `logout_time` (Session timing)
- `is_active` (Session status)

**Relationships**:
- Many-to-One: User
- One-to-One: Refresh Tokens

### 1.6 Audit Log
**Purpose**: Comprehensive system activity tracking for compliance
**Module**: Security & Compliance
**Key Attributes**:
- `audit_id` (Primary Key)
- `user_id` (Foreign Key - who performed action)
- `action` (What was done)
- `resource` (Which entity was affected)
- `resource_id` (Specific record ID)
- `old_values`, `new_values` (Before/after data)
- `timestamp` (When it happened)
- `ip_address` (Source IP)
- `user_agent` (Device info)

**Relationships**:
- Many-to-One: User
- Many-to-One: School (for multi-school isolation)

### 1.7 Facility
**Purpose**: Physical infrastructure and resource management
**Module**: Inventory & Asset Management
**Key Attributes**:
- `facility_id` (Primary Key)
- `school_id` (Foreign Key)
- `name` (Facility name: Classroom, Lab, Library, etc.)
- `type` (Facility category)
- `capacity` (Maximum occupancy)
- `location` (Building and room number)
- `equipment_list` (Associated equipment)
- `maintenance_schedule` (Regular maintenance)
- `status` (Active/Under Maintenance/Out of Service)

**Relationships**:
- Many-to-One: School
- One-to-Many: Maintenance Records, Equipment
- Many-to-Many: Classes (facility bookings)

### 1.8 Academic Year
**Purpose**: Academic calendar and year management
**Module**: Academic Management
**Key Attributes**:
- `academic_year_id` (Primary Key)
- `school_id` (Foreign Key)
- `year_name` (e.g., "2024-2025")
- `start_date`, `end_date` (Academic year period)
- `term_structure` (Number of terms/semesters)
- `holiday_calendar` (School holidays)
- `status` (Planning/Active/Completed)

**Relationships**:
- Many-to-One: School
- One-to-Many: Terms, Holidays, Academic Events

---

## 2. Academic Management Entities

### 2.1 Student
**Purpose**: Complete student profile and academic record management
**Module**: Student Management
**Key Attributes**:
- `student_id` (Primary Key)
- `school_id` (Foreign Key)
- `admission_number` (Unique student identifier)
- `first_name`, `last_name`, `date_of_birth`
- `gender`, `nationality`, `religion`
- `address`, `phone`, `email`
- `parent_id` (Foreign Key)
- `current_class_id` (Foreign Key)
- `admission_date`, `expected_graduation`
- `status` (Active/Alumni/Transferred/Withdrawn)

**Relationships**:
- Many-to-One: School, Parent, Current Class
- One-to-Many: Enrollments, Attendance Records, Grades
- One-to-Many: Medical Records, Disciplinary Records
- One-to-One: Student Documents

### 2.2 Staff
**Purpose**: Teaching and non-teaching personnel management
**Module**: Staff & HR Management
**Key Attributes**:
- `staff_id` (Primary Key)
- `school_id` (Foreign Key)
- `employee_id` (Unique identifier)
- `first_name`, `last_name`, `date_of_birth`
- `designation` (Teacher, Admin, Support Staff)
- `department` (Academic/Administrative/Support)
- `qualification` (Education and certifications)
- `joining_date`, `contract_end_date`
- `salary_grade`, `basic_salary`
- `status` (Active/Inactive/Terminated)

**Relationships**:
- Many-to-One: School, Department
- One-to-Many: Qualifications, Performance Reviews
- One-to-Many: Teaching Assignments, Leave Records
- Many-to-Many: Subjects (teaching assignments)

### 2.3 Class
**Purpose**: Academic class/section organization and management
**Module**: Academic Management
**Key Attributes**:
- `class_id` (Primary Key)
- `school_id` (Foreign Key)
- `grade_level` (1-12 or equivalent)
- `section` (A, B, C, etc.)
- `class_teacher_id` (Foreign Key - Staff)
- `capacity` (Maximum students)
- `academic_year_id` (Foreign Key)
- `status` (Active/Completed/Dissolved)

**Relationships**:
- Many-to-One: School, Class Teacher, Academic Year
- One-to-Many: Students, Timetables, Subjects
- Many-to-Many: Facilities (classroom assignments)

### 2.4 Subject
**Purpose**: Curriculum subject definitions and management
**Module**: Academic Management
**Key Attributes**:
- `subject_id` (Primary Key)
- `school_id` (Foreign Key)
- `name` (Subject name)
- `code` (Unique subject code)
- `category` (Core/Elective/Co-curricular)
- `grade_levels` (Applicable grades)
- `credits` (Credit hours)
- `description` (Subject description)
- `is_active` (Status)

**Relationships**:
- Many-to-One: School
- One-to-Many: Curriculum, Teaching Assignments
- Many-to-Many: Classes, Teachers

### 2.5 Curriculum
**Purpose**: Academic curriculum and syllabus management
**Module**: Academic Management
**Key Attributes**:
- `curriculum_id` (Primary Key)
- `school_id` (Foreign Key)
- `subject_id` (Foreign Key)
- `grade_level` (Applicable grade)
- `academic_year_id` (Foreign Key)
- `version` (Curriculum version)
- `approval_date` (When approved)
- `review_date` (Next review date)
- `status` (Draft/Approved/Under Review)

**Relationships**:
- Many-to-One: School, Subject, Academic Year
- One-to-Many: Syllabus Topics, Learning Objectives
- One-to-Many: Assessment Criteria

### 2.6 Timetable
**Purpose**: Class scheduling and resource allocation
**Module**: Timetable & Scheduling
**Key Attributes**:
- `timetable_id` (Primary Key)
- `school_id` (Foreign Key)
- `class_id` (Foreign Key)
- `academic_year_id` (Foreign Key)
- `day_of_week` (Monday-Sunday)
- `period_number` (1st period, 2nd period, etc.)
- `start_time`, `end_time` (Period timing)
- `subject_id` (Foreign Key)
- `teacher_id` (Foreign Key)
- `classroom_id` (Foreign Key)

**Relationships**:
- Many-to-One: School, Class, Subject, Teacher, Classroom
- One-to-One: Facility Booking

### 2.7 Enrollment
**Purpose**: Student enrollment in classes and subjects
**Module**: Academic Management
**Key Attributes**:
- `enrollment_id` (Primary Key)
- `student_id` (Foreign Key)
- `class_id` (Foreign Key)
- `subject_id` (Foreign Key)
- `academic_year_id` (Foreign Key)
- `enrollment_date` (When enrolled)
- `status` (Active/Completed/Dropped)
- `grade` (Final grade if completed)

**Relationships**:
- Many-to-One: Student, Class, Subject, Academic Year
- One-to-Many: Attendance Records, Grades

---

## 3. Operational Management Entities

### 3.1 Attendance
**Purpose**: Student and staff attendance tracking
**Module**: Attendance Management
**Key Attributes**:
- `attendance_id` (Primary Key)
- `student_id` (Foreign Key)
- `date` (Attendance date)
- `status` (Present/Absent/Late)
- `check_in_time`, `check_out_time`
- `method` (Manual/Biometric/RFID/Mobile)
- `device_id` (Biometric device used)
- `marked_by` (User who marked attendance)
- `remarks` (Additional notes)

**Relationships**:
- Many-to-One: Student, Attendance Method, Biometric Device
- One-to-One: Daily Attendance Record

### 3.2 Examination
**Purpose**: Test and assessment management
**Module**: Examination & Assessment
**Key Attributes**:
- `exam_id` (Primary Key)
- `school_id` (Foreign Key)
- `subject_id` (Foreign Key)
- `exam_type` (Unit Test/Term Exam/Final Exam)
- `exam_date`, `start_time`, `duration`
- `total_marks`, `passing_marks`
- `class_id` (Foreign Key)
- `academic_year_id` (Foreign Key)
- `status` (Scheduled/Ongoing/Completed/Cancelled)

**Relationships**:
- Many-to-One: School, Subject, Class, Academic Year
- One-to-Many: Exam Results, Exam Schedules
- One-to-One: Question Paper, Answer Sheets

### 3.3 Exam Result
**Purpose**: Student examination results and grading
**Module**: Examination & Assessment
**Key Attributes**:
- `result_id` (Primary Key)
- `exam_id` (Foreign Key)
- `student_id` (Foreign Key)
- `marks_obtained` (Numerical score)
- `grade` (Letter grade: A, B, C, etc.)
- `percentage` (Percentage score)
- `remarks` (Teacher comments)
- `graded_by` (Teacher who graded)
- `graded_date` (When graded)
- `status` (Draft/Final/Published)

**Relationships**:
- Many-to-One: Exam, Student
- One-to-One: Grade Scale Mapping

### 3.4 Fee Structure
**Purpose**: Fee configuration and management
**Module**: Fee Management
**Key Attributes**:
- `fee_id` (Primary Key)
- `school_id` (Foreign Key)
- `name` (Fee name: Tuition, Transport, Hostel)
- `type` (Academic/Transport/Hostel/Other)
- `amount` (Fee amount)
- `frequency` (Monthly/Quarterly/Yearly/One-time)
- `grade_level` (Applicable grade)
- `academic_year_id` (Foreign Key)
- `is_mandatory` (Required or optional)
- `due_date` (Payment deadline)

**Relationships**:
- Many-to-One: School, Academic Year
- One-to-Many: Fee Payments, Fee Discounts
- Many-to-Many: Students (through assignments)

### 3.5 Fee Payment
**Purpose**: Payment transaction and history tracking
**Module**: Fee Management
**Key Attributes**:
- `payment_id` (Primary Key)
- `student_id` (Foreign Key)
- `fee_id` (Foreign Key)
- `amount` (Payment amount)
- `payment_date` (When paid)
- `payment_method` (Cash/Card/Online Transfer)
- `transaction_id` (Payment gateway reference)
- `status` (Pending/Completed/Failed/Refunded)
- `receipt_number` (Unique receipt identifier)

**Relationships**:
- Many-to-One: Student, Fee Structure, Payment Method
- One-to-One: Payment Gateway Transaction

### 3.6 Leave Request
**Purpose**: Student and staff leave management
**Module**: Attendance Management, Staff & HR Management
**Key Attributes**:
- `leave_id` (Primary Key)
- `requester_id` (Foreign Key - Student or Staff)
- `requester_type` (Student/Staff)
- `leave_type` (Casual/Medical/Emergency/Annual)
- `start_date`, `end_date` (Leave period)
- `reason` (Leave justification)
- `status` (Pending/Approved/Rejected)
- `approved_by` (Approver user ID)
- `approved_date` (Approval timestamp)

**Relationships**:
- Many-to-One: Student or Staff, Approver
- One-to-Many: Leave Documents, Approval History

---

## 4. Support Services Entities

### 4.1 Library
**Purpose**: Library management and book circulation
**Module**: Library Management
**Key Attributes**:
- `library_id` (Primary Key)
- `school_id` (Foreign Key)
- `name` (Library name)
- `location` (Building and floor)
- `capacity` (Seating capacity)
- `operating_hours` (Open hours)
- `librarian_id` (Foreign Key - Staff)
- `total_books` (Collection size)
- `status` (Active/Under Maintenance)

**Relationships**:
- Many-to-One: School, Librarian
- One-to-Many: Books, Book Loans, Library Members

### 4.2 Book
**Purpose**: Book catalog and inventory management
**Module**: Library Management
**Key Attributes**:
- `book_id` (Primary Key)
- `library_id` (Foreign Key)
- `title` (Book title)
- `author` (Author name)
- `isbn` (International Standard Book Number)
- `publisher`, `publication_year`
- `category` (Fiction/Non-fiction/Academic/Reference)
- `language` (Book language)
- `pages` (Number of pages)
- `price` (Book cost)
- `status` (Available/Checked Out/Lost/Damaged)

**Relationships**:
- Many-to-One: Library
- One-to-Many: Book Copies, Book Loans
- Many-to-Many: Subjects (curriculum alignment)

### 4.3 Book Copy
**Purpose**: Individual book copy tracking
**Module**: Library Management
**Key Attributes**:
- `copy_id` (Primary Key)
- `book_id` (Foreign Key)
- `copy_number` (Unique copy identifier)
- `barcode` (Scanning barcode)
- `condition` (New/Good/Fair/Poor)
- `acquisition_date` (When acquired)
- `location` (Shelf location)
- `status` (Available/Checked Out/Reserved/Lost)

**Relationships**:
- Many-to-One: Book
- One-to-Many: Book Loans, Reservations

### 4.4 Book Loan
**Purpose**: Book borrowing and return tracking
**Module**: Library Management
**Key Attributes**:
- `loan_id` (Primary Key)
- `copy_id` (Foreign Key)
- `borrower_id` (Foreign Key - Student/Staff)
- `borrower_type` (Student/Staff)
- `loan_date` (When borrowed)
- `due_date` (Expected return date)
- `return_date` (Actual return date)
- `status` (Active/Overdue/Returned)
- `fine_amount` (Overdue fine if applicable)

**Relationships**:
- Many-to-One: Book Copy, Borrower
- One-to-One: Fine Record

### 4.5 Transportation
**Purpose**: School bus and transportation management
**Module**: Transportation Management
**Key Attributes**:
- `transport_id` (Primary Key)
- `school_id` (Foreign Key)
- `route_name` (Route identifier)
- `vehicle_id` (Foreign Key)
- `driver_id` (Foreign Key - Staff)
- `capacity` (Passenger capacity)
- `route_distance` (Total route distance)
- `estimated_duration` (Travel time)
- `status` (Active/Inactive/Maintenance)

**Relationships**:
- Many-to-One: School, Vehicle, Driver
- One-to-Many: Route Stops, Student Assignments
- One-to-One: GPS Tracking Device

### 4.6 Vehicle
**Purpose**: Fleet management and vehicle tracking
**Module**: Transportation Management
**Key Attributes**:
- `vehicle_id` (Primary Key)
- `school_id` (Foreign Key)
- `registration_number` (Vehicle registration)
- `model`, `make`, `year` (Vehicle details)
- `capacity` (Seating capacity)
- `fuel_type` (Petrol/Diesel/Electric)
- `gps_device_id` (Tracking device)
- `insurance_expiry` (Insurance validity)
- `status` (Active/Maintenance/Out of Service)

**Relationships**:
- Many-to-One: School
- One-to-Many: Routes, Maintenance Records
- One-to-One: GPS Device, Insurance Policy

### 4.7 Hostel
**Purpose**: Residential facility management
**Module**: Hostel/Dormitory Management
**Key Attributes**:
- `hostel_id` (Primary Key)
- `school_id` (Foreign Key)
- `name` (Hostel name)
- `type` (Boys/Girls/Mixed)
- `capacity` (Total capacity)
- `warden_id` (Foreign Key - Staff)
- `address` (Hostel location)
- `facilities` (Amenities list)
- `status` (Active/Under Maintenance)

**Relationships**:
- Many-to-One: School, Warden
- One-to-Many: Rooms, Residents, Facilities
- One-to-One: Hostel Rules, Emergency Procedures

### 4.8 Room
**Purpose**: Individual room management in hostels
**Module**: Hostel/Dormitory Management
**Key Attributes**:
- `room_id` (Primary Key)
- `hostel_id` (Foreign Key)
- `room_number` (Room identifier)
- `floor` (Floor number)
- `capacity` (Maximum occupants)
- `occupants` (Current occupants)
- `facilities` (Room amenities)
- `condition` (Room condition status)
- `status` (Available/Occupied/Under Maintenance)

**Relationships**:
- Many-to-One: Hostel
- One-to-Many: Beds, Residents, Maintenance Records
- Many-to-Many: Facilities

---

## 5. Digital Learning Entities

### 5.1 Virtual Classroom
**Purpose**: Online learning environment management
**Module**: Online Learning & Digital Classroom
**Key Attributes**:
- `classroom_id` (Primary Key)
- `school_id` (Foreign Key)
- `name` (Classroom name)
- `subject_id` (Foreign Key)
- `teacher_id` (Foreign Key)
- `capacity` (Maximum participants)
- `start_time`, `duration`
- `meeting_link` (Video conference link)
- `recording_url` (Session recording)
- `status` (Scheduled/Ongoing/Completed/Cancelled)

**Relationships**:
- Many-to-One: School, Subject, Teacher
- One-to-Many: Participants, Sessions, Recordings
- One-to-One: Meeting Configuration

### 5.2 Digital Content
**Purpose**: Educational content and resource management
**Module**: Online Learning & Digital Classroom
**Key Attributes**:
- `content_id` (Primary Key)
- `school_id` (Foreign Key)
- `title` (Content title)
- `type` (Video/Presentation/Document/Quiz)
- `subject_id` (Foreign Key)
- `grade_level` (Applicable grade)
- `file_path` (Storage location)
- `file_size` (Content size)
- `duration` (For videos/audio)
- `upload_date`, `uploaded_by`
- `status` (Draft/Published/Archived)

**Relationships**:
- Many-to-One: School, Subject, Uploader
- One-to-Many: Content Versions, Access Logs
- Many-to-Many: Classes (content assignments)

### 5.3 Assignment
**Purpose**: Digital assignment creation and management
**Module**: Online Learning & Digital Classroom
**Key Attributes**:
- `assignment_id` (Primary Key)
- `school_id` (Foreign Key)
- `title` (Assignment title)
- `description` (Detailed instructions)
- `subject_id` (Foreign Key)
- `class_id` (Foreign Key)
- `created_by` (Foreign Key - Teacher)
- `due_date` (Submission deadline)
- `total_marks` (Maximum marks)
- `submission_type` (File/Text/Online)
- `status` (Draft/Published/Closed)

**Relationships**:
- Many-to-One: School, Subject, Class, Creator
- One-to-Many: Submissions, Assignment Files
- One-to-One: Grading Rubric

### 5.4 Submission
**Purpose**: Student assignment submission tracking
**Module**: Online Learning & Digital Classroom
**Key Attributes**:
- `submission_id` (Primary Key)
- `assignment_id` (Foreign Key)
- `student_id` (Foreign Key)
- `submission_date` (When submitted)
- `file_path` (Submitted file location)
- `content` (Text submission if applicable)
- `status` (Submitted/Graded/Late)
- `marks_obtained` (Graded marks)
- `feedback` (Teacher feedback)
- `graded_by` (Foreign Key - Teacher)
- `graded_date` (Grading timestamp)

**Relationships**:
- Many-to-One: Assignment, Student, Grader
- One-to-Many: Submission Files, Feedback History

### 5.5 Communication
**Purpose**: Multi-channel communication management
**Module**: Communication & Notification
**Key Attributes**:
- `communication_id` (Primary Key)
- `school_id` (Foreign Key)
- `sender_id` (Foreign Key - User)
- `subject` (Message subject)
- `content` (Message body)
- `type` (Email/SMS/Push/Announcement)
- `priority` (Low/Medium/High/Urgent)
- `send_date` (When sent)
- `status` (Draft/Sent/Delivered/Read)

**Relationships**:
- Many-to-One: School, Sender
- One-to-Many: Recipients, Attachments
- One-to-One: Delivery Report

### 5.6 Message
**Purpose**: Individual message and conversation tracking
**Module**: Communication & Notification
**Key Attributes**:
- `message_id` (Primary Key)
- `communication_id` (Foreign Key)
- `recipient_id` (Foreign Key - User)
- `recipient_type` (To/CC/BCC)
- `delivery_status` (Sent/Delivered/Read/Failed)
- `delivery_date` (When delivered)
- `read_date` (When read)
- `response` (Reply content if applicable)

**Relationships**:
- Many-to-One: Communication, Recipient
- One-to-Many: Message Threads, Responses

---

## 6. Administrative Entities

### 6.1 Report
**Purpose**: System reporting and analytics management
**Module**: Reports & Analytics
**Key Attributes**:
- `report_id` (Primary Key)
- `school_id` (Foreign Key)
- `name` (Report name)
- `type` (Academic/Financial/Operational/Compliance)
- `description` (Report purpose)
- `query_definition` (Report logic)
- `parameters` (Report filters)
- `schedule` (Automated schedule)
- `created_by` (Foreign Key - User)
- `status` (Active/Inactive/Draft)

**Relationships**:
- Many-to-One: School, Creator
- One-to-Many: Report Executions, Recipients
- Many-to-Many: Data Sources

### 6.2 Dashboard
**Purpose**: Real-time monitoring and visualization
**Module**: Reports & Analytics
**Key Attributes**:
- `dashboard_id` (Primary Key)
- `school_id` (Foreign Key)
- `name` (Dashboard name)
- `description` (Dashboard purpose)
- `layout` (Widget arrangement)
- `user_id` (Foreign Key - Owner)
- `is_public` (Visibility setting)
- `refresh_interval` (Auto-refresh frequency)
- `status` (Active/Inactive)

**Relationships**:
- Many-to-One: School, Owner
- One-to-Many: Dashboard Widgets, User Access
- Many-to-Many: Data Sources

### 6.3 Backup
**Purpose**: Data backup and disaster recovery management
**Module**: Security & Compliance
**Key Attributes**:
- `backup_id` (Primary Key)
- `school_id` (Foreign Key)
- `backup_type` (Full/Incremental/Differential)
- `schedule` (Backup frequency)
- `retention_period` (How long to keep)
- `storage_location` (Where stored)
- `encryption_key` (Backup encryption)
- `status` (Scheduled/Running/Completed/Failed)
- `size` (Backup size)
- `created_date` (When created)

**Relationships**:
- Many-to-One: School
- One-to-Many: Backup Logs, Restore Operations
- One-to-One: Encryption Key

### 6.4 Incident
**Purpose**: Security and operational incident tracking
**Module**: Security & Compliance
**Key Attributes**:
- `incident_id` (Primary Key)
- `school_id` (Foreign Key)
- `title` (Incident title)
- `description` (Incident details)
- `type` (Security/Operational/Compliance)
- `severity` (Low/Medium/High/Critical)
- `status` (Open/Investigating/Resolved/Closed)
- `reported_by` (Foreign Key - User)
- `reported_date` (When reported)
- `resolved_date` (When resolved)
- `assigned_to` (Foreign Key - User)

**Relationships**:
- Many-to-One: School, Reporter, Assignee
- One-to-Many: Incident Logs, Evidence Files
- One-to-One: Incident Response Plan

### 6.5 API Endpoint
**Purpose**: API management and monitoring
**Module**: Integration Capabilities
**Key Attributes**:
- `endpoint_id` (Primary Key)
- `name` (Endpoint name)
- `path` (API path)
- `method` (GET/POST/PUT/DELETE)
- `version` (API version)
- `authentication_required` (Boolean)
- `rate_limit` (Requests per minute)
- `status` (Active/Deprecated/Retired)
- `documentation_url` (API docs link)

**Relationships**:
- One-to-Many: API Logs, API Keys
- Many-to-Many: User Permissions

### 6.6 Webhook
**Purpose**: Real-time data synchronization and notifications
**Module**: Integration Capabilities
**Key Attributes**:
- `webhook_id` (Primary Key)
- `name` (Webhook name)
- `url` (Callback URL)
- `event_type` (Trigger event)
- `secret` (Webhook secret for verification)
- `is_active` (Status)
- `retry_policy` (Retry configuration)
- `created_date` (When created)

**Relationships**:
- One-to-Many: Webhook Logs, Delivery Attempts
- Many-to-One: API Endpoint

---

## 7. Security & Compliance Entities

### 7.1 Access Log
**Purpose**: User access and authentication tracking
**Module**: Security & Compliance
**Key Attributes**:
- `access_id` (Primary Key)
- `user_id` (Foreign Key)
- `resource` (What was accessed)
- `action` (View/Create/Update/Delete)
- `ip_address` (Access source)
- `user_agent` (Device/browser info)
- `timestamp` (When accessed)
- `success` (Boolean - success/failure)
- `failure_reason` (If failed)

**Relationships**:
- Many-to-One: User
- One-to-One: Security Event (if triggered)

### 7.2 Security Event
**Purpose**: Security incident and threat tracking
**Module**: Security & Compliance
**Key Attributes**:
- `event_id` (Primary Key)
- `school_id` (Foreign Key)
- `type` (Brute Force/Unauthorized Access/Suspicious Activity)
- `severity` (Low/Medium/High/Critical)
- `description` (Event details)
- `source_ip` (Origin IP)
- `user_agent` (Device info)
- `timestamp` (When occurred)
- `status` (Detected/Investigating/Resolved)

**Relationships**:
- Many-to-One: School
- One-to-Many: Investigation Logs, Response Actions
- Many-to-One: Access Log (trigger source)

### 7.3 Compliance Requirement
**Purpose**: Regulatory compliance tracking
**Module**: Security & Compliance
**Key Attributes**:
- `requirement_id` (Primary Key)
- `school_id` (Foreign Key)
- `regulation` (GDPR/HIPAA/ISO27001/etc.)
- `requirement_text` (Compliance requirement)
- `category` (Data Privacy/Security/Operations)
- `due_date` (Compliance deadline)
- `status` (Compliant/Non-Compliant/Under Review)
- `last_assessment` (Last compliance check)
- `next_review` (Next assessment date)

**Relationships**:
- Many-to-One: School
- One-to-Many: Compliance Checks, Remediation Actions
- Many-to-One: Compliance Framework

---

## Entity Relationship Summary

### Total Entities by Module:
- **Multi-School Architecture**: 8 entities
- **User Management & Authentication**: 5 entities
- **Student Management**: 8 entities
- **Academic Management**: 7 entities
- **Attendance Management**: 4 entities
- **Examination & Assessment**: 4 entities
- **Fee Management**: 3 entities
- **Timetable & Scheduling**: 3 entities
- **Communication & Notification**: 3 entities
- **Library Management**: 4 entities
- **Transportation Management**: 3 entities
- **Hostel/Dormitory Management**: 3 entities
- **Staff & HR Management**: 5 entities
- **Inventory & Asset Management**: 2 entities
- **Reports & Analytics**: 3 entities
- **Parent Portal**: 2 entities
- **Student Portal**: 2 entities
- **Online Learning & Digital Classroom**: 5 entities
- **Security & Compliance**: 6 entities
- **Integration Capabilities**: 2 entities
- **Mobile Applications**: 1 entity

### Key Relationships:
- **School** is the central entity connecting most modules
- **User** provides role-based access across all entities
- **Student** and **Staff** are core operational entities
- **Audit Log** and **Access Log** provide compliance tracking
- **Communication** enables cross-entity notifications

### Database Design Considerations:
- **Multi-tenant architecture** with school_id foreign keys
- **Soft deletes** for data retention compliance
- **Audit trails** on all critical entities
- **Indexing strategy** for performance optimization
- **Data partitioning** for large datasets

This comprehensive entity list provides the foundation for the Academia Pro database schema, supporting all 21 modules with proper relationships and data integrity constraints.