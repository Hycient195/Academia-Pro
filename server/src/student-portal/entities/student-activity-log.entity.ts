import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { StudentPortalAccess } from './student-portal-access.entity';

export enum StudentActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PAGE_VIEW = 'page_view',
  ASSIGNMENT_VIEW = 'assignment_view',
  ASSIGNMENT_SUBMIT = 'assignment_submit',
  GRADE_VIEW = 'grade_view',
  TIMETABLE_VIEW = 'timetable_view',
  RESOURCE_ACCESS = 'resource_access',
  COMMUNICATION_SEND = 'communication_send',
  COMMUNICATION_RECEIVE = 'communication_receive',
  PROFILE_UPDATE = 'profile_update',
  PASSWORD_CHANGE = 'password_change',
  SETTINGS_UPDATE = 'settings_update',
  SELF_SERVICE_REQUEST = 'self_service_request',
  EXTRACURRICULAR_JOIN = 'extracurricular_join',
  EXTRACURRICULAR_LEAVE = 'extracurricular_leave',
  WELLNESS_CHECK = 'wellness_check',
  CAREER_ASSESSMENT = 'career_assessment',
  EMERGENCY_CONTACT = 'emergency_contact',
  SECURITY_ALERT = 'security_alert',
}

@Entity('student_activity_logs')
@Index(['studentPortalAccessId', 'activityType'])
@Index(['studentPortalAccessId', 'createdAt'])
@Index(['activityType', 'createdAt'])
export class StudentActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_portal_access_id', type: 'uuid' })
  studentPortalAccessId: string;

  @Column({
    name: 'activity_type',
    type: 'enum',
    enum: StudentActivityType,
  })
  activityType: StudentActivityType;

  @Column({ name: 'activity_description', type: 'varchar', length: 500 })
  activityDescription: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'varchar', length: 500, nullable: true })
  userAgent: string;

  @Column({ name: 'device_info', type: 'jsonb', nullable: true })
  deviceInfo: {
    deviceType: string;
    browser: string;
    os: string;
    screenResolution: string;
  };

  @Column({ name: 'location_info', type: 'jsonb', nullable: true })
  locationInfo: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };

  @Column({ name: 'resource_id', type: 'varchar', length: 100, nullable: true })
  resourceId: string;

  @Column({ name: 'resource_type', type: 'varchar', length: 50, nullable: true })
  resourceType: string;

  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ name: 'session_id', type: 'varchar', length: 100, nullable: true })
  sessionId: string;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds: number;

  @Column({ name: 'is_successful', type: 'boolean', default: true })
  isSuccessful: boolean;

  @Column({ name: 'error_message', type: 'varchar', length: 500, nullable: true })
  errorMessage: string;

  @Column({ name: 'security_flags', type: 'jsonb', nullable: true })
  securityFlags: {
    suspiciousActivity: boolean;
    unusualLocation: boolean;
    unusualDevice: boolean;
    unusualTime: boolean;
    failedAttempts: number;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => StudentPortalAccess, access => access.activityLogs)
  @JoinColumn({ name: 'student_portal_access_id' })
  studentPortalAccess: StudentPortalAccess;
}