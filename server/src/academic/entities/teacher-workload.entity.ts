import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum WorkloadType {
  TEACHING_HOURS = 'teaching_hours',
  PREPARATION_TIME = 'preparation_time',
  ASSESSMENT_TIME = 'assessment_time',
  ADMINISTRATIVE_DUTIES = 'administrative_duties',
  EXTRACURRICULAR_ACTIVITIES = 'extracurricular_activities',
}

export enum WorkloadStatus {
  UNDER_LOADED = 'under_loaded',
  OPTIMAL = 'optimal',
  OVER_LOADED = 'over_loaded',
  CRITICAL = 'critical',
}

@Entity('teacher_workloads')
@Index(['teacherId', 'academicYear'])
@Index(['schoolId', 'academicYear'])
@Index(['workloadStatus', 'academicYear'])
export class TeacherWorkload {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacherId: string;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @Column({ name: 'total_teaching_hours', type: 'decimal', precision: 6, scale: 2, default: 0 })
  totalTeachingHours: number;

  @Column({ name: 'total_preparation_hours', type: 'decimal', precision: 6, scale: 2, default: 0 })
  totalPreparationHours: number;

  @Column({ name: 'total_assessment_hours', type: 'decimal', precision: 6, scale: 2, default: 0 })
  totalAssessmentHours: number;

  @Column({ name: 'total_administrative_hours', type: 'decimal', precision: 6, scale: 2, default: 0 })
  totalAdministrativeHours: number;

  @Column({ name: 'total_extracurricular_hours', type: 'decimal', precision: 6, scale: 2, default: 0 })
  totalExtracurricularHours: number;

  @Column({ name: 'total_workload_hours', type: 'decimal', precision: 6, scale: 2, default: 0 })
  totalWorkloadHours: number;

  @Column({ name: 'contracted_hours', type: 'decimal', precision: 6, scale: 2, default: 40 })
  contractedHours: number; // Weekly contracted hours

  @Column({ name: 'max_allowed_hours', type: 'decimal', precision: 6, scale: 2, default: 50 })
  maxAllowedHours: number; // Maximum allowed weekly hours

  @Column({
    name: 'workload_status',
    type: 'enum',
    enum: WorkloadStatus,
    default: WorkloadStatus.OPTIMAL,
  })
  workloadStatus: WorkloadStatus;

  @Column({ name: 'workload_percentage', type: 'decimal', precision: 5, scale: 2, default: 0 })
  workloadPercentage: number; // Percentage of contracted hours

  @Column({ name: 'subjects_taught', type: 'jsonb', nullable: true })
  subjectsTaught: Array<{
    subjectId: string;
    subjectName: string;
    gradeLevel: string;
    hoursPerWeek: number;
    classCount: number;
    studentCount: number;
  }>;

  @Column({ name: 'classes_assigned', type: 'jsonb', nullable: true })
  classesAssigned: Array<{
    classId: string;
    className: string;
    gradeLevel: string;
    section: string;
    subject: string;
    hoursPerWeek: number;
    studentCount: number;
  }>;

  @Column({ name: 'weekly_schedule', type: 'jsonb', nullable: true })
  weeklySchedule: Record<string, Array<{
    day: string;
    startTime: string;
    endTime: string;
    subject: string;
    class: string;
    classroom: string;
  }>>;

  @Column({ name: 'workload_distribution', type: 'jsonb', nullable: true })
  workloadDistribution: {
    teaching: number; // percentage
    preparation: number;
    assessment: number;
    administrative: number;
    extracurricular: number;
  };

  @Column({ name: 'performance_metrics', type: 'jsonb', nullable: true })
  performanceMetrics: {
    studentSatisfaction: number;
    teachingEffectiveness: number;
    punctuality: number;
    lessonPlanning: number;
    assessmentQuality: number;
  };

  @Column({ name: 'leave_balance', type: 'jsonb', nullable: true })
  leaveBalance: {
    annualLeave: number;
    sickLeave: number;
    maternityLeave: number;
    otherLeave: number;
  };

  @Column({ name: 'substitute_assignments', type: 'jsonb', nullable: true })
  substituteAssignments: Array<{
    date: Date;
    subject: string;
    class: string;
    reason: string;
    status: string;
  }>;

  @Column({ name: 'professional_development', type: 'jsonb', nullable: true })
  professionalDevelopment: Array<{
    activity: string;
    type: string;
    hours: number;
    date: Date;
    provider: string;
  }>;

  @Column({ name: 'workload_alerts', type: 'jsonb', nullable: true })
  workloadAlerts: Array<{
    type: 'overload' | 'underload' | 'imbalance';
    message: string;
    severity: 'low' | 'medium' | 'high';
    date: Date;
    resolved: boolean;
  }>;

