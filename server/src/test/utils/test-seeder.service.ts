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
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';
import { User } from '../../users/user.entity';
import { School } from '../../schools/school.entity';
import { Student } from '../../students/student.entity';
import { Department } from '../../staff/entities/department.entity';
import { DelegatedSchoolAdmin, DelegatedSchoolAdminStatus } from '../../iam/entities/delegated-school-admin.entity';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';
import { TStudentStage } from '@academia-pro/types/student/student.types';
// Deterministic IDs for seeded users to keep JWTs valid across per-test truncations
const TEST_IDS = {
  AUTH_SYSTEM: '550e8400-e29b-41d4-a716-446655440000',
  SUPERADMIN: '11111111-1111-1111-8111-111111111111',
  SCHOOLADMIN: '22222222-2222-2222-8222-222222222222',
  TEACHER: '33333333-3333-3333-8333-333333333333',
  STUDENT: '44444444-4444-4444-8444-444444444444',
  PARENT: '55555555-5555-5555-8555-555555555555',
};

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
  private userRepository: Repository<User>;
  private schoolRepository: Repository<School>;
  private studentRepository: Repository<Student>;
  private departmentRepository: Repository<Department>;
  private delegatedSchoolAdminRepository: Repository<DelegatedSchoolAdmin>;

  constructor(private dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
    this.schoolRepository = this.dataSource.getRepository(School);
    this.studentRepository = this.dataSource.getRepository(Student);
    this.departmentRepository = this.dataSource.getRepository(Department);
    this.delegatedSchoolAdminRepository = this.dataSource.getRepository(DelegatedSchoolAdmin);
  }

  async clear() {
    // Truncate all public tables to guarantee full isolation between tests
    // Excludes migration/metadata tables if present
    const rows: Array<{ tablename: string }> = await this.dataSource.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
        AND tablename NOT IN ('migrations', 'typeorm_metadata')
    `);

    if (!rows || rows.length === 0) {
      return;
    }

    const tables = rows
      .map((r) => `"public"."${r.tablename}"`)
      .join(', ');

    // RESTART IDENTITY resets sequences; CASCADE handles FK relationships
    await this.dataSource.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
  }

  async seedAll() {
    const users = await this.seedUsers();
    const schools = await this.seedSchools();
    const departments = await this.seedDepartments(schools[0].id);
    const students = await this.seedStudents(schools[0].id);
    const delegatedSchoolAdmins = await this.seedDelegatedSchoolAdmins(schools[0].id);

    return { users, schools, departments, students, delegatedSchoolAdmins };
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
    // Ensure provided schoolId exists; fallback to first available school
    try {
      const exists = await this.dataSource.query('SELECT 1 FROM schools WHERE id = $1 LIMIT 1', [schoolId]);
      if (!exists || exists.length === 0) {
        const row = await this.dataSource.query('SELECT id FROM schools LIMIT 1');
        if (row && row.length > 0) {
          schoolId = row[0].id;
        }
      }
    } catch (e) {
      // If any error occurs, continue with the provided schoolId
    }

    const students = [];

    for (let i = 0; i < count; i++) {
      const gender = faker.person.sex();
      const firstName = faker.person.firstName(gender as 'female' | 'male');
      const lastName = faker.person.lastName();
      const gradeLevel = 10 - Math.floor(i / 2);
      const section = String.fromCharCode(65 + (i % 3)); // A, B, C

      const student = {
        id: randomUUID(),
        firstName,
        lastName,
        dateOfBirth: faker.date.birthdate({ min: 8, max: 18, mode: 'age' }),
        gender: gender.toLowerCase(),
        email: faker.internet.email({ firstName, lastName, provider: 'testacademy.com' }),
        phone: `+1-${faker.string.numeric(10)}`,
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state(),
          postalCode: faker.location.zipCode(),
          country: faker.location.country(),
        },
        admissionNumber: `ADM-${Date.now()}-${faker.string.numeric(6)}-${i}`,
        currentGrade: `Grade ${gradeLevel}`,
        currentSection: section,
        stage: 'SSS',
        gradeCode: `G${gradeLevel}`,
        streamSection: `Stream ${section}`,
        admissionDate: faker.date.past({ years: 4 }),
        enrollmentType: EnrollmentType.REGULAR,
        isBoarding: faker.datatype.boolean({ probability: 0.3 }),
        schoolId,
        status: StudentStatus.ACTIVE,
        gpa: faker.number.float({ min: 2.0, max: 4.0, fractionDigits: 2 }),
        financialInfo: {
          feeCategory: 'Regular',
          outstandingBalance: faker.number.int({ min: 0, max: 2000 }),
        },
        createdBy: '550e8400-e29b-41d4-a716-446655440000',
        updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      };

      await this.dataSource.query(
        `INSERT INTO students (
          id, "firstName", "lastName", "dateOfBirth", gender, email, phone, address,
          "admissionNumber", "currentGrade", "currentSection", stage, "gradeCode", "streamSection",
          "admissionDate", "enrollmentType", "isBoarding", "schoolId", status, gpa, "financialInfo",
          "createdBy", "updatedBy"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
        )
        ON CONFLICT ("admissionNumber") DO NOTHING`,
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
    const gender = faker.person.sex();
    const firstName = faker.person.firstName(gender as 'female' | 'male');
    const lastName = faker.person.lastName();

    const student = {
      id: randomUUID(),
      firstName,
      lastName,
      dateOfBirth: faker.date.birthdate({ min: 8, max: 18, mode: 'age' }),
      gender: gender.toLowerCase(),
      email: faker.internet.email({ firstName, lastName, provider: 'testacademy.com' }),
      phone: `+1-${faker.string.numeric(10)}`,
      address: {
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        state: faker.location.state(),
        postalCode: faker.location.zipCode(),
        country: faker.location.country(),
      },
      admissionNumber: `ADM${faker.string.numeric(3)}`,
      admissionDate: faker.date.past({ years: 4 }),
      enrollmentType: EnrollmentType.REGULAR,
      isBoarding: faker.datatype.boolean({ probability: 0.2 }),
      schoolId,
      status: StudentStatus.ACTIVE,
      createdBy: '550e8400-e29b-41d4-a716-446655440000',
      updatedBy: '550e8400-e29b-41d4-a716-446655440000',
      ...overrides,
    };

    await this.dataSource.query(
      `INSERT INTO students (
        id, "firstName", "lastName", "dateOfBirth", gender, email, phone, address,
        "admissionNumber", "admissionDate", "enrollmentType", "isBoarding", "schoolId", status,
        "createdBy", "updatedBy"
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
      ON CONFLICT ("admissionNumber") DO NOTHING`,
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
  private getStageFromGradeCode(gradeCode: string): TStudentStage {
    const gradeCodeUpper = gradeCode.toUpperCase();

    if (gradeCodeUpper.startsWith('CRECHE') || gradeCodeUpper.startsWith('N') || gradeCodeUpper.startsWith('KG')) {
      return TStudentStage.EY;
    } else if (gradeCodeUpper.startsWith('PRY')) {
      return TStudentStage.PRY;
    } else if (gradeCodeUpper.startsWith('JSS')) {
      return TStudentStage.JSS;
    } else if (gradeCodeUpper.startsWith('SSS')) {
      return TStudentStage.SSS;
    }

    return TStudentStage.SSS; // Default fallback
  }

  async seedUsers() {
    const hash = await bcrypt.hash('Test1234$', 10);
    const schools = await this.schoolRepository.find();
    const schoolId = schools.length > 0 ? schools[0].id : null;

    const users = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'auth-system@local',
        passwordHash: hash,
        firstName: 'Auth',
        lastName: 'System',
        roles: [EUserRole.SUPER_ADMIN],
        status: EUserStatus.ACTIVE,
        isEmailVerified: true,
        isFirstLogin: false,
        schoolId: null,
        preferences: {
          language: 'en',
          timezone: 'UTC',
          theme: 'light' as const,
          notifications: {
            email: false,
            sms: false,
            push: false,
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
        id: TEST_IDS.SUPERADMIN,
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
        id: TEST_IDS.SCHOOLADMIN,
        email: 'schooladmin@example.com',
        passwordHash: hash,
        firstName: 'School',
        lastName: 'Admin',
        roles: [EUserRole.SCHOOL_ADMIN],
        status: EUserStatus.ACTIVE,
        isEmailVerified: true,
        isFirstLogin: false,
        schoolId,
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
        id: TEST_IDS.TEACHER,
        email: 'teacher@example.com',
        passwordHash: hash,
        firstName: 'John',
        lastName: 'Teacher',
        roles: [EUserRole.STAFF],
        status: EUserStatus.ACTIVE,
        isEmailVerified: true,
        isFirstLogin: false,
        schoolId,
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
        id: TEST_IDS.STUDENT,
        email: 'student@example.com',
        passwordHash: hash,
        firstName: 'Jane',
        lastName: 'Student',
        roles: [EUserRole.STUDENT],
        status: EUserStatus.ACTIVE,
        isEmailVerified: true,
        isFirstLogin: false,
        schoolId,
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
        id: TEST_IDS.PARENT,
        email: 'parent@example.com',
        passwordHash: hash,
        firstName: 'Bob',
        lastName: 'Parent',
        roles: [EUserRole.PARENT],
        status: EUserStatus.ACTIVE,
        isEmailVerified: true,
        isFirstLogin: false,
        schoolId,
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
        id: '66666666-6666-6666-6666-666666666666',
        email: 'delegatedsuperadmin@example.com',
        passwordHash: hash,
        firstName: 'Delegated',
        lastName: 'Super Admin',
        roles: [EUserRole.DELEGATED_SUPER_ADMIN],
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
        id: '77777777-7777-7777-7777-777777777777',
        email: 'delegatedschoolsdmin@example.com',
        passwordHash: hash,
        firstName: 'Delegated',
        lastName: 'School Admin',
        roles: [EUserRole.DELEGATED_SCHOOL_ADMIN],
        status: EUserStatus.ACTIVE,
        isEmailVerified: true,
        isFirstLogin: false,
        schoolId,
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
      // Additional delegated super admin users for comprehensive testing
      {
        id: '66666666-6666-4666-8666-666666666667',
        email: 'delegatedsuperadmin-limited@example.com',
        passwordHash: hash,
        firstName: 'Delegated',
        lastName: 'Super Admin Limited',
        roles: [EUserRole.DELEGATED_SUPER_ADMIN],
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
        id: '66666666-6666-4666-8666-666666666668',
        email: 'delegatedsuperadmin-schools@example.com',
        passwordHash: hash,
        firstName: 'Delegated',
        lastName: 'Super Admin Schools',
        roles: [EUserRole.DELEGATED_SUPER_ADMIN],
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
        id: '66666666-6666-4666-8666-666666666669',
        email: 'delegatedsuperadmin-analytics@example.com',
        passwordHash: hash,
        firstName: 'Delegated',
        lastName: 'Super Admin Analytics',
        roles: [EUserRole.DELEGATED_SUPER_ADMIN],
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
        id: '66666666-6666-4666-8666-666666666670',
        email: 'wildcard@example.com',
        passwordHash: hash,
        firstName: 'Wildcard',
        lastName: 'Test User',
        roles: [EUserRole.DELEGATED_SUPER_ADMIN],
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
    ];

    const savedUsers = [];
    for (const userData of users) {
      const user = this.userRepository.create(userData);
      const savedUser = await this.userRepository.save(user);
      savedUsers.push(savedUser);
    }

    return savedUsers;
  }

  async seedSchools() {
    const schools = [
      {
        id: randomUUID(),
        code: 'SCH001',
        name: 'Premium High School',
        description: 'A premier educational institution offering comprehensive secondary education',
        type: ['secondary' as any],
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
          theme: 'light' as const,
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
        type: ['primary' as any, 'junior_secondary' as any],
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
          theme: 'light' as const,
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

    const savedSchools = [];
    for (const schoolData of schools) {
      const school = this.schoolRepository.create(schoolData);
      const savedSchool = await this.schoolRepository.save(school);
      savedSchools.push(savedSchool);
    }

    return savedSchools;
  }

  async seedDepartments(schoolId: string) {
    const systemUserId = randomUUID(); // Use a consistent UUID for system operations

    const departments = [
      {
        id: randomUUID(),
        type: EDepartmentType.TEACHING,
        name: 'Mathematics Department',
        description: 'Mathematics teaching and curriculum development',
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        id: randomUUID(),
        type: EDepartmentType.TEACHING,
        name: 'English Department',
        description: 'English language and literature teaching',
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        id: randomUUID(),
        type: EDepartmentType.TEACHING,
        name: 'Science Department',
        description: 'Physics, Chemistry, and Biology teaching',
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        id: randomUUID(),
        type: EDepartmentType.MEDICAL,
        name: 'School Clinic',
        description: 'Student health and medical services',
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        id: randomUUID(),
        type: EDepartmentType.ADMINISTRATION,
        name: 'School Administration',
        description: 'Overall school administration and management',
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        id: randomUUID(),
        type: EDepartmentType.COUNSELING,
        name: 'Student Counseling',
        description: 'Academic and personal counseling services',
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        id: randomUUID(),
        type: EDepartmentType.FACILITIES,
        name: 'Facilities Management',
        description: 'Building and grounds maintenance',
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        id: randomUUID(),
        type: EDepartmentType.IT,
        name: 'Information Technology',
        description: 'School IT infrastructure and support',
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
    ];

    const savedDepartments = [];
    for (const departmentData of departments) {
      const department = this.departmentRepository.create(departmentData);
      const savedDepartment = await this.departmentRepository.save(department);
      savedDepartments.push(savedDepartment);
    }

    return savedDepartments;
  }

  async seedStudents(schoolId: string) {
    const systemUserId = randomUUID(); // Use a consistent UUID for system operations

    const students = [
      {
        id: randomUUID(),
        firstName: faker.person.firstName('female'),
        lastName: faker.person.lastName(),
        middleName: faker.person.middleName('female'),
        dateOfBirth: faker.date.birthdate({ min: 14, max: 17, mode: 'age' }),
        gender: 'female' as const,
        bloodGroup: faker.helpers.arrayElement(Object.values(BloodGroup)),
        email: faker.internet.email(),
        phone: `+1-${faker.string.numeric(10)}`,
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          postalCode: faker.location.zipCode(),
          country: 'USA',
          coordinates: {
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
          },
        },
        admissionNumber: `STU${faker.date.recent({ days: 365 }).getFullYear()}001`,
        currentGrade: 'Grade 10',
        currentSection: 'A',
        stage: TStudentStage.SSS,
        gradeCode: '10',
        streamSection: 'Science Stream A',
        admissionDate: faker.date.past({ years: 4 }),
        enrollmentType: EnrollmentType.REGULAR,
        isBoarding: faker.datatype.boolean({ probability: 0.1 }),
        promotionHistory: [],
        transferHistory: [],
        graduationYear: faker.date.future({ years: 2 }).getFullYear(),
        schoolId: schoolId,
        status: StudentStatus.ACTIVE,
        parentInfo: {
          fatherFirstName: faker.person.firstName('male'),
          fatherLastName: faker.person.lastName(),
          fatherPhone: `+1-${faker.string.numeric(10)}`,
          fatherEmail: faker.internet.email(),
          fatherOccupation: faker.person.jobTitle(),
          motherFirstName: faker.person.firstName('female'),
          motherLastName: faker.person.lastName(),
          motherPhone: `+1-${faker.string.numeric(10)}`,
          motherEmail: faker.internet.email(),
          motherOccupation: faker.person.jobTitle(),
        },
        medicalInfo: {
          allergies: faker.helpers.arrayElements(['Peanuts', 'Dust', 'Shellfish', 'Pollen'], { min: 0, max: 2 }),
          medications: faker.helpers.arrayElements(['Antihistamine', 'Asthma Inhaler'], { min: 0, max: 1 }),
          conditions: faker.helpers.arrayElements(['Asthma', 'Allergies'], { min: 0, max: 1 }),
          emergencyContact: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            phone: `+1-${faker.string.numeric(10)}`,
            email: faker.internet.email(),
            relation: faker.helpers.arrayElement(['Father', 'Mother', 'Guardian']),
            occupation: faker.person.jobTitle(),
          },
        },
        gpa: faker.number.float({ min: 3.0, max: 4.0, fractionDigits: 1 }),
        totalCredits: faker.number.int({ min: 30, max: 60 }),
        academicStanding: {
          honors: faker.datatype.boolean({ probability: 0.3 }),
          probation: false,
          academicWarning: false,
          disciplinaryStatus: faker.helpers.arrayElement(['Excellent', 'Good', 'Satisfactory']),
        },
        transportation: {
          required: faker.datatype.boolean({ probability: 0.2 }),
        },
        hostel: {
          required: faker.datatype.boolean({ probability: 0.1 }),
        },
        financialInfo: {
          feeCategory: faker.helpers.arrayElement(['Standard', 'Premium', 'Scholarship']),
          outstandingBalance: faker.number.int({ min: 0, max: 1000 }),
          paymentPlan: faker.helpers.arrayElement(['Monthly', 'Quarterly', 'Annual']),
        },
        documents: [
          {
            type: 'birth_certificate',
            fileName: `${faker.person.firstName().toLowerCase()}_birth_certificate.pdf`,
            fileUrl: `/documents/${faker.person.firstName().toLowerCase()}_birth_certificate.pdf`,
            uploadedAt: faker.date.recent(),
            verified: faker.datatype.boolean({ probability: 0.9 }),
          },
        ],
        preferences: {
          language: 'en',
          notifications: {
            email: faker.datatype.boolean({ probability: 0.8 }),
            sms: faker.datatype.boolean({ probability: 0.3 }),
            push: faker.datatype.boolean({ probability: 0.6 }),
            parentCommunication: faker.datatype.boolean({ probability: 0.9 }),
          },
          extracurricular: faker.helpers.arrayElements(['Basketball', 'Debate Club', 'Chess', 'Music', 'Drama'], { min: 1, max: 3 }),
        },
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        id: randomUUID(),
        firstName: faker.person.firstName('male'),
        lastName: faker.person.lastName(),
        dateOfBirth: faker.date.birthdate({ min: 15, max: 18, mode: 'age' }),
        gender: 'male' as const,
        bloodGroup: faker.helpers.arrayElement(Object.values(BloodGroup)),
        email: faker.internet.email(),
        phone: `+1-${faker.string.numeric(10)}`,
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          postalCode: faker.location.zipCode(),
          country: 'USA',
          coordinates: {
            latitude: faker.location.latitude(),
            longitude: faker.location.longitude(),
          },
        },
        admissionNumber: `STU${faker.date.recent({ days: 365 }).getFullYear()}002`,
        currentGrade: 'Grade 11',
        currentSection: 'B',
        stage: TStudentStage.SSS,
        gradeCode: '11',
        streamSection: 'Arts Stream B',
        admissionDate: faker.date.past({ years: 5 }),
        enrollmentType: EnrollmentType.REGULAR,
        isBoarding: faker.datatype.boolean({ probability: 0.1 }),
        promotionHistory: [
          {
            fromGrade: '10' as any,
            toGrade: '11' as any,
            academicYear: '2023-2024',
            performedBy: systemUserId,
            timestamp: faker.date.recent({ days: 60 }),
          },
        ],
        transferHistory: [],
        graduationYear: faker.date.future({ years: 1 }).getFullYear(),
        schoolId: schoolId,
        status: StudentStatus.ACTIVE,
        parentInfo: {
          fatherFirstName: faker.person.firstName('male'),
          fatherLastName: faker.person.lastName(),
          fatherPhone: `+1-${faker.string.numeric(10)}`,
          fatherEmail: faker.internet.email(),
          fatherOccupation: faker.person.jobTitle(),
          motherFirstName: faker.person.firstName('female'),
          motherLastName: faker.person.lastName(),
          motherPhone: `+1-${faker.string.numeric(10)}`,
          motherEmail: faker.internet.email(),
          motherOccupation: faker.person.jobTitle(),
        },
        medicalInfo: {
          allergies: faker.helpers.arrayElements(['Peanuts', 'Dust', 'Shellfish'], { min: 0, max: 1 }),
          medications: faker.helpers.arrayElements(['Vitamin D'], { min: 0, max: 1 }),
          conditions: [],
          emergencyContact: {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            phone: `+1-${faker.string.numeric(10)}`,
            email: faker.internet.email(),
            relation: faker.helpers.arrayElement(['Father', 'Mother']),
            occupation: faker.person.jobTitle(),
          },
        },
        gpa: faker.number.float({ min: 3.0, max: 4.0, fractionDigits: 1 }),
        totalCredits: faker.number.int({ min: 40, max: 65 }),
        academicStanding: {
          honors: faker.datatype.boolean({ probability: 0.2 }),
          probation: false,
          academicWarning: false,
          disciplinaryStatus: faker.helpers.arrayElement(['Good', 'Excellent']),
        },
        transportation: {
          required: faker.datatype.boolean({ probability: 0.4 }),
          routeId: faker.datatype.boolean() ? `route_${faker.string.numeric(3)}` : undefined,
          stopId: faker.datatype.boolean() ? `stop_${faker.string.numeric(3)}` : undefined,
          pickupTime: faker.datatype.boolean() ? '07:30' : undefined,
          dropTime: faker.datatype.boolean() ? '15:30' : undefined,
          distance: faker.datatype.boolean() ? faker.number.float({ min: 2, max: 15, fractionDigits: 1 }) : undefined,
          fee: faker.datatype.boolean() ? faker.number.int({ min: 30, max: 100 }) : undefined,
        },
        hostel: {
          required: faker.datatype.boolean({ probability: 0.1 }),
        },
        financialInfo: {
          feeCategory: faker.helpers.arrayElement(['Standard', 'Premium']),
          outstandingBalance: faker.number.int({ min: 0, max: 500 }),
          paymentPlan: faker.helpers.arrayElement(['Monthly', 'Quarterly']),
          lastPaymentDate: faker.date.recent({ days: 30 }),
        },
        documents: [
          {
            type: 'transcript',
            fileName: `${faker.person.firstName().toLowerCase()}_transcript.pdf`,
            fileUrl: `/documents/${faker.person.firstName().toLowerCase()}_transcript.pdf`,
            uploadedAt: faker.date.recent(),
            verified: faker.datatype.boolean({ probability: 0.95 }),
          },
        ],
        preferences: {
          language: 'en',
          notifications: {
            email: faker.datatype.boolean({ probability: 0.9 }),
            sms: faker.datatype.boolean({ probability: 0.5 }),
            push: faker.datatype.boolean({ probability: 0.7 }),
            parentCommunication: faker.datatype.boolean({ probability: 0.95 }),
          },
          extracurricular: faker.helpers.arrayElements(['Football', 'Music Club', 'Drama', 'Art'], { min: 1, max: 2 }),
          careerInterests: faker.helpers.arrayElements(['Engineering', 'Technology', 'Medicine', 'Business'], { min: 1, max: 2 }),
        },
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        id: randomUUID(),
        firstName: faker.person.firstName('female'),
        lastName: faker.person.lastName(),
        middleName: faker.person.middleName('female'),
        dateOfBirth: faker.date.birthdate({ min: 13, max: 16, mode: 'age' }),
        gender: 'female' as const,
        bloodGroup: faker.helpers.arrayElement(Object.values(BloodGroup)),
        email: faker.internet.email(),
        phone: `+1-${faker.string.numeric(10)}`,
        address: {
          street: faker.location.streetAddress(),
          city: faker.location.city(),
          state: faker.location.state({ abbreviated: true }),
          postalCode: faker.location.zipCode(),
          country: 'USA',
        },
        admissionNumber: `STU${faker.date.recent({ days: 365 }).getFullYear()}003`,
        currentGrade: 'Grade 9',
        currentSection: 'A',
        stage: TStudentStage.JSS,
        gradeCode: '9',
        streamSection: 'Commerce Stream A',
        admissionDate: faker.date.past({ years: 3 }),
        enrollmentType: faker.helpers.arrayElement([EnrollmentType.REGULAR, EnrollmentType.GIFTED]),
        isBoarding: faker.datatype.boolean({ probability: 0.05 }),
        promotionHistory: [],
        transferHistory: [],
        graduationYear: faker.date.future({ years: 3 }).getFullYear(),
        schoolId: schoolId,
        status: StudentStatus.ACTIVE,
        parentInfo: {
          fatherFirstName: faker.person.firstName('male'),
          fatherLastName: faker.person.lastName(),
          fatherPhone: `+1-${faker.string.numeric(10)}`,
          fatherEmail: faker.internet.email(),
          fatherOccupation: faker.person.jobTitle(),
          motherFirstName: faker.person.firstName('female'),
          motherLastName: faker.person.lastName(),
          motherPhone: `+1-${faker.string.numeric(10)}`,
          motherEmail: faker.internet.email(),
          motherOccupation: faker.person.jobTitle(),
        },
        medicalInfo: {
          allergies: faker.helpers.arrayElements(['Dust', 'Pollen', 'Pet Dander'], { min: 0, max: 2 }),
          medications: faker.helpers.arrayElements(['Antihistamine', 'Inhaler'], { min: 0, max: 2 }),
          conditions: faker.helpers.arrayElements(['Asthma', 'Allergies'], { min: 0, max: 1 }),
          doctorInfo: faker.datatype.boolean({ probability: 0.3 }) ? {
            firstName: `Dr. ${faker.person.firstName()}`,
            lastName: faker.person.lastName(),
            phone: `+1-${faker.string.numeric(10)}`,
            clinic: faker.company.name() + ' Medical Center',
          } : undefined,
        },
        gpa: faker.number.float({ min: 3.5, max: 4.0, fractionDigits: 1 }),
        totalCredits: faker.number.int({ min: 20, max: 35 }),
        academicStanding: {
          honors: faker.datatype.boolean({ probability: 0.6 }),
          probation: false,
          academicWarning: false,
          disciplinaryStatus: faker.helpers.arrayElement(['Excellent', 'Outstanding']),
        },
        transportation: {
          required: faker.datatype.boolean({ probability: 0.1 }),
        },
        hostel: {
          required: faker.datatype.boolean({ probability: 0.05 }),
        },
        financialInfo: {
          feeCategory: faker.helpers.arrayElement(['Standard', 'Scholarship', 'Premium']),
          scholarship: faker.datatype.boolean({ probability: 0.2 }) ? {
            type: faker.helpers.arrayElement(['Academic Excellence', 'Sports', 'Arts']),
            amount: faker.number.int({ min: 1000, max: 5000 }),
            percentage: faker.number.int({ min: 25, max: 100 }),
            validUntil: faker.date.future({ years: 3 }),
          } : undefined,
          outstandingBalance: faker.number.int({ min: 0, max: 200 }),
          paymentPlan: faker.helpers.arrayElement(['Monthly', 'Annual']),
        },
        documents: [
          {
            type: 'photo',
            fileName: `${faker.person.firstName().toLowerCase()}_photo.jpg`,
            fileUrl: `/documents/${faker.person.firstName().toLowerCase()}_photo.jpg`,
            uploadedAt: faker.date.recent(),
            verified: faker.datatype.boolean({ probability: 0.9 }),
          },
        ],
        preferences: {
          language: 'en',
          notifications: {
            email: faker.datatype.boolean({ probability: 0.95 }),
            sms: faker.datatype.boolean({ probability: 0.2 }),
            push: faker.datatype.boolean({ probability: 0.8 }),
            parentCommunication: faker.datatype.boolean({ probability: 0.98 }),
          },
          extracurricular: faker.helpers.arrayElements(['Chess Club', 'Science Olympiad', 'Math Club', 'Debate'], { min: 1, max: 3 }),
          careerInterests: faker.helpers.arrayElements(['Medicine', 'Research', 'Engineering', 'Law'], { min: 1, max: 2 }),
        },
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
    ];

    const savedStudents = [];
    for (const studentData of students) {
      const student = this.studentRepository.create(studentData);
      const savedStudent = await this.studentRepository.save(student);
      savedStudents.push(savedStudent);
    }

    return savedStudents;
  }

  async seedDelegatedSchoolAdmins(schoolId: string) {
    const delegatedSchoolAdmins = [
      {
        id: randomUUID(),
        userId: '77777777-7777-7777-7777-777777777777', // delegated school admin user
        schoolId,
        email: 'delegatedschoolsdmin@example.com',
        permissions: ['students:read', 'students:create', 'students:update'], // Limited permissions for testing
        startDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        createdBy: TEST_IDS.SCHOOLADMIN,
        status: DelegatedSchoolAdminStatus.ACTIVE,
        notes: 'Test delegated school admin with limited permissions',
      },
    ];

    const savedDelegatedAdmins = [];
    for (const adminData of delegatedSchoolAdmins) {
      const admin = this.delegatedSchoolAdminRepository.create(adminData);
      const savedAdmin = await this.delegatedSchoolAdminRepository.save(admin);
      savedDelegatedAdmins.push(savedAdmin);
    }

    return savedDelegatedAdmins;
  }
}
