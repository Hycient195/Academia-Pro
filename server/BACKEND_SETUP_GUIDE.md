# 🚀 Academia Pro - Backend Setup Guide

## Overview
Complete setup guide for the Academia Pro NestJS backend with PostgreSQL, Redis, and comprehensive module scaffolding.

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 8.x or higher (or yarn/pnpm)
- **PostgreSQL**: 15.x or higher
- **Redis**: 7.x or higher
- **Docker**: 20.x or higher (optional but recommended)

### Development Tools
- **VS Code** with TypeScript extensions
- **Postman** or **Insomnia** for API testing
- **pgAdmin** or **DBeaver** for database management
- **Redis Commander** for Redis management

---

## 🐳 Quick Start with Docker (Recommended)

### 1. Start the Development Environment
```bash
# Clone or navigate to your project root
cd /path/to/academia-pro

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 2. Access Development Services
- **Backend API**: http://localhost:3000
- **PgAdmin**: http://localhost:5050 (admin@academia-pro.com / admin123)
- **Redis Commander**: http://localhost:8081
- **Frontend**: http://localhost:3001 (when ready)

### 3. Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes data)
docker-compose down -v
```

---

## 🛠️ Manual Setup (Alternative)

### 1. Install Dependencies
```bash
# Navigate to server directory
cd server

# Install NestJS CLI globally (if not already installed)
npm install -g @nestjs/cli

# Install project dependencies
npm install

# Install additional required packages
npm install @nestjs/typeorm typeorm pg @nestjs/config @nestjs/jwt @nestjs/passport bcryptjs class-validator class-transformer @nestjs/swagger passport passport-jwt passport-local @nestjs/throttler helmet compression @nestjs/cache-manager cache-manager-redis-store
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

**Required Environment Variables:**
```bash
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=academia_user
DB_PASSWORD=admin
DB_NAME=academia_pro

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (configure for production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 3. Database Setup
```bash
# Ensure PostgreSQL is running
sudo systemctl start postgresql

# Create database and user
sudo -u postgres psql
```

```sql
-- Run these commands in PostgreSQL
CREATE DATABASE academia_pro;
CREATE USER academia_user WITH PASSWORD 'academia_password';
GRANT ALL PRIVILEGES ON DATABASE academia_pro TO academia_user;
ALTER USER academia_user CREATEDB;
\q
```

### 4. Redis Setup
```bash
# Install Redis (Ubuntu/Debian)
sudo apt update
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server

# Verify Redis is running
redis-cli ping
```

---

## 📁 Project Structure Setup

### 1. Move Files to Correct Locations

Since I created files in the root directory due to permission issues, you need to move them to the correct locations:

```bash
# Move database configuration
mv database.config.ts server/src/

# Move main application module
mv app.module.ts server/src/

# Move common module
mv common.module.ts server/src/

# Move user entity
mv user.entity.ts server/src/users/
```

### 2. Create Required Directory Structure

```bash
# Create module directories
cd server/src

# Create common module structure
mkdir -p common/{guards,interceptors,filters,services,decorators}

# Create feature modules
mkdir -p {auth,users,schools,students,academic,attendance,communication}/{dto,entities}

# Create shared utilities
mkdir -p shared/{utils,interfaces,constants}
```

---

## 🔧 Core Configuration Files

### 1. Update main.ts
```typescript
// server/src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Academia Pro API')
      .setDescription('School Management System API')
      .setVersion('1.0')
      .addTag('academia-pro')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Compression
  // app.use(compression()); // Uncomment when compression package is installed

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Academia Pro API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
```

### 2. Create Common Guards

**Throttler Guard:**
```typescript
// server/src/common/guards/throttler.guard.ts
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class AcademiaThrottlerGuard extends ThrottlerGuard {
  protected getTracker(req: any): string {
    return req.user?.id || req.ip;
  }
}
```

**JWT Auth Guard:**
```typescript
// server/src/common/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

**Roles Guard:**
```typescript
// server/src/common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IUserPermissionRole } from '@academia-pro';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<IUserPermissionRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role?.includes(role));
  }
}
```

### 3. Create Common Interceptors

**Logging Interceptor:**
```typescript
// server/src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const delay = Date.now() - now;

        console.log(
          `${method} ${url} ${statusCode} - ${delay}ms ${user?.email || 'Anonymous'}`,
        );
      }),
    );
  }
}
```

**Timeout Interceptor:**
```typescript
// server/src/common/interceptors/timeout.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(30000), // 30 seconds
      catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException());
        }
        return throwError(() => err);
      }),
    );
  }
}
```

### 4. Create Common Filters

**All Exceptions Filter:**
```typescript
// server/src/common/filters/all-exceptions.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || message;
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    response.status(status).json(errorResponse);
  }
}
```

---

## 🔐 Authentication Setup

### 1. Create Auth Module

```bash
# Generate auth module
nest generate module auth
nest generate controller auth
nest generate service auth
```

### 2. Auth Service
```typescript
// server/src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../users/user.entity';
import { LoginCredentials, IAuthTokens } from '@academia-pro';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (user && await bcrypt.compare(password, user.passwordHash)) {
      const { passwordHash, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any): Promise<IAuthTokens> {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      schoolId: user.schoolId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
      expiresIn: 86400, // 24 hours
      tokenType: 'Bearer',
    };
  }

  async refreshToken(refreshToken: string): Promise<IAuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
