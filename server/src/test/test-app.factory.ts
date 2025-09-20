// Unified E2E test bootstrap for NestJS application
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';

import { AppModule } from '../app.module';
import { RedisService } from '../redis/redis.service';
import { FakeRedisService } from './utils/redis.stub';
import { DatabaseTestModule } from './database-test.module';
import { AuditAggregationService } from '../super-admin/audit/audit-aggregation.service';
import { AuditGateway } from '../common/audit/audit.gateway';

export type TCreateTestAppOptions = {
  globalPrefix?: string;
  overrideRedis?: boolean;
  logger?: Parameters<typeof Test['createTestingModule']>[0] extends never ? never : any;
};

export async function createTestApp(opts: TCreateTestAppOptions = {}): Promise<{
  app: INestApplication;
  moduleRef: TestingModule;
}> {
  process.env.NODE_ENV = 'test';

  const {
    globalPrefix = 'api/v1',
    overrideRedis = true,
  } = opts;

  // Provide the test TypeORM connection via DatabaseTestModule
  const dbModule = await DatabaseTestModule.forRoot();

  let builder = Test.createTestingModule({
    imports: [AppModule, dbModule],
  });

  if (overrideRedis) {
    builder = builder.overrideProvider(RedisService).useClass(FakeRedisService);
  }

  // Override background/audit services for faster, deterministic tests
  builder = builder.overrideProvider(AuditAggregationService).useValue({
    onModuleInit: () => {},
    onModuleDestroy: () => {},
  });
  builder = builder.overrideProvider(AuditGateway).useValue({
    afterInit: () => {},
    handleConnection: () => {},
    handleDisconnect: () => {},
    broadcastAuditEvent: async () => {},
    broadcastMetricsUpdate: async () => {},
  });


  const moduleRef = await builder.compile();

  const app = moduleRef.createNestApplication({
    // mirror verbose logger to aid in test debugging
    logger: ['error', 'warn', 'log'],
  });

  // Mirror critical bits from main bootstrap that tests rely on
  app.use(cookieParser());
  app.setGlobalPrefix(globalPrefix);
  // Enable validation globally to ensure DTOs are enforced like production
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();

  return { app, moduleRef };
}