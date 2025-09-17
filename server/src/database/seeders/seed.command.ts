import { Injectable } from '@nestjs/common';
import { SuperAdminSeeder } from './super-admin.seeder';
import { DepartmentSeeder } from './department.seeder';

@Injectable()
export class SeedCommand {
  constructor(
    private readonly superAdminSeeder: SuperAdminSeeder,
    private readonly departmentSeeder: DepartmentSeeder,
  ) {}

  async run(): Promise<void> {
    console.log('Starting database seeding...');

    try {
      await this.superAdminSeeder.seed();
      await this.departmentSeeder.seed();
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Error during database seeding:', error);
      throw error;
    }
  }
}