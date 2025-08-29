import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThan, LessThan } from 'typeorm';
import { ParentPortalAccess } from '../entities/parent-portal-access.entity';
import { ParentStudentLink, AuthorizationLevel } from '../entities/parent-student-link.entity';
import { PortalActivityLog, PortalActivityType } from '../entities/portal-activity-log.entity';

export interface AcademicOverview {
  studentId: string;
  currentGrade: string;
  gpa: number;
  attendanceRate: number;
  totalSubjects: number;
  subjects: Array<{
    subjectId: string;
    subjectName: string;
    teacherName: string;
    currentGrade: string;
    attendanceRate: number;
    assignmentsDue: number;
    recentGrades: Array<{
      assessment: string;
      grade: string;
      date: Date;
      weight: number;
    }>;
  }>;
  academicYear: string;
  lastUpdated: Date;
}

export interface GradeBook {
  studentId: string;
  subjectId: string;
  subjectName: string;
  teacherName: string;
  gradingPeriod: string;
  overallGrade: string;
  grades: Array<{
    assessmentId: string;
    assessmentName: string;
    assessmentType: string;
    grade: string;
    pointsEarned: number;
    pointsPossible: number;
    weight: number;
    date: Date;
    comments?: string;
  }>;
  statistics: {
    averageGrade: number;
    highestGrade: number;
    lowestGrade: number;
    totalAssessments: number;
    gradeDistribution: Record<string, number>;
  };
}

export interface AttendanceRecord {
  studentId: string;
  academicYear: string;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  tardyDays: number;
  excusedDays: number;
  attendanceRate: number;
  monthlyBreakdown: Array<{
    month: string;
    present: number;
    absent: number;
    tardy: number;
    excused: number;
    rate: number;
  }>;
  recentAttendance: Array<{
    date: Date;
    status: 'present' | 'absent' | 'tardy' | 'excused';
    checkInTime?: Date;
    checkOutTime?: Date;
    reason?: string;
  }>;
  patterns: {
    mostAbsentDay: string;
    averageArrivalTime: string;
    consecutiveAbsences: number;
    improvementTrend: 'improving' | 'declining' | 'stable';
  };
}

export interface AssignmentList {
  studentId: string;
  assignments: Array<{
    assignmentId: string;
    subjectName: string;
    title: string;
    description: string;
    dueDate: Date;
    assignedDate: Date;
    status: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'overdue';
    grade?: string;
    feedback?: string;
    attachments: Array<{
      fileName: string;
      fileSize: number;
      uploadedAt: Date;
    }>;
    submissionDate?: Date;
  }>;
  summary: {
    totalAssignments: number;
    completedAssignments: number;
    overdueAssignments: number;
    upcomingDeadlines: number;
    averageGrade: number;
  };
}

export interface TimetableEntry {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  period: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  subjectId: string;
  teacherName: string;
  roomNumber: string;
  classId: string;
  isActive: boolean;
}

export interface StudentTimetable {
  studentId: string;
  academicYear: string;
  timetable: TimetableEntry[];
  weeklySchedule: Record<string, TimetableEntry[]>; // day name -> entries
  todaySchedule: TimetableEntry[];
  nextClass?: {
    subjectName: string;
    startTime: string;
    roomNumber: string;
    teacherName: string;
  };
}

@Injectable()
export class ParentPortalAcademicService {
  private readonly logger = new Logger(ParentPortalAcademicService.name);

  constructor(
    @InjectRepository(ParentPortalAccess)
    private parentPortalAccessRepository: Repository<ParentPortalAccess>,
    @InjectRepository(ParentStudentLink)
    private parentStudentLinkRepository: Repository<ParentStudentLink>,
    @InjectRepository(PortalActivityLog)
    private portalActivityLogRepository: Repository<PortalActivityLog>,
    private dataSource: DataSource,
  ) {}

