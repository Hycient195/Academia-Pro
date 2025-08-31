// Academia Pro - Timetable Service
// Service for managing class schedules, automated generation, and conflict resolution

import { Injectable, NotFoundException, BadRequestException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';
import { Timetable, DayOfWeek, TimetableStatus, PeriodType, PriorityLevel, RecurrenceType } from '../entities/timetable.entity';
import { CreateTimetableDto, BulkCreateTimetableDto, UpdateTimetableDto } from '../dtos';
import { TDayOfWeek, TPriorityLevel } from '@academia-pro/common/timetable';

@Injectable()
export class TimetableService {
  private readonly logger = new Logger(TimetableService.name);

  constructor(
    @InjectRepository(Timetable)
    private readonly timetableRepository: Repository<Timetable>,
  ) {}

  /**
   * Convert TDayOfWeek to DayOfWeek
   */
  private convertTDayOfWeekToDayOfWeek(tDayOfWeek: TDayOfWeek): DayOfWeek {
    const mapping: Record<TDayOfWeek, DayOfWeek> = {
      [TDayOfWeek.SUNDAY]: DayOfWeek.SUNDAY,
      [TDayOfWeek.MONDAY]: DayOfWeek.MONDAY,
      [TDayOfWeek.TUESDAY]: DayOfWeek.TUESDAY,
      [TDayOfWeek.WEDNESDAY]: DayOfWeek.WEDNESDAY,
      [TDayOfWeek.THURSDAY]: DayOfWeek.THURSDAY,
      [TDayOfWeek.FRIDAY]: DayOfWeek.FRIDAY,
      [TDayOfWeek.SATURDAY]: DayOfWeek.SATURDAY,
    };
    return mapping[tDayOfWeek];
  }

  /**
   * Convert DayOfWeek to TDayOfWeek
   */
  private convertDayOfWeekToTDayOfWeek(dayOfWeek: DayOfWeek): TDayOfWeek {
    const mapping: Record<DayOfWeek, TDayOfWeek> = {
      [DayOfWeek.SUNDAY]: TDayOfWeek.SUNDAY,
      [DayOfWeek.MONDAY]: TDayOfWeek.MONDAY,
      [DayOfWeek.TUESDAY]: TDayOfWeek.TUESDAY,
      [DayOfWeek.WEDNESDAY]: TDayOfWeek.WEDNESDAY,
      [DayOfWeek.THURSDAY]: TDayOfWeek.THURSDAY,
      [DayOfWeek.FRIDAY]: TDayOfWeek.FRIDAY,
      [DayOfWeek.SATURDAY]: TDayOfWeek.SATURDAY,
    };
    return mapping[dayOfWeek];
  }

  /**
   * Create a new timetable entry
   */
  async createTimetable(dto: CreateTimetableDto, createdBy: string): Promise<Timetable> {
    // Validate time format
    this.validateTimeFormat(dto.startTime);
    this.validateTimeFormat(dto.endTime);

    // Check for conflicts
    const conflicts = await this.checkConflicts(dto);
    if (conflicts.length > 0) {
      throw new ConflictException({
        message: 'Schedule conflicts detected',
        conflicts: conflicts,
      });
    }

    // Create timetable entry
    const savedTimetable = await this.timetableRepository.save({
      schoolId: dto.schoolId,
      academicYear: dto.academicYear,
      gradeLevel: dto.gradeLevel,
      section: dto.section,
      classId: dto.classId,
      subjectId: dto.subjectId,
      subjectName: dto.subjectName,
      teacherId: dto.teacherId,
      teacherName: dto.teacherName,
      dayOfWeek: this.convertTDayOfWeekToDayOfWeek(dto.dayOfWeek),
      startTime: dto.startTime,
      endTime: dto.endTime,
      durationMinutes: dto.durationMinutes,
      periodNumber: dto.periodNumber,
      periodType: (dto.periodType as unknown as PeriodType) || PeriodType.REGULAR_CLASS,
      roomId: dto.roomId,
      roomName: dto.roomName,
      roomCapacity: dto.roomCapacity,
      roomType: dto.roomType,
      equipmentRequired: dto.equipmentRequired || [],
      recurrenceType: dto.recurrenceType || RecurrenceType.WEEKLY,
      recurrenceEndDate: dto.recurrenceEndDate ? new Date(dto.recurrenceEndDate) : undefined,
      isRecurring: dto.isRecurring !== false,
      eventTitle: dto.eventTitle,
      eventDescription: dto.eventDescription,
      isSpecialEvent: dto.isSpecialEvent || false,
      requiresApproval: dto.requiresApproval || false,
      expectedStudents: dto.expectedStudents,
      priorityLevel: (dto.priorityLevel as unknown as PriorityLevel) || PriorityLevel.NORMAL,
      isFixed: dto.isFixed || false,
      notifyStudents: dto.notifyStudents !== false,
      notifyTeachers: dto.notifyTeachers !== false,
      notifyParents: dto.notifyParents || false,
      reminderMinutesBefore: dto.reminderMinutesBefore || 15,
      isOnlineClass: dto.isOnlineClass || false,
      onlineMeetingLink: dto.onlineMeetingLink,
      onlineMeetingId: dto.onlineMeetingId,
      onlineMeetingPassword: dto.onlineMeetingPassword,
      qrCodeEnabled: dto.qrCodeEnabled || false,
      mobileCheckinEnabled: dto.mobileCheckinEnabled || false,
      tags: dto.tags || [],
      metadata: dto.metadata,
      internalNotes: dto.internalNotes,
      createdBy,
      updatedBy: createdBy,
    } as any) as Timetable;

    this.logger.log(
      `Created timetable entry for ${dto.subjectName} on ${dto.dayOfWeek} at ${dto.startTime}`
    );

    return savedTimetable;
  }

  /**
   * Create multiple timetable entries in bulk
   */
  async bulkCreateTimetable(dto: BulkCreateTimetableDto, createdBy: string): Promise<Timetable[]> {
    const timetables: Timetable[] = [];
    const errors: string[] = [];

    for (const entry of dto.entries) {
      try {
        const timetable = await this.createTimetable(entry, createdBy);
        timetables.push(timetable);
      } catch (error) {
        errors.push(`Entry ${entry.subjectName}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      this.logger.warn(`Bulk creation completed with ${errors.length} errors:`, errors);
    }

    this.logger.log(`Bulk created ${timetables.length} timetable entries`);
    return timetables;
  }

  /**
   * Get timetable by ID
   */
  async getTimetableById(timetableId: string): Promise<Timetable> {
    const timetable = await this.timetableRepository.findOne({
      where: { id: timetableId },
    });

    if (!timetable) {
      throw new NotFoundException(`Timetable entry with ID ${timetableId} not found`);
    }

    return timetable;
  }

  /**
   * Get timetables for a specific class
   */
  async getClassTimetable(
    classId: string,
    options?: {
      academicYear?: string;
      gradeLevel?: string;
      section?: string;
      dayOfWeek?: DayOfWeek;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<Timetable[]> {
    const queryBuilder = this.timetableRepository
      .createQueryBuilder('timetable')
      .where('timetable.classId = :classId', { classId })
      .orderBy('timetable.dayOfWeek', 'ASC')
      .addOrderBy('timetable.startTime', 'ASC');

    if (options?.academicYear) {
      queryBuilder.andWhere('timetable.academicYear = :academicYear', {
        academicYear: options.academicYear,
      });
    }

    if (options?.gradeLevel) {
      queryBuilder.andWhere('timetable.gradeLevel = :gradeLevel', {
        gradeLevel: options.gradeLevel,
      });
    }

    if (options?.section) {
      queryBuilder.andWhere('timetable.section = :section', {
        section: options.section,
      });
    }

    if (options?.dayOfWeek) {
      queryBuilder.andWhere('timetable.dayOfWeek = :dayOfWeek', {
        dayOfWeek: options.dayOfWeek,
      });
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
   * Get teacher timetable
   */
  async getTeacherTimetable(
    teacherId: string,
    options?: {
      academicYear?: string;
      dayOfWeek?: DayOfWeek;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<Timetable[]> {
    const queryBuilder = this.timetableRepository
      .createQueryBuilder('timetable')
      .where('timetable.teacherId = :teacherId', { teacherId })
      .orderBy('timetable.dayOfWeek', 'ASC')
      .addOrderBy('timetable.startTime', 'ASC');

    if (options?.academicYear) {
      queryBuilder.andWhere('timetable.academicYear = :academicYear', {
        academicYear: options.academicYear,
      });
    }

    if (options?.dayOfWeek) {
      queryBuilder.andWhere('timetable.dayOfWeek = :dayOfWeek', {
        dayOfWeek: options.dayOfWeek,
      });
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
   * Get room timetable
   */
  async getRoomTimetable(
    roomId: string,
    options?: {
      academicYear?: string;
      dayOfWeek?: DayOfWeek;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<Timetable[]> {
    const queryBuilder = this.timetableRepository
      .createQueryBuilder('timetable')
      .where('timetable.roomId = :roomId', { roomId })
      .orderBy('timetable.dayOfWeek', 'ASC')
      .addOrderBy('timetable.startTime', 'ASC');

    if (options?.academicYear) {
      queryBuilder.andWhere('timetable.academicYear = :academicYear', {
        academicYear: options.academicYear,
      });
    }

    if (options?.dayOfWeek) {
      queryBuilder.andWhere('timetable.dayOfWeek = :dayOfWeek', {
        dayOfWeek: options.dayOfWeek,
      });
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
   * Update timetable entry
   */
  async updateTimetable(timetableId: string, dto: UpdateTimetableDto, updatedBy: string): Promise<Timetable> {
    const timetable = await this.getTimetableById(timetableId);

    // Validate time format if updating times
    if (dto.startTime) this.validateTimeFormat(dto.startTime);
    if (dto.endTime) this.validateTimeFormat(dto.endTime);

    // Check for conflicts if updating scheduling information
    if (dto.dayOfWeek || dto.startTime || dto.endTime || dto.roomId) {
      const conflictDto: CreateTimetableDto = {
        schoolId: timetable.schoolId,
        academicYear: timetable.academicYear,
        gradeLevel: timetable.gradeLevel,
        section: timetable.section,
        classId: timetable.classId,
        subjectId: timetable.subjectId,
        subjectName: timetable.subjectName,
        teacherId: timetable.teacherId,
        teacherName: timetable.teacherName,
        dayOfWeek: dto.dayOfWeek || this.convertDayOfWeekToTDayOfWeek(timetable.dayOfWeek),
        startTime: dto.startTime || timetable.startTime,
        endTime: dto.endTime || timetable.endTime,
        durationMinutes: timetable.durationMinutes,
        roomId: dto.roomId || timetable.roomId,
        roomName: dto.roomName || timetable.roomName,
      };

      const conflicts = await this.checkConflicts(conflictDto);

      if (conflicts.length > 0) {
        throw new ConflictException({
          message: 'Schedule conflicts detected',
          conflicts: conflicts,
        });
      }
    }

    // Apply updates
    Object.assign(timetable, dto);
    timetable.updatedBy = updatedBy;

    const updatedTimetable = await this.timetableRepository.save(timetable);

    this.logger.log(`Updated timetable entry ${timetableId}`);
    return updatedTimetable;
  }

  /**
   * Delete timetable entry
   */
  async deleteTimetable(timetableId: string): Promise<void> {
    const timetable = await this.getTimetableById(timetableId);

    // Prevent deletion of active entries
    if (timetable.status === TimetableStatus.ACTIVE) {
      throw new BadRequestException('Cannot delete an active timetable entry');
    }

    await this.timetableRepository.remove(timetable);
    this.logger.log(`Deleted timetable entry ${timetableId}`);
  }

  /**
   * Publish timetable (make it visible to students)
   */
  async publishTimetable(timetableId: string): Promise<Timetable> {
    const timetable = await this.getTimetableById(timetableId);

    timetable.publish();
    const updatedTimetable = await this.timetableRepository.save(timetable);

    this.logger.log(`Published timetable entry ${timetableId}`);
    return updatedTimetable;
  }

  /**
   * Cancel timetable entry
   */
  async cancelTimetable(timetableId: string, reason: string): Promise<Timetable> {
    const timetable = await this.getTimetableById(timetableId);

    timetable.cancel(reason);
    const updatedTimetable = await this.timetableRepository.save(timetable);

    this.logger.log(`Cancelled timetable entry ${timetableId}: ${reason}`);
    return updatedTimetable;
  }

  /**
   * Check for scheduling conflicts
   */
  async checkConflicts(dto: CreateTimetableDto): Promise<Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
    conflictingEntry?: Timetable;
  }>> {
    const conflicts: Array<{
      type: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      conflictingEntry?: Timetable;
    }> = [];

    // Check teacher conflicts
    const teacherConflicts = await this.timetableRepository.find({
      where: {
        teacherId: dto.teacherId,
        dayOfWeek: this.convertTDayOfWeekToDayOfWeek(dto.dayOfWeek),
        academicYear: dto.academicYear,
        status: In([TimetableStatus.DRAFT, TimetableStatus.PUBLISHED, TimetableStatus.ACTIVE]),
      },
    });

    for (const conflict of teacherConflicts) {
      if (this.timesOverlap(dto.startTime, dto.endTime, conflict.startTime, conflict.endTime)) {
        conflicts.push({
          type: 'teacher_conflict',
          description: `Teacher ${dto.teacherName} is already scheduled for ${conflict.subjectName} during this time`,
          severity: 'high',
          conflictingEntry: conflict,
        });
      }
    }

    // Check room conflicts
    if (dto.roomId) {
      const roomConflicts = await this.timetableRepository.find({
        where: {
          roomId: dto.roomId,
          dayOfWeek: this.convertTDayOfWeekToDayOfWeek(dto.dayOfWeek),
          academicYear: dto.academicYear,
          status: In([TimetableStatus.DRAFT, TimetableStatus.PUBLISHED, TimetableStatus.ACTIVE]),
        },
      });

      for (const conflict of roomConflicts) {
        if (this.timesOverlap(dto.startTime, dto.endTime, conflict.startTime, conflict.endTime)) {
          conflicts.push({
            type: 'room_conflict',
            description: `Room ${dto.roomName} is already booked for ${conflict.subjectName} during this time`,
            severity: 'high',
            conflictingEntry: conflict,
          });
        }
      }
    }

    // Check class conflicts
    const classConflicts = await this.timetableRepository.find({
      where: {
        classId: dto.classId,
        dayOfWeek: this.convertTDayOfWeekToDayOfWeek(dto.dayOfWeek),
        academicYear: dto.academicYear,
        section: dto.section,
        status: In([TimetableStatus.DRAFT, TimetableStatus.PUBLISHED, TimetableStatus.ACTIVE]),
      },
    });

    for (const conflict of classConflicts) {
      if (this.timesOverlap(dto.startTime, dto.endTime, conflict.startTime, conflict.endTime)) {
        conflicts.push({
          type: 'class_conflict',
          description: `Class ${dto.gradeLevel}${dto.section ? `-${dto.section}` : ''} already has ${conflict.subjectName} scheduled during this time`,
          severity: 'high',
          conflictingEntry: conflict,
        });
      }
    }

    return conflicts;
  }

  /**
   * Generate optimized timetable automatically
   */
  async generateTimetable(options: {
    schoolId: string;
    academicYear: string;
    gradeLevel: string;
    section?: string;
    subjects: Array<{
      subjectId: string;
      subjectName: string;
      teacherId: string;
      teacherName: string;
      periodsPerWeek: number;
      durationMinutes: number;
      priorityLevel?: TPriorityLevel;
    }>;
    constraints?: {
      maxPeriodsPerDay?: number;
      breakDurationMinutes?: number;
      lunchBreak?: {
        startTime: string;
        endTime: string;
      };
      workingDays?: DayOfWeek[];
      startTime?: string;
      endTime?: string;
    };
  }): Promise<Timetable[]> {
    const { schoolId, academicYear, gradeLevel, section, subjects, constraints } = options;

    const generatedEntries: Timetable[] = [];
    const workingDays = constraints?.workingDays || [
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
    ];

    const maxPeriodsPerDay = constraints?.maxPeriodsPerDay || 8;
    const breakDuration = constraints?.breakDurationMinutes || 15;
    const startTime = constraints?.startTime || '08:00';
    const endTime = constraints?.endTime || '15:00';

    // Sort subjects by priority
    const sortedSubjects = subjects.sort((a, b) => {
      const priorityOrder = { [TPriorityLevel.URGENT]: 3, [TPriorityLevel.HIGH]: 2, [TPriorityLevel.NORMAL]: 1, [TPriorityLevel.LOW]: 0 };
      return (priorityOrder[b.priorityLevel || TPriorityLevel.NORMAL] || 0) -
             (priorityOrder[a.priorityLevel || TPriorityLevel.NORMAL] || 0);
    });

    for (const subject of sortedSubjects) {
      let periodsScheduled = 0;

      for (const day of workingDays) {
        if (periodsScheduled >= subject.periodsPerWeek) break;

        // Get existing entries for this day
        const existingEntries = await this.getClassTimetable(`${schoolId}-${gradeLevel}${section ? `-${section}` : ''}`, {
          academicYear,
          gradeLevel,
          section,
          dayOfWeek: day,
        });

        // Find available time slots
        const availableSlots = this.findAvailableTimeSlots(
          existingEntries,
          startTime,
          endTime,
          subject.durationMinutes,
          breakDuration,
          constraints?.lunchBreak,
        );

        for (const slot of availableSlots) {
          if (periodsScheduled >= subject.periodsPerWeek) break;

          // Check for conflicts
          const conflictDto: CreateTimetableDto = {
            schoolId,
            academicYear,
            gradeLevel,
            section,
            classId: `${schoolId}-${gradeLevel}${section ? `-${section}` : ''}`,
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            teacherId: subject.teacherId,
            teacherName: subject.teacherName,
            dayOfWeek: this.convertDayOfWeekToTDayOfWeek(day),
            startTime: slot.startTime,
            endTime: slot.endTime,
            durationMinutes: subject.durationMinutes,
          };

          const conflicts = await this.checkConflicts(conflictDto);

          if (conflicts.length === 0) {
            const timetableEntry = await this.createTimetable({
              schoolId,
              academicYear,
              gradeLevel,
              section,
              classId: `${schoolId}-${gradeLevel}${section ? `-${section}` : ''}`,
              subjectId: subject.subjectId,
              subjectName: subject.subjectName,
              teacherId: subject.teacherId,
              teacherName: subject.teacherName,
              dayOfWeek: this.convertDayOfWeekToTDayOfWeek(day),
              startTime: slot.startTime,
              endTime: slot.endTime,
              durationMinutes: subject.durationMinutes,
              priorityLevel: subject.priorityLevel,
            }, 'system');

            generatedEntries.push(timetableEntry);
            periodsScheduled++;
          }
        }
      }

      if (periodsScheduled < subject.periodsPerWeek) {
        this.logger.warn(
          `Could not schedule all ${subject.periodsPerWeek} periods for ${subject.subjectName}. Only ${periodsScheduled} scheduled.`
        );
      }
    }

    this.logger.log(`Generated timetable with ${generatedEntries.length} entries`);
    return generatedEntries;
  }

  /**
   * Get timetable statistics
   */
  async getTimetableStatistics(options: {
    schoolId: string;
    academicYear?: string;
    gradeLevel?: string;
    section?: string;
  }): Promise<{
    totalEntries: number;
    publishedEntries: number;
    activeEntries: number;
    conflictsCount: number;
    utilizationRate: number;
    averagePeriodsPerDay: number;
    teacherWorkload: Record<string, number>;
    roomUtilization: Record<string, number>;
  }> {
    const queryBuilder = this.timetableRepository
      .createQueryBuilder('timetable')
      .where('timetable.schoolId = :schoolId', { schoolId: options.schoolId });

    if (options.academicYear) {
      queryBuilder.andWhere('timetable.academicYear = :academicYear', {
        academicYear: options.academicYear,
      });
    }

    if (options.gradeLevel) {
      queryBuilder.andWhere('timetable.gradeLevel = :gradeLevel', {
        gradeLevel: options.gradeLevel,
      });
    }

    if (options.section) {
      queryBuilder.andWhere('timetable.section = :section', {
        section: options.section,
      });
    }

    const entries = await queryBuilder.getMany();

    const totalEntries = entries.length;
    const publishedEntries = entries.filter(e => e.status === TimetableStatus.PUBLISHED).length;
    const activeEntries = entries.filter(e => e.status === TimetableStatus.ACTIVE).length;
    const conflictsCount = entries.filter(e => e.hasConflicts).length;

    // Calculate utilization rate
    const totalPossibleSlots = 5 * 8; // 5 days, 8 periods per day
    const utilizationRate = totalEntries > 0 ? (totalEntries / totalPossibleSlots) * 100 : 0;

    // Calculate average periods per day
    const periodsByDay = entries.reduce((acc, entry) => {
      acc[entry.dayOfWeek] = (acc[entry.dayOfWeek] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averagePeriodsPerDay = Object.values(periodsByDay).reduce((sum, count) => sum + count, 0) / 5;

    // Calculate teacher workload
    const teacherWorkload = entries.reduce((acc, entry) => {
      acc[entry.teacherName] = (acc[entry.teacherName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate room utilization
    const roomUtilization = entries
      .filter(e => e.roomId)
      .reduce((acc, entry) => {
        acc[entry.roomName || 'Unknown'] = (acc[entry.roomName || 'Unknown'] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalEntries,
      publishedEntries,
      activeEntries,
      conflictsCount,
      utilizationRate: Math.round(utilizationRate * 100) / 100,
      averagePeriodsPerDay: Math.round(averagePeriodsPerDay * 100) / 100,
      teacherWorkload,
      roomUtilization,
    };
  }

  /**
   * Validate time format (HH:MM)
   */
  private validateTimeFormat(time: string): void {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new BadRequestException(`Invalid time format: ${time}. Expected HH:MM format.`);
    }
  }

  /**
   * Check if two time ranges overlap
   */
  private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
    const start1Minutes = this.timeToMinutes(start1);
    const end1Minutes = this.timeToMinutes(end1);
    const start2Minutes = this.timeToMinutes(start2);
    const end2Minutes = this.timeToMinutes(end2);

    return start1Minutes < end2Minutes && end1Minutes > start2Minutes;
  }

  /**
   * Convert time string to minutes
   */
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Find available time slots in a day
   */
  private findAvailableTimeSlots(
    existingEntries: Timetable[],
    dayStart: string,
    dayEnd: string,
    durationMinutes: number,
    breakDuration: number,
    lunchBreak?: { startTime: string; endTime: string },
  ): Array<{ startTime: string; endTime: string }> {
    const availableSlots: Array<{ startTime: string; endTime: string }> = [];

    // Sort existing entries by start time
    const sortedEntries = existingEntries.sort((a, b) =>
      this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
    );

    let currentTime = this.timeToMinutes(dayStart);

    for (const entry of sortedEntries) {
      const entryStart = this.timeToMinutes(entry.startTime);
      const entryEnd = this.timeToMinutes(entry.endTime);

      // Check if there's enough time before this entry
      if (entryStart - currentTime >= durationMinutes + breakDuration) {
        const slotStart = this.minutesToTime(currentTime);
        const slotEnd = this.minutesToTime(currentTime + durationMinutes);

        // Skip lunch break if it overlaps
        if (!this.overlapsLunchBreak(slotStart, slotEnd, lunchBreak)) {
          availableSlots.push({ startTime: slotStart, endTime: slotEnd });
        }
      }

      currentTime = Math.max(currentTime, entryEnd + breakDuration);
    }

    // Check remaining time after last entry
    const dayEndMinutes = this.timeToMinutes(dayEnd);
    if (dayEndMinutes - currentTime >= durationMinutes) {
      const slotStart = this.minutesToTime(currentTime);
      const slotEnd = this.minutesToTime(currentTime + durationMinutes);

      if (!this.overlapsLunchBreak(slotStart, slotEnd, lunchBreak)) {
        availableSlots.push({ startTime: slotStart, endTime: slotEnd });
      }
    }

    return availableSlots;
  }

  /**
   * Convert minutes to time string
   */
  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Check if time slot overlaps with lunch break
   */
  private overlapsLunchBreak(
    slotStart: string,
    slotEnd: string,
    lunchBreak?: { startTime: string; endTime: string },
  ): boolean {
    if (!lunchBreak) return false;

    return this.timesOverlap(slotStart, slotEnd, lunchBreak.startTime, lunchBreak.endTime);
  }
}