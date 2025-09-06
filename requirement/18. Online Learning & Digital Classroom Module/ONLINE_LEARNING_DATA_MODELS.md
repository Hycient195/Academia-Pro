# Online Learning & Digital Classroom Module - Data Models

## Overview

This document defines the TypeScript interfaces and data models for the Online Learning & Digital Classroom Module, ensuring type safety and consistency across the application.

## 1. Enums and Constants

```typescript
// Content and Assessment Types
export enum ContentType {
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  PRESENTATION = 'presentation',
  INTERACTIVE = 'interactive',
  SCORM = 'scorm',
  QUIZ = 'quiz'
}

export enum AssessmentType {
  QUIZ = 'quiz',
  ASSIGNMENT = 'assignment',
  PROJECT = 'project',
  EXAM = 'exam',
  DISCUSSION = 'discussion',
  PEER_REVIEW = 'peer_review'
}

export enum ClassroomStatus {
  SCHEDULED = 'scheduled',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}

export enum IUserPermissionRole {
  INSTRUCTOR = 'instructor',
  STUDENT = 'student',
  GUEST = 'guest',
  MODERATOR = 'moderator'
}

export enum AccessLevel {
  PUBLIC = 'public',
  ENROLLED = 'enrolled',
  PRIVATE = 'private',
  RESTRICTED = 'restricted'
}

export enum LearningPathStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  ABANDONED = 'abandoned'
}

export enum EngagementLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXCELLENT = 'excellent'
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert'
}
```

## 2. Core Interfaces

### 2.1 Virtual Classroom Interfaces

```typescript
export interface IVirtualClassroom {
  classroomId: string;
  schoolId: string;
  courseId: string;
  classroomName: string;
  description?: string;
  instructorId: string;
  instructor?: IUser;
  maxParticipants: number;
  currentParticipants?: number;
  startTime: Date;
  endTime: Date;
  durationMinutes?: number;
  status: ClassroomStatus;
  recordingEnabled: boolean;
  recordingUrl?: string;
  interactiveTools: IInteractiveTools;
  settings: IClassroomSettings;
  participants?: IClassroomParticipant[];
  sessions?: IClassroomSession[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IClassroomParticipant {
  participantId: string;
  classroomId: string;
  userId: string;
  user?: IUser;
  userType: IUserPermissionRole;
  joinTime: Date;
  leaveTime?: Date;
  isMuted: boolean;
  isVideoOn: boolean;
  handRaised: boolean;
  engagementScore?: number;
  participationData?: IParticipationData;
  createdAt: Date;
}

export interface IClassroomSession {
  sessionId: string;
  classroomId: string;
  sessionStart: Date;
  sessionEnd?: Date;
  participantCount: number;
  recordingAvailable: boolean;
  sessionNotes?: string;
  engagementMetrics?: IEngagementMetrics;
  technicalIssues?: ITechnicalIssue[];
  createdAt: Date;
}

export interface IInteractiveTools {
  whiteboard: boolean;
  polling: boolean;
  breakoutRooms: boolean;
  screenSharing: boolean;
  chat: boolean;
  fileSharing: boolean;
  annotations: boolean;
  recording: boolean;
}

export interface IClassroomSettings {
  allowGuests: boolean;
  muteOnEntry: boolean;
  waitingRoom: boolean;
  allowRecording: boolean;
  maxVideoStreams: number;
  bandwidthLimit: number;
  language: string;
  timezone: string;
}
```

### 2.2 Digital Content Interfaces

