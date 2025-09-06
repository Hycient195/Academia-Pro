// Academia Pro - Online Learning Types
// Shared type definitions for online learning and digital education module

// Enums
export enum TContentType {
  VIDEO = 'video',
  DOCUMENT = 'document',
  PRESENTATION = 'presentation',
  INTERACTIVE = 'interactive',
  ASSESSMENT = 'assessment',
  AUDIO = 'audio',
  IMAGE = 'image',
  TEXT = 'text',
  SIMULATION = 'simulation',
  GAME = 'game',
}

export enum TContentStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  DEPRECATED = 'deprecated',
}

export enum TDifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum TLearningPathType {
  SUBJECT = 'subject',
  SKILL = 'skill',
  CAREER = 'career',
  CERTIFICATION = 'certification',
  PERSONAL = 'personal',
}

export enum TOnlineLearningAssessmentType {
  QUIZ = 'quiz',
  TEST = 'test',
  EXAM = 'exam',
  ASSIGNMENT = 'assignment',
  PROJECT = 'project',
  PRACTICAL = 'practical',
}

export enum TProgressStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  LOCKED = 'locked',
  EXPIRED = 'expired',
}

export enum TEnrollmentStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  DROPPED = 'dropped',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
}

export enum TDiscussionType {
  QUESTION = 'question',
  DISCUSSION = 'discussion',
  ANNOUNCEMENT = 'announcement',
  CLARIFICATION = 'clarification',
}

export enum TCollaborationType {
  GROUP_PROJECT = 'group_project',
  PEER_REVIEW = 'peer_review',
  STUDY_GROUP = 'study_group',
  TUTORING = 'tutoring',
}

// Interfaces
export interface IContent {
  id: string;
  schoolId: string;
  title: string;
  description?: string;
  type: TContentType;
  subject: string;
  gradeLevel: string;
  difficulty: TDifficultyLevel;
  duration?: number; // in minutes
  fileSize?: number; // in bytes
  contentUrl: string;
  thumbnailUrl?: string;
  transcriptUrl?: string;
  subtitles?: Array<{
    language: string;
    url: string;
  }>;
  tags: string[];
  learningObjectives: string[];
  prerequisites: string[];
  status: TContentStatus;
  isPublic: boolean;
  requiresEnrollment: boolean;
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    version: string;
    license?: string;
    copyright?: string;
    language: string;
    format: string;
    resolution?: string;
  };
  statistics: {
    viewCount: number;
    completionCount: number;
    averageRating: number;
    totalRatings: number;
    favoriteCount: number;
    shareCount: number;
    downloadCount: number;
  };
  relatedContent: Array<{
    id: string;
    title: string;
    type: TContentType;
    relevance: number;
  }>;
}

export interface ICourse {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  instructorId: string;
  instructorName: string;
  duration: number; // in weeks
  totalHours: number;
  difficulty: TDifficultyLevel;
  maxStudents: number;
  currentStudents: number;
  startDate: Date;
  endDate: Date;
  enrollmentDeadline: Date;
  isActive: boolean;
  isSelfPaced: boolean;
  prerequisites: string[];
  learningObjectives: string[];
  syllabus: ICourseModule[];
  tags: string[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    version: string;
    language: string;
    category: string;
  };
  statistics: {
    completionRate: number;
    averageRating: number;
    totalEnrollments: number;
    activeStudents: number;
  };
}

export interface ICourseModule {
  id: string;
  title: string;
  description: string;
  order: number;
  duration: number; // in minutes
  isOptional: boolean;
  content: IContent[];
  assessments: IAssessment[];
  prerequisites: string[];
}

export interface IAssessment {
  id: string;
  title: string;
  type: TOnlineLearningAssessmentType;
  description: string;
  duration: number; // in minutes
  totalPoints: number;
  passingScore: number;
  maxAttempts: number;
  isTimed: boolean;
  questions: IQuestion[];
  instructions: string;
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    difficulty: TDifficultyLevel;
  };
}


export interface IQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'matching' | 'ordering';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
  hints?: string[];
  metadata: {
    difficulty: TDifficultyLevel;
    subject: string;
    gradeLevel: string;
  };
}

export interface IQuestionResponse extends IQuestion {
  exam?: {
    id: string;
    title: string;
  };
}