```

### 3. JWT Strategy
```typescript
// server/src/auth/strategies/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      schoolId: payload.schoolId,
    };
  }
}
```

---

## 👥 User Management Setup

### 1. Create Users Module

```bash
# Generate users module
nest generate module users
nest generate controller users
nest generate service users
```

### 2. Users Service
```typescript
// server/src/users/users.service.ts
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.usersRepository.create({
      ...userData,
      email,
      passwordHash,
    });

    return this.usersRepository.save(user);
  }

  async findAll(options?: {
    page?: number;
    limit?: number;
    role?: string;
    schoolId?: string;
  }): Promise<{ users: User[]; total: number }> {
    const { page = 1, limit = 10, role, schoolId } = options || {};

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (schoolId) {
      queryBuilder.andWhere('user.schoolId = :schoolId', { schoolId });
    }

    queryBuilder
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return { users, total };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Update user
    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }
}
```

### 3. Users Controller
```typescript
// server/src/users/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('super-admin', 'school-admin')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('super-admin', 'school-admin')
  @ApiOperation({ summary: 'Get all users' })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('schoolId') schoolId?: string,
  ) {
    return this.usersService.findAll({ page, limit, role, schoolId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('super-admin', 'school-admin')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('super-admin')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
```

---

## 🧪 Testing the Setup

### 1. Start the Application
```bash
# In server directory
npm run start:dev
```

### 2. Test Health Endpoint
```bash
curl http://localhost:3000/api/health
```

### 3. Test API Documentation
Visit: http://localhost:3000/api/docs

### 4. Test Database Connection
```bash
# Check if tables are created
docker exec -it academia-pro-postgres psql -U academia_user -d academia_pro -c "\dt"
```

---

## 📊 Monitoring and Logging

### 1. Health Check Endpoint
```typescript
// server/src/app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
```

### 2. Logging Configuration
```typescript
// server/src/common/services/logger.service.ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class LoggerService extends Logger {
  logRequest(method: string, url: string, statusCode: number, duration: number) {
    this.log(`${method} ${url} ${statusCode} - ${duration}ms`, 'Request');
  }

  logError(error: Error, context?: string) {
    this.error(error.message, error.stack, context);
  }

  logDatabase(query: string, duration: number) {
    this.debug(`DB Query: ${query} - ${duration}ms`, 'Database');
  }
}
```

---

## 🚀 Next Steps

### 1. Complete Authentication Flow
- Implement password reset functionality
- Add email verification
- Set up refresh token rotation

### 2. Add Core Modules
- **Schools Module**: Multi-tenant school management
- **Students Module**: Student lifecycle management
- **Academic Module**: Curriculum and subjects
- **Attendance Module**: Daily attendance tracking

### 3. Database Migrations
```bash
# Generate migration
npm run typeorm:generate-migration -- --name=InitialSchema

# Run migrations
npm run typeorm:run-migrations
```

### 4. API Documentation
- Complete Swagger setup
- Add request/response examples
- Document authentication flows

### 5. Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🔧 Troubleshooting

### Common Issues

**1. Database Connection Issues**
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker exec -it academia-pro-postgres psql -U academia_user -d academia_pro
```

**2. Redis Connection Issues**
```bash
# Check Redis status
docker-compose ps redis

# Test Redis connection
docker exec -it academia-pro-redis redis-cli ping
```

**3. Port Conflicts**
```bash
# Check what's using ports
lsof -i :3000
lsof -i :5432
lsof -i :6379

# Change ports in docker-compose.yml if needed
```

**4. Permission Issues**
```bash
# Fix Docker permissions on Linux
sudo usermod -aG docker $USER
newgrp docker

# Or run with sudo
sudo docker-compose up -d
```

---

## 📚 Additional Resources

### Documentation
- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

### Development Tools
- [VS Code Extensions](https://marketplace.visualstudio.com/)
- [Postman Collections](https://learning.postman.com/)
- [pgAdmin Documentation](https://www.pgadmin.org/docs/)

### Best Practices
- [NestJS Best Practices](https://docs.nestjs.com/fundamentals/techniques)
- [API Design Guidelines](https://docs.microsoft.com/en-us/azure/architecture/best-practices/api-design)
- [Database Design Patterns](https://database-patterns.com/)

---

## 🎯 Success Checklist

- [ ] Docker environment running
- [ ] Database connected and initialized
- [ ] Redis cache working
- [ ] NestJS application starting
- [ ] API documentation accessible
- [ ] Authentication flow working
- [ ] User management functional
- [ ] Health checks passing
- [ ] Logging configured
- [ ] Basic error handling in place

**Congratulations! Your Academia Pro backend is now set up and ready for development! 🚀**