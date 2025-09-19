import { DataSource } from 'typeorm';
import { School, SchoolStatus, SubscriptionPlan } from '../schools/school.entity';
import { Student, StudentStatus, EnrollmentType, BloodGroup } from '../students/student.entity';
import { TStudentStage } from '@academia-pro/types/student/student.types';
import { User } from '../users/user.entity';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';
import { TSchoolType } from '@academia-pro/types/schools';

export class TestSeeder {
  constructor(private dataSource: DataSource) {}

  async seed() {
    const schoolRepository = this.dataSource.getRepository(School);
    const studentRepository = this.dataSource.getRepository(Student);

    // Create a test school
    const school = await schoolRepository.save({
      code: 'TEST_SCH_001',
      name: 'Test Academy',
      description: 'A test school for integration testing',
      type: [TSchoolType.SECONDARY],
      status: SchoolStatus.ACTIVE,
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Test Country',
      phone: '+1234567890',
      email: 'info@testacademy.com',
      website: 'https://testacademy.com',
      principalName: 'Dr. Test Principal',
      principalPhone: '+1234567891',
      principalEmail: 'principal@testacademy.com',
      openingTime: '08:00:00',
      closingTime: '17:00:00',
      timezone: 'UTC',
      currency: 'NGN',
      language: 'en',
      maxStudents: 1000,
      currentStudents: 0,
      maxStaff: 100,
      currentStaff: 0,
      subscriptionPlan: SubscriptionPlan.STANDARD,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      isActiveSubscription: true,
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      createdBy: 'test-user-id',
    });

    // Create test students
    const students = await Promise.all([
      studentRepository.save({
        firstName: 'John',
        lastName: 'Doe',
        middleName: 'Michael',
        dateOfBirth: new Date('2005-05-15'),
        gender: 'male',
        bloodGroup: BloodGroup.O_POSITIVE,
        email: 'john.doe@testacademy.com',
        phone: '+1234567892',
        address: {
          street: '456 Student Ave',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country',
        },
        admissionNumber: 'ADM001',
        currentGrade: 'Grade 10',
        currentSection: 'A',
        stage: TStudentStage.SSS,
        gradeCode: 'G10',
        streamSection: 'Science A',
        admissionDate: new Date('2020-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        isBoarding: false,
        schoolId: school.id,
        status: StudentStatus.ACTIVE,
        parentInfo: {
          fatherFirstName: 'Robert',
          fatherLastName: 'Doe',
          fatherPhone: '+1234567893',
          fatherEmail: 'robert.doe@email.com',
          fatherOccupation: 'Engineer',
          motherFirstName: 'Jane',
          motherLastName: 'Doe',
          motherPhone: '+1234567894',
          motherEmail: 'jane.doe@email.com',
          motherOccupation: 'Teacher',
        },
        medicalInfo: {
          allergies: ['Peanuts'],
          emergencyContact: {
            firstName: 'Robert',
            lastName: 'Doe',
            phone: '+1234567893',
            relation: 'Father',
          },
        },
        gpa: 3.8,
        totalCredits: 120,
        academicStanding: {
          honors: true,
        },
        financialInfo: {
          feeCategory: 'Regular',
          outstandingBalance: 0,
        },
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            sms: true,
            push: false,
            parentCommunication: true,
          },
          extracurricular: ['Basketball', 'Science Club'],
        },
        createdBy: 'test-user-id',
        updatedBy: 'test-user-id',
      }),
      studentRepository.save({
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('2006-03-22'),
        gender: 'female',
        bloodGroup: BloodGroup.A_POSITIVE,
        email: 'jane.smith@testacademy.com',
        phone: '+1234567895',
        address: {
          street: '789 Student Blvd',
          city: 'Test City',
          state: 'Test State',
          postalCode: '12345',
          country: 'Test Country',
        },
        admissionNumber: 'ADM002',
        currentGrade: 'Grade 9',
        currentSection: 'B',
        stage: TStudentStage.SSS,
        gradeCode: 'G9',
        streamSection: 'Arts B',
        admissionDate: new Date('2021-09-01'),
        enrollmentType: EnrollmentType.REGULAR,
        isBoarding: true,
        schoolId: school.id,
        status: StudentStatus.ACTIVE,
        parentInfo: {
          fatherFirstName: 'Michael',
          fatherLastName: 'Smith',
          fatherPhone: '+1234567896',
          fatherOccupation: 'Doctor',
          motherFirstName: 'Sarah',
          motherLastName: 'Smith',
          motherPhone: '+1234567897',
          motherOccupation: 'Nurse',
        },
        gpa: 3.9,
        totalCredits: 90,
        academicStanding: {
          honors: true,
        },
        transportation: {
          required: true,
          routeId: 'route-001',
          pickupTime: '07:30',
          dropTime: '15:30',
        },
        hostel: {
          required: true,
          hostelId: 'hostel-001',
          roomNumber: '101',
          bedNumber: 'A1',
        },
        financialInfo: {
          feeCategory: 'Boarding',
          outstandingBalance: 500,
        },
        preferences: {
          language: 'en',
          notifications: {
            email: true,
            sms: false,
            push: true,
            parentCommunication: true,
          },
          extracurricular: ['Drama Club', 'Debate Team'],
        },
        createdBy: 'test-user-id',
        updatedBy: 'test-user-id',
      }),
    ]);

