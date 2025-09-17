// test/utils/test-seeder.service.ts
//
// Test seeder service for seeding test users in the database.
// This service creates realistic test users with proper structure matching the User entity.
//
// Users created:
// - superadmin@example.com: Super Admin with full system access
// - schooladmin@example.com: School Admin with school-level management access
// - teacher@example.com: Teacher with teaching-related permissions
// - student@example.com: Student with student-specific access
// - parent@example.com: Parent with parent portal access
//
// All users have password: 'Test1234$' (hashed)
// All users are email verified and active by default
// School-affiliated users have a placeholder schoolId that should be updated for actual tests

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

// Local enums for test seeder (to avoid import issues in test environment)
enum EUserRole {
  SUPER_ADMIN = 'super-admin',
  DELEGATED_SUPER_ADMIN = 'delegated-super-admin',
  SCHOOL_ADMIN = 'school-admin',
  STAFF = 'staff',
  STUDENT = 'student',
  PARENT = 'parent',
}

enum EUserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  DELETED = 'deleted',
}

enum SchoolStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  UNDER_MAINTENANCE = 'under_maintenance',
  CLOSED = 'closed',
}

enum SubscriptionPlan {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

enum EDepartmentType {
  ADMINISTRATION = 'administration',
  TEACHING = 'teaching',
  MEDICAL = 'medical',
  COUNSELING = 'counseling',
  BOARDING = 'boarding',
  TRANSPORTATION = 'transportation',
  CATERING = 'catering',
  FACILITIES = 'facilities',
  SECURITY = 'security',
  FINANCE = 'finance',
  HR = 'hr',
  IT = 'it',
  LIBRARY = 'library',
  SPORTS = 'sports',
  ARTS = 'arts',
  EXAMINATIONS = 'examinations',
}

enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
  TRANSFERRED = 'transferred',
  WITHDRAWN = 'withdrawn',
  SUSPENDED = 'suspended',
}

enum EnrollmentType {
  REGULAR = 'regular',
  SPECIAL_NEEDS = 'special_needs',
  GIFTED = 'gifted',
  INTERNATIONAL = 'international',
  TRANSFER = 'transfer',
}

enum BloodGroup {
  A_POSITIVE = 'A+',
  A_NEGATIVE = 'A-',
  B_POSITIVE = 'B+',
  B_NEGATIVE = 'B-',
  AB_POSITIVE = 'AB+',
  AB_NEGATIVE = 'AB-',
  O_POSITIVE = 'O+',
  O_NEGATIVE = 'O-',
}

@Injectable()
export class TestSeederService {
  constructor(private dataSource: DataSource) {}

  async clear() {
    // ⚠️ order matters because of FK constraints
    await this.dataSource.query('TRUNCATE TABLE students RESTART IDENTITY CASCADE');
    await this.dataSource.query('TRUNCATE TABLE departments RESTART IDENTITY CASCADE');
    await this.dataSource.query('TRUNCATE TABLE schools RESTART IDENTITY CASCADE');
    await this.dataSource.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  }

  async seedAll() {
    const users = await this.seedUsers();
    const schools = await this.seedSchools();
    const departments = await this.seedDepartments(schools[0].id);
    const students = await this.seedStudents(schools[0].id);

    return { users, schools, departments, students };
  }

  // Legacy seeding method for backward compatibility
  async seed() {
    const schools = await this.seedSchools();
    const school = schools[0];
    const students = await this.seedStudents(school.id);

    // Update school student count
    await this.dataSource.query(
      'UPDATE schools SET current_students = $1 WHERE id = $2',
      [students.length, school.id]
    );

    return { school, students };
  }

