import { Controller, Post, Body, Get, UseGuards, Request, HttpCode, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService, LoginCredentials, AuthTokens, MfaSetup } from '../services/auth.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { MfaGuard } from '../guards/mfa.guard';

@ApiTags('Security - Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticate user with email and password. Returns tokens or MFA challenge.',
  })
  @ApiBody({
    description: 'Login credentials',
    schema: {
      type: 'object',
      required: ['email', 'password'],
      properties: {
        email: { type: 'string', format: 'email', example: 'user@school.com' },
        password: { type: 'string', example: 'password123' },
        rememberMe: { type: 'boolean', default: false },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        requiresMfa: { type: 'boolean' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            roles: { type: 'array', items: { type: 'string' } },
            schoolId: { type: 'string' },
          },
        },
        tokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'number' },
            tokenType: { type: 'string' },
          },
        },
        sessionId: { type: 'string' },
        mfaMethods: { type: 'array', items: { type: 'string' } },
        tempToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(
    @Body() credentials: LoginCredentials,
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`Login attempt for: ${credentials.email}`);

    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    return this.authService.login(credentials, ipAddress, userAgent);
  }

  @Post('mfa/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Verify MFA token',
    description: 'Verify multi-factor authentication token for login completion.',
  })
  @ApiBody({
    description: 'MFA verification data',
    schema: {
      type: 'object',
      required: ['userId', 'token', 'method', 'tempToken'],
      properties: {
        userId: { type: 'string', example: 'user-001' },
        token: { type: 'string', example: '123456' },
        method: { type: 'string', enum: ['totp', 'sms', 'email'], example: 'totp' },
        tempToken: { type: 'string', description: 'Temporary token from login response' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'MFA verification successful',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid MFA token',
  })
  async verifyMfa(
    @Body() data: { userId: string; token: string; method: string; tempToken: string },
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`MFA verification for user: ${data.userId}, method: ${data.method}`);

    return this.authService.verifyMfa(
      data.userId,
      data.token,
      data.method,
      data.tempToken,
    );
  }

  @Post('mfa/setup')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Setup MFA',
    description: 'Initialize multi-factor authentication setup for the current user.',
  })
  @ApiBody({
    description: 'MFA setup request',
    schema: {
      type: 'object',
      required: ['method'],
      properties: {
        method: { type: 'string', enum: ['totp', 'sms', 'email'], example: 'totp' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'MFA setup initiated',
    schema: {
      type: 'object',
      properties: {
        secret: { type: 'string' },
        otpauthUrl: { type: 'string' },
        qrCodeUrl: { type: 'string' },
      },
    },
  })
  async setupMfa(
    @Body() data: { method: string },
    @Request() req: any,
  ): Promise<MfaSetup> {
    this.logger.log(`MFA setup for user: ${req.user.userId}, method: ${data.method}`);

    return this.authService.setupMfa(req.user.userId, data.method);
  }

  @Post('mfa/enable')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Enable MFA',
    description: 'Complete MFA setup and enable multi-factor authentication.',
  })
  @ApiBody({
    description: 'MFA enable request',
    schema: {
      type: 'object',
      required: ['method', 'verificationToken'],
      properties: {
        method: { type: 'string', enum: ['totp', 'sms', 'email'], example: 'totp' },
        verificationToken: { type: 'string', example: '123456' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'MFA enabled successfully',
  })
  async enableMfa(
    @Body() data: { method: string; verificationToken: string },
    @Request() req: any,
  ): Promise<void> {
    this.logger.log(`Enabling MFA for user: ${req.user.userId}, method: ${data.method}`);

    await this.authService.enableMfa(
      req.user.userId,
      data.method,
      data.verificationToken,
    );
  }

  @Post('mfa/disable')
  @UseGuards(JwtAuthGuard, MfaGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Disable MFA',
    description: 'Disable multi-factor authentication for the current user.',
  })
  @ApiBody({
    description: 'MFA disable request',
    schema: {
      type: 'object',
      required: ['verificationToken'],
      properties: {
        verificationToken: { type: 'string', example: '123456' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'MFA disabled successfully',
  })
  async disableMfa(
    @Body() data: { verificationToken: string },
    @Request() req: any,
  ): Promise<void> {
    this.logger.log(`Disabling MFA for user: ${req.user.userId}`);

    await this.authService.disableMfa(req.user.userId, data.verificationToken);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generate new access token using refresh token.',
  })
  @ApiBody({
    description: 'Refresh token request',
    schema: {
      type: 'object',
      required: ['refreshToken'],
      properties: {
        refreshToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid refresh token',
  })
  async refreshToken(@Body() data: { refreshToken: string }): Promise<AuthTokens> {
    this.logger.log('Token refresh request');

    return this.authService.refreshToken(data.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidate user session and log out.',
  })
  @ApiBody({
    description: 'Logout request',
    schema: {
      type: 'object',
      required: ['sessionId'],
      properties: {
        sessionId: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
  })
  async logout(
    @Body() data: { sessionId: string },
    @Request() req: any,
  ): Promise<void> {
    this.logger.log(`Logout for user: ${req.user.userId}`);

    await this.authService.logout(req.user.userId, data.sessionId);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve current authenticated user profile information.',
  })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  async getProfile(@Request() req: any): Promise<any> {
    this.logger.log(`Profile request for user: ${req.user.userId}`);

    // Return user profile (in real implementation, fetch from database)
    return {
      id: req.user.userId,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      roles: req.user.roles,
      schoolId: req.user.schoolId,
      mfaEnabled: req.user.mfaEnabled,
      lastLogin: req.user.lastLogin,
      profileComplete: req.user.profileComplete,
    };
  }

  @Post('mfa/test')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Test MFA token',
    description: 'Test MFA token generation without enabling MFA.',
  })
  @ApiBody({
    description: 'MFA test request',
    schema: {
      type: 'object',
      required: ['method'],
      properties: {
        method: { type: 'string', enum: ['totp', 'sms', 'email'], example: 'totp' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'MFA test token generated',
  })
  async testMfa(
    @Body() data: { method: string },
    @Request() req: any,
  ): Promise<any> {
    this.logger.log(`MFA test for user: ${req.user.userId}, method: ${data.method}`);

    // Mock MFA test response
    return {
      method: data.method,
      testToken: '123456', // Mock token for testing
      message: `Test ${data.method} token generated. Use this token to verify MFA functionality.`,
      expiresIn: 300, // 5 minutes
    };
  }

  @Get('session/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get session status',
    description: 'Check current session status and validity.',
  })
  @ApiResponse({
    status: 200,
    description: 'Session status retrieved',
  })
  async getSessionStatus(@Request() req: any): Promise<any> {
    this.logger.log(`Session status check for user: ${req.user.userId}`);

    // Mock session status
    return {
      sessionId: req.user.sessionId,
      status: 'active',
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      lastActivity: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      mfaVerified: req.user.mfaVerified,
    };
  }
}