    // Update school student count
    await schoolRepository.update(school.id, {
      currentStudents: students.length,
    });

    return { school, students };
  }

  async clear() {
    // Clear in reverse order of dependencies
    await this.dataSource.getRepository(Student).clear();
    await this.dataSource.getRepository(School).clear();
  }

  async createAdditionalStudents(schoolId: string, count: number = 5) {
    const studentRepository = this.dataSource.getRepository(Student);
    const students = [];

    for (let i = 0; i < count; i++) {
      const student = await studentRepository.save({
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
        stage: TStudentStage.SSS,
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
      });
      students.push(student);
    }

    return students;
  }

  async seedSchoolWithStudents(gradeCode: string, count: number): Promise<any[]> {
    const school = await this.seedSchool();
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

  async seedSchoolWithStudentsInSections(gradeCode: string, sections: string[], countPerSection: number): Promise<any[]> {
    const school = await this.seedSchool();
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

  private async seedSchool() {
    const schoolRepository = this.dataSource.getRepository(School);
    const existingSchool = await schoolRepository.findOne({
      where: { code: 'TEST_SCH_001' }
    });

    if (existingSchool) {
      return existingSchool;
    }

    const school = await schoolRepository.save({
      code: 'TEST_SCH_001',
      name: 'Test Academy',
      description: 'A test school for integration testing',
      type: [TSchoolType.SECONDARY],
      status: SchoolStatus.ACTIVE,
      address: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      zipCode: '12345',
      country: 'Test Country',
      phone: '+1234567890',
      email: 'info@testacademy.com',
      website: 'https://testacademy.com',
      principalName: 'Dr. Test Principal',
      principalPhone: '+1234567891',
      principalEmail: 'principal@testacademy.com',
      openingTime: '08:00:00',
      closingTime: '17:00:00',
      timezone: 'UTC',
      currency: 'NGN',
      language: 'en',
      maxStudents: 1000,
      currentStudents: 0,
      maxStaff: 100,
      currentStaff: 0,
      subscriptionPlan: SubscriptionPlan.STANDARD,
      subscriptionStartDate: new Date(),
      subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      isActiveSubscription: true,
      primaryColor: '#007bff',
      secondaryColor: '#6c757d',
      createdBy: 'test-user-id',
    });

    return school;
  }

  private async seedStudent(schoolId: string, overrides: any = {}) {
    const studentRepository = this.dataSource.getRepository(Student);

    const baseStudent = {
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

    const student = await studentRepository.save(baseStudent);
    return student;
  }

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

    return TStudentStage.EY; // Default fallback
  }

  async seedSchoolAdmin(schoolId: string): Promise<User> {
    const userRepository = this.dataSource.getRepository(User);
    const hashedPassword = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // bcrypt hash for 'testpassword'

    const adminUser = userRepository.create({
      email: 'schooladmin@test.com',
      firstName: 'School',
      lastName: 'Admin',
      passwordHash: hashedPassword,
      roles: [EUserRole.SCHOOL_ADMIN],
      schoolId,
      status: EUserStatus.ACTIVE,
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return await userRepository.save(adminUser);
  }
}