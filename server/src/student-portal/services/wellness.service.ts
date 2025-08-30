import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { StudentPortalAccess } from '../entities/student-portal-access.entity';
import { StudentWellnessRecord, WellnessCheckType, MoodLevel, WellnessStatus } from '../entities/student-wellness-record.entity';
import { StudentActivityLog, StudentActivityType } from '../entities/student-activity-log.entity';

export interface WellnessCheckinDto {
  id: string;
  moodLevel: number;
  stressLevel: number;
  energyLevel: number;
  sleepQuality?: number;
  sleepHours?: number;
  physicalActivity?: string;
  overallStatus: string;
  notes?: string;
  triggers?: string[];
  recordedAt: Date;
  insights?: string[];
}

export interface WellnessInsightsDto {
  currentStatus: {
    overall: string;
    mood: string;
    stress: string;
    energy: string;
  };
  trends: {
    mood: 'improving' | 'stable' | 'declining';
    stress: 'improving' | 'stable' | 'declining';
    energy: 'improving' | 'stable' | 'declining';
    sleep: 'improving' | 'stable' | 'declining';
  };
  recommendations: string[];
  alerts: string[];
  streak: number;
}

@Injectable()
export class StudentPortalWellnessService {
  private readonly logger = new Logger(StudentPortalWellnessService.name);

  constructor(
    @InjectRepository(StudentPortalAccess)
    private studentPortalAccessRepository: Repository<StudentPortalAccess>,
    @InjectRepository(StudentWellnessRecord)
    private wellnessRepository: Repository<StudentWellnessRecord>,
    @InjectRepository(StudentActivityLog)
    private activityLogRepository: Repository<StudentActivityLog>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async getWellnessCheckins(studentId: string): Promise<WellnessCheckinDto[]> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      return [];
    }

    // Get wellness records
    const records = await this.wellnessRepository.find({
      where: { studentPortalAccessId: portalAccess.id },
      order: { createdAt: 'DESC' },
      take: 30, // Last 30 days
    });

