import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../staff/entities/department.entity';
import { EDepartmentType } from '@academia-pro/types/staff';

@Injectable()
export class DepartmentSeeder {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  async seed(): Promise<void> {
    // Skip seeding in test environment
    if (process.env.NODE_ENV === 'test') {
      // console.log('Skipping department seeding in test environment');
      return;
    }

    console.log('Seeding departments...');

    const departments = [
      {
        type: EDepartmentType.ADMINISTRATION,
        name: 'School Administration',
        description: 'Handles overall school administration and management',
      },
      {
        type: EDepartmentType.ADMINISTRATION,
        name: 'Academic Affairs',
        description: 'Manages academic policies and curriculum development',
      },
      {
        type: EDepartmentType.TEACHING,
        name: 'Mathematics Department',
        description: 'Mathematics teaching and curriculum',
      },
      {
        type: EDepartmentType.TEACHING,
        name: 'English Department',
        description: 'English language and literature teaching',
      },
      {
        type: EDepartmentType.TEACHING,
        name: 'Science Department',
        description: 'Physics, Chemistry, and Biology teaching',
      },
      {
        type: EDepartmentType.MEDICAL,
        name: 'School Clinic',
        description: 'Student health and medical services',
      },
      {
        type: EDepartmentType.COUNSELING,
        name: 'Student Counseling',
        description: 'Academic and personal counseling services',
      },
      {
        type: EDepartmentType.FACILITIES,
        name: 'Facilities Management',
        description: 'Building and grounds maintenance',
      },
      {
        type: EDepartmentType.IT,
        name: 'Information Technology',
        description: 'School IT infrastructure and support',
      },
      {
        type: EDepartmentType.FINANCE,
        name: 'Finance Department',
        description: 'School financial management and accounting',
      },
    ];

    for (const deptData of departments) {
      const existing = await this.departmentRepository.findOne({
        where: { type: deptData.type, name: deptData.name },
      });

      if (!existing) {
        const department = this.departmentRepository.create({
          ...deptData,
          createdBy: 'system',
          updatedBy: 'system',
        });

        await this.departmentRepository.save(department);
        console.log(`Created department: ${deptData.name}`);
      } else {
        console.log(`Department already exists: ${deptData.name}`);
      }
    }

    console.log('Department seeding completed.');
  }
}