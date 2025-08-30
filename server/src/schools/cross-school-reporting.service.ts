// Academia Pro - Cross-School Reporting Service
// Provides aggregated analytics and reporting across multiple schools

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { School } from './school.entity';
import { User } from '../users/user.entity';
import { Student } from '../students/student.entity';

export interface CrossSchoolAnalytics {
  totalSchools: number;
  activeSchools: number;
  totalUsers: number;
  totalStudents: number;
  totalStaff: number;
  averageOccupancyRate: number;
  subscriptionMetrics: {
    activeSubscriptions: number;
    expiredSubscriptions: number;
    expiringSoon: number; // within 30 days
    totalRevenue: number;
  };
  schoolTypeDistribution: { [key: string]: number };
  geographicDistribution: { [key: string]: number };
  performanceMetrics: {
    averageUsersPerSchool: number;
    averageStudentsPerSchool: number;
    topPerformingSchools: Array<{
      schoolId: string;
      schoolName: string;
      occupancyRate: number;
      userCount: number;
      studentCount: number;
    }>;
  };
}

export interface SchoolComparisonReport {
  schoolId: string;
  schoolName: string;
  metrics: {
    userCount: number;
    studentCount: number;
    staffCount: number;
    occupancyRate: number;
    subscriptionStatus: string;
    performanceScore: number; // 0-100 based on various factors
  };
  trends: {
    userGrowth: number; // percentage change
    studentGrowth: number; // percentage change
    occupancyChange: number; // percentage change
  };
}

@Injectable()
export class CrossSchoolReportingService {
  private readonly logger = new Logger(CrossSchoolReportingService.name);

  constructor(
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private dataSource: DataSource,
  ) {}

  /**
   * Generate comprehensive cross-school analytics
   */
  async generateCrossSchoolAnalytics(): Promise<CrossSchoolAnalytics> {
    this.logger.log('Generating cross-school analytics');

    // Get all schools
    const schools = await this.schoolRepository.find();

    // Calculate basic metrics
    const totalSchools = schools.length;
    const activeSchools = schools.filter(s => s.status === 'active').length;

    // Calculate user and student counts
    const userCounts = await this.getUserCountsBySchool();
    const studentCounts = await this.getStudentCountsBySchool();

    const totalUsers = Object.values(userCounts).reduce((sum, count) => sum + count, 0);
    const totalStudents = Object.values(studentCounts).reduce((sum, count) => sum + count, 0);
    const totalStaff = totalUsers - totalStudents; // Assuming students are part of users

    // Calculate average occupancy rate
    const occupancyRates = schools.map(school => school.occupancyRate || 0);
    const averageOccupancyRate = occupancyRates.length > 0
      ? occupancyRates.reduce((sum, rate) => sum + rate, 0) / occupancyRates.length
      : 0;

    // Calculate subscription metrics
    const subscriptionMetrics = this.calculateSubscriptionMetrics(schools);

    // Calculate distributions
    const schoolTypeDistribution = this.calculateSchoolTypeDistribution(schools);
    const geographicDistribution = this.calculateGeographicDistribution(schools);

    // Calculate performance metrics
    const performanceMetrics = await this.calculatePerformanceMetrics(schools, userCounts, studentCounts);

    return {
      totalSchools,
      activeSchools,
      totalUsers,
      totalStudents,
      totalStaff,
      averageOccupancyRate,
      subscriptionMetrics,
      schoolTypeDistribution,
      geographicDistribution,
      performanceMetrics,
    };
  }

  /**
   * Generate school comparison report
   */
  async generateSchoolComparisonReport(schoolIds?: string[]): Promise<SchoolComparisonReport[]> {
    this.logger.log('Generating school comparison report');

    let schools: School[];
    if (schoolIds && schoolIds.length > 0) {
      schools = await this.schoolRepository.find({
        where: schoolIds.map(id => ({ id })),
      });
    } else {
      schools = await this.schoolRepository.find();
    }

    const userCounts = await this.getUserCountsBySchool();
    const studentCounts = await this.getStudentCountsBySchool();

    const reports: SchoolComparisonReport[] = [];

    for (const school of schools) {
      const userCount = userCounts[school.id] || 0;
      const studentCount = studentCounts[school.id] || 0;
      const staffCount = userCount - studentCount;

      // Calculate performance score (0-100)
      const performanceScore = this.calculatePerformanceScore(school, userCount, studentCount);

      // Calculate trends (mock data for now - would need historical data)
      const trends = {
        userGrowth: Math.random() * 20 - 10, // -10% to +10%
        studentGrowth: Math.random() * 15 - 7.5, // -7.5% to +7.5%
        occupancyChange: Math.random() * 10 - 5, // -5% to +5%
      };

      reports.push({
        schoolId: school.id,
        schoolName: school.name,
        metrics: {
          userCount,
          studentCount,
          staffCount,
          occupancyRate: school.occupancyRate || 0,
          subscriptionStatus: school.isSubscriptionActive ? 'active' : 'expired',
          performanceScore,
        },
        trends,
      });
    }

    // Sort by performance score descending
    return reports.sort((a, b) => b.metrics.performanceScore - a.metrics.performanceScore);
  }

