// Academia Pro - Attendance Service
// Service for managing student attendance across various contexts

import { Injectable, NotFoundException, BadRequestException, Logger, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Attendance, AttendanceStatus, AttendanceType, AttendanceMethod } from '../entities/attendance.entity';
import { Student } from '../../students/student.entity';
import { MarkAttendanceDto, BulkMarkAttendanceDto, BulkUpdateAttendanceDto } from '../dtos';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
  ) {}

  /**
   * Mark attendance for a single student
   */
  async markAttendance(
    dto: MarkAttendanceDto,
    markedBy: string,
    markedByName: string,
    markedByRole: string,
  ): Promise<Attendance> {
    // Verify student exists
    const student = await this.studentRepository.findOne({
      where: { id: dto.studentId },
      select: ['id', 'firstName', 'lastName', 'currentGrade', 'currentSection'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${dto.studentId} not found`);
    }

    // Check if attendance already exists for this student on this date
    const existingAttendance = await this.attendanceRepository.findOne({
      where: {
        studentId: dto.studentId,
        attendanceDate: new Date(dto.attendanceDate),
        attendanceType: dto.attendanceType || AttendanceType.CLASS,
        classId: dto.classId,
        periodNumber: dto.periodNumber,
      },
    });

    if (existingAttendance) {
      throw new ConflictException(
        `Attendance already marked for student ${student.fullName} on ${dto.attendanceDate}`
      );
    }

    // Calculate pattern data
    const patternData = await this.calculateAttendancePattern(dto.studentId, new Date(dto.attendanceDate));

    // Create attendance record
    const attendance = this.attendanceRepository.create({
      studentId: dto.studentId,
      status: dto.status,
      attendanceType: dto.attendanceType || AttendanceType.CLASS,
      attendanceDate: new Date(dto.attendanceDate),
      checkInTime: dto.checkInTime ? new Date(dto.checkInTime) : undefined,
      checkOutTime: dto.checkOutTime ? new Date(dto.checkOutTime) : undefined,
      classId: dto.classId,
      sectionId: dto.sectionId,
      subjectId: dto.subjectId,
      teacherId: dto.teacherId,
      periodNumber: dto.periodNumber,
      eventId: dto.eventId,
      eventName: dto.eventName,
      location: dto.location,
      attendanceMethod: dto.attendanceMethod || AttendanceMethod.MANUAL,
      markedBy,
      markedByName,
      markedByRole,
      lateMinutes: dto.lateMinutes || 0,
      absenceReason: dto.absenceReason,
      excuseType: dto.excuseType,
      excuseDocumentUrl: dto.excuseDocumentUrl,
      notes: dto.notes,
      internalNotes: dto.internalNotes,
      latitude: dto.latitude,
      longitude: dto.longitude,
      academicYear: this.getCurrentAcademicYear(),
      gradeLevel: student.currentGrade,
      section: student.currentSection,
      ...patternData,
    });

    const savedAttendance = await this.attendanceRepository.save(attendance);

    this.logger.log(
      `Marked attendance for student ${student.fullName}: ${dto.status} on ${dto.attendanceDate}`
    );

    return savedAttendance;
  }

  /**
   * Mark attendance for multiple students (bulk operation)
   */
  async bulkMarkAttendance(
    dto: BulkMarkAttendanceDto,
    markedBy: string,
    markedByName: string,
    markedByRole: string,
  ): Promise<Attendance[]> {
    const attendanceRecords: Attendance[] = [];
    const errors: string[] = [];

    for (const item of dto.attendanceData) {
      try {
        const attendanceDto: MarkAttendanceDto = {
          studentId: item.studentId,
          status: item.status,
          attendanceType: dto.attendanceType,
          attendanceDate: dto.attendanceDate,
          checkInTime: dto.checkInTime,
          checkOutTime: dto.checkOutTime,
          classId: dto.classId,
          sectionId: dto.sectionId,
          subjectId: dto.subjectId,
          teacherId: dto.teacherId,
          periodNumber: dto.periodNumber,
          eventId: dto.eventId,
          eventName: dto.eventName,
          location: dto.location,
          attendanceMethod: dto.attendanceMethod,
          lateMinutes: item.lateMinutes,
          absenceReason: item.absenceReason,
          excuseType: item.excuseType,
          notes: item.notes,
          internalNotes: dto.internalNotes,
        };

        const attendance = await this.markAttendance(attendanceDto, markedBy, markedByName, markedByRole);
        attendanceRecords.push(attendance);
      } catch (error) {
        errors.push(`Student ${item.studentId}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      this.logger.warn(`Bulk attendance marking completed with ${errors.length} errors:`, errors);
    }

    this.logger.log(`Bulk marked attendance for ${attendanceRecords.length} students on ${dto.attendanceDate}`);

    return attendanceRecords;
  }

  /**
   * Update attendance record
   */
  async updateAttendance(
    attendanceId: string,
    dto: Partial<MarkAttendanceDto>,
  ): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${attendanceId} not found`);
    }

    // Update fields
    if (dto.status) attendance.status = dto.status;
    if (dto.checkInTime) attendance.checkInTime = new Date(dto.checkInTime);
    if (dto.checkOutTime) attendance.checkOutTime = new Date(dto.checkOutTime);
    if (dto.lateMinutes !== undefined) attendance.lateMinutes = dto.lateMinutes;
    if (dto.absenceReason !== undefined) attendance.absenceReason = dto.absenceReason;
    if (dto.excuseType !== undefined) attendance.excuseType = dto.excuseType;
    if (dto.excuseDocumentUrl !== undefined) attendance.excuseDocumentUrl = dto.excuseDocumentUrl;
    if (dto.notes !== undefined) attendance.notes = dto.notes;
    if (dto.internalNotes !== undefined) attendance.internalNotes = dto.internalNotes;

    // Recalculate pattern data if status changed
    if (dto.status && dto.status !== attendance.status) {
      const patternData = await this.calculateAttendancePattern(attendance.studentId, attendance.attendanceDate);
      Object.assign(attendance, patternData);
    }

    const updatedAttendance = await this.attendanceRepository.save(attendance);

    this.logger.log(`Updated attendance record ${attendanceId}`);
    return updatedAttendance;
  }

  /**
   * Get attendance record by ID
   */
  async getAttendanceById(attendanceId: string): Promise<Attendance> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id: attendanceId },
      relations: ['student'],
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${attendanceId} not found`);
    }

    return attendance;
  }

  /**
   * Get attendance records for a student
   */
  async getStudentAttendance(
    studentId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
      attendanceType?: AttendanceType;
      limit?: number;
      offset?: number;
    },
  ): Promise<Attendance[]> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .where('attendance.studentId = :studentId', { studentId })
      .orderBy('attendance.attendanceDate', 'DESC')
      .addOrderBy('attendance.createdAt', 'DESC');

    if (options?.startDate) {
      queryBuilder.andWhere('attendance.attendanceDate >= :startDate', {
        startDate: options.startDate,
      });
    }

    if (options?.endDate) {
      queryBuilder.andWhere('attendance.attendanceDate <= :endDate', {
        endDate: options.endDate,
      });
    }

    if (options?.attendanceType) {
      queryBuilder.andWhere('attendance.attendanceType = :attendanceType', {
        attendanceType: options.attendanceType,
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
   * Get class attendance for a specific date
   */
  async getClassAttendance(
    classId: string,
    attendanceDate: Date,
    options?: {
      sectionId?: string;
      periodNumber?: number;
    },
  ): Promise<Attendance[]> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .leftJoinAndSelect('attendance.student', 'student')
      .where('attendance.classId = :classId', { classId })
      .andWhere('attendance.attendanceDate = :attendanceDate', { attendanceDate })
      .orderBy('student.lastName', 'ASC')
      .addOrderBy('student.firstName', 'ASC');

    if (options?.sectionId) {
      queryBuilder.andWhere('attendance.sectionId = :sectionId', {
        sectionId: options.sectionId,
      });
    }

    if (options?.periodNumber) {
      queryBuilder.andWhere('attendance.periodNumber = :periodNumber', {
        periodNumber: options.periodNumber,
      });
    }

    return queryBuilder.getMany();
  }

  /**
   * Calculate attendance pattern data for a student
   */
  private async calculateAttendancePattern(
    studentId: string,
    attendanceDate: Date,
  ): Promise<{
    consecutiveAbsences: number;
    totalAbsencesThisMonth: number;
    totalAbsencesThisYear: number;
    isFirstAbsence: boolean;
  }> {
    const startOfMonth = new Date(attendanceDate.getFullYear(), attendanceDate.getMonth(), 1);
    const startOfYear = new Date(attendanceDate.getFullYear(), 0, 1);

    // Get absences in current month
    const monthlyAbsences = await this.attendanceRepository.count({
      where: {
        studentId,
        attendanceDate: Between(startOfMonth, attendanceDate),
        status: AttendanceStatus.ABSENT,
      },
    });

    // Get absences in current year
    const yearlyAbsences = await this.attendanceRepository.count({
      where: {
        studentId,
        attendanceDate: Between(startOfYear, attendanceDate),
        status: AttendanceStatus.ABSENT,
      },
    });

    // Calculate consecutive absences
    const recentAttendance = await this.attendanceRepository.find({
      where: { studentId },
      order: { attendanceDate: 'DESC' },
      take: 30, // Check last 30 days
    });

    let consecutiveAbsences = 0;
    for (const record of recentAttendance) {
      if (record.status === AttendanceStatus.ABSENT) {
        consecutiveAbsences++;
      } else {
        break;
      }
    }

    return {
      consecutiveAbsences,
      totalAbsencesThisMonth: monthlyAbsences,
      totalAbsencesThisYear: yearlyAbsences,
      isFirstAbsence: yearlyAbsences === 0,
    };
  }

  /**
   * Get current academic year
   */
  private getCurrentAcademicYear(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript months are 0-indexed

    // Assuming academic year starts in August
    if (month >= 8) {
      return `${year}-${year + 1}`;
    } else {
      return `${year - 1}-${year}`;
    }
  }

  /**
   * Get attendance statistics for a date range
   */
  async getAttendanceStatistics(options: {
    classId?: string;
    sectionId?: string;
    startDate: Date;
    endDate: Date;
    attendanceType?: AttendanceType;
  }): Promise<{
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    excusedCount: number;
    attendancePercentage: number;
    averageLateMinutes: number;
    commonAbsenceReason?: string;
  }> {
    const queryBuilder = this.attendanceRepository
      .createQueryBuilder('attendance')
      .where('attendance.attendanceDate BETWEEN :startDate AND :endDate', {
        startDate: options.startDate,
        endDate: options.endDate,
      });

    if (options.classId) {
      queryBuilder.andWhere('attendance.classId = :classId', { classId: options.classId });
    }

    if (options.sectionId) {
      queryBuilder.andWhere('attendance.sectionId = :sectionId', { sectionId: options.sectionId });
    }

    if (options.attendanceType) {
      queryBuilder.andWhere('attendance.attendanceType = :attendanceType', {
        attendanceType: options.attendanceType,
      });
    }

    const records = await queryBuilder.getMany();

    const totalRecords = records.length;
    const presentCount = records.filter(r => r.isPresent).length;
    const absentCount = records.filter(r => r.isAbsent).length;
    const lateCount = records.filter(r => r.isLate).length;
    const excusedCount = records.filter(r => r.status === AttendanceStatus.EXCUSED).length;

    const attendancePercentage = totalRecords > 0 ? (presentCount / totalRecords) * 100 : 0;

    const lateRecords = records.filter(r => r.lateMinutes > 0);
    const averageLateMinutes = lateRecords.length > 0
      ? lateRecords.reduce((sum, r) => sum + r.lateMinutes, 0) / lateRecords.length
      : 0;

    // Find most common absence reason
    const absenceReasons = records
      .filter(r => r.absenceReason)
      .map(r => r.absenceReason);

    const reasonCounts = {};
    absenceReasons.forEach(reason => {
      reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
    });

    const commonAbsenceReason = Object.keys(reasonCounts).length > 0
      ? Object.keys(reasonCounts).reduce((a, b) =>
          reasonCounts[a] > reasonCounts[b] ? a : b
        )
      : undefined;

    return {
      totalRecords,
      presentCount,
      absentCount,
      lateCount,
      excusedCount,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      averageLateMinutes: Math.round(averageLateMinutes * 100) / 100,
      commonAbsenceReason,
    };
  }

  /**
   * Get student attendance summary
   */
  async getStudentAttendanceSummary(
    studentId: string,
    options: {
      startDate: Date;
      endDate: Date;
      attendanceType?: AttendanceType;
    },
  ): Promise<{
    studentId: string;
    studentName: string;
    gradeLevel: string;
    section: string;
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    excusedDays: number;
    attendancePercentage: number;
    totalLateMinutes: number;
    consecutiveAbsences: number;
    absencesThisMonth: number;
    absencesThisYear: number;
  }> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      select: ['id', 'firstName', 'lastName', 'currentGrade', 'currentSection'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const records = await this.getStudentAttendance(studentId, options);

    const totalDays = records.length;
    const presentDays = records.filter(r => r.isPresent).length;
    const absentDays = records.filter(r => r.isAbsent).length;
    const lateDays = records.filter(r => r.isLate).length;
    const excusedDays = records.filter(r => r.status === AttendanceStatus.EXCUSED).length;

    const attendancePercentage = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;
    const totalLateMinutes = records.reduce((sum, r) => sum + r.lateMinutes, 0);

    // Get current pattern data
    const patternData = await this.calculateAttendancePattern(studentId, new Date());

    return {
      studentId,
      studentName: student.fullName,
      gradeLevel: student.currentGrade,
      section: student.currentSection,
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      totalLateMinutes,
      consecutiveAbsences: patternData.consecutiveAbsences,
      absencesThisMonth: patternData.totalAbsencesThisMonth,
      absencesThisYear: patternData.totalAbsencesThisYear,
    };
  }

  /**
   * Delete attendance record
   */
  async deleteAttendance(attendanceId: string): Promise<void> {
    const attendance = await this.attendanceRepository.findOne({
      where: { id: attendanceId },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance record with ID ${attendanceId} not found`);
    }

    await this.attendanceRepository.remove(attendance);
    this.logger.log(`Deleted attendance record ${attendanceId}`);
  }

  /**
   * Bulk update attendance records
   */
  async bulkUpdateAttendance(dto: BulkUpdateAttendanceDto): Promise<Attendance[]> {
    const attendanceRecords: Attendance[] = [];

    for (const studentId of dto.studentIds) {
      const attendance = await this.attendanceRepository.findOne({
        where: {
          studentId,
          attendanceDate: new Date(dto.attendanceDate),
        },
      });

      if (attendance) {
        attendance.status = dto.status;
        if (dto.reason) {
          attendance.notes = dto.reason;
        }
        if (dto.internalNotes) {
          attendance.internalNotes = dto.internalNotes;
        }

        const updatedAttendance = await this.attendanceRepository.save(attendance);
        attendanceRecords.push(updatedAttendance);
      }
    }

    this.logger.log(`Bulk updated attendance for ${attendanceRecords.length} students`);
    return attendanceRecords;
  }
}