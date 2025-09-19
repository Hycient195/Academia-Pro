// Academia Pro - Student Achievement Service
// Service for managing student achievements and recognitions

import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../student.entity';
import { StudentAchievement, AchievementType, AchievementLevel, AchievementStatus } from '../entities/student-achievement.entity';
import { CreateAchievementDto, UpdateAchievementDto } from '../dtos/create-achievement.dto';

@Injectable()
export class StudentAchievementService {
  private readonly logger = new Logger(StudentAchievementService.name);

  constructor(
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(StudentAchievement)
    private readonly achievementRepository: Repository<StudentAchievement>,
  ) {}

  /**
   * Create a new achievement for a student
   */
  async createAchievement(
    studentId: string,
    createDto: CreateAchievementDto,
    createdBy: string,
  ): Promise<StudentAchievement> {
    // Verify student exists
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      select: ['id', 'firstName', 'lastName', 'currentGrade', 'currentSection'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Create achievement
    const achievement = this.achievementRepository.create({
      studentId,
      achievementType: createDto.achievementType,
      achievementTitle: createDto.achievementTitle,
      achievementDescription: createDto.achievementDescription,
      achievementLevel: createDto.achievementLevel || AchievementLevel.SCHOOL,
      status: AchievementStatus.PENDING,
      achievementDate: new Date(createDto.achievementDate),
      announcementDate: createDto.announcementDate ? new Date(createDto.announcementDate) : undefined,
      eventName: createDto.eventName,
      eventOrganizer: createDto.eventOrganizer,
      competitionName: createDto.competitionName,
      positionRank: createDto.positionRank,
      participantsCount: createDto.participantsCount,
      prizeAmount: createDto.prizeAmount,
      prizeCurrency: createDto.prizeCurrency || 'NGN',
      prizeDescription: createDto.prizeDescription,
      certificateIssued: createDto.certificateIssued || false,
      certificateNumber: createDto.certificateNumber,
      certificateUrl: createDto.certificateUrl,
      certificateIssueDate: createDto.certificateIssueDate ? new Date(createDto.certificateIssueDate) : undefined,
      supportingDocuments: createDto.supportingDocuments || [],
      recognitionLevel: createDto.recognitionLevel,
      impactDescription: createDto.impactDescription,
      schoolImpact: createDto.schoolImpact,
      communityImpact: createDto.communityImpact,
      academicYear: createDto.academicYear,
      gradeLevel: createDto.gradeLevel,
      section: createDto.section,
      isPublic: createDto.isPublic !== undefined ? createDto.isPublic : true,
      publishOnWebsite: createDto.publishOnWebsite !== undefined ? createDto.publishOnWebsite : true,
      publishInNewsletter: createDto.publishInNewsletter || false,
      shareWithParents: createDto.shareWithParents !== undefined ? createDto.shareWithParents : true,
      shareWithCommunity: createDto.shareWithCommunity || false,
      socialMediaPosted: createDto.socialMediaPosted || false,
      socialMediaUrls: createDto.socialMediaUrls || [],
      followUpRequired: createDto.followUpRequired || false,
      followUpDate: createDto.followUpDate ? new Date(createDto.followUpDate) : undefined,
      followUpNotes: createDto.followUpNotes,
      longTermImpact: createDto.longTermImpact,
      tags: createDto.tags || [],
      metadata: createDto.metadata,
      internalNotes: createDto.internalNotes,
      createdBy,
      createdByName: 'System', // This should be passed from the controller
    });

    const savedAchievement = await this.achievementRepository.save(achievement);

    this.logger.log(`Created achievement ${savedAchievement.id} for student ${studentId}`);
    return savedAchievement;
  }

  /**
   * Get all achievements for a student
   */
  async getStudentAchievements(
    studentId: string,
    options?: {
      status?: string;
      type?: string;
      level?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<StudentAchievement[]> {
    const queryBuilder = this.achievementRepository
      .createQueryBuilder('achievement')
      .where('achievement.studentId = :studentId', { studentId })
      .orderBy('achievement.achievementDate', 'DESC');

    if (options?.status) {
      queryBuilder.andWhere('achievement.status = :status', { status: options.status });
    }

    if (options?.type) {
      queryBuilder.andWhere('achievement.achievementType = :type', { type: options.type });
    }

    if (options?.level) {
      queryBuilder.andWhere('achievement.achievementLevel = :level', { level: options.level });
    }

    if (options?.limit) {
      queryBuilder.limit(options.limit);
    }

    if (options?.offset) {
      queryBuilder.offset(options.offset);
    }

    return queryBuilder.getMany();
  }

  /**
   * Get a specific achievement
   */
  async getAchievement(achievementId: string): Promise<StudentAchievement> {
    const achievement = await this.achievementRepository.findOne({
      where: { id: achievementId },
      relations: ['student'],
    });

    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${achievementId} not found`);
    }

    return achievement;
  }

  /**
   * Update an achievement
   */
  async updateAchievement(
    achievementId: string,
    updateDto: UpdateAchievementDto,
    updatedBy: string,
  ): Promise<StudentAchievement> {
    const achievement = await this.achievementRepository.findOne({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${achievementId} not found`);
    }

    // Prepare update data
    const updateData: Partial<StudentAchievement> = {};

    if (updateDto.achievementType) updateData.achievementType = updateDto.achievementType;
    if (updateDto.achievementTitle) updateData.achievementTitle = updateDto.achievementTitle;
    if (updateDto.achievementDescription) updateData.achievementDescription = updateDto.achievementDescription;
    if (updateDto.achievementLevel) updateData.achievementLevel = updateDto.achievementLevel;
    if (updateDto.status) updateData.status = updateDto.status as any;
    if (updateDto.achievementDate) updateData.achievementDate = new Date(updateDto.achievementDate);
    if (updateDto.announcementDate) updateData.announcementDate = new Date(updateDto.announcementDate);
    if (updateDto.eventName !== undefined) updateData.eventName = updateDto.eventName;
    if (updateDto.eventOrganizer !== undefined) updateData.eventOrganizer = updateDto.eventOrganizer;
    if (updateDto.competitionName !== undefined) updateData.competitionName = updateDto.competitionName;
    if (updateDto.positionRank !== undefined) updateData.positionRank = updateDto.positionRank;
    if (updateDto.participantsCount !== undefined) updateData.participantsCount = updateDto.participantsCount;
    if (updateDto.prizeAmount !== undefined) updateData.prizeAmount = updateDto.prizeAmount;
    if (updateDto.prizeCurrency) updateData.prizeCurrency = updateDto.prizeCurrency;
    if (updateDto.prizeDescription !== undefined) updateData.prizeDescription = updateDto.prizeDescription;
    if (updateDto.certificateIssued !== undefined) updateData.certificateIssued = updateDto.certificateIssued;
    if (updateDto.certificateNumber !== undefined) updateData.certificateNumber = updateDto.certificateNumber;
    if (updateDto.certificateUrl !== undefined) updateData.certificateUrl = updateDto.certificateUrl;
    if (updateDto.certificateIssueDate) updateData.certificateIssueDate = new Date(updateDto.certificateIssueDate);
    if (updateDto.supportingDocuments) {
      updateData.supportingDocuments = updateDto.supportingDocuments.map(doc => ({
        documentType: doc.documentType,
        documentName: doc.documentName,
        documentUrl: doc.documentUrl,
        uploadDate: doc.uploadDate ? new Date(doc.uploadDate) : new Date(),
      }));
    }
    if (updateDto.recognitionLevel !== undefined) updateData.recognitionLevel = updateDto.recognitionLevel;
    if (updateDto.impactDescription !== undefined) updateData.impactDescription = updateDto.impactDescription;
    if (updateDto.schoolImpact !== undefined) updateData.schoolImpact = updateDto.schoolImpact;
    if (updateDto.communityImpact !== undefined) updateData.communityImpact = updateDto.communityImpact;
    if (updateDto.academicYear) updateData.academicYear = updateDto.academicYear;
    if (updateDto.gradeLevel) updateData.gradeLevel = updateDto.gradeLevel;
    if (updateDto.section !== undefined) updateData.section = updateDto.section;
    if (updateDto.isPublic !== undefined) updateData.isPublic = updateDto.isPublic;
    if (updateDto.publishOnWebsite !== undefined) updateData.publishOnWebsite = updateDto.publishOnWebsite;
    if (updateDto.publishInNewsletter !== undefined) updateData.publishInNewsletter = updateDto.publishInNewsletter;
    if (updateDto.shareWithParents !== undefined) updateData.shareWithParents = updateDto.shareWithParents;
    if (updateDto.shareWithCommunity !== undefined) updateData.shareWithCommunity = updateDto.shareWithCommunity;
    if (updateDto.socialMediaPosted !== undefined) updateData.socialMediaPosted = updateDto.socialMediaPosted;
    if (updateDto.socialMediaUrls) {
      updateData.socialMediaUrls = updateDto.socialMediaUrls.map(url => ({
        platform: url.platform,
        url: url.url,
        postDate: url.postDate ? new Date(url.postDate) : new Date(),
      }));
    }
    if (updateDto.followUpRequired !== undefined) updateData.followUpRequired = updateDto.followUpRequired;
    if (updateDto.followUpDate) updateData.followUpDate = new Date(updateDto.followUpDate);
    if (updateDto.followUpNotes !== undefined) updateData.followUpNotes = updateDto.followUpNotes;
    if (updateDto.longTermImpact !== undefined) updateData.longTermImpact = updateDto.longTermImpact;
    if (updateDto.tags) updateData.tags = updateDto.tags;
    if (updateDto.metadata) {
      updateData.metadata = {
        category: updateDto.metadata.category,
        subcategory: updateDto.metadata.subcategory,
        priority: updateDto.metadata.priority,
        featured: updateDto.metadata.featured,
        pressCoverage: updateDto.metadata.pressCoverage?.map(coverage => ({
          publication: coverage.publication,
          date: new Date(coverage.date),
          url: coverage.url,
        })),
        relatedAchievements: updateDto.metadata.relatedAchievements,
        skillsDemonstrated: updateDto.metadata.skillsDemonstrated,
      };
    }
    if (updateDto.internalNotes !== undefined) updateData.internalNotes = updateDto.internalNotes;

    updateData.updatedBy = updatedBy;
    updateData.updatedByName = 'System'; // This should be passed from the controller

    await this.achievementRepository.update(achievementId, updateData);

    const updatedAchievement = await this.getAchievement(achievementId);
    this.logger.log(`Updated achievement ${achievementId}`);
    return updatedAchievement;
  }

  /**
   * Delete an achievement
   */
  async deleteAchievement(achievementId: string): Promise<void> {
    const achievement = await this.achievementRepository.findOne({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${achievementId} not found`);
    }

    await this.achievementRepository.remove(achievement);
    this.logger.log(`Deleted achievement ${achievementId}`);
  }

  /**
   * Get achievements by type
   */
  async getAchievementsByType(
    studentId: string,
    achievementType: string,
  ): Promise<StudentAchievement[]> {
    return this.achievementRepository.find({
      where: {
        studentId,
        achievementType: achievementType as any,
      },
      order: {
        achievementDate: 'DESC',
      },
    });
  }

  /**
   * Get achievements by level
   */
  async getAchievementsByLevel(
    studentId: string,
    achievementLevel: string,
  ): Promise<StudentAchievement[]> {
    return this.achievementRepository.find({
      where: {
        studentId,
        achievementLevel: achievementLevel as any,
      },
      order: {
        achievementDate: 'DESC',
      },
    });
  }

  /**
   * Get published achievements
   */
  async getPublishedAchievements(studentId: string): Promise<StudentAchievement[]> {
    return this.achievementRepository.find({
      where: {
        studentId,
        status: AchievementStatus.PUBLISHED,
        isPublic: true,
      },
      order: {
        achievementDate: 'DESC',
      },
    });
  }

  /**
   * Get achievements requiring follow-up
   */
  async getAchievementsRequiringFollowUp(studentId: string): Promise<StudentAchievement[]> {
    return this.achievementRepository.find({
      where: {
        studentId,
        followUpRequired: true,
        status: AchievementStatus.VERIFIED,
      },
      order: {
        followUpDate: 'ASC',
      },
    });
  }

  /**
   * Search achievements
   */
  async searchAchievements(
    studentId: string,
    searchTerm: string,
  ): Promise<StudentAchievement[]> {
    const queryBuilder = this.achievementRepository
      .createQueryBuilder('achievement')
      .where('achievement.studentId = :studentId', { studentId })
      .andWhere(
        '(achievement.achievementTitle ILIKE :searchTerm OR achievement.achievementDescription ILIKE :searchTerm OR achievement.eventName ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      )
      .orderBy('achievement.achievementDate', 'DESC');

    return queryBuilder.getMany();
  }

  /**
   * Verify an achievement
   */
  async verifyAchievement(
    achievementId: string,
    verifiedBy: string,
    verificationNotes?: string,
  ): Promise<StudentAchievement> {
    const achievement = await this.achievementRepository.findOne({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${achievementId} not found`);
    }

    await this.achievementRepository.update(achievementId, {
      status: AchievementStatus.VERIFIED,
      verifiedBy,
      verifiedByName: 'System', // This should be passed from the controller
      verificationDate: new Date(),
      verificationNotes,
    });

    const updatedAchievement = await this.getAchievement(achievementId);
    this.logger.log(`Verified achievement ${achievementId}`);
    return updatedAchievement;
  }

  /**
   * Publish an achievement
   */
  async publishAchievement(achievementId: string): Promise<StudentAchievement> {
    const achievement = await this.achievementRepository.findOne({
      where: { id: achievementId },
    });

    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${achievementId} not found`);
    }

    if (achievement.status !== AchievementStatus.VERIFIED) {
      throw new BadRequestException('Achievement must be verified before publishing');
    }

    await this.achievementRepository.update(achievementId, {
      status: AchievementStatus.PUBLISHED,
    });

    const updatedAchievement = await this.getAchievement(achievementId);
    this.logger.log(`Published achievement ${achievementId}`);
    return updatedAchievement;
  }

  /**
   * Get achievement statistics for a student
   */
  async getAchievementStatistics(studentId: string): Promise<{
    totalAchievements: number;
    verifiedAchievements: number;
    publishedAchievements: number;
    achievementsByType: Record<string, number>;
    achievementsByLevel: Record<string, number>;
    recentAchievements: number;
  }> {
    const [totalAchievements, verifiedAchievements, publishedAchievements] = await Promise.all([
      this.achievementRepository.count({ where: { studentId } }),
      this.achievementRepository.count({
        where: { studentId, status: AchievementStatus.VERIFIED },
      }),
      this.achievementRepository.count({
        where: { studentId, status: AchievementStatus.PUBLISHED },
      }),
    ]);

    // Get achievements by type
    const achievementsByType = await this.achievementRepository
      .createQueryBuilder('achievement')
      .select('achievement.achievementType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('achievement.studentId = :studentId', { studentId })
      .groupBy('achievement.achievementType')
      .getRawMany();

    const typeStats = {};
    achievementsByType.forEach(item => {
      typeStats[item.type] = parseInt(item.count);
    });

    // Get achievements by level
    const achievementsByLevel = await this.achievementRepository
      .createQueryBuilder('achievement')
      .select('achievement.achievementLevel', 'level')
      .addSelect('COUNT(*)', 'count')
      .where('achievement.studentId = :studentId', { studentId })
      .groupBy('achievement.achievementLevel')
      .getRawMany();

    const levelStats = {};
    achievementsByLevel.forEach(item => {
      levelStats[item.level] = parseInt(item.count);
    });

    // Get recent achievements (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentAchievements = await this.achievementRepository.count({
      where: {
        studentId,
        achievementDate: sixMonthsAgo as any,
      },
    });

    return {
      totalAchievements,
      verifiedAchievements,
      publishedAchievements,
      achievementsByType: typeStats,
      achievementsByLevel: levelStats,
      recentAchievements,
    };
  }
}