```typescript
export interface IDigitalContent {
  contentId: string;
  schoolId: string;
  title: string;
  description?: string;
  contentType: ContentType;
  filePath: string;
  thumbnailPath?: string;
  durationMinutes?: number;
  fileSizeBytes: number;
  metadata: IContentMetadata;
  tags: string[];
  accessLevel: AccessLevel;
  createdBy: string;
  creator?: IUser;
  versionNumber: number;
  isActive: boolean;
  isDownloadable: boolean;
  copyrightInfo?: string;
  licenseType?: string;
  viewCount: number;
  averageRating?: number;
  ratings?: IContentRating[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IContentMetadata {
  resolution?: string;
  bitrate?: string;
  format: string;
  encoding?: string;
  language: string;
  subtitles?: string[];
  chapters?: IContentChapter[];
  transcript?: string;
  keywords?: string[];
  difficulty: DifficultyLevel;
  prerequisites?: string[];
  learningObjectives?: string[];
}

export interface IContentChapter {
  title: string;
  startTime: number; // seconds
  endTime: number; // seconds
  description?: string;
}

export interface IContentRating {
  userId: string;
  rating: number; // 1-5
  review?: string;
  createdAt: Date;
}

export interface IContentModule {
  moduleId: string;
  courseId: string;
  moduleTitle: string;
  moduleDescription?: string;
  sequenceOrder: number;
  estimatedDurationMinutes: number;
  prerequisites?: string[];
  completionCriteria: ICompletionCriteria;
  isMandatory: boolean;
  isActive: boolean;
  contentItems?: IModuleContent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IModuleContent {
  moduleContentId: string;
  moduleId: string;
  contentId: string;
  content?: IDigitalContent;
  contentOrder: number;
  isRequired: boolean;
  timeLimitMinutes?: number;
  createdAt: Date;
}

export interface ICompletionCriteria {
  requiredContentViews: number;
  requiredAssessments: number;
  minimumScore?: number;
  requiredTimeSpent?: number;
  prerequisitesCompleted: boolean;
}
```

### 2.3 Assessment and Evaluation Interfaces

```typescript
export interface IAssessment {
  assessmentId: string;
  moduleId: string;
  module?: IContentModule;
  assessmentTitle: string;
  assessmentType: AssessmentType;
  instructions: string;
  timeLimitMinutes?: number;
  passingScore: number;
  maxAttempts: number;
  isGraded: boolean;
  plagiarismCheckEnabled: boolean;
  questions: IAssessmentQuestion[];
  rubric?: IAssessmentRubric;
  settings: IAssessmentSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAssessmentQuestion {
  questionId: string;
  questionType: QuestionType;
  questionText: string;
  options?: string[]; // for multiple choice
  correctAnswer?: any;
  points: number;
  explanation?: string;
  hints?: string[];
  timeLimitSeconds?: number;
  difficulty: DifficultyLevel;
  tags?: string[];
}

export interface IAssessmentRubric {
  criteria: IRubricCriterion[];
  totalPoints: number;
  gradingScale: IGradingScale;
}

export interface IRubricCriterion {
  name: string;
  description?: string;
  weight: number; // percentage
  levels: IRubricLevel[];
}

export interface IRubricLevel {
  score: number;
  description: string;
  examples?: string[];
}

export interface IGradingScale {
  excellent: { min: number; max: number; grade: string };
  good: { min: number; max: number; grade: string };
  satisfactory: { min: number; max: number; grade: string };
  needs_improvement: { min: number; max: number; grade: string };
}

export interface IAssessmentSubmission {
  submissionId: string;
  assessmentId: string;
  assessment?: IAssessment;
  studentId: string;
  student?: IUser;
  answers: IQuestionAnswer[];
  submittedAt: Date;
  gradedAt?: Date;
  score?: number;
  feedback?: string;
  attemptNumber: number;
  status: SubmissionStatus;
  plagiarismScore?: number;
  timeSpentMinutes: number;
  deviceInfo?: IDeviceInfo;
  createdAt: Date;
}

export interface IQuestionAnswer {
  questionId: string;
  answer: any;
  isCorrect?: boolean;
  points?: number;
  timeSpentSeconds: number;
  confidenceLevel?: number; // 1-5
}

export interface IAssessmentSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showResultsImmediately: boolean;
  allowReview: boolean;
  allowSaveProgress: boolean;
  requireLockdown: boolean;
  webcamRequired: boolean;
  microphoneRequired: boolean;
}
```

### 2.4 Learning Analytics Interfaces