  /**
   * Generate subscription and billing report
   */
  async generateSubscriptionReport(): Promise<any> {
    this.logger.log('Generating subscription report');

    const schools = await this.schoolRepository.find();

    const activeSubscriptions = schools.filter(s => s.isSubscriptionActive);
    const expiredSubscriptions = schools.filter(s => !s.isSubscriptionActive);
    const expiringSoon = schools.filter(s =>
      s.daysUntilSubscriptionExpiry !== undefined &&
      s.daysUntilSubscriptionExpiry <= 30 &&
      s.daysUntilSubscriptionExpiry > 0
    );

    // Calculate revenue by plan
    const revenueByPlan = activeSubscriptions.reduce((acc, school) => {
      const plan = school.subscriptionPlan;
      const monthlyRate = this.getPlanMonthlyRate(plan);
      acc[plan] = (acc[plan] || 0) + monthlyRate;
      return acc;
    }, {});

    const totalMonthlyRevenue = Object.values(revenueByPlan).reduce((sum: number, rate: number) => sum + rate, 0);

    return {
      summary: {
        totalSchools: schools.length,
        activeSubscriptions: activeSubscriptions.length,
        expiredSubscriptions: expiredSubscriptions.length,
        expiringSoon: expiringSoon.length,
        totalMonthlyRevenue,
        totalAnnualRevenue: (totalMonthlyRevenue as number) * 12,
      },
      revenueByPlan,
      expiringSchools: expiringSoon.map(school => ({
        id: school.id,
        name: school.name,
        plan: school.subscriptionPlan,
        daysUntilExpiry: school.daysUntilSubscriptionExpiry,
        monthlyRevenue: this.getPlanMonthlyRate(school.subscriptionPlan),
      })),
      expiredSchools: expiredSubscriptions.map(school => ({
        id: school.id,
        name: school.name,
        plan: school.subscriptionPlan,
        daysSinceExpiry: school.daysUntilSubscriptionExpiry ? -school.daysUntilSubscriptionExpiry : 0,
      })),
    };
  }

  /**
   * Generate geographic distribution report
   */
  async generateGeographicReport(): Promise<any> {
    this.logger.log('Generating geographic report');

    const schools = await this.schoolRepository.find();

    const countryDistribution = schools.reduce((acc, school) => {
      const country = school.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});

    const cityDistribution = schools.reduce((acc, school) => {
      const city = school.city || 'Unknown';
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    // Group schools by region
    const schoolsByRegion = schools.reduce((acc, school) => {
      const region = this.determineRegion(school.country);
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push({
        id: school.id,
        name: school.name,
        city: school.city,
        type: school.type,
        status: school.status,
      });
      return acc;
    }, {});

    return {
      countryDistribution,
      cityDistribution,
      schoolsByRegion,
      topCountries: Object.entries(countryDistribution)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10),
      topCities: Object.entries(cityDistribution)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10),
    };
  }

  // ==================== PRIVATE METHODS ====================

  private async getUserCountsBySchool(): Promise<{ [schoolId: string]: number }> {
    const result = await this.userRepository
      .createQueryBuilder('user')
      .select('user.schoolId', 'schoolId')
      .addSelect('COUNT(*)', 'count')
      .where('user.schoolId IS NOT NULL')
      .groupBy('user.schoolId')
      .getRawMany();

    return result.reduce((acc, row) => {
      acc[row.schoolId] = parseInt(row.count);
      return acc;
    }, {});
  }