export interface ILearningPath {
  id: string;
  schoolId: string;
  title: string;
  description: string;
  type: TLearningPathType;
  targetAudience: string[];
  estimatedDuration: number; // in hours
  difficulty: TDifficultyLevel;
  courses: Array<{
    courseId: string;
    courseTitle: string;
    order: number;
    isRequired: boolean;
  }>;
  skills: string[];
  certifications: string[];
  prerequisites: string[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    version: string;
  };
  statistics: {
    totalStudents: number;
    completionRate: number;
    averageRating: number;
  };
}

export interface IEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: Date;
  status: TEnrollmentStatus;
  progress: number; // percentage
  completedModules: string[];
  currentModule?: string;
  lastActivity: Date;
  certificateEarned?: boolean;
  certificateUrl?: string;
  grade?: string;
  finalScore?: number;
  metadata: {
    enrollmentMethod: string;
    paymentStatus?: string;
    completionDate?: Date;
  };
}

export interface IProgress {
  id: string;
  studentId: string;
  contentId?: string;
  courseId?: string;
  moduleId?: string;
  status: TProgressStatus;
  progress: number; // percentage
  timeSpent: number; // in minutes
  lastPosition?: number; // for videos/audio
  completedAt?: Date;
  score?: number;
  attempts: number;
  bookmarks: Array<{
    position: number;
    note?: string;
    timestamp: Date;
  }>;
  metadata: {
    deviceType: string;
    browserInfo?: string;
    ipAddress: string;
    sessionId: string;
  };
}

export interface IDiscussion {
  id: string;
  courseId?: string;
  contentId?: string;
  studentId: string;
  studentName: string;
  type: TDiscussionType;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isResolved: boolean;
  parentDiscussionId?: string;
  replies: IDiscussionReply[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    viewCount: number;
    upvoteCount: number;
    downvoteCount: number;
  };
}

export interface IDiscussionReply {
  id: string;
  discussionId: string;
  studentId: string;
  studentName: string;
  content: string;
  isInstructorReply: boolean;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    upvoteCount: number;
  };
}

export interface ICollaboration {
  id: string;
  courseId: string;
  type: TCollaborationType;
  title: string;
  description: string;
  participants: Array<{
    studentId: string;
    studentName: string;
    role: string;
  }>;
  deliverables: Array<{
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    status: TProgressStatus;
  }>;
  resources: IContent[];
  metadata: {
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    maxParticipants: number;
    isActive: boolean;
  };
}

export interface IVirtualClassroom {
  id: string;
  courseId: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  scheduledDate: Date;
  duration: number; // in minutes
  maxParticipants: number;
  currentParticipants: number;
  meetingUrl: string;
  meetingId: string;
  password?: string;
  recordings: Array<{
    id: string;
    title: string;
    url: string;
    duration: number;
    recordedAt: Date;
  }>;
  participants: Array<{
    studentId: string;
    studentName: string;
    joinTime?: Date;
    leaveTime?: Date;
    participationScore: number;
  }>;
  chatMessages: Array<{
    id: string;
    studentId: string;
    studentName: string;
    message: string;
    timestamp: Date;
    isInstructor: boolean;
  }>;
  sharedContent: IContent[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    platform: string;
    settings: {
      allowRecording: boolean;
      allowChat: boolean;
      allowScreenShare: boolean;
      muteOnEntry: boolean;
    };
  };
}

// Request Interfaces
export interface IGetContentLibraryRequest {
  subject?: string;
  grade?: string;
  type?: TContentType;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'title' | 'rating' | 'views' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
}

export interface IGetContentLibraryResponse {
  totalItems: number;
  items: IContent[];
  filters: {
    subjects: string[];
    grades: string[];
    types: TContentType[];
    difficulties: TDifficultyLevel[];
  };
  statistics: {
    totalVideos: number;
    totalDocuments: number;
    totalInteractive: number;
    totalPresentations: number;
    totalAssessments: number;
  };
}

export interface IGetContentDetailsRequest {
  contentId: string;
}

export interface IGetContentDetailsResponse extends IContent {
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    comment: string;
    rating: number;
    timestamp: Date;
    replies: Array<{
      id: string;
      userId: string;
      userName: string;
      comment: string;
      timestamp: Date;
    }>;
  }>;
}

export interface IUploadContentRequest {
  file: any;
  title: string;
  description?: string;
  subject: string;
  grade: string;
  type: TContentType;
  tags?: string[];
  isPublic?: boolean;
  learningObjectives?: string[];
  prerequisites?: string[];
}

export interface IUploadContentResponse {
  contentId: string;
  title: string;
  uploadStatus: 'processing' | 'completed' | 'failed';
  fileName: string;
  fileSize: number;
  uploadUrl: string;
  processingProgress: number;
  estimatedCompletion: string;
  message: string;
}