```typescript
export interface ILearningAnalytics {
  analyticsId: string;
  studentId: string;
  student?: IUser;
  courseId: string;
  moduleId?: string;
  contentId?: string;
  activityType: ActivityType;
  activityData: IActivityData;
  durationSeconds: number;
  completionStatus: CompletionStatus;
  engagementScore: number;
  timestamp: Date;
  sessionId?: string;
  deviceInfo?: IDeviceInfo;
  locationInfo?: ILocationInfo;
}

export interface IActivityData {
  contentViews?: IContentViewData;
  assessmentAttempts?: IAssessmentAttemptData;
  discussionParticipation?: IDiscussionParticipationData;
  classroomAttendance?: IClassroomAttendanceData;
  collaborationActivity?: ICollaborationActivityData;
}

export interface IContentViewData {
  contentId: string;
  startTime: Date;
  endTime: Date;
  watchTimeSeconds: number;
  completionPercentage: number;
  interactions: IContentInteraction[];
  pauseCount: number;
  rewindCount: number;
  speedChanges: number;
}

export interface IContentInteraction {
  interactionType: string; // click, hover, scroll, etc.
  timestamp: Date;
  element?: string;
  data?: any;
}

export interface IAssessmentAttemptData {
  assessmentId: string;
  attemptNumber: number;
  startTime: Date;
  endTime: Date;
  score?: number;
  questionsAnswered: number;
  timePerQuestion: number[];
  hintsUsed: number;
}

export interface IDiscussionParticipationData {
  forumId: string;
  postsCreated: number;
  repliesGiven: number;
  postsRead: number;
  timeSpentReading: number;
  likesReceived: number;
  likesGiven: number;
}

export interface IClassroomAttendanceData {
  classroomId: string;
  joinTime: Date;
  leaveTime?: Date;
  totalTimeMinutes: number;
  participationScore: number;
  interactions: IClassroomInteraction[];
}

export interface IClassroomInteraction {
  interactionType: string; // chat, poll, raise_hand, etc.
  timestamp: Date;
  data?: any;
}

export interface ICollaborationActivityData {
  projectId?: string;
  groupId?: string;
  contributions: number;
  peerReviews: number;
  filesShared: number;
  meetingsAttended: number;
}

export interface IEngagementMetrics {
  totalStudyTime: number; // minutes
  averageSessionLength: number; // minutes
  sessionsPerWeek: number;
  consistencyScore: number; // 0-100
  interactionFrequency: number;
  contentConsumptionRate: number;
  assessmentCompletionRate: number;
  collaborationIndex: number;
}

export interface IPerformanceMetrics {
  overallScore: number;
  subjectScores: Record<string, number>;
  improvementRate: number;
  strengthAreas: string[];
  weaknessAreas: string[];
  learningVelocity: number;
  retentionRate: number;
}
```

### 2.5 Learning Path and Personalization Interfaces

```typescript
export interface ILearningPath {
  pathId: string;
  studentId: string;
  student?: IUser;
  courseId: string;
  currentModuleId?: string;
  progressPercentage: number;
  estimatedCompletionDate?: Date;
  learningPace: LearningPace;
  personalizedRecommendations: IPersonalizedRecommendation[];
  pathStatus: LearningPathStatus;
  learningObjectives: string[];
  prerequisites: string[];
  adaptiveSettings: IAdaptiveSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPersonalizedRecommendation {
  recommendationId: string;
  recommendationType: RecommendationType;
  contentId?: string;
  moduleId?: string;
  assessmentId?: string;
  priority: number; // 1-10
  reason: string;
  expectedImpact: number; // 0-100
  createdAt: Date;
}

export interface IAdaptiveSettings {
  difficultyAdjustment: boolean;
  paceAdjustment: boolean;
  contentRecommendations: boolean;
  assessmentAdaptation: boolean;
  interventionTriggers: IInterventionTrigger[];
  learningStyle: LearningStyle;
  preferredContentTypes: ContentType[];
  optimalStudyTime: number; // minutes per day
}

export interface IInterventionTrigger {
  triggerType: TriggerType;
  threshold: number;
  action: InterventionAction;
  cooldownDays: number;
}

export interface ILearningProfile {
  profileId: string;
  studentId: string;
  learningStyle: LearningStyle;
  preferredPace: LearningPace;
  strengthSubjects: string[];
  weaknessSubjects: string[];
  engagementPatterns: IEngagementPattern[];
  performanceTrends: IPerformanceTrend[];
  preferredContentTypes: ContentType[];
  optimalStudyTimes: string[]; // e.g., ["09:00-11:00", "14:00-16:00"]
  devicePreferences: IDevicePreference[];
  lastUpdated: Date;
}

export interface IEngagementPattern {
  patternType: string;
  frequency: number;
  peakTimes: string[];
  duration: number;
  consistency: number;
}

export interface IPerformanceTrend {
  subject: string;
  trend: 'improving' | 'stable' | 'declining';
  rate: number; // percentage change per week
  confidence: number; // 0-100
}
```

### 2.6 Collaboration and Communication Interfaces

