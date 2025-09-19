import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import * as pg from 'pg';

@Global()
@Module({})
export class DatabaseTestModule {
  private static container: StartedPostgreSqlContainer | null = null;

  static async forRoot() {
    if (!this.container) {
      // console.log('Starting PostgreSQL container for DatabaseTestModule...');
      // Enable Testcontainers reuse when TESTCONTAINERS_REUSE=true to speed up local runs
      const builder = new PostgreSqlContainer()
        .withDatabase('school_test')
        .withUsername('testuser')
        .withPassword('testpass');

      // Use withReuse() if available in the installed @testcontainers version
      const anyBuilder: any = builder as any;
      if (process.env.TESTCONTAINERS_REUSE === 'true' && typeof anyBuilder.withReuse === 'function') {
        anyBuilder.withReuse();
      }

      this.container = await builder.start();

      const mappedPort = this.container.getMappedPort(5432);
      // console.log('PostgreSQL container started successfully on port', mappedPort);

      // Set environment variable for database.config.ts to use
      process.env.TEST_DB_PORT = mappedPort.toString();
    }

    return {
      module: DatabaseTestModule,
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: this.container.getHost(),
          port: this.container.getMappedPort(5432),
          username: this.container.getUsername(),
          password: this.container.getPassword(),
          database: this.container.getDatabase(),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true, // Use synchronize for tests
          dropSchema: true,  // Clean database between tests
          logging: false,    // Disable logging for tests
          cache: false,      // Disable cache for tests
          driver: pg,        // Explicitly set the PostgreSQL driver
          extra: {
            connectionTimeoutMillis: 5000,
            query_timeout: 5000,
            statement_timeout: 5000,
          },
        }),
      ],
      providers: [
        {
          provide: 'TEST_CONTAINER',
          useValue: this.container,
        },
      ],
      exports: [TypeOrmModule],
    };
  }

  static async shutdown() {
    if (this.container) {
      console.log('Stopping PostgreSQL container...');
      await this.container.stop();
      this.container = null;
    }
  }
}