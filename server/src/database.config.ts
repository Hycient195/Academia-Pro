// Academia Pro - Database Configuration
// PostgreSQL database configuration with TypeORM

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as pg from 'pg';

const ensureDatabaseExists = async (configService: ConfigService): Promise<void> => {
  const dbName = configService.get<string>('DB_NAME', 'academia_pro');
  const dbHost = configService.get<string>('DB_HOST', 'localhost');
  const dbPort = configService.get<number>('DB_PORT', 5432);
  const dbUsername = configService.get<string>('DB_ADMIN_USERNAME', 'postgres');
  const dbPassword = configService.get<string>('DB_PASSWORD', 'admin');

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
    console.log('Connected to PostgreSQL server for database creation');

    try {
      // Try to create the database
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully`);
    } catch (createError: any) {
      // Check if error is "database already exists"
      if (createError.code === '23505' || createError.code === '42P04') { // unique_violation or duplicate_database
        console.log(`Database "${dbName}" already exists`);
      } else {
        throw createError;
      }
    }

  } catch (error) {
    console.error('Error ensuring database exists:', error);
    throw error;
  } finally {
    await client.end();
  }
};

export const getDatabaseConfig = async (configService: ConfigService): Promise<TypeOrmModuleOptions> => {
  const isTest = process.env.NODE_ENV === 'test' || !!process.env.TEST_DB_HOST;

  // Only ensure/create DB in non-test environments
  if (!isTest) {
    await ensureDatabaseExists(configService);
  }

  // Optimized config for e2e/integration tests (use PostgreSQL on dynamic port)
  if (isTest) {
    const testDbPort = process.env.TEST_DB_PORT ? parseInt(process.env.TEST_DB_PORT) : 5432;
    console.log('Using PostgreSQL database config for tests on port', testDbPort);

    return {
      type: 'postgres',
      host: 'localhost',
      port: testDbPort,
      username: 'testuser',
      password: 'testpass',
      database: 'school_test',
      synchronize: true,
      dropSchema: true,
      logging: ['error', 'warn'],
      autoLoadEntities: true,
      retryAttempts: 5,
      retryDelay: 1000,
      extra: {
        connectionTimeoutMillis: 10000,
        query_timeout: 10000,
        statement_timeout: 10000,
      },
    };
  }

  // Default app config
  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'academia_user'),
    password: configService.get('DB_PASSWORD', 'admin'),
    database: configService.get('DB_NAME', 'academia_pro'),
    entities: [
      'dist/users/**/*.entity{.ts,.js}',
      'dist/schools/**/*.entity{.ts,.js}',
      'dist/students/**/*.entity{.ts,.js}',
      'dist/academic/**/*.entity{.ts,.js}',
      'dist/attendance/**/*.entity{.ts,.js}',
      'dist/examination/**/*.entity{.ts,.js}',
      'dist/fee/**/*.entity{.ts,.js}',
      'dist/library/**/*.entity{.ts,.js}',
      'dist/hostel/**/*.entity{.ts,.js}',
      'dist/transportation/**/*.entity{.ts,.js}',
      'dist/inventory/**/*.entity{.ts,.js}',
      'dist/communication/**/*.entity{.ts,.js}',
      'dist/iam/**/*.entity{.ts,.js}',
      'dist/staff/**/*.entity{.ts,.js}',
      'dist/parent/**/*.entity{.ts,.js}',
      'dist/timetable/**/*.entity{.ts,.js}',
      'dist/online-learning/**/*.entity{.ts,.js}',
      'dist/reports/**/*.entity{.ts,.js}',
      'dist/student-portal/**/*.entity{.ts,.js}',
      // 'dist/parent-portal/**/*.entity{.ts,.js}', // Temporarily excluded due to circular dependency
      'dist/common/**/*.entity{.ts,.js}',
      'dist/auth/**/*.entity{.ts,.js}',
      'dist/security/**/*.entity{.ts,.js}',
    ],
    migrations: ['dist/migrations/*{.ts,.js}'],
    synchronize: configService.get('NODE_ENV') === 'development', // Enable synchronize in development
    logging: configService.get('NODE_ENV') === 'development',
    ssl: configService.get('NODE_ENV') === 'production',
    extra: {
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    },
    dropSchema: false,
    // cache: {
    //   type: 'redis',
    //   options: {
    //     host: configService.get('REDIS_HOST', 'localhost'),
    //     port: configService.get('REDIS_PORT', 6379),
    //   },
    //   duration: 300000, // 5 minutes
    // },
  };
};