  async getAcademicOverview(
    parentPortalAccessId: string,
    studentId: string,
  ): Promise<AcademicOverview> {
    try {
      this.logger.log(`Getting academic overview for student: ${studentId}, parent: ${parentPortalAccessId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get academic overview (mock data - would integrate with academic module)
      const overview = await this.getStudentAcademicOverview(studentId);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_GRADES, `Viewed academic overview for student ${studentId}`, studentId);

      return overview;
    } catch (error) {
      this.logger.error(`Academic overview error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getGradeBook(
    parentPortalAccessId: string,
    studentId: string,
    subjectId?: string,
    gradingPeriod?: string,
  ): Promise<GradeBook> {
    try {
      this.logger.log(`Getting grade book for student: ${studentId}, subject: ${subjectId}, period: ${gradingPeriod}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get grade book data (mock data - would integrate with academic module)
      const gradeBook = await this.getStudentGradeBook(studentId, subjectId, gradingPeriod);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_GRADES, `Viewed grade book for student ${studentId}`, studentId);

      return gradeBook;
    } catch (error) {
      this.logger.error(`Grade book error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAttendanceRecord(
    parentPortalAccessId: string,
    studentId: string,
    academicYear?: string,
  ): Promise<AttendanceRecord> {
    try {
      this.logger.log(`Getting attendance record for student: ${studentId}, year: ${academicYear}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get attendance data (mock data - would integrate with attendance module)
      const attendance = await this.getStudentAttendanceRecord(studentId, academicYear);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_ATTENDANCE, `Viewed attendance record for student ${studentId}`, studentId);

      return attendance;
    } catch (error) {
      this.logger.error(`Attendance record error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAssignments(
    parentPortalAccessId: string,
    studentId: string,
    status?: 'pending' | 'overdue' | 'completed' | 'all',
    subjectId?: string,
  ): Promise<AssignmentList> {
    try {
      this.logger.log(`Getting assignments for student: ${studentId}, status: ${status}, subject: ${subjectId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get assignments data (mock data - would integrate with academic module)
      const assignments = await this.getStudentAssignments(studentId, status, subjectId);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_ASSIGNMENTS, `Viewed assignments for student ${studentId}`, studentId);

      return assignments;
    } catch (error) {
      this.logger.error(`Assignments error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getTimetable(
    parentPortalAccessId: string,
    studentId: string,
    date?: Date,
  ): Promise<StudentTimetable> {
    try {
      this.logger.log(`Getting timetable for student: ${studentId}, date: ${date}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get timetable data (mock data - would integrate with timetable module)
      const timetable = await this.getStudentTimetable(studentId, date);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_TIMETABLE, `Viewed timetable for student ${studentId}`, studentId);

      return timetable;
    } catch (error) {
      this.logger.error(`Timetable error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAcademicReports(
    parentPortalAccessId: string,
    studentId: string,
    reportType: 'progress' | 'transcript' | 'certificate',
    academicYear?: string,
  ): Promise<{
    reportId: string;
    reportType: string;
    generatedAt: Date;
    academicYear: string;
    downloadUrl: string;
    expiresAt: Date;
  }> {
    try {
      this.logger.log(`Getting academic report for student: ${studentId}, type: ${reportType}, year: ${academicYear}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Generate academic report (mock data - would integrate with reports module)
      const report = await this.generateAcademicReport(studentId, reportType, academicYear);

      // Log activity
      await this.logActivity(parentPortalAccessId, PortalActivityType.VIEW_REPORTS, `Generated ${reportType} report for student ${studentId}`, studentId);

      return report;
    } catch (error) {
      this.logger.error(`Academic report error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async getAcademicAlerts(
    parentPortalAccessId: string,
    studentId: string,
  ): Promise<Array<{
    alertId: string;
    type: 'academic' | 'attendance' | 'behavior' | 'grade';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    actionRequired: boolean;
    createdAt: Date;
    acknowledgedAt?: Date;
  }>> {
    try {
      this.logger.log(`Getting academic alerts for student: ${studentId}`);

      // Verify parent has access to this student
      await this.verifyStudentAccess(parentPortalAccessId, studentId, AuthorizationLevel.VIEW_ONLY);

      // Get academic alerts (mock data - would integrate with academic module)
      const alerts = await this.getStudentAcademicAlerts(studentId);

      return alerts;
    } catch (error) {
      this.logger.error(`Academic alerts error: ${error.message}`, error.stack);
      throw error;
    }
  }

  // Private helper methods
  private async verifyStudentAccess(
    parentPortalAccessId: string,
    studentId: string,
    requiredLevel: AuthorizationLevel,
  ): Promise<void> {
    const studentLink = await this.parentStudentLinkRepository.findOne({
      where: {
        parentPortalAccessId,
        studentId,
        isActive: true,
      },
    });

    if (!studentLink) {
      throw new NotFoundException('Student not found or access denied');
    }

    if (!studentLink.isAuthorizedFor(requiredLevel)) {
      throw new ForbiddenException(`Insufficient authorization level. Required: ${requiredLevel}`);
    }
  }

  private async getStudentAcademicOverview(studentId: string): Promise<AcademicOverview> {
    // Mock data - would integrate with academic module
    return {
      studentId,
      currentGrade: 'A-',
      gpa: 3.7,
      attendanceRate: 95.5,
      totalSubjects: 8,
      subjects: [
        {
          subjectId: 'math-001',
          subjectName: 'Mathematics',
          teacherName: 'Mr. Johnson',
          currentGrade: 'A',
          attendanceRate: 98.0,
          assignmentsDue: 2,
          recentGrades: [
            { assessment: 'Chapter 5 Quiz', grade: 'A', date: new Date(), weight: 15 },
            { assessment: 'Homework 3', grade: 'A-', date: new Date(), weight: 10 },
          ],
        },
        {
          subjectId: 'english-001',
          subjectName: 'English Literature',
          teacherName: 'Ms. Davis',
          currentGrade: 'A-',
          attendanceRate: 96.0,
          assignmentsDue: 1,
          recentGrades: [
            { assessment: 'Essay Analysis', grade: 'A-', date: new Date(), weight: 25 },
            { assessment: 'Reading Quiz', grade: 'A', date: new Date(), weight: 10 },
          ],
        },
      ],
      academicYear: '2024-2025',
      lastUpdated: new Date(),
    };
  }

  private async getStudentGradeBook(
    studentId: string,
    subjectId?: string,
    gradingPeriod?: string,
  ): Promise<GradeBook> {
    // Mock data - would integrate with academic module
    const grades = [
      {
        assessmentId: 'quiz-001',
        assessmentName: 'Chapter 5 Quiz',
        assessmentType: 'quiz',
        grade: 'A',
        pointsEarned: 18,
        pointsPossible: 20,
        weight: 15,
        date: new Date(),
        comments: 'Excellent understanding of algebraic concepts',
      },
      {
        assessmentId: 'hw-001',
        assessmentName: 'Homework 3',
        assessmentType: 'homework',
        grade: 'A-',
        pointsEarned: 9,
        pointsPossible: 10,
        weight: 10,
        date: new Date(),
      },
    ];

    const gradeValues = grades.map(g => this.gradeToNumeric(g.grade));
    const averageGrade = gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length;

    return {
      studentId,
      subjectId: subjectId || 'math-001',
      subjectName: 'Mathematics',
      teacherName: 'Mr. Johnson',
      gradingPeriod: gradingPeriod || 'Q1 2024',
      overallGrade: this.numericToGrade(averageGrade),
      grades,
      statistics: {
        averageGrade,
        highestGrade: Math.max(...gradeValues),
        lowestGrade: Math.min(...gradeValues),
        totalAssessments: grades.length,
        gradeDistribution: this.calculateGradeDistribution(grades),
      },
    };
  }

  private async getStudentAttendanceRecord(studentId: string, academicYear?: string): Promise<AttendanceRecord> {
    // Mock data - would integrate with attendance module
    const totalDays = 120;
    const presentDays = 115;
    const absentDays = 3;
    const tardyDays = 2;
    const excusedDays = 0;

    return {
      studentId,
      academicYear: academicYear || '2024-2025',
      totalDays,
      presentDays,
      absentDays,
      tardyDays,
      excusedDays,
      attendanceRate: (presentDays / totalDays) * 100,
      monthlyBreakdown: [
        { month: 'September', present: 18, absent: 0, tardy: 0, excused: 0, rate: 100 },
        { month: 'October', present: 19, absent: 1, tardy: 0, excused: 0, rate: 95 },
        { month: 'November', present: 18, absent: 1, tardy: 1, excused: 0, rate: 90 },
      ],
      recentAttendance: [
        { date: new Date(), status: 'present', checkInTime: new Date('2024-01-15T08:30:00Z'), checkOutTime: new Date('2024-01-15T15:30:00Z') },
        { date: new Date(Date.now() - 86400000), status: 'present', checkInTime: new Date('2024-01-14T08:25:00Z'), checkOutTime: new Date('2024-01-14T15:35:00Z') },
        { date: new Date(Date.now() - 172800000), status: 'absent', reason: 'Medical appointment' },
      ],
      patterns: {
        mostAbsentDay: 'Friday',
        averageArrivalTime: '08:30',
        consecutiveAbsences: 0,
        improvementTrend: 'improving',
      },
    };
  }

  private async getStudentAssignments(
    studentId: string,
    status?: string,
    subjectId?: string,
  ): Promise<AssignmentList> {
    // Mock data - would integrate with academic module
    const allAssignments: Array<{
      assignmentId: string;
      subjectName: string;
      title: string;
      description: string;
      dueDate: Date;
      assignedDate: Date;
      status: 'not_started' | 'in_progress' | 'submitted' | 'graded' | 'overdue';
      grade?: string;
      feedback?: string;
      attachments: Array<{
        fileName: string;
        fileSize: number;
        uploadedAt: Date;
      }>;
      submissionDate?: Date;
    }> = [
      {
        assignmentId: 'assign-001',
        subjectName: 'Mathematics',
        title: 'Algebra Problem Set',
        description: 'Complete problems 1-20 from Chapter 5',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        assignedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        status: 'in_progress',
        attachments: [],
      },
      {
        assignmentId: 'assign-002',
        subjectName: 'English Literature',
        title: 'Shakespeare Essay',
        description: 'Write a 1000-word essay on Hamlet',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        assignedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: 'not_started',
        attachments: [],
      },
      {
        assignmentId: 'assign-003',
        subjectName: 'Mathematics',
        title: 'Geometry Quiz',
        description: 'Chapter 4 Geometry Quiz',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        assignedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        status: 'submitted',
        grade: 'A-',
        submissionDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        attachments: [
          { fileName: 'geometry_quiz.pdf', fileSize: 2048576, uploadedAt: new Date() },
        ],
      },
    ];

    let filteredAssignments = allAssignments;

    if (status && status !== 'all') {
      if (status === 'pending') {
        filteredAssignments = allAssignments.filter(a => a.status === 'not_started' || a.status === 'in_progress');
      } else if (status === 'overdue') {
        filteredAssignments = allAssignments.filter(a => a.dueDate < new Date() && a.status !== 'submitted' && a.status !== 'graded');
      } else if (status === 'completed') {
        filteredAssignments = allAssignments.filter(a => a.status === 'submitted' || a.status === 'graded');
      }
    }

    if (subjectId) {
      filteredAssignments = filteredAssignments.filter(a => a.subjectName.toLowerCase().includes(subjectId.toLowerCase()));
    }

    const completedAssignments = allAssignments.filter(a => a.status === 'submitted' || a.status === 'graded').length;
    const overdueAssignments = allAssignments.filter(a => a.dueDate < new Date() && a.status !== 'submitted' && a.status !== 'graded').length;
    const upcomingDeadlines = allAssignments.filter(a => a.dueDate > new Date() && a.dueDate < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)).length;
    const gradedAssignments = allAssignments.filter(a => a.grade);
    const averageGrade = gradedAssignments.length > 0
      ? gradedAssignments.reduce((sum, a) => sum + this.gradeToNumeric(a.grade!), 0) / gradedAssignments.length
      : 0;

    return {
      studentId,
      assignments: filteredAssignments,
      summary: {
        totalAssignments: allAssignments.length,
        completedAssignments,
        overdueAssignments,
        upcomingDeadlines,
        averageGrade,
      },
    };
  }

  private async getStudentTimetable(studentId: string, date?: Date): Promise<StudentTimetable> {
    // Mock data - would integrate with timetable module
    const timetable: TimetableEntry[] = [
      {
        dayOfWeek: 1, // Monday
        period: 1,
        startTime: '08:00',
        endTime: '08:45',
        subjectName: 'Mathematics',
        subjectId: 'math-001',
        teacherName: 'Mr. Johnson',
        roomNumber: '101',
        classId: 'class-001',
        isActive: true,
      },
      {
        dayOfWeek: 1,
        period: 2,
        startTime: '08:50',
        endTime: '09:35',
        subjectName: 'English Literature',
        subjectId: 'english-001',
        teacherName: 'Ms. Davis',
        roomNumber: '102',
        classId: 'class-002',
        isActive: true,
      },
      {
        dayOfWeek: 1,
        period: 3,
        startTime: '09:40',
        endTime: '10:25',
        subjectName: 'Science',
        subjectId: 'science-001',
        teacherName: 'Dr. Smith',
        roomNumber: '103',
        classId: 'class-003',
        isActive: true,
      },
    ];

    const targetDate = date || new Date();
    const dayOfWeek = targetDate.getDay();
    const todaySchedule = timetable.filter(entry => entry.dayOfWeek === dayOfWeek);

    // Find next class
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const nextClass = todaySchedule
      .filter(entry => {
        const [hours, minutes] = entry.startTime.split(':').map(Number);
        const entryTime = hours * 60 + minutes;
        return entryTime > currentTime;
      })
      .sort((a, b) => {
        const [aHours, aMinutes] = a.startTime.split(':').map(Number);
        const [bHours, bMinutes] = b.startTime.split(':').map(Number);
        return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
      })[0];

    return {
      studentId,
      academicYear: '2024-2025',
      timetable,
      weeklySchedule: {
        'Monday': timetable.filter(e => e.dayOfWeek === 1),
        'Tuesday': timetable.filter(e => e.dayOfWeek === 2),
        'Wednesday': timetable.filter(e => e.dayOfWeek === 3),
        'Thursday': timetable.filter(e => e.dayOfWeek === 4),
        'Friday': timetable.filter(e => e.dayOfWeek === 5),
      },
      todaySchedule,
      nextClass: nextClass ? {
        subjectName: nextClass.subjectName,
        startTime: nextClass.startTime,
        roomNumber: nextClass.roomNumber,
        teacherName: nextClass.teacherName,
      } : undefined,
    };
  }

  private async generateAcademicReport(
    studentId: string,
    reportType: string,
    academicYear?: string,
  ): Promise<{
    reportId: string;
    reportType: string;
    generatedAt: Date;
    academicYear: string;
    downloadUrl: string;
    expiresAt: Date;
  }> {
    // Mock data - would integrate with reports module
    const reportId = `report-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    return {
      reportId,
      reportType,
      generatedAt: new Date(),
      academicYear: academicYear || '2024-2025',
      downloadUrl: `/api/parent-portal/academic/reports/${reportId}/download`,
      expiresAt,
    };
  }

  private async getStudentAcademicAlerts(studentId: string): Promise<Array<{
    alertId: string;
    type: 'academic' | 'attendance' | 'behavior' | 'grade';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    actionRequired: boolean;
    createdAt: Date;
    acknowledgedAt?: Date;
  }>> {
    // Mock data - would integrate with academic module
    return [
      {
        alertId: 'alert-001',
        type: 'academic',
        severity: 'medium',
        title: 'Assignment Due Soon',
        message: 'Mathematics problem set is due in 2 days',
        actionRequired: false,
        createdAt: new Date(),
      },
      {
        alertId: 'alert-002',
        type: 'grade',
        severity: 'low',
        title: 'Grade Improvement',
        message: 'Recent quiz grade shows improvement in Mathematics',
        actionRequired: false,
        createdAt: new Date(),
      },
    ];
  }

  private async logActivity(
    parentPortalAccessId: string,
    activityType: PortalActivityType,
    description: string,
    studentId?: string,
  ): Promise<void> {
    try {
      await this.portalActivityLogRepository.save({
        parentPortalAccessId,
        studentId,
        activityType,
        description,
        action: activityType.replace('_', ' '),
        ipAddress: 'system', // Would get from request context
        success: true,
      });
    } catch (error) {
      this.logger.error('Failed to log activity', error);
    }
  }

  // Utility methods
  private gradeToNumeric(grade: string): number {
    const gradeMap: Record<string, number> = {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0,
    };
    return gradeMap[grade] || 0;
  }

  private numericToGrade(score: number): string {
    if (score >= 3.85) return 'A';
    if (score >= 3.5) return 'A-';
    if (score >= 3.15) return 'B+';
    if (score >= 2.85) return 'B';
    if (score >= 2.5) return 'B-';
    if (score >= 2.15) return 'C+';
    if (score >= 1.85) return 'C';
    if (score >= 1.5) return 'C-';
    if (score >= 1.15) return 'D+';
    if (score >= 0.85) return 'D';
    return 'F';
  }

  private calculateGradeDistribution(grades: Array<{ grade: string }>): Record<string, number> {
    const distribution: Record<string, number> = {};
    grades.forEach(g => {
      distribution[g.grade] = (distribution[g.grade] || 0) + 1;
    });
    return distribution;
  }
}