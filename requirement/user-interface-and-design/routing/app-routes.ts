// Academia Pro - Application Routing Configuration
// Comprehensive route structure for all modules and user roles

import { RouteConfig } from './types/route.types';

export const appRoutes: RouteConfig[] = [
  // Public Routes
  {
    path: '/',
    component: 'LandingPage',
    title: 'Welcome to Academia Pro',
    public: true,
    layout: 'auth',
    meta: {
      requiresAuth: false,
      hideNavigation: true,
    },
  },
  {
    path: '/login',
    component: 'LoginPage',
    title: 'Sign In',
    public: true,
    layout: 'auth',
    meta: {
      requiresAuth: false,
      hideNavigation: true,
    },
  },
  {
    path: '/register',
    component: 'RegisterPage',
    title: 'Create Account',
    public: true,
    layout: 'auth',
    meta: {
      requiresAuth: false,
      hideNavigation: true,
    },
  },
  {
    path: '/forgot-password',
    component: 'ForgotPasswordPage',
    title: 'Reset Password',
    public: true,
    layout: 'auth',
    meta: {
      requiresAuth: false,
      hideNavigation: true,
    },
  },

  // Dashboard Routes (Role-based)
  {
    path: '/dashboard',
    component: 'DashboardPage',
    title: 'Dashboard',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin', 'teacher', 'parent', 'student'],
      icon: 'dashboard',
      menuOrder: 1,
    },
  },

  // Multi-School Architecture Module
  {
    path: '/schools',
    component: 'SchoolManagementPage',
    title: 'School Management',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin'],
      icon: 'school',
      menuOrder: 2,
      module: 'multi-school-architecture',
    },
    children: [
      {
        path: '/schools/list',
        component: 'SchoolListPage',
        title: 'All Schools',
        meta: { breadcrumb: 'Schools' },
      },
      {
        path: '/schools/:id',
        component: 'SchoolDetailPage',
        title: 'School Details',
        meta: { breadcrumb: 'School Details' },
      },
      {
        path: '/schools/create',
        component: 'SchoolCreatePage',
        title: 'Add New School',
        meta: { breadcrumb: 'Add School' },
      },
      {
        path: '/schools/:id/settings',
        component: 'SchoolSettingsPage',
        title: 'School Settings',
        meta: { breadcrumb: 'Settings' },
      },
    ],
  },

  // User Management Module
  {
    path: '/users',
    component: 'UserManagementPage',
    title: 'User Management',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin'],
      icon: 'users',
      menuOrder: 3,
      module: 'user-management',
    },
    children: [
      {
        path: '/users/list',
        component: 'UserListPage',
        title: 'All Users',
        meta: { breadcrumb: 'Users' },
      },
      {
        path: '/users/create',
        component: 'UserCreatePage',
        title: 'Add User',
        meta: { breadcrumb: 'Add User' },
      },
      {
        path: '/users/:id',
        component: 'UserDetailPage',
        title: 'User Profile',
        meta: { breadcrumb: 'User Details' },
      },
      {
        path: '/users/roles',
        component: 'RoleManagementPage',
        title: 'Role Management',
        meta: { breadcrumb: 'Roles' },
      },
      {
        path: '/users/permissions',
        component: 'PermissionManagementPage',
        title: 'Permissions',
        meta: { breadcrumb: 'Permissions' },
      },
    ],
  },

  // Student Management Module
  {
    path: '/students',
    component: 'StudentManagementPage',
    title: 'Student Management',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin', 'teacher', 'parent'],
      icon: 'graduation-cap',
      menuOrder: 4,
      module: 'student-management',
    },
    children: [
      {
        path: '/students/list',
        component: 'StudentListPage',
        title: 'All Students',
        meta: { breadcrumb: 'Students' },
      },
      {
        path: '/students/create',
        component: 'StudentCreatePage',
        title: 'Add Student',
        meta: { breadcrumb: 'Add Student' },
      },
      {
        path: '/students/:id',
        component: 'StudentDetailPage',
        title: 'Student Profile',
        meta: { breadcrumb: 'Student Details' },
      },
      {
        path: '/students/:id/edit',
        component: 'StudentEditPage',
        title: 'Edit Student',
        meta: { breadcrumb: 'Edit Student' },
      },
      {
        path: '/students/bulk',
        component: 'StudentBulkOperationsPage',
        title: 'Bulk Operations',
        meta: { breadcrumb: 'Bulk Operations' },
      },
      {
        path: '/students/transfers',
        component: 'StudentTransferPage',
        title: 'Student Transfers',
        meta: { breadcrumb: 'Transfers' },
      },
      {
        path: '/students/reports',
        component: 'StudentReportsPage',
        title: 'Student Reports',
        meta: { breadcrumb: 'Reports' },
      },
    ],
  },

  // Academic Management Module
  {
    path: '/academic',
    component: 'AcademicManagementPage',
    title: 'Academic Management',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin', 'teacher'],
      icon: 'book-open',
      menuOrder: 5,
      module: 'academic-management',
    },
    children: [
      {
        path: '/academic/curriculum',
        component: 'CurriculumManagementPage',
        title: 'Curriculum',
        meta: { breadcrumb: 'Curriculum' },
      },
      {
        path: '/academic/subjects',
        component: 'SubjectManagementPage',
        title: 'Subjects',
        meta: { breadcrumb: 'Subjects' },
      },
      {
        path: '/academic/classes',
        component: 'ClassManagementPage',
        title: 'Classes & Sections',
        meta: { breadcrumb: 'Classes' },
      },
      {
        path: '/academic/calendar',
        component: 'AcademicCalendarPage',
        title: 'Academic Calendar',
        meta: { breadcrumb: 'Calendar' },
      },
      {
        path: '/academic/standards',
        component: 'AcademicStandardsPage',
        title: 'Academic Standards',
        meta: { breadcrumb: 'Standards' },
      },
    ],
  },

  // Attendance Management Module
  {
    path: '/attendance',
    component: 'AttendanceManagementPage',
    title: 'Attendance Management',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin', 'teacher', 'parent'],
      icon: 'calendar-check',
      menuOrder: 6,
      module: 'attendance-management',
    },
    children: [
      {
        path: '/attendance/daily',
        component: 'DailyAttendancePage',
        title: 'Daily Attendance',
        meta: { breadcrumb: 'Daily' },
      },
      {
        path: '/attendance/reports',
        component: 'AttendanceReportsPage',
        title: 'Attendance Reports',
        meta: { breadcrumb: 'Reports' },
      },
      {
        path: '/attendance/analytics',
        component: 'AttendanceAnalyticsPage',
        title: 'Attendance Analytics',
        meta: { breadcrumb: 'Analytics' },
      },
      {
        path: '/attendance/settings',
        component: 'AttendanceSettingsPage',
        title: 'Attendance Settings',
        meta: { breadcrumb: 'Settings' },
      },
    ],
  },

  // Examination & Assessment Module
  {
    path: '/examinations',
    component: 'ExaminationManagementPage',
    title: 'Examinations & Assessment',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin', 'teacher'],
      icon: 'clipboard-list',
      menuOrder: 7,
      module: 'examination-assessment',
    },
    children: [
      {
        path: '/examinations/schedule',
        component: 'ExamSchedulePage',
        title: 'Exam Schedule',
        meta: { breadcrumb: 'Schedule' },
      },
      {
        path: '/examinations/question-bank',
        component: 'QuestionBankPage',
        title: 'Question Bank',
        meta: { breadcrumb: 'Question Bank' },
      },
      {
        path: '/examinations/results',
        component: 'ExamResultsPage',
        title: 'Exam Results',
        meta: { breadcrumb: 'Results' },
      },
      {
        path: '/examinations/reports',
        component: 'ExamReportsPage',
        title: 'Exam Reports',
        meta: { breadcrumb: 'Reports' },
      },
      {
        path: '/examinations/revaluation',
        component: 'RevaluationPage',
        title: 'Revaluation',
        meta: { breadcrumb: 'Revaluation' },
      },
    ],
  },

  // Fee Management Module
  {
    path: '/fees',
    component: 'FeeManagementPage',
    title: 'Fee Management',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin', 'parent'],
      icon: 'credit-card',
      menuOrder: 8,
      module: 'fee-management',
    },
    children: [
      {
        path: '/fees/structure',
        component: 'FeeStructurePage',
        title: 'Fee Structure',
        meta: { breadcrumb: 'Structure' },
      },
      {
        path: '/fees/collection',
        component: 'FeeCollectionPage',
        title: 'Fee Collection',
        meta: { breadcrumb: 'Collection' },
      },
      {
        path: '/fees/outstanding',
        component: 'OutstandingFeesPage',
        title: 'Outstanding Fees',
        meta: { breadcrumb: 'Outstanding' },
      },
      {
        path: '/fees/scholarships',
        component: 'ScholarshipManagementPage',
        title: 'Scholarships',
        meta: { breadcrumb: 'Scholarships' },
      },
      {
        path: '/fees/reports',
        component: 'FeeReportsPage',
        title: 'Fee Reports',
        meta: { breadcrumb: 'Reports' },
      },
    ],
  },

  // Timetable & Scheduling Module
  {
    path: '/timetable',
    component: 'TimetableManagementPage',
    title: 'Timetable & Scheduling',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'delegated-super-admin', 'school-admin', 'teacher', 'student', 'parent'],
      icon: 'clock',
      menuOrder: 9,
      module: 'timetable-scheduling',
    },
    children: [
      {
        path: '/timetable/view',
        component: 'TimetableViewPage',
        title: 'My Timetable',
        meta: { breadcrumb: 'Timetable' },
      },
      {
        path: '/timetable/manage',
        component: 'TimetableManagementPage',
        title: 'Manage Timetable',
        meta: {
          breadcrumb: 'Manage',
          roles: ['super-admin', 'school-admin', 'teacher']
        },
      },
      {
        path: '/timetable/conflicts',
        component: 'ConflictResolutionPage',
        title: 'Conflict Resolution',
        meta: {
          breadcrumb: 'Conflicts',
          roles: ['super-admin', 'school-admin']
        },
      },
      {
        path: '/timetable/resources',
        component: 'ResourceAllocationPage',
        title: 'Resource Allocation',
        meta: {
          breadcrumb: 'Resources',
          roles: ['super-admin', 'school-admin']
        },
      },
    ],
  },

  // Communication & Notification Module
  {
    path: '/communication',
    component: 'CommunicationPage',
    title: 'Communication',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin', 'teacher', 'parent', 'student'],
      icon: 'message-circle',
      menuOrder: 10,
      module: 'communication-notification',
    },
    children: [
      {
        path: '/communication/messages',
        component: 'MessagesPage',
        title: 'Messages',
        meta: { breadcrumb: 'Messages' },
      },
      {
        path: '/communication/announcements',
        component: 'AnnouncementsPage',
        title: 'Announcements',
        meta: { breadcrumb: 'Announcements' },
      },
      {
        path: '/communication/notice-board',
        component: 'NoticeBoardPage',
        title: 'Notice Board',
        meta: { breadcrumb: 'Notice Board' },
      },
      {
        path: '/communication/emergency',
        component: 'EmergencyCommunicationPage',
        title: 'Emergency Alerts',
        meta: { breadcrumb: 'Emergency' },
      },
    ],
  },

  // Library Management Module
  {
    path: '/library',
    component: 'LibraryManagementPage',
    title: 'Library Management',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin', 'teacher', 'student'],
      icon: 'library',
      menuOrder: 11,
      module: 'library-management',
    },
    children: [
      {
        path: '/library/catalog',
        component: 'LibraryCatalogPage',
        title: 'Library Catalog',
        meta: { breadcrumb: 'Catalog' },
      },
      {
        path: '/library/my-books',
        component: 'MyBooksPage',
        title: 'My Books',
        meta: { breadcrumb: 'My Books' },
      },
      {
        path: '/library/reservations',
        component: 'ReservationsPage',
        title: 'Reservations',
        meta: { breadcrumb: 'Reservations' },
      },
      {
        path: '/library/digital',
        component: 'DigitalLibraryPage',
        title: 'Digital Library',
        meta: { breadcrumb: 'Digital' },
      },
      {
        path: '/library/reports',
        component: 'LibraryReportsPage',
        title: 'Library Reports',
        meta: {
          breadcrumb: 'Reports',
          roles: ['super-admin', 'school-admin']
        },
      },
    ],
  },

  // Transportation Management Module
  {
    path: '/transportation',
    component: 'TransportationManagementPage',
    title: 'Transportation',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin', 'parent'],
      icon: 'truck',
      menuOrder: 12,
      module: 'transportation-management',
    },
    children: [
      {
        path: '/transportation/routes',
        component: 'RouteManagementPage',
        title: 'Routes',
        meta: { breadcrumb: 'Routes' },
      },
      {
        path: '/transportation/vehicles',
        component: 'FleetManagementPage',
        title: 'Fleet Management',
        meta: { breadcrumb: 'Fleet' },
      },
      {
        path: '/transportation/tracking',
        component: 'LiveTrackingPage',
        title: 'Live Tracking',
        meta: { breadcrumb: 'Tracking' },
      },
      {
        path: '/transportation/assignments',
        component: 'StudentAssignmentsPage',
        title: 'Student Assignments',
        meta: { breadcrumb: 'Assignments' },
      },
    ],
  },

  // Hostel/Dormitory Management Module
  {
    path: '/hostel',
    component: 'HostelManagementPage',
    title: 'Hostel Management',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin', 'parent'],
      icon: 'home',
      menuOrder: 13,
      module: 'hostel-management',
    },
    children: [
      {
        path: '/hostel/overview',
        component: 'HostelOverviewPage',
        title: 'Hostel Overview',
        meta: { breadcrumb: 'Overview' },
      },
      {
        path: '/hostel/rooms',
        component: 'RoomManagementPage',
        title: 'Room Management',
        meta: { breadcrumb: 'Rooms' },
      },
      {
        path: '/hostel/residents',
        component: 'ResidentManagementPage',
        title: 'Residents',
        meta: { breadcrumb: 'Residents' },
      },
      {
        path: '/hostel/maintenance',
        component: 'MaintenancePage',
        title: 'Maintenance',
        meta: { breadcrumb: 'Maintenance' },
      },
    ],
  },

  // Staff & HR Management Module
  {
    path: '/staff',
    component: 'StaffManagementPage',
    title: 'Staff & HR',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin'],
      icon: 'users-cog',
      menuOrder: 14,
      module: 'staff-hr-management',
    },
    children: [
      {
        path: '/staff/directory',
        component: 'StaffDirectoryPage',
        title: 'Staff Directory',
        meta: { breadcrumb: 'Directory' },
      },
      {
        path: '/staff/payroll',
        component: 'PayrollManagementPage',
        title: 'Payroll',
        meta: { breadcrumb: 'Payroll' },
      },
      {
        path: '/staff/recruitment',
        component: 'RecruitmentPage',
        title: 'Recruitment',
        meta: { breadcrumb: 'Recruitment' },
      },
      {
        path: '/staff/training',
        component: 'TrainingPage',
        title: 'Training & Development',
        meta: { breadcrumb: 'Training' },
      },
    ],
  },

  // Inventory & Asset Management Module
  {
    path: '/inventory',
    component: 'InventoryManagementPage',
    title: 'Inventory & Assets',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin'],
      icon: 'package',
      menuOrder: 15,
      module: 'inventory-asset-management',
    },
    children: [
      {
        path: '/inventory/assets',
        component: 'AssetManagementPage',
        title: 'Asset Management',
        meta: { breadcrumb: 'Assets' },
      },
      {
        path: '/inventory/procurement',
        component: 'ProcurementPage',
        title: 'Procurement',
        meta: { breadcrumb: 'Procurement' },
      },
      {
        path: '/inventory/maintenance',
        component: 'AssetMaintenancePage',
        title: 'Maintenance',
        meta: { breadcrumb: 'Maintenance' },
      },
      {
        path: '/inventory/reports',
        component: 'InventoryReportsPage',
        title: 'Reports',
        meta: { breadcrumb: 'Reports' },
      },
    ],
  },

  // Reports & Analytics Module
  {
    path: '/reports',
    component: 'ReportsAnalyticsPage',
    title: 'Reports & Analytics',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin', 'teacher'],
      icon: 'bar-chart',
      menuOrder: 16,
      module: 'reports-analytics',
    },
    children: [
      {
        path: '/reports/academic',
        component: 'AcademicReportsPage',
        title: 'Academic Reports',
        meta: { breadcrumb: 'Academic' },
      },
      {
        path: '/reports/operational',
        component: 'OperationalReportsPage',
        title: 'Operational Reports',
        meta: { breadcrumb: 'Operational' },
      },
      {
        path: '/reports/financial',
        component: 'FinancialReportsPage',
        title: 'Financial Reports',
        meta: { breadcrumb: 'Financial' },
      },
      {
        path: '/reports/custom',
        component: 'CustomReportsPage',
        title: 'Custom Reports',
        meta: { breadcrumb: 'Custom' },
      },
    ],
  },

  // Parent Portal Module
  {
    path: '/parent',
    component: 'ParentPortalPage',
    title: 'Parent Portal',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['parent'],
      icon: 'user-check',
      menuOrder: 17,
      module: 'parent-portal',
    },
    children: [
      {
        path: '/parent/dashboard',
        component: 'ParentDashboardPage',
        title: 'Parent Dashboard',
        meta: { breadcrumb: 'Dashboard' },
      },
      {
        path: '/parent/children',
        component: 'ChildrenOverviewPage',
        title: 'My Children',
        meta: { breadcrumb: 'Children' },
      },
      {
        path: '/parent/communication',
        component: 'ParentCommunicationPage',
        title: 'Communication',
        meta: { breadcrumb: 'Communication' },
      },
      {
        path: '/parent/payments',
        component: 'ParentPaymentsPage',
        title: 'Payments',
        meta: { breadcrumb: 'Payments' },
      },
    ],
  },

  // Student Portal Module
  {
    path: '/student',
    component: 'StudentPortalPage',
    title: 'Student Portal',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['student'],
      icon: 'user-graduate',
      menuOrder: 18,
      module: 'student-portal',
    },
    children: [
      {
        path: '/student/dashboard',
        component: 'StudentDashboardPage',
        title: 'Student Dashboard',
        meta: { breadcrumb: 'Dashboard' },
      },
      {
        path: '/student/profile',
        component: 'StudentProfilePage',
        title: 'My Profile',
        meta: { breadcrumb: 'Profile' },
      },
      {
        path: '/student/academic',
        component: 'StudentAcademicPage',
        title: 'Academic',
        meta: { breadcrumb: 'Academic' },
      },
      {
        path: '/student/library',
        component: 'StudentLibraryPage',
        title: 'Library',
        meta: { breadcrumb: 'Library' },
      },
    ],
  },

  // Online Learning & Digital Classroom Module
  {
    path: '/learning',
    component: 'OnlineLearningPage',
    title: 'Online Learning',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin', 'teacher', 'student'],
      icon: 'laptop',
      menuOrder: 19,
      module: 'online-learning',
    },
    children: [
      {
        path: '/learning/classroom',
        component: 'VirtualClassroomPage',
        title: 'Virtual Classroom',
        meta: { breadcrumb: 'Classroom' },
      },
      {
        path: '/learning/content',
        component: 'LearningContentPage',
        title: 'Learning Content',
        meta: { breadcrumb: 'Content' },
      },
      {
        path: '/learning/assignments',
        component: 'AssignmentsPage',
        title: 'Assignments',
        meta: { breadcrumb: 'Assignments' },
      },
      {
        path: '/learning/assessments',
        component: 'OnlineAssessmentsPage',
        title: 'Assessments',
        meta: { breadcrumb: 'Assessments' },
      },
    ],
  },

  // Security & Compliance Module
  {
    path: '/security',
    component: 'SecurityCompliancePage',
    title: 'Security & Compliance',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin'],
      icon: 'shield',
      menuOrder: 20,
      module: 'security-compliance',
    },
    children: [
      {
        path: '/security/audit',
        component: 'AuditLogsPage',
        title: 'Audit Logs',
        meta: { breadcrumb: 'Audit' },
      },
      {
        path: '/security/compliance',
        component: 'ComplianceReportsPage',
        title: 'Compliance',
        meta: { breadcrumb: 'Compliance' },
      },
      {
        path: '/security/settings',
        component: 'SecuritySettingsPage',
        title: 'Security Settings',
        meta: { breadcrumb: 'Settings' },
      },
    ],
  },

  // Integration Capabilities Module
  {
    path: '/integrations',
    component: 'IntegrationManagementPage',
    title: 'Integrations',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin'],
      icon: 'plug',
      menuOrder: 21,
      module: 'integration-capabilities',
    },
    children: [
      {
        path: '/integrations/payment',
        component: 'PaymentIntegrationsPage',
        title: 'Payment Gateways',
        meta: { breadcrumb: 'Payments' },
      },
      {
        path: '/integrations/communication',
        component: 'CommunicationIntegrationsPage',
        title: 'Communication',
        meta: { breadcrumb: 'Communication' },
      },
      {
        path: '/integrations/government',
        component: 'GovernmentIntegrationsPage',
        title: 'Government Systems',
        meta: { breadcrumb: 'Government' },
      },
      {
        path: '/integrations/api',
        component: 'APIManagementPage',
        title: 'API Management',
        meta: { breadcrumb: 'API' },
      },
    ],
  },

  // Mobile Applications Module
  {
    path: '/mobile',
    component: 'MobileAppsPage',
    title: 'Mobile Applications',
    layout: 'main',
    meta: {
      requiresAuth: true,
      roles: ['super-admin', 'school-admin'],
      icon: 'smartphone',
      menuOrder: 22,
      module: 'mobile-applications',
    },
    children: [
      {
        path: '/mobile/parent-app',
        component: 'ParentAppPage',
        title: 'Parent App',
        meta: { breadcrumb: 'Parent App' },
      },
      {
        path: '/mobile/student-app',
        component: 'StudentAppPage',
        title: 'Student App',
        meta: { breadcrumb: 'Student App' },
      },
      {
        path: '/mobile/staff-app',
        component: 'StaffAppPage',
        title: 'Staff App',
        meta: { breadcrumb: 'Staff App' },
      },
      {
        path: '/mobile/analytics',
        component: 'MobileAnalyticsPage',
        title: 'Mobile Analytics',
        meta: { breadcrumb: 'Analytics' },
      },
    ],
  },

  // Error Routes
  {
    path: '/404',
    component: 'NotFoundPage',
    title: 'Page Not Found',
    layout: 'main',
    meta: {
      requiresAuth: false,
      hideNavigation: true,
    },
  },
  {
    path: '/403',
    component: 'ForbiddenPage',
    title: 'Access Denied',
    layout: 'main',
    meta: {
      requiresAuth: false,
      hideNavigation: true,
    },
  },
  {
    path: '/500',
    component: 'ServerErrorPage',
    title: 'Server Error',
    layout: 'main',
    meta: {
      requiresAuth: false,
      hideNavigation: true,
    },
  },

  // Catch-all route (must be last)
  {
    path: '*',
    component: 'NotFoundPage',
    title: 'Page Not Found',
    layout: 'main',
    meta: {
      requiresAuth: false,
      hideNavigation: true,
    },
  },
];

