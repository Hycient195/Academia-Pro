#!/usr/bin/env node

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { SeedCommand } from './seed.command';

async function bootstrap() {
  // Skip seeding in test environment
  if (process.env.NODE_ENV === 'test') {
    // console.log('Skipping seeding script in test environment');
    process.exit(0);
  }

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