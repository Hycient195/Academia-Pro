import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as pg from 'pg';

@Injectable()
export class DatabaseBootstrapService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseBootstrapService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.ensureDatabaseExists();
  }

  private async ensureDatabaseExists(): Promise<void> {
    const dbName = this.configService.get<string>('DB_NAME', 'academia_pro');
    const dbHost = this.configService.get<string>('DB_HOST', 'localhost');
    const dbPort = this.configService.get<number>('DB_PORT', 5432);
    const dbUsername = this.configService.get<string>('DB_USERNAME', 'postgres');
    const dbPassword = this.configService.get<string>('DB_PASSWORD', 'admin');

    // Connect to postgres database (not the application database)
    const client = new pg.Client({
      host: dbHost,
      port: dbPort,
      user: dbUsername,
      password: dbPassword,
      database: 'postgres', // Connect to default postgres database
    });

    try {
      await client.connect();
      this.logger.log('Connected to PostgreSQL server');

      // Check if database exists
      const result = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [dbName]
      );

      if (result.rows.length === 0) {
        this.logger.log(`Database "${dbName}" does not exist. Creating...`);

        // Create the database
        await client.query(`CREATE DATABASE "${dbName}"`);

        this.logger.log(`Database "${dbName}" created successfully`);
      } else {
        this.logger.log(`Database "${dbName}" already exists`);
      }

    } catch (error) {
      this.logger.error('Error ensuring database exists:', error);
      throw error;
    } finally {
      await client.end();
    }
  }
}