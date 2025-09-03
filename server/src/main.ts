import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

const logger = new Logger('Main');

async function bootstrap() {
  try {
    logger.log('Starting Academia Pro Backend Application...');

    // Validate required environment variables
    const requiredEnvVars = ['NODE_ENV'];
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
      logger.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
      logger.error('Please set the following environment variables:');
      missingEnvVars.forEach(envVar => logger.error(`  - ${envVar}`));
      process.exit(1);
    }

    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

    if (isNaN(port) || port < 1 || port > 65535) {
      logger.error(`❌ Invalid port number: ${process.env.PORT}. Port must be between 1 and 65535.`);
      logger.error('Please set PORT environment variable to a valid port number (1-65535).');
      process.exit(1);
    }

    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`Port: ${port}`);

    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Enable global validation pipes
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }));

    // Enable CORS
    app.enableCors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    });

    // Enable cookie parsing
    app.use(cookieParser());

    // Set global prefix for API routes
    app.setGlobalPrefix('api/v1');

    await app.listen(port);

    logger.log(`🚀 Academia Pro Backend Application is running on: http://localhost:${port}`);
    logger.log(`📚 API Documentation available at: http://localhost:${port}/api`);

    // Log application startup information
    logger.log(`📊 Application started successfully at ${new Date().toISOString()}`);
    logger.log(`🔧 Node.js version: ${process.version}`);
    logger.log(`🏠 Platform: ${process.platform} ${process.arch}`);
    logger.log(`💾 Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      logger.log('Received SIGINT signal. Starting graceful shutdown...');
      await app.close();
      logger.log('Application closed successfully');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.log('Received SIGTERM signal. Starting graceful shutdown...');
      await app.close();
      logger.log('Application closed successfully');
      process.exit(0);
    });

  } catch (error) {
    logger.error('❌ Failed to start Academia Pro Backend Application', error);

    if (error instanceof Error) {
      logger.error(`Error message: ${error.message}`);

      // Log additional context for common errors
      if (error.message.includes('EADDRINUSE')) {
        logger.error('Port is already in use. Please try a different port or stop the process using the current port.');
      } else if (error.message.includes('ECONNREFUSED')) {
        logger.error('Database connection failed. Please check your database configuration.');
      } else if (error.message.includes('ENOTFOUND')) {
        logger.error('Network connection error. Please check your internet connection.');
      }

      logger.error(`Error stack: ${error.stack}`);
    } else {
      logger.error('Unknown error occurred:', error);
    }

    logger.error('Application startup failed. Exiting...');
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle warnings
process.on('warning', (warning) => {
  logger.warn('Warning:', warning.message);
});

bootstrap();
