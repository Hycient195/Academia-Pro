import { Injectable } from '@nestjs/common';
import { SuperAdminSeeder } from './super-admin.seeder';

@Injectable()
export class SeedCommand {
  constructor(private readonly superAdminSeeder: SuperAdminSeeder) {}

  async run(): Promise<void> {
    console.log('Starting database seeding...');

    try {
      await this.superAdminSeeder.seed();
      console.log('Database seeding completed successfully!');
    } catch (error) {
      console.error('Error during database seeding:', error);
      throw error;
    }
  }
}