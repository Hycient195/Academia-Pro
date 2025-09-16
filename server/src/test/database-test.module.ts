import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

@Global()
@Module({})
export class DatabaseTestModule {
  static async forRoot() {
    const container = await new PostgreSqlContainer()
      .withDatabase('test_db')
      .withUsername('test_user')
      .withPassword('test_password')
      .start();

    return {
      module: DatabaseTestModule,
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: container.getHost(),
          port: container.getPort(),
          username: container.getUsername(),
          password: container.getPassword(),
          database: container.getDatabase(),
          entities: [__dirname + '/../**/*.entity{.ts,.js}'],
          synchronize: true, // Use synchronize for tests
          dropSchema: true,  // Clean database between tests
          logging: false,    // Disable logging for tests
        }),
      ],
      providers: [
        {
          provide: 'TEST_CONTAINER',
          useValue: container,
        },
      ],
      exports: [TypeOrmModule],
    };
  }
}