export interface IUpdateContentRequest {
  title?: string;
  description?: string;
  subject?: string;
  grade?: string;
  tags?: string[];
  isPublic?: boolean;
  difficulty?: TDifficultyLevel;
  learningObjectives?: string[];
  prerequisites?: string[];
}

export interface IUpdateContentResponse {
  contentId: string;
  updatedFields: string[];
  lastModified: Date;
  message: string;
}

export interface IRateContentRequest {
  contentId: string;
  rating: number;
  comment?: string;
}

export interface IRateContentResponse {
  contentId: string;
  rating: number;
  comment?: string;
  submittedAt: Date;
  message: string;
}

export interface IGetCategoriesResponse {
  subjects: Array<{
    id: string;
    name: string;
    subcategories: string[];
    contentCount: number;
  }>;
  contentTypes: Array<{
    id: string;
    name: string;
    count: number;
    icon: string;
  }>;
  gradeLevels: Array<{
    id: string;
    name: string;
    contentCount: number;
  }>;
}

export interface IGetTrendingContentRequest {
  period?: 'day' | 'week' | 'month';
  limit?: number;
}

export interface IGetTrendingContentResponse {
  period: string;
  trendingContent: Array<{
    id: string;
    title: string;
    type: TContentType;
    subject: string;
    viewsThisPeriod: number;
    totalViews: number;
    trend: 'up' | 'down' | 'stable';
    rank: number;
  }>;
  topRated: Array<{
    id: string;
    title: string;
    averageRating: number;
    totalRatings: number;
    rank: number;
  }>;
  mostDownloaded: Array<{
    id: string;
    title: string;
    downloads: number;
    rank: number;
  }>;
}

// Course Management
export interface ICreateCourseRequest {
  title: string;
  description: string;
  subject: string;
  gradeLevel: string;
  instructorId: string;
  duration: number;
  totalHours: number;
  difficulty: TDifficultyLevel;
  maxStudents: number;
  startDate: Date;
  endDate: Date;
  enrollmentDeadline: Date;
  isSelfPaced?: boolean;
  prerequisites?: string[];
  learningObjectives?: string[];
  tags?: string[];
}

export interface IUpdateCourseRequest {
  title?: string;
  description?: string;
  instructorId?: string;
  duration?: number;
  totalHours?: number;
  difficulty?: TDifficultyLevel;
  maxStudents?: number;
  startDate?: Date;
  endDate?: Date;
  enrollmentDeadline?: Date;
  isSelfPaced?: boolean;
  prerequisites?: string[];
  learningObjectives?: string[];
  tags?: string[];
  isActive?: boolean;
}

export interface IEnrollInCourseRequest {
  courseId: string;
  studentId: string;
}

export interface IEnrollInCourseResponse {
  enrollmentId: string;
  courseId: string;
  studentId: string;
  enrollmentDate: Date;
  status: TEnrollmentStatus;
  message: string;
}

// Assessment and Grading
export interface ISubmitAssessmentRequest {
  assessmentId: string;
  studentId: string;
  answers: Record<string, any>;
  timeSpent?: number;
}

export interface ISubmitAssessmentResponse {
  assessmentId: string;
  studentId: string;
  submissionId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  feedback?: string;
  submittedAt: Date;
}

// Discussion and Collaboration
export interface ICreateDiscussionRequest {
  courseId?: string;
  contentId?: string;
  type: TDiscussionType;
  title: string;
  content: string;
  tags?: string[];
}

export interface ICreateDiscussionResponse {
  discussionId: string;
  type: TDiscussionType;
  title: string;
  createdAt: Date;
  message: string;
}

export interface IReplyToDiscussionRequest {
  discussionId: string;
  content: string;
}

export interface IReplyToDiscussionResponse {
  replyId: string;
  discussionId: string;
  createdAt: Date;
  message: string;
}

// Virtual Classroom
export interface IScheduleVirtualClassRequest {
  courseId: string;
  title: string;
  description: string;
  scheduledDate: Date;
  duration: number;
  maxParticipants?: number;
}

export interface IScheduleVirtualClassResponse {
  classroomId: string;
  meetingUrl: string;
  meetingId: string;
  password?: string;
  scheduledDate: Date;
  message: string;
}

export interface IJoinVirtualClassRequest {
  classroomId: string;
  studentId: string;
}

export interface IJoinVirtualClassResponse {
  classroomId: string;
  studentId: string;
  joinUrl: string;
  token: string;
  joinedAt: Date;
}

