# Academia Pro - Detailed API Endpoint Specifications

## Overview
This document provides comprehensive API endpoint specifications for Academia Pro based on the selected technology stack:
- **Backend**: Nest.js with TypeScript
- **Database**: PostgreSQL with advanced features
- **Authentication**: OAuth 2.0 + JWT
- **API Gateway**: AWS API Gateway
- **Documentation**: OpenAPI 3.0 with Swagger

## API Base Configuration

### **Base URLs**
```typescript
// Production
const API_BASE_URL = 'https://api.academia-pro.com/v2';

// Staging
const API_STAGING_URL = 'https://staging-api.academia-pro.com/v2';

// Development
const API_DEV_URL = 'http://localhost:3000/api/v2';
```

### **Common Headers**
```typescript
const COMMON_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'Accept-Version': 'v2', // For header versioning
  'Authorization': 'Bearer {jwt_token}',
  'X-API-Key': '{api_key}', // For server-to-server calls
  'X-School-ID': '{school_id}', // Multi-tenant header
  'X-Request-ID': '{uuid}', // For request tracing
};
```

### **Rate Limiting**
```typescript
const RATE_LIMITS = {
  authenticated_user: {
    requests_per_minute: 1000,
    burst_limit: 100,
  },
  anonymous_user: {
    requests_per_minute: 100,
    burst_limit: 10,
  },
  api_client: {
    requests_per_hour: 10000,
    burst_limit: 1000,
  },
};
```

---

## 1. Authentication & Authorization Endpoints

### **POST /auth/login**
User authentication endpoint

**Request:**
```typescript
interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
  device_info?: {
    fingerprint: string;
    user_agent: string;
    ip_address: string;
  };
}
```

**Response:**
```typescript
interface LoginResponse {
  access_token: string; // JWT token
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number; // seconds
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    school_id: string;
    permissions: string[];
  };
  mfa_required?: boolean;
  mfa_token?: string;
}
```

**Error Responses:**
- `400 Bad Request` - Invalid credentials
- `401 Unauthorized` - Account disabled or MFA required
- `429 Too Many Requests` - Rate limit exceeded

### **POST /auth/refresh**
Refresh access token

**Request:**
```typescript
interface RefreshTokenRequest {
  refresh_token: string;
  grant_type: 'refresh_token';
}
```

**Response:**
```typescript
interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
}
```

### **POST /auth/logout**
User logout

**Request:**
```typescript
interface LogoutRequest {
  refresh_token?: string; // Optional for token revocation
}
```

**Response:**
```typescript
interface LogoutResponse {
  message: string;
  success: boolean;
}
```

### **POST /auth/mfa/verify**
Multi-factor authentication verification

**Request:**
```typescript
interface MFAVerifyRequest {
  mfa_token: string;
  code: string;
  method: 'sms' | 'email' | 'authenticator';
}
```

**Response:**
```typescript
interface MFAVerifyResponse {
  access_token: string;
  refresh_token: string;
  user: UserProfile;
}
```

### **POST /auth/forgot-password**
Initiate password reset

**Request:**
```typescript
interface ForgotPasswordRequest {
  email: string;
}
```

**Response:**
```typescript
interface ForgotPasswordResponse {
  message: string;
  reset_token_expires_in: number;
}
```

### **POST /auth/reset-password**
Reset password with token

**Request:**
```typescript
interface ResetPasswordRequest {
  reset_token: string;
  new_password: string;
  confirm_password: string;
}
```

**Response:**
```typescript
interface ResetPasswordResponse {
  message: string;
  success: boolean;
}
```

---

## 2. User Management Endpoints

### **GET /users/profile**
Get current user profile

