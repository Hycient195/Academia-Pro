import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GradeEntry {
  @ApiProperty({
    description: 'Assessment or exam name',
    example: 'Mid-term Mathematics Exam',
  })
  assessmentName: string;

  @ApiProperty({
    description: 'Assessment type',
    example: 'exam',
  })
  assessmentType: string;

  @ApiProperty({
    description: 'Grade received',
    example: 'A',
  })
  grade: string;

  @ApiProperty({
    description: 'Numeric grade points',
    example: 4.0,
  })
  gradePoints: number;

  @ApiProperty({
    description: 'Maximum possible points',
    example: 100,
  })
  maxPoints: number;

  @ApiProperty({
    description: 'Points received',
    example: 85,
  })
  pointsReceived: number;

  @ApiProperty({
    description: 'Assessment date',
    example: '2024-03-15T00:00:00Z',
  })
  assessmentDate: Date;

  @ApiPropertyOptional({
    description: 'Teacher comments',
    example: 'Excellent understanding of algebraic concepts',
  })
  comments?: string;

  @ApiProperty({
    description: 'Assessment weight in final grade',
    example: 30,
  })
  weight: number;
}

export class SubjectGrade {
  @ApiProperty({
    description: 'Subject ID',
    example: 'subj-123',
  })
  subjectId: string;

  @ApiProperty({
    description: 'Subject name',
    example: 'Mathematics',
  })
  subjectName: string;

  @ApiProperty({
    description: 'Current overall grade',
    example: 'A-',
  })
  currentGrade: string;

  @ApiProperty({
    description: 'Current grade points',
    example: 3.7,
  })
  gradePoints: number;

  @ApiProperty({
    description: 'Subject teacher name',
    example: 'Mr. Johnson',
  })
  teacherName: string;

  @ApiProperty({
    description: 'List of assessments and grades',
    type: [GradeEntry],
  })
  assessments: GradeEntry[];

  @ApiProperty({
    description: 'Grade trend',
    enum: ['improving', 'stable', 'declining'],
    example: 'improving',
  })
  gradeTrend: 'improving' | 'stable' | 'declining';

  @ApiPropertyOptional({
    description: 'Grade trend percentage change',
    example: 5.2,
  })
  trendPercentage?: number;
}

export class StudentGradesSummary {
  @ApiProperty({
    description: 'Student ID',
    example: 'student-123',
  })
  studentId: string;

  @ApiProperty({
    description: 'Student full name',
    example: 'John Doe',
  })
  studentName: string;

  @ApiPropertyOptional({
    description: 'Parent-child relationship type',
    example: 'father',
  })
  relationship?: string;

  @ApiProperty({
    description: 'Current grade level',
    example: 'Grade 10',
  })
  currentGrade: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  academicYear: string;

  @ApiProperty({
    description: 'Current term',
    example: 'Term 1',
  })
  currentTerm: string;

  @ApiProperty({
    description: 'Subject grades',
    type: [SubjectGrade],
  })
  subjects: SubjectGrade[];

  @ApiProperty({
    description: 'Overall GPA',
    example: 3.8,
  })
  overallGPA: number;

  @ApiProperty({
    description: 'Grade point average trend',
    enum: ['improving', 'stable', 'declining'],
    example: 'improving',
  })
  gpaTrend: 'improving' | 'stable' | 'declining';

  @ApiProperty({
    description: 'Total credits earned',
    example: 45,
  })
  totalCredits: number;

  @ApiProperty({
    description: 'Academic standing',
    enum: ['excellent', 'good', 'satisfactory', 'needs_improvement'],
    example: 'excellent',
  })
  academicStanding: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';

  @ApiPropertyOptional({
    description: 'Academic advisor comments',
    example: 'John has shown excellent progress in mathematics this term.',
  })
  advisorComments?: string;
}

export class AcademicSummary {
  @ApiProperty({
    description: 'Total number of students',
    example: 2,
  })
  totalStudents: number;

  @ApiProperty({
    description: 'Average GPA across all students',
    example: 3.6,
  })
  averageGPA: number;

  @ApiProperty({
    description: 'Number of subjects with grades',
    example: 8,
  })
  totalSubjects: number;

  @ApiProperty({
    description: 'Number of assessments completed',
    example: 24,
  })
  totalAssessments: number;

  @ApiProperty({
    description: 'Grade distribution',
    example: { 'A': 12, 'B': 8, 'C': 3, 'D': 1, 'F': 0 },
  })
  gradeDistribution: Record<string, number>;