  private async getStudentCountsBySchool(): Promise<{ [schoolId: string]: number }> {
    const result = await this.studentRepository
      .createQueryBuilder('student')
      .select('student.schoolId', 'schoolId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('student.schoolId')
      .getRawMany();

    return result.reduce((acc, row) => {
      acc[row.schoolId] = parseInt(row.count);
      return acc;
    }, {});
  }

  private calculateSubscriptionMetrics(schools: School[]): any {
    const activeSubscriptions = schools.filter(s => s.isSubscriptionActive).length;
    const expiredSubscriptions = schools.filter(s => !s.isSubscriptionActive).length;
    const expiringSoon = schools.filter(s =>
      s.daysUntilSubscriptionExpiry !== undefined &&
      s.daysUntilSubscriptionExpiry <= 30 &&
      s.daysUntilSubscriptionExpiry > 0
    ).length;

    const totalRevenue = schools
      .filter(s => s.isSubscriptionActive)
      .reduce((sum, school) => sum + this.getPlanMonthlyRate(school.subscriptionPlan), 0);

    return {
      activeSubscriptions,
      expiredSubscriptions,
      expiringSoon,
      totalRevenue,
    };
  }

  private calculateSchoolTypeDistribution(schools: School[]): { [key: string]: number } {
    return schools.reduce((acc, school) => {
      acc[school.type] = (acc[school.type] || 0) + 1;
      return acc;
    }, {});
  }

  private calculateGeographicDistribution(schools: School[]): { [key: string]: number } {
    return schools.reduce((acc, school) => {
      const country = school.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
  }

  private async calculatePerformanceMetrics(
    schools: School[],
    userCounts: { [schoolId: string]: number },
    studentCounts: { [schoolId: string]: number }
  ): Promise<any> {
    const totalUsers = Object.values(userCounts).reduce((sum, count) => sum + count, 0);
    const totalStudents = Object.values(studentCounts).reduce((sum, count) => sum + count, 0);

    const averageUsersPerSchool = schools.length > 0 ? totalUsers / schools.length : 0;
    const averageStudentsPerSchool = schools.length > 0 ? totalStudents / schools.length : 0;

    // Calculate top performing schools based on occupancy rate and user count
    const topPerformingSchools = schools
      .map(school => ({
        schoolId: school.id,
        schoolName: school.name,
        occupancyRate: school.occupancyRate || 0,
        userCount: userCounts[school.id] || 0,
        studentCount: studentCounts[school.id] || 0,
      }))
      .sort((a, b) => {
        // Sort by occupancy rate, then by user count
        if (a.occupancyRate !== b.occupancyRate) {
          return b.occupancyRate - a.occupancyRate;
        }
        return b.userCount - a.userCount;
      })
      .slice(0, 10);

    return {
      averageUsersPerSchool,
      averageStudentsPerSchool,
      topPerformingSchools,
    };
  }

  private calculatePerformanceScore(school: School, userCount: number, studentCount: number): number {
    let score = 0;

    // Occupancy rate contributes 40% to score
    const occupancyScore = Math.min((school.occupancyRate || 0) / 100, 1) * 40;
    score += occupancyScore;

    // User engagement contributes 30% to score
    const expectedUsers = school.maxStudents || 100;
    const userEngagementScore = Math.min(userCount / expectedUsers, 1) * 30;
    score += userEngagementScore;

    // Subscription status contributes 20% to score
    const subscriptionScore = school.isSubscriptionActive ? 20 : 0;
    score += subscriptionScore;

    // Activity level contributes 10% to score
    const activityScore = studentCount > 0 ? 10 : 0;
    score += activityScore;

    return Math.round(score);
  }

  private getPlanMonthlyRate(plan: string): number {
    const rates = {
      basic: 50,
      standard: 100,
      premium: 200,
      enterprise: 500,
    };
    return rates[plan] || 0;
  }

  private determineRegion(country: string): string {
    const regions = {
      'North America': ['United States', 'Canada', 'Mexico'],
      'Europe': ['United Kingdom', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands'],
      'Asia': ['India', 'China', 'Japan', 'South Korea', 'Singapore', 'Malaysia'],
      'Africa': ['Nigeria', 'South Africa', 'Kenya', 'Egypt', 'Ghana'],
      'South America': ['Brazil', 'Argentina', 'Colombia', 'Chile'],
      'Oceania': ['Australia', 'New Zealand'],
    };

    for (const [region, countries] of Object.entries(regions)) {
      if (countries.includes(country)) {
        return region;
      }
    }

    return 'Other';
  }
}