**Response:**
```typescript
interface UserProfileResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
  avatar_url?: string;
  role: UserRole;
  school_id: string;
  department?: string;
  employee_id?: string;
  student_id?: string;
  preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: NotificationPreferences;
  };
  last_login: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### **PUT /users/profile**
Update user profile

**Request:**
```typescript
interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    language?: string;
    notifications?: NotificationPreferences;
  };
}
```

### **POST /users/change-password**
Change user password

**Request:**
```typescript
interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}
```

### **GET /users/{user_id}**
Get user by ID (Admin only)

**Path Parameters:**
- `user_id` (string, required) - User ID

**Response:** `UserProfileResponse`

### **PUT /users/{user_id}**
Update user (Admin only)

**Path Parameters:**
- `user_id` (string, required) - User ID

**Request:** `UpdateProfileRequest`

### **DELETE /users/{user_id}**
Deactivate user (Admin only)

**Path Parameters:**
- `user_id` (string, required) - User ID

### **GET /users**
List users with filtering (Admin only)

**Query Parameters:**
- `role` (string, optional) - Filter by role
- `school_id` (string, optional) - Filter by school
- `is_active` (boolean, optional) - Filter by active status
- `search` (string, optional) - Search by name or email
- `page` (number, optional) - Page number (default: 1)
- `limit` (number, optional) - Items per page (default: 20)

**Response:**
```typescript
interface UsersListResponse {
  users: UserProfileResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

---

## 3. School Management Endpoints

### **GET /schools**
List schools (Super Admin only)

**Query Parameters:**
- `status` (string, optional) - active, inactive, suspended
- `search` (string, optional) - Search by name
- `page` (number, optional) - Page number
- `limit` (number, optional) - Items per page

**Response:**
```typescript
interface SchoolsListResponse {
  schools: SchoolSummary[];
  pagination: PaginationInfo;
}

interface SchoolSummary {
  id: string;
  name: string;
  code: string;
  address: Address;
  contact_info: ContactInfo;
  status: 'active' | 'inactive' | 'suspended';
  total_students: number;
  total_staff: number;
  created_at: string;
}
```

### **POST /schools**
Create new school (Super Admin only)

**Request:**
```typescript
interface CreateSchoolRequest {
  name: string;
  code: string; // Unique school code
  address: Address;
  contact_info: ContactInfo;
  settings: SchoolSettings;
  admin_user: {
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
  };
}
```

### **GET /schools/{school_id}**
Get school details

**Path Parameters:**
- `school_id` (string, required) - School ID

**Response:**
```typescript
interface SchoolDetailsResponse {
  id: string;
  name: string;
  code: string;
  address: Address;
  contact_info: ContactInfo;
  settings: SchoolSettings;
  statistics: {
    total_students: number;
    total_staff: number;
    total_classes: number;
    active_modules: string[];
  };
  created_at: string;
  updated_at: string;
}
```

### **PUT /schools/{school_id}**
Update school (Admin only)

**Path Parameters:**
- `school_id` (string, required) - School ID

**Request:**
```typescript
interface UpdateSchoolRequest {
  name?: string;
  address?: Address;
  contact_info?: ContactInfo;
  settings?: Partial<SchoolSettings>;
}
```

### **DELETE /schools/{school_id}**
Deactivate school (Super Admin only)

---

## 4. Student Management Endpoints

### **GET /students**
List students with filtering

**Query Parameters:**
- `grade_id` (string, optional) - Filter by grade
- `class_id` (string, optional) - Filter by class
- `status` (string, optional) - active, inactive, graduated, transferred
- `search` (string, optional) - Search by name or ID
- `page` (number, optional) - Page number
- `limit` (number, optional) - Items per page

**Response:**
```typescript
interface StudentsListResponse {
  students: StudentSummary[];
  pagination: PaginationInfo;
}

interface StudentSummary {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  grade_name: string;
  class_name: string;
  status: StudentStatus;
  avatar_url?: string;
}
```

### **POST /students**
Enroll new student

**Request:**
```typescript
interface CreateStudentRequest {
  student_id: string; // Unique student ID
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  address: Address;
  contact_info: ContactInfo;
  emergency_contacts: EmergencyContact[];
  medical_info?: MedicalInfo;
  enrollment_info: {
    grade_id: string;
    class_id: string;
    enrollment_date: string;
    academic_year: string;
  };
  documents: StudentDocument[];
}
```

### **GET /students/{student_id}**
Get student details

**Path Parameters:**
- `student_id` (string, required) - Student ID

**Response:**
```typescript
interface StudentDetailsResponse {
  id: string;
  student_id: string;
  personal_info: PersonalInfo;
  academic_info: AcademicInfo;
  contact_info: ContactInfo;
  emergency_contacts: EmergencyContact[];
  medical_info?: MedicalInfo;
  documents: StudentDocument[];
  enrollment_history: EnrollmentRecord[];
  achievements: Achievement[];
  disciplinary_records: DisciplinaryRecord[];
  created_at: string;
  updated_at: string;
}
```

### **PUT /students/{student_id}**
Update student information

**Path Parameters:**
- `student_id` (string, required) - Student ID

**Request:**
```typescript
interface UpdateStudentRequest {
  personal_info?: Partial<PersonalInfo>;
  contact_info?: Partial<ContactInfo>;
  medical_info?: Partial<MedicalInfo>;
  academic_info?: Partial<AcademicInfo>;
}
```

### **POST /students/{student_id}/transfer**
Transfer student to another class/grade

**Path Parameters:**
- `student_id` (string, required) - Student ID

**Request:**
```typescript
interface TransferStudentRequest {
  target_grade_id: string;
  target_class_id: string;
  transfer_date: string;
  reason: string;
  transfer_type: 'promotion' | 'demotion' | 'lateral' | 'external';
  documents?: TransferDocument[];
}
```

### **POST /students/{student_id}/withdraw**
Withdraw student from school

**Path Parameters:**
- `student_id` (string, required) - Student ID

**Request:**
```typescript
interface WithdrawStudentRequest {
  withdrawal_date: string;
  reason: string;
  withdrawal_type: 'voluntary' | 'expulsion' | 'transfer' | 'graduation';
  final_grade?: string;
  transcript_issued: boolean;
  documents?: WithdrawalDocument[];
}
```

---

## 5. Academic Management Endpoints

### **GET /academic/curriculum**
Get curriculum structure

**Query Parameters:**
- `grade_id` (string, optional) - Filter by grade
- `subject_id` (string, optional) - Filter by subject

**Response:**
```typescript
interface CurriculumResponse {
  curriculum: CurriculumStructure[];
  subjects: Subject[];
  grades: Grade[];
}

interface CurriculumStructure {
  id: string;
  grade_id: string;
  subject_id: string;
  topics: CurriculumTopic[];
  learning_objectives: LearningObjective[];
  assessment_methods: AssessmentMethod[];
}
```

### **POST /academic/classes**
Create new class

**Request:**
```typescript
interface CreateClassRequest {
  class_name: string;
  grade_id: string;
  section: string;
  academic_year: string;
  capacity: number;
  class_teacher_id?: string;
  room_id?: string;
  schedule: ClassSchedule[];
}
```

### **GET /academic/classes/{class_id}/students**
Get students in a class

**Path Parameters:**
- `class_id` (string, required) - Class ID

**Response:**
```typescript
interface ClassStudentsResponse {
  class_info: ClassInfo;
  students: StudentSummary[];
  total_students: number;
}
```

### **POST /academic/subjects**
Create new subject

**Request:**
```typescript
interface CreateSubjectRequest {
  subject_name: string;
  subject_code: string;
  description: string;
  category: SubjectCategory;
  grade_levels: string[]; // Array of grade IDs
  credit_hours: number;
  prerequisites?: string[]; // Array of subject IDs
  syllabus?: SyllabusDocument;
}
```

### **PUT /academic/teacher-assignments**
Assign teacher to subject/class

**Request:**
```typescript
interface AssignTeacherRequest {
  teacher_id: string;
  subject_id: string;
  class_id: string;
  assignment_type: 'primary' | 'secondary' | 'substitute';
  start_date: string;
  end_date?: string;
}
```

---

## 6. Attendance Management Endpoints

### **POST /attendance/mark**
Mark attendance for student/class

**Request:**
```typescript
interface MarkAttendanceRequest {
  student_id?: string; // For individual student
  class_id?: string;   // For entire class
  attendance_date: string;
  attendance_records: AttendanceRecord[];
  marked_by: string;
  device_info?: DeviceInfo;
}

interface AttendanceRecord {
  student_id: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in_time?: string;
  check_out_time?: string;
  remarks?: string;
}
```

### **GET /attendance/student/{student_id}**
Get student attendance history

**Path Parameters:**
- `student_id` (string, required) - Student ID

**Query Parameters:**
- `start_date` (string, optional) - Start date (YYYY-MM-DD)
- `end_date` (string, optional) - End date (YYYY-MM-DD)
- `subject_id` (string, optional) - Filter by subject

**Response:**
```typescript
interface StudentAttendanceResponse {
  student_info: StudentSummary;
  attendance_records: AttendanceRecord[];
  summary: {
    total_days: number;
    present_days: number;
    absent_days: number;
    late_days: number;
    excused_days: number;
    attendance_percentage: number;
  };
}
```

### **GET /attendance/class/{class_id}/summary**
Get class attendance summary

**Path Parameters:**
- `class_id` (string, required) - Class ID

**Query Parameters:**
- `date` (string, optional) - Specific date (YYYY-MM-DD)
- `month` (string, optional) - Month (YYYY-MM)

**Response:**
```typescript
interface ClassAttendanceSummaryResponse {
  class_info: ClassInfo;
  date: string;
  total_students: number;
  present_count: number;
  absent_count: number;
  late_count: number;
  attendance_percentage: number;
  attendance_records: AttendanceRecord[];
}
```

### **POST /attendance/leave-request**
Submit leave request

**Request:**
```typescript
interface LeaveRequest {
  student_id: string;
  leave_type: 'casual' | 'medical' | 'emergency';
  start_date: string;
  end_date: string;
  reason: string;
  supporting_documents?: File[];
  emergency_contact?: ContactInfo;
}
```

### **PUT /attendance/leave-request/{request_id}/approve**
Approve/reject leave request (Teacher/Admin only)

**Path Parameters:**
- `request_id` (string, required) - Leave request ID

**Request:**
```typescript
interface ApproveLeaveRequest {
  status: 'approved' | 'rejected';
  approved_by: string;
  comments?: string;
  approved_days?: number; // For partial approval
}
```

---

## 7. Examination & Assessment Endpoints

### **POST /examinations**
Create new examination

**Request:**
```typescript
interface CreateExaminationRequest {
  examination_name: string;
  examination_type: 'unit_test' | 'term_exam' | 'final_exam' | 'entrance';
  academic_year: string;
  grade_ids: string[];
  subject_ids: string[];
  schedule: ExamSchedule[];
  settings: ExamSettings;
}
```

### **GET /examinations/{exam_id}/results**
Get examination results

**Path Parameters:**
- `exam_id` (string, required) - Examination ID

**Query Parameters:**
- `class_id` (string, optional) - Filter by class
- `student_id` (string, optional) - Filter by student

**Response:**
```typescript
interface ExamResultsResponse {
  examination: ExaminationInfo;
  results: ExamResult[];
  statistics: {
    total_students: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
    pass_percentage: number;
    grade_distribution: GradeDistribution;
  };
}
```

### **POST /examinations/{exam_id}/results**
Submit examination results

**Path Parameters:**
- `exam_id` (string, required) - Examination ID

**Request:**
```typescript
interface SubmitExamResultsRequest {
  results: ExamResult[];
  submitted_by: string;
  verification_required: boolean;
}

interface ExamResult {
  student_id: string;
  subject_id: string;
  marks_obtained: number;
  total_marks: number;
  grade: string;
  remarks?: string;
  verified: boolean;
}
```

### **POST /assessments**
Create new assessment

**Request:**
```typescript
interface CreateAssessmentRequest {
  title: string;
  description: string;
  assessment_type: 'quiz' | 'assignment' | 'project' | 'presentation';
  subject_id: string;
  class_ids: string[];
  due_date: string;
  total_marks: number;
  instructions: string;
  attachments?: File[];
  rubric?: AssessmentRubric;
}
```

### **POST /assessments/{assessment_id}/submissions**
Submit assessment

**Path Parameters:**
- `assessment_id` (string, required) - Assessment ID

**Request:**
```typescript
interface SubmitAssessmentRequest {
  student_id: string;
  submission_content: string;
  attachments?: File[];
  submitted_at: string;
}
```

---

## 8. Fee Management Endpoints

### **GET /fees/structure**
Get fee structure

**Query Parameters:**
- `grade_id` (string, optional) - Filter by grade
- `academic_year` (string, optional) - Filter by academic year

**Response:**
```typescript
interface FeeStructureResponse {
  fee_structures: FeeStructure[];
  fee_categories: FeeCategory[];
}

interface FeeStructure {
  id: string;
  grade_id: string;
  academic_year: string;
  fee_components: FeeComponent[];
  total_amount: number;
  installment_plan?: InstallmentPlan;
}
```

### **POST /fees/student/{student_id}/generate**
Generate student fee bill

**Path Parameters:**
- `student_id` (string, required) - Student ID

**Request:**
```typescript
interface GenerateFeeBillRequest {
  academic_year: string;
  grade_id: string;
  fee_structure_id: string;
  discounts?: Discount[];
  scholarships?: Scholarship[];
  payment_plan: 'full' | 'installment';
}
```

### **POST /fees/payments**
Process fee payment

**Request:**
```typescript
interface ProcessPaymentRequest {
  student_id: string;
  fee_bill_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  reference_number?: string;
  remarks?: string;
}

interface PaymentMethod {
  type: 'cash' | 'bank_transfer' | 'online' | 'cheque' | 'card';
  gateway?: string; // For online payments
  transaction_id?: string;
  bank_details?: BankDetails;
}
```

### **GET /fees/payments/student/{student_id}**
Get student payment history

**Path Parameters:**
- `student_id` (string, required) - Student ID

**Response:**
```typescript
interface PaymentHistoryResponse {
  student_info: StudentSummary;
  payments: PaymentRecord[];
  outstanding_balance: number;
  next_due_date?: string;
}
```

### **POST /fees/scholarships**
Create scholarship

**Request:**
```typescript
interface CreateScholarshipRequest {
  scholarship_name: string;
  description: string;
  eligibility_criteria: EligibilityCriteria;
  amount: number;
  amount_type: 'fixed' | 'percentage';
  max_recipients?: number;
  application_deadline: string;
  documents_required: string[];
}
```

---

## 9. Communication & Notification Endpoints

### **POST /communications/messages**
Send message

**Request:**
```typescript
interface SendMessageRequest {
  sender_id: string;
  recipient_ids: string[]; // Individual recipients
  group_ids?: string[];   // Group recipients
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  attachments?: File[];
  channels: CommunicationChannel[];
  scheduled_at?: string; // For scheduled messages
}

interface CommunicationChannel {
  type: 'email' | 'sms' | 'push' | 'in_app';
  enabled: boolean;
}
```

### **GET /communications/messages**
Get message history

**Query Parameters:**
- `sender_id` (string, optional) - Filter by sender
- `recipient_id` (string, optional) - Filter by recipient
- `start_date` (string, optional) - Start date
- `end_date` (string, optional) - End date
- `page` (number, optional) - Page number
- `limit` (number, optional) - Items per page

**Response:**
```typescript
interface MessagesResponse {
  messages: Message[];
  pagination: PaginationInfo;
}

interface Message {
  id: string;
  sender: UserSummary;
  recipients: UserSummary[];
  subject: string;
  message: string;
  priority: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sent_at: string;
  read_at?: string;
  attachments?: File[];
}
```

### **POST /communications/announcements**
Create school announcement

**Request:**
```typescript
interface CreateAnnouncementRequest {
  title: string;
  content: string;
  target_audience: {
    roles?: UserRole[];
    grades?: string[];
    classes?: string[];
    departments?: string[];
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  attachments?: File[];
  publish_immediately: boolean;
  publish_at?: string;
  expiry_date?: string;
}
```

### **POST /communications/emergency-alert**
Send emergency alert

**Request:**
```typescript
interface EmergencyAlertRequest {
  alert_type: 'fire' | 'medical' | 'security' | 'weather' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  affected_areas?: string[];
  instructions: string;
  contact_info: ContactInfo;
  auto_escalate: boolean;
}
```

---

## 10. Library Management Endpoints

### **POST /library/books**
Add new book

**Request:**
```typescript
interface AddBookRequest {
  isbn?: string;
  title: string;
  authors: string[];
  publisher: string;
  publication_year: number;
  edition?: string;
  category: string;
  description?: string;
  language: string;
  pages: number;
  price: number;
  quantity: number;
  location: BookLocation;
  cover_image?: File;
}
```

### **GET /library/books**
Search books

**Query Parameters:**
- `search` (string, optional) - Search term
- `category` (string, optional) - Filter by category
- `author` (string, optional) - Filter by author
- `isbn` (string, optional) - Search by ISBN
- `available_only` (boolean, optional) - Show only available books
- `page` (number, optional) - Page number
- `limit` (number, optional) - Items per page

**Response:**
```typescript
interface BooksSearchResponse {
  books: Book[];
  pagination: PaginationInfo;
}

interface Book {
  id: string;
  isbn?: string;
  title: string;
  authors: string[];
  category: string;
  availability_status: 'available' | 'checked_out' | 'reserved' | 'lost';
  location: BookLocation;
  cover_image_url?: string;
}
```

### **POST /library/circulation/checkout**
Checkout book

**Request:**
```typescript
interface CheckoutBookRequest {
  book_id: string;
  user_id: string;
  checkout_date: string;
  due_date: string;
  notes?: string;
}
```

### **POST /library/circulation/return**
Return book

**Request:**
```typescript
interface ReturnBookRequest {
  book_id: string;
  user_id: string;
  return_date: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'damaged';
  damage_description?: string;
}
```

### **POST /library/reservations**
Reserve book

**Request:**
```typescript
interface ReserveBookRequest {
  book_id: string;
  user_id: string;
  reservation_date: string;
  expiry_date: string;
}
```

---

## 11. Transportation Management Endpoints

### **POST /transportation/routes**
Create transportation route

**Request:**
```typescript
interface CreateRouteRequest {
  route_name: string;
  route_type: 'pickup' | 'drop' | 'both';
  stops: RouteStop[];
  vehicle_assignments: VehicleAssignment[];
  schedule: RouteSchedule;
  capacity: number;
  estimated_duration: number; // in minutes
}
```

### **GET /transportation/routes/{route_id}/tracking**
Get real-time route tracking

**Path Parameters:**
- `route_id` (string, required) - Route ID

**Response:**
```typescript
interface RouteTrackingResponse {
  route_info: RouteInfo;
  current_location: GPSLocation;
  next_stop: RouteStop;
  passengers_onboard: number;
  estimated_arrival: string;
  delay_minutes?: number;
  status: 'on_time' | 'delayed' | 'early';
}
```

### **POST /transportation/emergency**
Report transportation emergency

**Request:**
```typescript
interface TransportationEmergencyRequest {
  route_id: string;
  vehicle_id: string;
  emergency_type: 'accident' | 'medical' | 'mechanical' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: GPSLocation;
  description: string;
  passengers_affected: number;
  contact_info: ContactInfo;
}
```

### **PUT /transportation/student/{student_id}/assignment**
Assign student to transportation route

**Path Parameters:**
- `student_id` (string, required) - Student ID

**Request:**
```typescript
interface AssignStudentTransportRequest {
  route_id: string;
  stop_id: string;
  transport_type: 'pickup' | 'drop' | 'both';
  start_date: string;
  end_date?: string;
  special_requirements?: string;
}
```

---

## 12. GraphQL Endpoints

### **POST /graphql**
GraphQL endpoint for complex queries

**Request:**
```typescript
interface GraphQLRequest {
  query: string;
  variables?: Record<string, any>;
  operationName?: string;
}
```

**Example Queries:**

```graphql
# Get student dashboard data
query GetStudentDashboard($studentId: ID!) {
  student(id: $studentId) {
    id
    name
    currentGrade {
      name
      class {
        name
        teacher {
          name
        }
      }
    }
    attendanceSummary {
      presentDays
      totalDays
      percentage
    }
    upcomingAssignments {
      id
      title
      dueDate
      subject {
        name
      }
    }
    recentGrades {
      subject {
        name
      }
      grade
      date
    }
  }
}

# Get class attendance with student details
query GetClassAttendance($classId: ID!, $date: Date!) {
  classAttendance(classId: $classId, date: $date) {
    class {
      name
      grade {
        name
      }
    }
    date
    records {
      student {
        id
        name
      }
      status
      checkInTime
      remarks
    }
    summary {
      totalStudents
      presentCount
      absentCount
      percentage
    }
  }
}
```

---

## 13. Real-Time Endpoints (WebSocket)

### **WebSocket Connection**
```typescript
const WS_URL = 'wss://realtime.academia-pro.com';

// Connection with authentication
const ws = new WebSocket(WS_URL, [], {
  headers: {
    'Authorization': `Bearer ${jwtToken}`,
    'X-School-ID': schoolId
  }
});
```

### **WebSocket Events**

#### **Classroom Events**
```typescript
// Join classroom
ws.send(JSON.stringify({
  type: 'join_classroom',
  classroom_id: 'class_123',
  user_type: 'student'
}));

// Send message
ws.send(JSON.stringify({
  type: 'classroom_message',
  classroom_id: 'class_123',
  message: 'Hello everyone!',
  message_type: 'text'
}));

// Raise hand
ws.send(JSON.stringify({
  type: 'raise_hand',
  classroom_id: 'class_123'
}));
```

#### **Notification Events**
```typescript
// Subscribe to notifications
ws.send(JSON.stringify({
  type: 'subscribe_notifications',
  user_id: 'user_123',
  categories: ['academic', 'attendance', 'emergency']
}));

// Mark notification as read
ws.send(JSON.stringify({
  type: 'mark_notification_read',
  notification_id: 'notif_123'
}));
```

---

## 14. File Upload Endpoints

### **POST /files/upload**
Upload file with metadata

**Request:** `multipart/form-data`
```typescript
interface FileUploadRequest {
  file: File;
  file_type: 'document' | 'image' | 'video' | 'audio';
  category: 'assignment' | 'profile' | 'certificate' | 'announcement';
  metadata?: Record<string, any>;
  is_public: boolean;
}
```

**Response:**
```typescript
interface FileUploadResponse {
  file_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  mime_type: string;
  url: string;
  thumbnail_url?: string;
  uploaded_by: string;
  uploaded_at: string;
  checksum: string;
}
```

### **GET /files/{file_id}/download**
Download file

**Path Parameters:**
- `file_id` (string, required) - File ID

**Query Parameters:**
- `disposition` (string, optional) - 'inline' or 'attachment'

### **DELETE /files/{file_id}**
Delete file

**Path Parameters:**
- `file_id` (string, required) - File ID

---

## 15. Health Check & Monitoring Endpoints

### **GET /health**
System health check

**Response:**
```typescript
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
    storage: ServiceHealth;
    email: ServiceHealth;
    sms: ServiceHealth;
  };
  uptime: number;
  memory_usage: MemoryInfo;
  response_time: number;
}

interface ServiceHealth {
  status: 'up' | 'down' | 'degraded';
  response_time?: number;
  error_message?: string;
}
```

### **GET /metrics**
System metrics (Admin only)

**Response:**
```typescript
interface SystemMetricsResponse {
  timestamp: string;
  requests_per_second: number;
  active_connections: number;
  database_connections: number;
  cache_hit_rate: number;
  error_rate: number;
  response_time_avg: number;
  memory_usage: MemoryInfo;
  storage_usage: StorageInfo;
}
```

---

## Error Response Format

All API endpoints follow the RFC 7807 Problem Details format:

```typescript
interface ErrorResponse {
  type: string;        // Error type URI
  title: string;       // Human-readable title
  status: number;      // HTTP status code
  detail: string;      // Detailed error description
  instance: string;    // Request instance URI
  error_code: string;  // Application-specific error code
  field_errors?: FieldError[]; // For validation errors
  timestamp: string;   // Error timestamp
  request_id: string;  // Request tracing ID
}

interface FieldError {
  field: string;
  message: string;
  code: string;
}
```

## Rate Limiting Headers

All responses include rate limiting information:

```typescript
// Response Headers
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
X-RateLimit-Retry-After: 60  // When limit exceeded
```

## Pagination Format

All list endpoints use cursor-based pagination:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
    next_cursor?: string;
    previous_cursor?: string;
  };
}
```

## API Versioning Examples

```typescript
// URL Versioning
GET /api/v1/students
GET /api/v2/students

// Header Versioning
GET /api/students
Accept-Version: v2

// Combined Approach
GET /api/v2/students
Accept-Version: v2.1
```

This comprehensive API specification provides all the endpoints needed for Academia Pro's 21 modules, with detailed request/response formats, error handling, authentication, and real-time capabilities. The specifications are ready for implementation in your Nest.js backend with full TypeScript support.