// Analytics and Reporting
export interface IGetLearningAnalyticsRequest {
  studentId?: string;
  courseId?: string;
  contentId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface IGetLearningAnalyticsResponse {
  summary: {
    totalStudents: number;
    totalCourses: number;
    totalContent: number;
    totalEnrollments: number;
    averageCompletionRate: number;
    averageEngagementTime: number;
  };
  studentAnalytics?: {
    studentId: string;
    coursesEnrolled: number;
    coursesCompleted: number;
    totalTimeSpent: number;
    averageScore: number;
    learningStreak: number;
    achievements: string[];
  };
  courseAnalytics?: {
    courseId: string;
    totalEnrollments: number;
    completionRate: number;
    averageScore: number;
    totalTimeSpent: number;
    dropOutRate: number;
    popularContent: Array<{
      contentId: string;
      title: string;
      views: number;
      completionRate: number;
    }>;
  };
  contentAnalytics?: {
    contentId: string;
    totalViews: number;
    completionRate: number;
    averageRating: number;
    totalTimeSpent: number;
    popularSections: Array<{
      section: string;
      views: number;
      averageTime: number;
    }>;
  };
}

// Progress Tracking
export interface IUpdateProgressRequest {
  studentId: string;
  contentId?: string;
  courseId?: string;
  moduleId?: string;
  progress: number;
  timeSpent: number;
  lastPosition?: number;
  completed?: boolean;
}

export interface IUpdateProgressResponse {
  progressId: string;
  studentId: string;
  progress: number;
  timeSpent: number;
  updatedAt: Date;
  completed: boolean;
  message: string;
}

// Learning Path Management
export interface ICreateLearningPathRequest {
  title: string;
  description: string;
  type: TLearningPathType;
  targetAudience: string[];
  estimatedDuration: number;
  difficulty: TDifficultyLevel;
  courses: Array<{
    courseId: string;
    order: number;
    isRequired: boolean;
  }>;
  skills?: string[];
  certifications?: string[];
  prerequisites?: string[];
}

export interface ICreateLearningPathResponse {
  pathId: string;
  title: string;
  createdAt: Date;
  message: string;
}

// Certificate Management
export interface IGenerateCertificateRequest {
  studentId: string;
  courseId: string;
  certificateType: 'completion' | 'achievement' | 'participation';
}

export interface IGenerateCertificateResponse {
  certificateId: string;
  studentId: string;
  courseId: string;
  certificateUrl: string;
  issuedAt: Date;
  validUntil?: Date;
  message: string;
}

// Notification and Communication
export interface ISendNotificationRequest {
  studentIds: string[];
  title: string;
  message: string;
  type: 'announcement' | 'reminder' | 'achievement' | 'deadline';
  data?: Record<string, any>;
  actionUrl?: string;
}

export interface ISendNotificationResponse {
  notificationId: string;
  sentTo: number;
  failed: number;
  sentAt: Date;
  message: string;
}

// Bulk Operations
export interface IBulkEnrollRequest {
  courseId: string;
  studentIds: string[];
}

export interface IBulkEnrollResponse {
  courseId: string;
  successful: number;
  failed: number;
  errors: Array<{
    studentId: string;
    error: string;
  }>;
  enrolledAt: Date;
}

export interface IBulkContentUploadRequest {
  files: any[];
  metadata: Array<{
    title: string;
    description?: string;
    subject: string;
    grade: string;
    type: TContentType;
    tags?: string[];
  }>;
}

export interface IBulkContentUploadResponse {
  totalFiles: number;
  successful: number;
  failed: number;
  results: Array<{
    fileName: string;
    contentId?: string;
    error?: string;
  }>;
  uploadedAt: Date;
}

// Settings and Configuration
export interface IOnlineLearningSettings {
  schoolId: string;
  generalSettings: {
    platformName: string;
    defaultLanguage: string;
    timezone: string;
    maxFileSize: number;
    allowedFileTypes: string[];
    enableGuestAccess: boolean;
  };
  courseSettings: {
    defaultMaxStudents: number;
    defaultDuration: number;
    autoEnrollment: boolean;
    requireApproval: boolean;
    allowSelfPaced: boolean;
  };
  assessmentSettings: {
    defaultPassingScore: number;
    maxAttempts: number;
    showAnswersAfter: boolean;
    allowReview: boolean;
    timeLimit: number;
  };
  virtualClassroomSettings: {
    defaultPlatform: string;
    recordingEnabled: boolean;
    maxParticipants: number;
    allowScreenShare: boolean;
    allowChat: boolean;
  };
  notificationSettings: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    reminderFrequency: number;
  };
}