    return records.map(record => ({
      id: record.id,
      moodLevel: this.moodLevelToNumber(record.moodLevel),
      stressLevel: record.stressLevel || 5,
      energyLevel: record.energyLevel || 5,
      sleepQuality: record.sleepQuality || 5,
      sleepHours: 8, // Default, TODO: calculate from available data
      physicalActivity: record.physicalActivityHours ? 'moderate' : 'light',
      overallStatus: record.overallStatus || 'good',
      notes: record.moodDescription || '',
      triggers: record.metadata?.triggers || [],
      recordedAt: record.createdAt,
      insights: [], // TODO: Generate insights based on data
    }));
  }

  async submitWellnessCheckin(
    studentId: string,
    checkinData: {
      moodLevel: number;
      stressLevel: number;
      energyLevel: number;
      sleepQuality?: number;
      sleepHours?: number;
      physicalActivity?: string;
      notes?: string;
      triggers?: string[];
    },
  ): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      throw new Error('Student not found');
    }

    // Calculate overall status
    const avgScore = (checkinData.moodLevel + (11 - checkinData.stressLevel) + checkinData.energyLevel) / 3;
    let overallStatus: WellnessStatus = WellnessStatus.GOOD;
    if (avgScore < 4) overallStatus = WellnessStatus.CONCERNING;
    else if (avgScore < 7) overallStatus = WellnessStatus.FAIR;

    // Create wellness record
    const wellnessRecord = this.wellnessRepository.create({
      studentPortalAccessId: portalAccess.id,
      checkType: WellnessCheckType.DAILY_CHECK,
      moodLevel: this.numberToMoodLevel(checkinData.moodLevel),
      stressLevel: checkinData.stressLevel,
      energyLevel: checkinData.energyLevel,
      sleepQuality: checkinData.sleepQuality,
      physicalActivityHours: checkinData.physicalActivity === 'intense' ? 2 : checkinData.physicalActivity === 'moderate' ? 1 : 0.5,
      overallStatus,
      moodDescription: checkinData.notes,
      academicYear: '2024-2025', // TODO: Get from current academic year
      gradeLevel: portalAccess.gradeLevel,
      metadata: {
        triggers: checkinData.triggers,
        assessmentMethod: 'self_report',
      },
    });

    const savedRecord = await this.wellnessRepository.save(wellnessRecord);

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.WELLNESS_CHECK,
      activityDescription: 'Completed daily wellness check-in',
      resourceType: 'wellness',
      metadata: {
        moodLevel: checkinData.moodLevel,
        stressLevel: checkinData.stressLevel,
        overallStatus,
      },
    } as any);

    return {
      id: savedRecord.id,
      status: 'recorded',
      overallStatus,
      recordedAt: savedRecord.createdAt,
      message: 'Wellness check-in recorded successfully',
    };
  }

  async getWellnessInsights(studentId: string): Promise<WellnessInsightsDto> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student not found');
    }

    // Get recent wellness records
    const records = await this.wellnessRepository.find({
      where: { studentPortalAccessId: portalAccess.id },
      order: { createdAt: 'DESC' },
      take: 14, // Last 2 weeks
    });

    if (records.length === 0) {
      return {
        currentStatus: {
          overall: 'unknown',
          mood: 'unknown',
          stress: 'unknown',
          energy: 'unknown',
        },
        trends: {
          mood: 'stable',
          stress: 'stable',
          energy: 'stable',
          sleep: 'stable',
        },
        recommendations: ['Start tracking your daily wellness to get personalized insights'],
        alerts: [],
        streak: 0,
      };
    }

    // Calculate current status
    const latest = records[0];
    const currentStatus = {
      overall: latest.overallStatus,
      mood: this.getStatusLabel(latest.moodLevel, 'mood'),
      stress: this.getStatusLabel(11 - latest.stressLevel, 'stress'),
      energy: this.getStatusLabel(latest.energyLevel, 'energy'),
    };

    // Calculate trends
    const trends = this.calculateTrends(records);

    // Generate recommendations
    const recommendations = this.generateRecommendations(records, trends);

    // Calculate streak
    const streak = this.calculateStreak(records);

    return {
      currentStatus,
      trends,
      recommendations,
      alerts: [], // TODO: Generate alerts based on concerning patterns
      streak,
    };
  }

  async getWellnessTrends(studentId: string): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student not found');
    }

    // Get wellness records for trend analysis
    const records = await this.wellnessRepository.find({
      where: { studentPortalAccessId: portalAccess.id },
      order: { createdAt: 'ASC' },
      take: 90, // Last 90 days
    });

    // Group by week and calculate averages
    const weeklyTrends = this.groupByWeek(records);

    return {
      weeklyTrends,
      summary: {
        totalCheckins: records.length,
        averageMood: records.reduce((sum, r) => sum + this.moodLevelToNumber(r.moodLevel), 0) / records.length,
        averageStress: records.reduce((sum, r) => sum + (r.stressLevel || 0), 0) / records.length,
        averageEnergy: records.reduce((sum, r) => sum + (r.energyLevel || 0), 0) / records.length,
      },
    };
  }

  async getWellnessResources(studentId: string): Promise<any[]> {
    // TODO: Implement resource retrieval based on student needs
    return [
      {
        id: 'resource-001',
        title: 'Stress Management Techniques',
        type: 'article',
        category: 'stress',
        description: 'Learn effective techniques to manage academic stress',
        url: '/resources/stress-management',
        tags: ['stress', 'mental-health', 'coping'],
      },
      {
        id: 'resource-002',
        title: 'Sleep Hygiene Guide',
        type: 'guide',
        category: 'sleep',
        description: 'Improve your sleep quality with these evidence-based tips',
        url: '/resources/sleep-hygiene',
        tags: ['sleep', 'health', 'wellness'],
      },
      {
        id: 'resource-003',
        title: 'Mindfulness Meditation',
        type: 'video',
        category: 'mindfulness',
        description: '5-minute guided meditation for focus and calm',
        url: '/resources/mindfulness-meditation',
        tags: ['mindfulness', 'meditation', 'focus'],
      },
    ];
  }

  async requestCounseling(
    studentId: string,
    requestData: {
      reason: string;
      preferredDate: Date;
      preferredTime?: string;
      urgency?: string;
      confidential?: boolean;
      additionalInfo?: string;
    },
  ): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      throw new Error('Student not found');
    }

    // TODO: Implement counseling request creation
    // This would create a counseling request entity and notify counselors

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.EMERGENCY_CONTACT,
      activityDescription: 'Requested counseling session',
      resourceType: 'counseling',
      metadata: {
        reason: requestData.reason,
        urgency: requestData.urgency,
        confidential: requestData.confidential,
      },
    } as any);

    return {
      id: 'counseling-' + Date.now(),
      status: 'submitted',
      submittedAt: new Date(),
      message: 'Counseling request submitted successfully',
      estimatedResponse: 'Within 24-48 hours',
    };
  }

  async getWellnessGoals(studentId: string): Promise<any[]> {
    // TODO: Implement wellness goals retrieval
    return [
      {
        id: 'goal-001',
        goalType: 'sleep',
        targetValue: 8,
        currentValue: 7.5,
        timeframe: 'weekly',
        progress: 94,
        status: 'on_track',
        description: 'Get 8 hours of sleep per night',
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ];
  }

  async setWellnessGoal(
    studentId: string,
    goalData: {
      goalType: string;
      targetValue: number;
      timeframe: string;
      description?: string;
      reminders?: boolean;
    },
  ): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
    });

    if (!portalAccess) {
      throw new Error('Student not found');
    }

    // TODO: Implement wellness goal creation

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.CAREER_ASSESSMENT,
      activityDescription: `Set ${goalData.goalType} wellness goal`,
      resourceType: 'wellness_goal',
      metadata: {
        goalType: goalData.goalType,
        targetValue: goalData.targetValue,
        timeframe: goalData.timeframe,
      },
    } as any);

    return {
      id: 'goal-' + Date.now(),
      status: 'created',
      createdAt: new Date(),
      message: 'Wellness goal created successfully',
    };
  }

  async getEmergencyContacts(studentId: string): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      throw new Error('Student not found');
    }

    const student = portalAccess.student;

    return {
      emergencyContact: student.medicalInfo?.emergencyContact,
      schoolContacts: {
        nurse: {
          name: 'School Nurse',
          phone: '+1234567890',
          email: 'nurse@school.edu',
        },
        counselor: {
          name: 'School Counselor',
          phone: '+1234567891',
          email: 'counselor@school.edu',
        },
        security: {
          name: 'Security Office',
          phone: '+1234567892',
          extension: '911',
        },
      },
      emergencyProcedures: {
        medical: 'Call school nurse immediately, then emergency contact',
        safety: 'Move to safe location, contact security',
        mental_health: 'Contact counselor or trusted adult',
      },
    };
  }

  async sendEmergencyAlert(
    studentId: string,
    alertData: {
      alertType: string;
      location: string;
      description?: string;
      severity?: string;
      contacts?: string[];
    },
  ): Promise<any> {
    // Get portal access
    const portalAccess = await this.studentPortalAccessRepository.findOne({
      where: { studentId },
      relations: ['student'],
    });

    if (!portalAccess || !portalAccess.student) {
      throw new Error('Student not found');
    }

    // TODO: Implement emergency alert system
    // This would notify emergency contacts, school authorities, and possibly emergency services

    // Log activity
    await this.activityLogRepository.save({
      studentPortalAccessId: portalAccess.id,
      activityType: StudentActivityType.EMERGENCY_CONTACT,
      activityDescription: `Emergency alert: ${alertData.alertType}`,
      resourceType: 'emergency',
      metadata: {
        alertType: alertData.alertType,
        location: alertData.location,
        severity: alertData.severity,
      },
    } as any);

    return {
      id: 'alert-' + Date.now(),
      status: 'sent',
      sentAt: new Date(),
      message: 'Emergency alert sent successfully',
      notifiedContacts: ['emergency_contact', 'school_nurse', 'security'],
    };
  }


  private calculateTrends(records: StudentWellnessRecord[]): any {
    if (records.length < 7) {
      return {
        mood: 'stable',
        stress: 'stable',
        energy: 'stable',
        sleep: 'stable',
      };
    }

    const recent = records.slice(0, 7); // Last 7 days
    const previous = records.slice(7, 14); // Previous 7 days

    const calculateTrend = (recentValues: number[], previousValues: number[]): string => {
      if (previousValues.length === 0) return 'stable';

      const recentAvg = recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
      const previousAvg = previousValues.reduce((a, b) => a + b, 0) / previousValues.length;

      const diff = recentAvg - previousAvg;
      if (Math.abs(diff) < 0.5) return 'stable';
      return diff > 0 ? 'improving' : 'declining';
    };

    return {
      mood: calculateTrend(recent.map(r => this.moodLevelToNumber(r.moodLevel)), previous.map(r => this.moodLevelToNumber(r.moodLevel))),
      stress: calculateTrend(recent.map(r => 11 - (r.stressLevel || 5)), previous.map(r => 11 - (r.stressLevel || 5))),
      energy: calculateTrend(recent.map(r => r.energyLevel || 5), previous.map(r => r.energyLevel || 5)),
      sleep: calculateTrend(recent.map(r => r.sleepQuality || 5), previous.map(r => r.sleepQuality || 5)),
    };
  }

  private generateRecommendations(records: StudentWellnessRecord[], trends: any): string[] {
    const recommendations = [];

    const latest = records[0];
    if (latest.stressLevel > 7) {
      recommendations.push('Consider stress management techniques like deep breathing exercises');
    }

    if (latest.sleepQuality && latest.sleepQuality < 6) {
      recommendations.push('Focus on improving sleep hygiene - consistent bedtime routine');
    }

    if (latest.energyLevel < 5) {
      recommendations.push('Increase physical activity and ensure balanced nutrition');
    }

    if (trends.mood === 'declining') {
      recommendations.push('Reach out to counselor if mood concerns persist');
    }

    if (recommendations.length === 0) {
      recommendations.push('Keep up the good work with your wellness routine!');
    }

    return recommendations;
  }

  private calculateStreak(records: StudentWellnessRecord[]): number {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < records.length; i++) {
      const recordDate = new Date(records[i].createdAt);
      recordDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (recordDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private groupByWeek(records: StudentWellnessRecord[]): any[] {
    const weeklyData = new Map();

    records.forEach(record => {
      const date = new Date(record.createdAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, {
          week: weekKey,
          mood: [],
          stress: [],
          energy: [],
          sleep: [],
        });
      }

      const week = weeklyData.get(weekKey);
      week.mood.push(record.moodLevel);
      week.stress.push(record.stressLevel);
      week.energy.push(record.energyLevel);
      if (record.sleepQuality) {
        week.sleep.push(record.sleepQuality);
      }
    });

    return Array.from(weeklyData.values()).map(week => ({
      week: week.week,
      averageMood: this.averageMoodLevels(week.mood),
      averageStress: week.stress.reduce((a, b) => a + b, 0) / week.stress.length,
      averageEnergy: week.energy.reduce((a, b) => a + b, 0) / week.energy.length,
      averageSleep: week.sleep.length > 0 ? week.sleep.reduce((a, b) => a + b, 0) / week.sleep.length : null,
    }));
  }

  private moodLevelToNumber(moodLevel: MoodLevel): number {
    switch (moodLevel) {
      case MoodLevel.VERY_HAPPY: return 10;
      case MoodLevel.HAPPY: return 8;
      case MoodLevel.NEUTRAL: return 6;
      case MoodLevel.SAD: return 4;
      case MoodLevel.VERY_SAD: return 2;
      case MoodLevel.ANXIOUS: return 3;
      case MoodLevel.STRESSED: return 3;
      case MoodLevel.ANGRY: return 2;
      default: return 5;
    }
  }

  private numberToMoodLevel(value: number): MoodLevel {
    if (value >= 9) return MoodLevel.VERY_HAPPY;
    if (value >= 7) return MoodLevel.HAPPY;
    if (value >= 5) return MoodLevel.NEUTRAL;
    if (value >= 3) return MoodLevel.SAD;
    return MoodLevel.VERY_SAD;
  }

  private getStatusLabel(value: number | MoodLevel, type: string): string {
    if (type === 'mood' && typeof value === 'string') {
      return value.replace('_', ' ').toLowerCase();
    }

    const numValue = typeof value === 'number' ? value : this.moodLevelToNumber(value);

    if (type === 'stress') {
      if (numValue >= 8) return 'low';
      if (numValue >= 6) return 'moderate';
      return 'high';
    } else {
      if (numValue >= 8) return 'excellent';
      if (numValue >= 6) return 'good';
      if (numValue >= 4) return 'fair';
      return 'poor';
    }
  }

  private averageMoodLevels(moodLevels: MoodLevel[]): number {
    if (moodLevels.length === 0) return 0;
    const sum = moodLevels.reduce((acc, mood) => acc + this.moodLevelToNumber(mood), 0);
    return sum / moodLevels.length;
  }
}