```typescript
export interface IDiscussionForum {
  forumId: string;
  courseId: string;
  forumTitle: string;
  forumDescription?: string;
  isModerated: boolean;
  moderatorId?: string;
  moderator?: IUser;
  allowAnonymousPosts: boolean;
  isActive: boolean;
  postCount: number;
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IForumPost {
  postId: string;
  forumId: string;
  forum?: IDiscussionForum;
  parentPostId?: string; // for replies
  authorId: string;
  author?: IUser;
  postTitle: string;
  postContent: string;
  isPinned: boolean;
  isLocked: boolean;
  likesCount: number;
  repliesCount: number;
  tags?: string[];
  attachments?: IPostAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPostAttachment {
  attachmentId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
}

export interface ICollaborativeProject {
  projectId: string;
  courseId: string;
  projectTitle: string;
  description: string;
  maxGroupSize: number;
  currentGroupSize: number;
  dueDate: Date;
  deliverables: IDeliverable[];
  rubric: IProjectRubric;
  status: ProjectStatus;
  createdBy: string;
  creator?: IUser;
  groups?: IProjectGroup[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectGroup {
  groupId: string;
  projectId: string;
  groupName: string;
  members: IGroupMember[];
  leaderId: string;
  leader?: IUser;
  deliverables: IGroupDeliverable[];
  progress: number;
  grade?: number;
  feedback?: string;
  createdAt: Date;
}

export interface IGroupMember {
  userId: string;
  user?: IUser;
  role: GroupRole;
  joinedAt: Date;
  contributions: number;
  peerRating?: number;
}

export interface IGroupDeliverable {
  deliverableId: string;
  deliverable: IDeliverable;
  submittedAt?: Date;
  submittedBy: string;
  filePath?: string;
  grade?: number;
  feedback?: string;
}
```

## 3. Request and Response Interfaces

### 3.1 API Request Interfaces

```typescript
export interface ICreateClassroomRequest {
  schoolId: string;
  courseId: string;
  classroomName: string;
  description?: string;
  instructorId: string;
  maxParticipants: number;
  startTime: Date;
  endTime: Date;
  recordingEnabled: boolean;
  interactiveTools: IInteractiveTools;
  settings: IClassroomSettings;
}

export interface IUpdateClassroomRequest {
  classroomName?: string;
  description?: string;
  maxParticipants?: number;
  startTime?: Date;
  endTime?: Date;
  interactiveTools?: Partial<IInteractiveTools>;
  settings?: Partial<IClassroomSettings>;
}

export interface IJoinClassroomRequest {
  userId: string;
  userType: IUserPermissionRole;
  deviceInfo: IDeviceInfo;
}

export interface ICreateContentRequest {
  schoolId: string;
  title: string;
  description?: string;
  contentType: ContentType;
  courseId: string;
  moduleId?: string;
  tags: string[];
  accessLevel: AccessLevel;
  isDownloadable: boolean;
  metadata: IContentMetadata;
}

export interface ICreateAssessmentRequest {
  moduleId: string;
  assessmentTitle: string;
  assessmentType: AssessmentType;
  instructions: string;
  timeLimitMinutes?: number;
  passingScore: number;
  maxAttempts: number;
  isGraded: boolean;
  plagiarismCheckEnabled: boolean;
  questions: IAssessmentQuestion[];
  rubric?: IAssessmentRubric;
  settings: IAssessmentSettings;
}

export interface ISubmitAssessmentRequest {
  assessmentId: string;
  answers: IQuestionAnswer[];
  attemptNumber: number;
  startTime: Date;
  endTime: Date;
  deviceInfo?: IDeviceInfo;
}
```

### 3.2 API Response Interfaces

```typescript
export interface IClassroomResponse extends IVirtualClassroom {
  instructor: IUser;
  participants: IClassroomParticipant[];
  sessionCount: number;
  totalAttendance: number;
}

export interface IContentResponse extends IDigitalContent {
  creator: IUser;
  moduleCount: number;
  averageRating: number;
  totalViews: number;
}

export interface IAssessmentResponse extends IAssessment {
  module: IContentModule;
  submissionCount: number;
  averageScore?: number;
  completionRate: number;
}

export interface IAnalyticsResponse {
  studentId: string;
  courseId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  engagementMetrics: IEngagementMetrics;
  performanceMetrics: IPerformanceMetrics;
  learningPath: ILearningPath;
  recommendations: IPersonalizedRecommendation[];
}

export interface IProgressResponse {
  studentId: string;
  courseId: string;
  overallProgress: number;
  modulesProgress: IModuleProgress[];
  nextRecommendedActivities: IRecommendedActivity[];
  estimatedCompletionDate: Date;
  currentStreak: number; // days
  studyTimeThisWeek: number;
}

export interface IModuleProgress {
  moduleId: string;
  moduleTitle: string;
  progress: number;
  completedAt?: Date;
  score?: number;
  timeSpent: number;
  status: 'not_started' | 'in_progress' | 'completed';
}
```