  @Column({ name: 'last_updated', type: 'timestamp' })
  lastUpdated: Date;

  @Column({ name: 'next_review_date', type: 'date', nullable: true })
  nextReviewDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Virtual properties
  get isOverloaded(): boolean {
    return this.workloadStatus === WorkloadStatus.OVER_LOADED ||
           this.workloadStatus === WorkloadStatus.CRITICAL;
  }

  get isUnderloaded(): boolean {
    return this.workloadStatus === WorkloadStatus.UNDER_LOADED;
  }

  get isOptimal(): boolean {
    return this.workloadStatus === WorkloadStatus.OPTIMAL;
  }

  get availableHours(): number {
    return Math.max(0, this.contractedHours - this.totalWorkloadHours);
  }

  get overtimeHours(): number {
    return Math.max(0, this.totalWorkloadHours - this.contractedHours);
  }

  get utilizationRate(): number {
    return this.contractedHours > 0 ? (this.totalWorkloadHours / this.contractedHours) * 100 : 0;
  }

  // Methods
  updateWorkloadStatus(): void {
    const utilization = this.utilizationRate;

    if (utilization < 60) {
      this.workloadStatus = WorkloadStatus.UNDER_LOADED;
    } else if (utilization >= 60 && utilization <= 90) {
      this.workloadStatus = WorkloadStatus.OPTIMAL;
    } else if (utilization > 90 && utilization <= 110) {
      this.workloadStatus = WorkloadStatus.OVER_LOADED;
    } else {
      this.workloadStatus = WorkloadStatus.CRITICAL;
    }

    this.workloadPercentage = utilization;
    this.lastUpdated = new Date();
    this.updatedAt = new Date();
  }

  addTeachingHours(hours: number, subjectId: string, subjectName: string): void {
    this.totalTeachingHours += hours;
    this.totalWorkloadHours += hours;

    if (!this.subjectsTaught) {
      this.subjectsTaught = [];
    }

    const existingSubject = this.subjectsTaught.find(s => s.subjectId === subjectId);
    if (existingSubject) {
      existingSubject.hoursPerWeek += hours;
    } else {
      this.subjectsTaught.push({
        subjectId,
        subjectName,
        gradeLevel: '',
        hoursPerWeek: hours,
        classCount: 1,
        studentCount: 0,
      });
    }

    this.updateWorkloadStatus();
  }

  removeTeachingHours(hours: number, subjectId: string): void {
    this.totalTeachingHours = Math.max(0, this.totalTeachingHours - hours);
    this.totalWorkloadHours = Math.max(0, this.totalWorkloadHours - hours);

    if (this.subjectsTaught) {
      const subject = this.subjectsTaught.find(s => s.subjectId === subjectId);
      if (subject) {
        subject.hoursPerWeek = Math.max(0, subject.hoursPerWeek - hours);
        if (subject.hoursPerWeek === 0) {
          this.subjectsTaught = this.subjectsTaught.filter(s => s.subjectId !== subjectId);
        }
      }
    }

    this.updateWorkloadStatus();
  }

  addAlert(type: 'overload' | 'underload' | 'imbalance', message: string, severity: 'low' | 'medium' | 'high'): void {
    if (!this.workloadAlerts) {
      this.workloadAlerts = [];
    }

    this.workloadAlerts.push({
      type,
      message,
      severity,
      date: new Date(),
      resolved: false,
    });

    this.updatedAt = new Date();
  }

  resolveAlert(index: number): void {
    if (this.workloadAlerts && this.workloadAlerts[index]) {
      this.workloadAlerts[index].resolved = true;
      this.updatedAt = new Date();
    }
  }

  // Static factory methods
  static createWorkload(
    teacherId: string,
    schoolId: string,
    academicYear: string,
    contractedHours: number = 40,
  ): TeacherWorkload {
    const workload = new TeacherWorkload();
    workload.teacherId = teacherId;
    workload.schoolId = schoolId;
    workload.academicYear = academicYear;
    workload.contractedHours = contractedHours;
    workload.maxAllowedHours = contractedHours * 1.25; // 25% buffer
    workload.lastUpdated = new Date();

    return workload;
  }

  static calculateWorkloadDistribution(
    teachingHours: number,
    preparationHours: number,
    assessmentHours: number,
    administrativeHours: number,
    extracurricularHours: number,
  ): any {
    const total = teachingHours + preparationHours + assessmentHours + administrativeHours + extracurricularHours;

    if (total === 0) return null;

    return {
      teaching: (teachingHours / total) * 100,
      preparation: (preparationHours / total) * 100,
      assessment: (assessmentHours / total) * 100,
      administrative: (administrativeHours / total) * 100,
      extracurricular: (extracurricularHours / total) * 100,
    };
  }
}