  @ApiProperty({
    description: 'Academic performance insights',
    example: ['Mathematics performance is improving', 'Science grades are consistent'],
  })
  insights: string[];

  @ApiProperty({
    description: 'Last updated timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  lastUpdated: Date;
}

export class ParentAcademicGradesResponse {
  @ApiProperty({
    description: 'Parent ID',
    example: 'parent-123',
  })
  parentId: string;

  @ApiProperty({
    description: 'School ID',
    example: 'school-456',
  })
  schoolId: string;

  @ApiProperty({
    description: 'Academic year',
    example: '2024-2025',
  })
  academicYear: string;

  @ApiProperty({
    description: 'Students grades summary',
    type: [StudentGradesSummary],
  })
  students: StudentGradesSummary[];

  @ApiProperty({
    description: 'Academic summary statistics',
  })
  summary: AcademicSummary;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  timestamp: Date;
}

export class AttendanceRecord {
  @ApiProperty({
    description: 'Attendance date',
    example: '2024-08-29T00:00:00Z',
  })
  date: Date;

  @ApiProperty({
    description: 'Attendance status',
    enum: ['present', 'absent', 'late', 'excused'],
    example: 'present',
  })
  status: 'present' | 'absent' | 'late' | 'excused';

  @ApiPropertyOptional({
    description: 'Check-in time',
    example: '08:30:00',
  })
  checkInTime?: string;

  @ApiPropertyOptional({
    description: 'Check-out time',
    example: '15:30:00',
  })
  checkOutTime?: string;

  @ApiPropertyOptional({
    description: 'Reason for absence or tardiness',
    example: 'Medical appointment',
  })
  reason?: string;

  @ApiProperty({
    description: 'Total hours present',
    example: 7.0,
  })
  hoursPresent: number;

  @ApiProperty({
    description: 'Subject-specific attendance',
    example: { 'Mathematics': 'present', 'Science': 'present' },
  })
  subjectAttendance: Record<string, string>;
}

export class AttendanceSummary {
  @ApiProperty({
    description: 'Total days in period',
    example: 90,
  })
  totalDays: number;

  @ApiProperty({
    description: 'Days present',
    example: 85,
  })
  daysPresent: number;

  @ApiProperty({
    description: 'Days absent',
    example: 3,
  })
  daysAbsent: number;

  @ApiProperty({
    description: 'Days late',
    example: 2,
  })
  daysLate: number;

  @ApiProperty({
    description: 'Attendance percentage',
    example: 94.4,
  })
  attendancePercentage: number;

  @ApiProperty({
    description: 'Attendance trend',
    enum: ['improving', 'stable', 'declining'],
    example: 'stable',
  })
  attendanceTrend: 'improving' | 'stable' | 'declining';

  @ApiProperty({
    description: 'Consecutive days present',
    example: 15,
  })
  consecutivePresent: number;
}

export class ParentAttendanceResponse {
  @ApiProperty({
    description: 'Parent ID',
    example: 'parent-123',
  })
  parentId: string;

  @ApiProperty({
    description: 'Student ID',
    example: 'student-456',
  })
  studentId: string;

  @ApiProperty({
    description: 'Student name',
    example: 'John Doe',
  })
  studentName: string;

  @ApiProperty({
    description: 'Attendance period',
    example: { start: '2024-08-01', end: '2024-08-29' },
  })
  period: {
    start: string;
    end: string;
  };

  @ApiProperty({
    description: 'Attendance records',
    type: [AttendanceRecord],
  })
  records: AttendanceRecord[];

  @ApiProperty({
    description: 'Attendance summary',
  })
  summary: AttendanceSummary;

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  timestamp: Date;
}

export class AssignmentSubmission {
  @ApiProperty({
    description: 'Submission ID',
    example: 'sub-123',
  })
  submissionId: string;

  @ApiProperty({
    description: 'Submission date',
    example: '2024-08-25T14:30:00Z',
  })
  submittedAt: Date;

  @ApiProperty({
    description: 'Submission status',
    enum: ['submitted', 'late', 'graded', 'pending'],
    example: 'graded',
  })
  status: 'submitted' | 'late' | 'graded' | 'pending';

  @ApiPropertyOptional({
    description: 'Grade received',
    example: 'A',
  })
  grade?: string;

  @ApiPropertyOptional({
    description: 'Teacher feedback',
    example: 'Excellent work on the problem-solving section.',
  })
  feedback?: string;

  @ApiPropertyOptional({
    description: 'Submission file URL',
    example: 'https://storage.example.com/assignments/sub-123.pdf',
  })
  fileUrl?: string;
}

export class AssignmentDetails {
  @ApiProperty({
    description: 'Assignment ID',
    example: 'assign-123',
  })
  assignmentId: string;

  @ApiProperty({
    description: 'Assignment title',
    example: 'Mathematics Problem Set 5',
  })
  title: string;

  @ApiProperty({
    description: 'Subject name',
    example: 'Mathematics',
  })
  subject: string;

  @ApiProperty({
    description: 'Assignment description',
    example: 'Complete problems 1-20 from Chapter 5.',
  })
  description: string;

  @ApiProperty({
    description: 'Due date',
    example: '2024-08-30T23:59:00Z',
  })
  dueDate: Date;

  @ApiProperty({
    description: 'Assignment status',
    enum: ['pending', 'submitted', 'overdue', 'graded'],
    example: 'submitted',
  })
  status: 'pending' | 'submitted' | 'overdue' | 'graded';

  @ApiProperty({
    description: 'Assignment type',
    example: 'homework',
  })
  type: string;

  @ApiProperty({
    description: 'Maximum points',
    example: 100,
  })
  maxPoints: number;

  @ApiPropertyOptional({
    description: 'Submission details',
  })
  submission?: AssignmentSubmission;

  @ApiProperty({
    description: 'Days until due',
    example: 1,
  })
  daysUntilDue: number;

  @ApiProperty({
    description: 'Priority level',
    enum: ['low', 'normal', 'high', 'urgent'],
    example: 'normal',
  })
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

export class ParentAssignmentsResponse {
  @ApiProperty({
    description: 'Parent ID',
    example: 'parent-123',
  })
  parentId: string;

  @ApiProperty({
    description: 'Student ID',
    example: 'student-456',
  })
  studentId: string;

  @ApiProperty({
    description: 'Student name',
    example: 'John Doe',
  })
  studentName: string;

  @ApiProperty({
    description: 'Assignments list',
    type: [AssignmentDetails],
  })
  assignments: AssignmentDetails[];

  @ApiProperty({
    description: 'Assignments summary',
    example: {
      total: 12,
      pending: 3,
      submitted: 7,
      overdue: 1,
      graded: 8
    },
  })
  summary: {
    total: number;
    pending: number;
    submitted: number;
    overdue: number;
    graded: number;
  };

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  timestamp: Date;
}

export class TimetableEntry {
  @ApiProperty({
    description: 'Subject name',
    example: 'Mathematics',
  })
  subject: string;

  @ApiProperty({
    description: 'Teacher name',
    example: 'Mr. Johnson',
  })
  teacher: string;

  @ApiProperty({
    description: 'Classroom or room number',
    example: 'Room 204',
  })
  room: string;

  @ApiProperty({
    description: 'Start time',
    example: '09:00',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time',
    example: '10:00',
  })
  endTime: string;

  @ApiProperty({
    description: 'Day of week',
    example: 'Monday',
  })
  dayOfWeek: string;

  @ApiProperty({
    description: 'Period number',
    example: 2,
  })
  period: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Bring calculator',
  })
  notes?: string;
}

export class ParentTimetableResponse {
  @ApiProperty({
    description: 'Parent ID',
    example: 'parent-123',
  })
  parentId: string;

  @ApiProperty({
    description: 'Student ID',
    example: 'student-456',
  })
  studentId: string;

  @ApiProperty({
    description: 'Student name',
    example: 'John Doe',
  })
  studentName: string;

  @ApiProperty({
    description: 'Week start date',
    example: '2024-08-26',
  })
  weekStart: string;

  @ApiProperty({
    description: 'Daily timetable entries',
    example: {
      'Monday': [
        {
          subject: 'Mathematics',
          teacher: 'Mr. Johnson',
          room: 'Room 204',
          startTime: '09:00',
          endTime: '10:00',
          dayOfWeek: 'Monday',
          period: 1
        }
      ],
      'Tuesday': [],
      'Wednesday': [],
      'Thursday': [],
      'Friday': []
    },
  })
  timetable: Record<string, TimetableEntry[]>;

  @ApiProperty({
    description: 'Timetable summary',
    example: {
      totalSubjects: 8,
      totalPeriods: 35,
      averagePeriodsPerDay: 7
    },
  })
  summary: {
    totalSubjects: number;
    totalPeriods: number;
    averagePeriodsPerDay: number;
  };

  @ApiProperty({
    description: 'Response timestamp',
    example: '2024-08-29T10:30:00Z',
  })
  timestamp: Date;
}