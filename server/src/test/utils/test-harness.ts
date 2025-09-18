// test/utils/test-harness.ts
// Centralized E2E test harness that:
// - Boots a single Nest app via createTestApp()
// - Uses DatabaseTestModule as the single source of truth for Postgres
// - Provides per-test isolation by truncating all tables in afterEach
// - Seeds a deterministic baseline dataset before each test

import { INestApplication } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import type { SuperAgentTest } from 'supertest';

import { createTestApp } from '../test-app.factory';
import { DatabaseTestModule } from '../database-test.module';
import { TestSeederService } from './test-seeder.service';
import { getAuthAgent } from './auth.helper';
import { testUsers } from './test-users';

export class TestHarness {
  private static app: INestApplication;
  private static moduleRef: TestingModule;
  private static dataSource: DataSource;
  private static seeder: TestSeederService;
  private static isBootstrapped = false;

  // Boot the unified test Nest app (global prefix, cookie parser, Redis stubbed)
  static async bootstrap() {
    if (this.isBootstrapped) {
      return this;
    }

    // Create the unified test Nest app
    const { app, moduleRef } = await createTestApp();
    this.app = app;
    this.moduleRef = moduleRef;

    // Resolve TypeORM DataSource from the compiled AppModule
    this.dataSource = this.moduleRef.get(DataSource, { strict: false });

    // Ensure database connection is ready
    await this.waitForDatabaseConnection();

    // Prepare test seeder
    this.seeder = new TestSeederService(this.dataSource);

    // Seed initial baseline so beforeAll logins work
    await this.seeder.clear();
    await this.seeder.seedAll();

    this.isBootstrapped = true;
    return this;
  }

  // Keep as a safety net in case the DataSource isn't ready yet
  private static async waitForDatabaseConnection(maxRetries = 10, delay = 1000): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (!this.dataSource.isInitialized) {
          await this.dataSource.initialize();
        }

        // Test the connection with a simple query
        await this.dataSource.query('SELECT 1');
        return;
      } catch (error: any) {
        // eslint-disable-next-line no-console
        console.log(`Database connection attempt ${attempt}/${maxRetries} failed:`, error?.message ?? error);
        if (attempt === maxRetries) {
          throw new Error(`Failed to connect to database after ${maxRetries} attempts: ${error?.message ?? error}`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  static getApp(): INestApplication {
    return this.app;
  }

  static getSeeder(): TestSeederService {
    return this.seeder;
  }

  static getDataSource(): DataSource {
    return this.dataSource;
  }

  static async auth(role: keyof typeof testUsers): Promise<SuperAgentTest> {
    return getAuthAgent(this.app, role);
  }

  // Before each test: reset DB and seed a fresh baseline
  static async startTransaction() {
    if (!this.seeder) {
      this.seeder = new TestSeederService(this.dataSource);
    }
    await this.seeder.clear();
    await this.seeder.seedAll();
  }

  // After each test: fully reset DB to guarantee isolation
  static async rollbackTransaction() {
    if (this.seeder) {
      await this.seeder.clear();
    }
  }

  static async shutdown() {
    if (this.app) {
      await this.app.close();
    }
    if (this.dataSource?.isInitialized) {
      await this.dataSource.destroy();
    }

    // Ensure DatabaseTestModule container is stopped deterministically
    await DatabaseTestModule.shutdown();

    this.isBootstrapped = false;
  }
}