  // Create additional students for bulk testing
  async createAdditionalStudents(schoolId: string, count: number = 5) {
    const students = [];

    for (let i = 0; i < count; i++) {
      const student = {
        id: randomUUID(),
        firstName: `Test${i + 1}`,
        lastName: `Student${i + 1}`,
        dateOfBirth: new Date(2005 - i, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        gender: Math.random() > 0.5 ? 'male' : 'female',
        email: `test${i + 1}.student@testacademy.com`,
        phone: `+1234567${890 + i}`,
        address: {
          street: `${100 + i} Test St`,
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country',
        },
        admissionNumber: `ADM${String(i + 3).padStart(3, '0')}`,
        currentGrade: `Grade ${10 - Math.floor(i / 2)}`,
        currentSection: String.fromCharCode(65 + (i % 3)), // A, B, C
        stage: 'secondary',
        gradeCode: `G${10 - Math.floor(i / 2)}`,
        streamSection: `Stream ${String.fromCharCode(65 + (i % 3))}`,
        admissionDate: new Date(2020 - Math.floor(i / 2), 8, 1),
        enrollmentType: EnrollmentType.REGULAR,
        isBoarding: Math.random() > 0.7,
        schoolId,
        status: StudentStatus.ACTIVE,
        gpa: Math.round((3.0 + Math.random() * 1.0) * 100) / 100,
        financialInfo: {
          feeCategory: 'Regular',
          outstandingBalance: Math.floor(Math.random() * 1000),
        },
        createdBy: 'test-user-id',
        updatedBy: 'test-user-id',
      };

      await this.dataSource.query(
        `INSERT INTO students (
          id, first_name, last_name, date_of_birth, gender, email, phone, address,
          admission_number, current_grade, current_section, stage, grade_code, stream_section,
          admission_date, enrollment_type, is_boarding, school_id, status, gpa, financial_info,
          created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        )
        ON CONFLICT (admission_number) DO NOTHING`,
        [
          student.id,
          student.firstName,
          student.lastName,
          student.dateOfBirth,
          student.gender,
          student.email,
          student.phone,
          JSON.stringify(student.address),
          student.admissionNumber,
          student.currentGrade,
          student.currentSection,
          student.stage,
          student.gradeCode,
          student.streamSection,
          student.admissionDate,
          student.enrollmentType,
          student.isBoarding,
          student.schoolId,
          student.status,
          student.gpa,
          JSON.stringify(student.financialInfo),
          student.createdBy,
          student.updatedBy,
        ],
      );

      students.push(student);
    }

    return students;
  }

  // Seed school with students in specific grade
  async seedSchoolWithStudents(gradeCode: string, count: number) {
    const schools = await this.seedSchools();
    const school = schools[0];
    const students = [];

    for (let i = 0; i < count; i++) {
      const student = await this.seedStudent(school.id, {
        gradeCode,
        streamSection: 'A',
        stage: this.getStageFromGradeCode(gradeCode),
      });
      students.push(student);
    }

    return students;
  }

  // Seed school with students in multiple sections
  async seedSchoolWithStudentsInSections(gradeCode: string, sections: string[], countPerSection: number) {
    const schools = await this.seedSchools();
    const school = schools[0];
    const students = [];

    for (const section of sections) {
      for (let i = 0; i < countPerSection; i++) {
        const student = await this.seedStudent(school.id, {
          gradeCode,
          streamSection: section,
          stage: this.getStageFromGradeCode(gradeCode),
        });
        students.push(student);
      }
    }

    return students;
  }

  // Create a school admin user
  async seedSchoolAdmin(schoolId: string) {
    const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // bcrypt hash for 'testpassword'

    const adminUser = {
      id: randomUUID(),
      email: 'schooladmin@test.com',
      firstName: 'School',
      lastName: 'Admin',
      passwordHash: hashedPassword,
      roles: [EUserRole.SCHOOL_ADMIN],
      status: EUserStatus.ACTIVE,
      isEmailVerified: true,
      schoolId,
      preferences: {
        language: 'en',
        timezone: 'UTC',
        theme: 'light',
        notifications: {
          email: true,
          sms: false,
          push: true,
          marketing: false,
          system: true,
        },
        privacy: {
          profileVisibility: 'school-only',
          contactVisibility: 'school-only',
          dataSharing: true,
        },
      },
    };

    await this.dataSource.query(
      `INSERT INTO users (
        id, email, first_name, last_name, password_hash, roles, status,
        is_email_verified, school_id, preferences
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (email) DO NOTHING`,
      [
        adminUser.id,
        adminUser.email,
        adminUser.firstName,
        adminUser.lastName,
        adminUser.passwordHash,
        adminUser.roles,
        adminUser.status,
        adminUser.isEmailVerified,
        adminUser.schoolId,
        JSON.stringify(adminUser.preferences),
      ],
    );

    return adminUser;
  }

  // Private helper method to seed individual student
  private async seedStudent(schoolId: string, overrides: any = {}) {
    const student = {
      id: randomUUID(),
      firstName: `Test${Math.floor(Math.random() * 1000)}`,
      lastName: `Student${Math.floor(Math.random() * 1000)}`,
      dateOfBirth: new Date(2005, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
      gender: Math.random() > 0.5 ? 'male' : 'female',
      email: `test${Math.floor(Math.random() * 1000)}.student@testacademy.com`,
      phone: `+1234567${Math.floor(Math.random() * 1000)}`,
      address: {
        street: `${Math.floor(Math.random() * 1000)} Test St`,
        city: 'Test City',
        state: 'Test State',
        postalCode: '12345',
        country: 'Test Country',
      },
      admissionNumber: `ADM${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      admissionDate: new Date(2020, 8, 1),
      enrollmentType: EnrollmentType.REGULAR,
      isBoarding: false,
      schoolId,
      status: StudentStatus.ACTIVE,
      createdBy: 'test-user-id',
      updatedBy: 'test-user-id',
      ...overrides,
    };

    await this.dataSource.query(
      `INSERT INTO students (
        id, first_name, last_name, date_of_birth, gender, email, phone, address,
        admission_number, admission_date, enrollment_type, is_boarding, school_id, status,
        created_by, updated_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
      ON CONFLICT (admission_number) DO NOTHING`,
      [
        student.id,
        student.firstName,
        student.lastName,
        student.dateOfBirth,
        student.gender,
        student.email,
        student.phone,
        JSON.stringify(student.address),
        student.admissionNumber,
        student.admissionDate,
        student.enrollmentType,
        student.isBoarding,
        student.schoolId,
        student.status,
        student.createdBy,
        student.updatedBy,
      ],
    );

    return student;
  }

  // Helper method to determine stage from grade code
  private getStageFromGradeCode(gradeCode: string): string {
    const gradeCodeUpper = gradeCode.toUpperCase();

    if (gradeCodeUpper.startsWith('CRECHE') || gradeCodeUpper.startsWith('N') || gradeCodeUpper.startsWith('KG')) {
      return 'early_years';
    } else if (gradeCodeUpper.startsWith('PRY')) {
      return 'primary';
    } else if (gradeCodeUpper.startsWith('JSS')) {
      return 'junior_secondary';
    } else if (gradeCodeUpper.startsWith('SSS')) {
      return 'secondary';
    }

    return 'secondary'; // Default fallback
  }

  async seedUsers() {
    const hash = await bcrypt.hash('Test1234$', 10);
    const users = [
      {
        id: randomUUID(),
        email: 'superadmin@example.com',
        passwordHash: hash,
        firstName: 'Super',
        lastName: 'Admin',
        roles: [EUserRole.SUPER_ADMIN],
        status: EUserStatus.ACTIVE,
        isEmailVerified: true,
        isFirstLogin: false,
        preferences: {
          language: 'en',
          timezone: 'UTC',
          theme: 'light' as const,
          notifications: {
            email: true,
            sms: false,
            push: true,
            marketing: false,
            system: true,
          },
          privacy: {
            profileVisibility: 'private' as const,
            contactVisibility: 'private' as const,
            dataSharing: false,
          },
        },
      },
      {
        id: randomUUID(),
        email: 'schooladmin@example.com',
        passwordHash: hash,
        firstName: 'School',
        lastName: 'Admin',
        roles: [EUserRole.SCHOOL_ADMIN],
        status: EUserStatus.ACTIVE,
        isEmailVerified: true,
        isFirstLogin: false,
        schoolId: 'test-school-id', // This would need to be set to an actual school ID
        preferences: {
          language: 'en',
          timezone: 'UTC',
          theme: 'light' as const,
          notifications: {
            email: true,
            sms: false,
            push: true,
            marketing: false,
            system: true,
          },
          privacy: {
            profileVisibility: 'school-only' as const,
            contactVisibility: 'school-only' as const,
            dataSharing: true,
          },
        },
      },
      {
        id: randomUUID(),
        email: 'teacher@example.com',
        passwordHash: hash,
        firstName: 'John',
        lastName: 'Teacher',
        roles: [EUserRole.STAFF],
        status: EUserStatus.ACTIVE,
        isEmailVerified: true,
        isFirstLogin: false,
        schoolId: 'test-school-id', // This would need to be set to an actual school ID
        preferences: {
          language: 'en',
          timezone: 'UTC',
          theme: 'light' as const,
          notifications: {
            email: true,
            sms: false,
            push: true,
            marketing: false,
            system: true,
          },
          privacy: {
            profileVisibility: 'school-only' as const,
            contactVisibility: 'school-only' as const,
            dataSharing: true,
          },
        },
      },
      {
        id: randomUUID(),
        email: 'student@example.com',
        passwordHash: hash,
        firstName: 'Jane',
        lastName: 'Student',
        roles: [EUserRole.STUDENT],
        status: EUserStatus.ACTIVE,
        isEmailVerified: true,
        isFirstLogin: false,
        schoolId: 'test-school-id', // This would need to be set to an actual school ID
        dateOfBirth: new Date('2005-05-15'),
        gender: 'female' as const,
        preferences: {
          language: 'en',
          timezone: 'UTC',
          theme: 'light' as const,
          notifications: {
            email: true,
            sms: false,
            push: true,
            marketing: false,
            system: true,
          },
          privacy: {
            profileVisibility: 'school-only' as const,
            contactVisibility: 'private' as const,
            dataSharing: false,
          },
        },
      },
      {
        id: randomUUID(),
        email: 'parent@example.com',
        passwordHash: hash,
        firstName: 'Bob',
        lastName: 'Parent',
        roles: [EUserRole.PARENT],
        status: EUserStatus.ACTIVE,
        isEmailVerified: true,
        isFirstLogin: false,
        schoolId: 'test-school-id', // This would need to be set to an actual school ID
        preferences: {
          language: 'en',
          timezone: 'UTC',
          theme: 'light' as const,
          notifications: {
            email: true,
            sms: false,
            push: true,
            marketing: false,
            system: true,
          },
          privacy: {
            profileVisibility: 'private' as const,
            contactVisibility: 'private' as const,
            dataSharing: false,
          },
        },
      },
    ];

    for (const user of users) {
      await this.dataSource.query(
        `INSERT INTO users (
          email, password_hash, first_name, last_name, roles, status,
          is_email_verified, is_first_login, school_id, date_of_birth, gender, preferences
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (email) DO NOTHING`,
        [
          user.email,
          user.passwordHash,
          user.firstName,
          user.lastName,
          user.roles,
          user.status,
          user.isEmailVerified,
          user.isFirstLogin,
          user.schoolId || null,
          user.dateOfBirth || null,
          user.gender || null,
          JSON.stringify(user.preferences),
        ],
      );
    }

    return users;
  }

  async seedSchools() {
    const schools = [
      {
        id: randomUUID(),
        code: 'SCH001',
        name: 'Premium High School',
        description: 'A premier educational institution offering comprehensive secondary education',
        type: ['secondary'],
        status: SchoolStatus.ACTIVE,
        address: '123 Education Street',
        city: 'Academic City',
        state: 'Knowledge State',
        zipCode: '12345',
        country: 'Education Country',
        phone: '+1-555-0101',
        email: 'info@premiumhigh.edu',
        website: 'https://premiumhigh.edu',
        principalName: 'Dr. Sarah Johnson',
        principalPhone: '+1-555-0102',
        principalEmail: 'principal@premiumhigh.edu',
        openingTime: '08:00',
        closingTime: '17:00',
        timezone: 'America/New_York',
        currency: 'USD',
        language: 'en',
        maxStudents: 1200,
        currentStudents: 950,
        maxStaff: 80,
        currentStaff: 65,
        subscriptionPlan: SubscriptionPlan.PREMIUM,
        subscriptionStartDate: new Date('2024-01-01'),
        subscriptionEndDate: new Date('2025-12-31'),
        isActiveSubscription: true,
        logoUrl: 'https://premiumhigh.edu/logo.png',
        primaryColor: '#007bff',
        secondaryColor: '#6c757d',
        branding: {
          logo: 'https://premiumhigh.edu/logo.png',
          favicon: 'https://premiumhigh.edu/favicon.ico',
          theme: 'light',
          customCss: '',
        },
        settings: {
          features: ['attendance', 'grading', 'communication', 'reports'],
          modules: ['academic', 'administrative', 'financial'],
          integrations: ['google-classroom', 'zoom'],
          notifications: {
            email: true,
            sms: true,
            push: true,
          },
          security: {
            mfaRequired: false,
            passwordPolicy: {},
            sessionTimeout: 3600000,
          },
          academic: {
            gradingScale: 'A-F',
            academicYear: '2024-2025',
            terms: [],
          },
        },
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: randomUUID(),
        code: 'SCH002',
        name: 'City Junior Academy',
        description: 'A nurturing environment for young minds in their formative years',
        type: ['primary', 'junior_secondary'],
        status: SchoolStatus.ACTIVE,
        address: '456 Learning Avenue',
        city: 'Metropolitan City',
        state: 'Progress State',
        zipCode: '67890',
        country: 'Education Country',
        phone: '+1-555-0201',
        email: 'contact@cityjunior.edu',
        website: 'https://cityjunior.edu',
        principalName: 'Mr. Robert Chen',
        principalPhone: '+1-555-0202',
        principalEmail: 'principal@cityjunior.edu',
        openingTime: '08:30',
        closingTime: '16:30',
        timezone: 'America/New_York',
        currency: 'USD',
        language: 'en',
        maxStudents: 800,
        currentStudents: 620,
        maxStaff: 50,
        currentStaff: 42,
        subscriptionPlan: SubscriptionPlan.STANDARD,
        subscriptionStartDate: new Date('2024-02-01'),
        subscriptionEndDate: new Date('2025-01-31'),
        isActiveSubscription: true,
        logoUrl: 'https://cityjunior.edu/logo.png',
        primaryColor: '#28a745',
        secondaryColor: '#6c757d',
        branding: {
          logo: 'https://cityjunior.edu/logo.png',
          favicon: 'https://cityjunior.edu/favicon.ico',
          theme: 'light',
          customCss: '',
        },
        settings: {
          features: ['attendance', 'grading', 'communication'],
          modules: ['academic', 'administrative'],
          integrations: ['google-classroom'],
          notifications: {
            email: true,
            sms: false,
            push: true,
          },
          security: {
            mfaRequired: false,
            passwordPolicy: {},
            sessionTimeout: 3600000,
          },
          academic: {
            gradingScale: 'A-F',
            academicYear: '2024-2025',
            terms: [],
          },
        },
        createdBy: 'system',
        updatedBy: 'system',
      },
    ];

    for (const school of schools) {
      await this.dataSource.query(
        `INSERT INTO schools (
          id, code, name, description, type, status, address, city, state, zip_code, country,
          phone, email, website, principal_name, principal_phone, principal_email,
          opening_time, closing_time, timezone, currency, language, max_students, current_students,
          max_staff, current_staff, subscription_plan, subscription_start_date, subscription_end_date,
          is_active_subscription, logo_url, primary_color, secondary_color, branding, settings,
          created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37
        )
        ON CONFLICT (code) DO NOTHING`,
        [
          school.id,
          school.code,
          school.name,
          school.description,
          school.type,
          school.status,
          school.address,
          school.city,
          school.state,
          school.zipCode,
          school.country,
          school.phone,
          school.email,
          school.website,
          school.principalName,
          school.principalPhone,
          school.principalEmail,
          school.openingTime,
          school.closingTime,
          school.timezone,
          school.currency,
          school.language,
          school.maxStudents,
          school.currentStudents,
          school.maxStaff,
          school.currentStaff,
          school.subscriptionPlan,
          school.subscriptionStartDate,
          school.subscriptionEndDate,
          school.isActiveSubscription,
          school.logoUrl,
          school.primaryColor,
          school.secondaryColor,
          JSON.stringify(school.branding),
          JSON.stringify(school.settings),
          school.createdBy,
          school.updatedBy,
        ],
      );
    }

    return schools;
  }

  async seedDepartments(schoolId: string) {
    const departments = [
      {
        id: randomUUID(),
        type: EDepartmentType.TEACHING,
        name: 'Mathematics Department',
        description: 'Mathematics teaching and curriculum development',
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: randomUUID(),
        type: EDepartmentType.TEACHING,
        name: 'English Department',
        description: 'English language and literature teaching',
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: randomUUID(),
        type: EDepartmentType.TEACHING,
        name: 'Science Department',
        description: 'Physics, Chemistry, and Biology teaching',
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: randomUUID(),
        type: EDepartmentType.MEDICAL,
        name: 'School Clinic',
        description: 'Student health and medical services',
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: randomUUID(),
        type: EDepartmentType.ADMINISTRATION,
        name: 'School Administration',
        description: 'Overall school administration and management',
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: randomUUID(),
        type: EDepartmentType.COUNSELING,
        name: 'Student Counseling',
        description: 'Academic and personal counseling services',
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: randomUUID(),
        type: EDepartmentType.FACILITIES,
        name: 'Facilities Management',
        description: 'Building and grounds maintenance',
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: randomUUID(),
        type: EDepartmentType.IT,
        name: 'Information Technology',
        description: 'School IT infrastructure and support',
        createdBy: 'system',
        updatedBy: 'system',
      },
    ];

    for (const department of departments) {
      await this.dataSource.query(
        `INSERT INTO departments (id, type, name, description, created_by, updated_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (name) DO NOTHING`,
        [
          department.id,
          department.type,
          department.name,
          department.description,
          department.createdBy,
          department.updatedBy,
        ],
      );
    }

    return departments;
  }

  async seedStudents(schoolId: string) {
    const students = [
      {
        id: randomUUID(),
        firstName: 'Alice',
        lastName: 'Johnson',
        middleName: 'Marie',
        dateOfBirth: new Date('2008-03-15'),
        gender: 'female' as const,
        bloodGroup: BloodGroup.A_POSITIVE,
        email: 'alice.johnson@student.com',
        phone: '+1-555-1001',
        address: {
          street: '123 Maple Street',
          city: 'Springfield',
          state: 'IL',
          postalCode: '62701',
          country: 'USA',
          coordinates: {
            latitude: 39.7817,
            longitude: -89.6501,
          },
        },
        admissionNumber: 'STU2024001',
        currentGrade: 'Grade 10',
        currentSection: 'A',
        stage: 'secondary',
        gradeCode: '10',
        streamSection: 'Science Stream A',
        admissionDate: new Date('2020-08-15'),
        enrollmentType: EnrollmentType.REGULAR,
        isBoarding: false,
        promotionHistory: [],
        transferHistory: [],
        graduationYear: 2026,
        schoolId: schoolId,
        status: StudentStatus.ACTIVE,
        parentInfo: {
          fatherFirstName: 'John',
          fatherLastName: 'Johnson',
          fatherPhone: '+1-555-1002',
          fatherEmail: 'john.johnson@email.com',
          fatherOccupation: 'Engineer',
          motherFirstName: 'Sarah',
          motherLastName: 'Johnson',
          motherPhone: '+1-555-1003',
          motherEmail: 'sarah.johnson@email.com',
          motherOccupation: 'Teacher',
        },
        medicalInfo: {
          allergies: ['Peanuts'],
          medications: [],
          conditions: [],
          emergencyContact: {
            firstName: 'John',
            lastName: 'Johnson',
            phone: '+1-555-1002',
            email: 'john.johnson@email.com',
            relation: 'Father',
            occupation: 'Engineer',
          },
        },
        gpa: 3.8,
        totalCredits: 45,
        academicStanding: {
          honors: true,
          probation: false,
          academicWarning: false,
          disciplinaryStatus: 'Good',
        },
        transportation: {
          required: false,
        },
        hostel: {
          required: false,
        },
        financialInfo: {
          feeCategory: 'Standard',
          outstandingBalance: 0,
          paymentPlan: 'Monthly',
        },
        documents: [
          {
            type: 'birth_certificate',
            fileName: 'alice_birth_certificate.pdf',
            fileUrl: '/documents/alice_birth_certificate.pdf',
            uploadedAt: new Date(),
            verified: true,
          },
        ],
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            sms: false,
            push: true,
            parentCommunication: true,
          },
          extracurricular: ['Basketball', 'Debate Club'],
        },
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: randomUUID(),
        firstName: 'Bob',
        lastName: 'Smith',
        dateOfBirth: new Date('2007-07-22'),
        gender: 'male' as const,
        bloodGroup: BloodGroup.O_POSITIVE,
        email: 'bob.smith@student.com',
        phone: '+1-555-1004',
        address: {
          street: '456 Oak Avenue',
          city: 'Springfield',
          state: 'IL',
          postalCode: '62702',
          country: 'USA',
          coordinates: {
            latitude: 39.7817,
            longitude: -89.6501,
          },
        },
        admissionNumber: 'STU2024002',
        currentGrade: 'Grade 11',
        currentSection: 'B',
        stage: 'secondary',
        gradeCode: '11',
        streamSection: 'Arts Stream B',
        admissionDate: new Date('2019-08-15'),
        enrollmentType: EnrollmentType.REGULAR,
        isBoarding: false,
        promotionHistory: [
          {
            fromGrade: '10',
            toGrade: '11',
            academicYear: '2023-2024',
            performedBy: 'system',
            timestamp: new Date('2024-06-15'),
          },
        ],
        transferHistory: [],
        graduationYear: 2025,
        schoolId: schoolId,
        status: StudentStatus.ACTIVE,
        parentInfo: {
          fatherFirstName: 'Michael',
          fatherLastName: 'Smith',
          fatherPhone: '+1-555-1005',
          fatherEmail: 'michael.smith@email.com',
          fatherOccupation: 'Doctor',
          motherFirstName: 'Jennifer',
          motherLastName: 'Smith',
          motherPhone: '+1-555-1006',
          motherEmail: 'jennifer.smith@email.com',
          motherOccupation: 'Nurse',
        },
        medicalInfo: {
          allergies: [],
          medications: [],
          conditions: [],
          emergencyContact: {
            firstName: 'Michael',
            lastName: 'Smith',
            phone: '+1-555-1005',
            email: 'michael.smith@email.com',
            relation: 'Father',
            occupation: 'Doctor',
          },
        },
        gpa: 3.6,
        totalCredits: 52,
        academicStanding: {
          honors: false,
          probation: false,
          academicWarning: false,
          disciplinaryStatus: 'Good',
        },
        transportation: {
          required: true,
          routeId: 'route_001',
          stopId: 'stop_001',
          pickupTime: '07:30',
          dropTime: '15:30',
          distance: 5.2,
          fee: 50,
        },
        hostel: {
          required: false,
        },
        financialInfo: {
          feeCategory: 'Standard',
          outstandingBalance: 150,
          paymentPlan: 'Monthly',
          lastPaymentDate: new Date('2024-08-01'),
        },
        documents: [
          {
            type: 'transcript',
            fileName: 'bob_transcript.pdf',
            fileUrl: '/documents/bob_transcript.pdf',
            uploadedAt: new Date(),
            verified: true,
          },
        ],
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            sms: true,
            push: true,
            parentCommunication: true,
          },
          extracurricular: ['Football', 'Music Club'],
          careerInterests: ['Engineering', 'Technology'],
        },
        createdBy: 'system',
        updatedBy: 'system',
      },
      {
        id: randomUUID(),
        firstName: 'Carol',
        lastName: 'Williams',
        middleName: 'Anne',
        dateOfBirth: new Date('2009-01-10'),
        gender: 'female' as const,
        bloodGroup: BloodGroup.B_NEGATIVE,
        email: 'carol.williams@student.com',
        phone: '+1-555-1007',
        address: {
          street: '789 Pine Road',
          city: 'Springfield',
          state: 'IL',
          postalCode: '62703',
          country: 'USA',
        },
        admissionNumber: 'STU2024003',
        currentGrade: 'Grade 9',
        currentSection: 'A',
        stage: 'secondary',
        gradeCode: '9',
        streamSection: 'Commerce Stream A',
        admissionDate: new Date('2021-08-15'),
        enrollmentType: EnrollmentType.GIFTED,
        isBoarding: false,
        promotionHistory: [],
        transferHistory: [],
        graduationYear: 2027,
        schoolId: schoolId,
        status: StudentStatus.ACTIVE,
        parentInfo: {
          fatherFirstName: 'David',
          fatherLastName: 'Williams',
          fatherPhone: '+1-555-1008',
          fatherEmail: 'david.williams@email.com',
          fatherOccupation: 'Teacher',
          motherFirstName: 'Lisa',
          motherLastName: 'Williams',
          motherPhone: '+1-555-1009',
          motherEmail: 'lisa.williams@email.com',
          motherOccupation: 'Librarian',
        },
        medicalInfo: {
          allergies: ['Dust'],
          medications: ['Antihistamine'],
          conditions: ['Asthma'],
          doctorInfo: {
            firstName: 'Dr. Emily',
            lastName: 'Davis',
            phone: '+1-555-2001',
            clinic: 'Springfield Medical Center',
          },
        },
        gpa: 4.0,
        totalCredits: 28,
        academicStanding: {
          honors: true,
          probation: false,
          academicWarning: false,
          disciplinaryStatus: 'Excellent',
        },
        transportation: {
          required: false,
        },
        hostel: {
          required: false,
        },
        financialInfo: {
          feeCategory: 'Scholarship',
          scholarship: {
            type: 'Academic Excellence',
            amount: 2000,
            percentage: 50,
            validUntil: new Date('2027-06-30'),
          },
          outstandingBalance: 0,
          paymentPlan: 'Annual',
        },
        documents: [
          {
            type: 'photo',
            fileName: 'carol_photo.jpg',
            fileUrl: '/documents/carol_photo.jpg',
            uploadedAt: new Date(),
            verified: true,
          },
        ],
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            sms: false,
            push: true,
            parentCommunication: true,
          },
          extracurricular: ['Chess Club', 'Science Olympiad'],
          careerInterests: ['Medicine', 'Research'],
        },
        createdBy: 'system',
        updatedBy: 'system',
      },
    ];

    for (const student of students) {
      await this.dataSource.query(
        `INSERT INTO students (
          id, first_name, last_name, middle_name, date_of_birth, gender, blood_group,
          email, phone, address, admission_number, current_grade, current_section,
          stage, grade_code, stream_section, admission_date, enrollment_type, is_boarding,
          promotion_history, transfer_history, graduation_year, school_id, status,
          parent_info, medical_info, gpa, total_credits, academic_standing,
          transportation, hostel, financial_info, documents, preferences,
          created_by, updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19,
          $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36
        )
        ON CONFLICT (admission_number) DO NOTHING`,
        [
          student.id,
          student.firstName,
          student.lastName,
          student.middleName,
          student.dateOfBirth,
          student.gender,
          student.bloodGroup,
          student.email,
          student.phone,
          JSON.stringify(student.address),
          student.admissionNumber,
          student.currentGrade,
          student.currentSection,
          student.stage,
          student.gradeCode,
          student.streamSection,
          student.admissionDate,
          student.enrollmentType,
          student.isBoarding,
          JSON.stringify(student.promotionHistory),
          JSON.stringify(student.transferHistory),
          student.graduationYear,
          student.schoolId,
          student.status,
          JSON.stringify(student.parentInfo),
          JSON.stringify(student.medicalInfo),
          student.gpa,
          student.totalCredits,
          JSON.stringify(student.academicStanding),
          JSON.stringify(student.transportation),
          JSON.stringify(student.hostel),
          JSON.stringify(student.financialInfo),
          JSON.stringify(student.documents),
          JSON.stringify(student.preferences),
          student.createdBy,
          student.updatedBy,
        ],
      );
    }

    return students;
  }
}
