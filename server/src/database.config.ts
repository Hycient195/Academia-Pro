// Academia Pro - Database Configuration
// PostgreSQL database configuration with TypeORM

import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'academia_user'),
  password: configService.get('DB_PASSWORD', 'admin'),
  database: configService.get('DB_NAME', 'academia_pro'),
  entities: [
    'src/users/**/*.entity{.ts,.js}',
    'src/schools/**/*.entity{.ts,.js}',
    'src/students/**/*.entity{.ts,.js}',
    'src/academic/**/*.entity{.ts,.js}',
    'src/attendance/**/*.entity{.ts,.js}',
    'src/examination/**/*.entity{.ts,.js}',
    'src/fee/**/*.entity{.ts,.js}',
    'src/library/**/*.entity{.ts,.js}',
    'src/hostel/**/*.entity{.ts,.js}',
    'src/transportation/**/*.entity{.ts,.js}',
    'src/inventory/**/*.entity{.ts,.js}',
    'src/communication/**/*.entity{.ts,.js}',
    'src/iam/**/*.entity{.ts,.js}',
    // 'src/parent-portal/**/*.entity{.ts,.js}', // Temporarily excluded due to circular dependency
    'src/common/**/*.entity{.ts,.js}',
    'src/auth/**/*.entity{.ts,.js}',
    'src/security/**/*.entity{.ts,.js}',
  ],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: true,
  logging: configService.get('NODE_ENV') === 'development',
  ssl: configService.get('NODE_ENV') === 'production',
  extra: {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  },
  dropSchema: false,
  cache: {
    type: 'redis',
    options: {
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get('REDIS_PORT', 6379),
    },
    duration: 300000, // 5 minutes
  },
});