## 4. Supporting Types and Enums

```typescript
export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  MULTIPLE_SELECT = 'multiple_select',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  ESSAY = 'essay',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING = 'matching',
  ORDERING = 'ordering'
}

export enum SubmissionStatus {
  SUBMITTED = 'submitted',
  GRADED = 'graded',
  RETURNED = 'returned',
  LATE = 'late',
  DRAFT = 'draft'
}

export enum ActivityType {
  CONTENT_VIEW = 'content_view',
  ASSESSMENT_ATTEMPT = 'assessment_attempt',
  DISCUSSION_PARTICIPATION = 'discussion_participation',
  CLASSROOM_ATTENDANCE = 'classroom_attendance',
  COLLABORATION_ACTIVITY = 'collaboration_activity',
  STUDY_SESSION = 'study_session'
}

export enum CompletionStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned'
}

export enum LearningPace {
  ACCELERATED = 'accelerated',
  NORMAL = 'normal',
  RELAXED = 'relaxed'
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING = 'reading'
}

export enum RecommendationType {
  CONTENT = 'content',
  ASSESSMENT = 'assessment',
  MODULE = 'module',
  STUDY_SESSION = 'study_session',
  INTERVENTION = 'intervention'
}

export enum TriggerType {
  LOW_ENGAGEMENT = 'low_engagement',
  DECLINING_PERFORMANCE = 'declining_performance',
  MISSED_DEADLINES = 'missed_deadlines',
  LOW_ATTENDANCE = 'low_attendance'
}

export enum InterventionAction {
  EMAIL_REMINDER = 'email_reminder',
  SCHEDULE_MEETING = 'schedule_meeting',
  ADJUST_DIFFICULTY = 'adjust_difficulty',
  PROVIDE_RESOURCES = 'provide_resources',
  CONTACT_PARENT = 'contact_parent'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  SUBMISSION = 'submission',
  GRADING = 'grading',
  COMPLETED = 'completed'
}

export enum GroupRole {
  LEADER = 'leader',
  MEMBER = 'member',
  REVIEWER = 'reviewer'
}

export interface IDeviceInfo {
  type: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  screenResolution?: string;
  networkType?: string;
}

export interface ILocationInfo {
  ipAddress: string;
  country?: string;
  region?: string;
  city?: string;
  timezone: string;
}

export interface ITechnicalIssue {
  issueId: string;
  issueType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  resolved: boolean;
  resolution?: string;
}

export interface IParticipationData {
  chatMessages: number;
  pollsAnswered: number;
  handRaises: number;
  screenShares: number;
  filesShared: number;
  breakoutRoomJoins: number;
}

export interface IRecommendedActivity {
  activityId: string;
  activityType: ActivityType;
  title: string;
  description: string;
  estimatedTime: number; // minutes
  priority: number;
  dueDate?: Date;
}
```

## 5. Validation Rules and Business Logic

```typescript
export interface IOnlineLearningValidationRules {
  maxClassroomParticipants: number;
  maxContentFileSize: number; // bytes
  maxAssessmentAttempts: number;
  maxForumPostLength: number;
  maxDiscussionNesting: number;
  minAssessmentPassingScore: number;
  maxAssessmentTimeLimit: number; // minutes
  maxModuleContentItems: number;
  maxProjectGroupSize: number;
  maxRecommendationPriority: number;
}

export interface IOnlineLearningBusinessRules {
  classroomBufferTime: number; // minutes before/after session
  assessmentGracePeriod: number; // minutes for late submissions
  contentRetentionPeriod: number; // days
  analyticsRetentionPeriod: number; // days
  maxConcurrentSessions: number;
  plagiarismCheckThreshold: number; // percentage
  engagementAlertThreshold: number; // percentage below average
  performanceDeclineThreshold: number; // percentage drop
}
```

This comprehensive data model specification provides the foundation for implementing a robust, scalable online learning platform with strong typing, validation, and business rule enforcement.