// Route Guards and Middleware
export const routeGuards = {
  // Authentication guard
  requireAuth: (route: RouteConfig, user: any) => {
    if (route.meta?.requiresAuth && !user) {
      return '/login';
    }
    return null;
  },

  // Role-based access guard
  requireRole: (route: RouteConfig, user: any) => {
    if (route.meta?.roles && user?.role) {
      if (!route.meta.roles.includes(user.role)) {
        return '/403';
      }
    }
    return null;
  },

  // Feature flag guard
  requireFeature: (route: RouteConfig, features: string[]) => {
    if (route.meta?.feature && !features.includes(route.meta.feature)) {
      return '/404';
    }
    return null;
  },
};

// Route Utilities
export const routeUtils = {
  // Get routes for specific role
  getRoutesForRole: (role: string): RouteConfig[] => {
    return appRoutes.filter(route =>
      !route.meta?.roles || route.meta.roles.includes(role)
    );
  },

  // Get navigation menu items
  getNavigationItems: (role: string) => {
    return appRoutes
      .filter(route =>
        route.meta?.menuOrder &&
        (!route.meta?.roles || route.meta.roles.includes(role))
      )
      .sort((a, b) => (a.meta?.menuOrder || 0) - (b.meta?.menuOrder || 0))
      .map(route => ({
        path: route.path,
        title: route.title,
        icon: route.meta?.icon,
        children: route.children?.filter(child =>
          !child.meta?.roles || child.meta.roles.includes(role)
        ),
      }));
  },

  // Find route by path
  findRouteByPath: (path: string): RouteConfig | null => {
    for (const route of appRoutes) {
      if (route.path === path) return route;
      if (route.children) {
        const childRoute = route.children.find(child => child.path === path);
        if (childRoute) return childRoute;
      }
    }
    return null;
  },

  // Generate breadcrumbs
  generateBreadcrumbs: (currentPath: string): Array<{ path: string; title: string }> => {
    const breadcrumbs: Array<{ path: string; title: string }> = [];
    const pathSegments = currentPath.split('/').filter(Boolean);

    let currentPathBuild = '';
    for (const segment of pathSegments) {
      currentPathBuild += `/${segment}`;
      const route = routeUtils.findRouteByPath(currentPathBuild);
      if (route) {
        breadcrumbs.push({
          path: currentPathBuild,
          title: route.title,
        });
      }
    }

    return breadcrumbs;
  },
};

// Export types
export type { RouteConfig } from './types/route.types';