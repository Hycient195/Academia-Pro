#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeedCommand } from './seed.command';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const seedCommand = app.get(SeedCommand);
  await seedCommand.run();

  await app.close();
  process.exit(0);
}

bootstrap().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});