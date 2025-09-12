// Academia Pro - Authentication Controller
// REST API endpoints for user authentication and authorization

import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Response,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { MfaService } from './services/mfa.service';
import { SessionService } from './services/session.service';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { MfaGuard } from '../security/guards/mfa.guard';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from './dtos';
import { IAuthTokens } from '@academia-pro/types/auth';
import { EUserRole } from '@academia-pro/types/users';
import { Auditable, AuditAuth } from '../common/audit/auditable.decorator';
import { AuditAction, AuditSeverity } from '../security/types/audit.types';

interface MfaSetup {
  secret: string;
  otpauthUrl: string;
  qrCodeUrl: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly mfaService: MfaService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @Auditable({
    action: AuditAction.USER_CREATED,
    resource: 'user_registration_endpoint',
    severity: AuditSeverity.MEDIUM,
    excludeFields: ['password'],
    performanceThreshold: 2000, // Alert if registration takes longer than 2 seconds
    metadata: { endpoint: 'register' }
  })
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            role: { type: 'string' },
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
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation error' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body() registerDto: RegisterDto): Promise<{
    user: any;
    tokens: IAuthTokens;
  }> {
    const user = await this.authService.register(registerDto);
    const tokens = await this.authService.login(user);

    // Remove sensitive information from response
    const { passwordHash, ...userResponse } = user;

    return { user: userResponse, tokens };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Auditable({
    action: AuditAction.LOGIN,
    resource: 'user_login_endpoint',
    severity: AuditSeverity.MEDIUM,
    excludeFields: ['password'],
    samplingRate: 0.5, // Sample 50% of login attempts for performance
    metadata: { endpoint: 'login' }
  })
  @ApiOperation({ summary: 'Authenticate user and get access tokens' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        tokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'number' },
            tokenType: { type: 'string' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto, @Response() res: any, @Request() req: any): Promise<void> {
    try {
      console.log('[AuthController] login start:', { email: loginDto?.email });

      // Per-request CORS headers for credentialed responses
      const origin = req.headers?.origin;
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      const user = await this.authService.validateUser(
        loginDto.email,
        loginDto.password,
      );

      const result = await this.authService.loginWithCookies(user, res);

      console.log('[AuthController] login success:', { userId: user?.id, roles: user?.roles });
      res.json(result);
    } catch (err: any) {
      const status = err?.status || 500;
      const message = err?.message || 'Login failed';
      console.error('[AuthController] login error:', { status, message });

      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    }
  }

  @Post('super-admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate super admin user' })
  @ApiResponse({
    status: 200,
    description: 'Super admin login successful',
    schema: {
      type: 'object',
      properties: {
        user: { type: 'object' },
        csrfToken: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Access denied - not a super admin' })
  async superAdminLogin(@Body() loginDto: LoginDto, @Response() res: any): Promise<void> {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    // Check if user is a super admin
    if (!user.roles.includes(EUserRole.SUPER_ADMIN)) {
      res.status(403).json({ message: 'Access denied - not a super admin' });
      return;
    }

    const result = await this.authService.loginWithCookies(user, res);

    res.json(result);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token from cookies' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
        tokenType: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Request() req: any, @Response() res: any): Promise<void> {
    try {
      // Per-request CORS headers for credentialed responses
      const origin = req.headers?.origin;
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Try to get refresh token from regular user cookies
      const refreshToken = req.cookies?.refreshToken;

      if (!refreshToken) {
        res.status(401).json({ message: 'Refresh token not found in cookies' });
        return;
      }

      const tokens = await this.authService.refreshToken({ refreshToken });

      // Get user info to determine cookie names
      const user = await this.authService.getUserFromRefreshToken(refreshToken);

      this.authService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken, user);
      res.json(tokens);
    } catch (err: any) {
      const status = err?.status || 500;
      const message = err?.message || 'Token refresh failed';
      console.error('[AuthController] refresh error:', { status, message });

      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    }
  }

  @Post('super-admin/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh super admin access token using refresh token from cookies' })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' },
        tokenType: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async superAdminRefreshToken(@Request() req: any, @Response() res: any): Promise<void> {
    try {
      // Per-request CORS headers for credentialed responses
      const origin = req.headers?.origin;
      if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Try to get refresh token from super admin cookies
      const refreshToken = req.cookies?.superAdminRefreshToken;

      if (!refreshToken) {
        res.status(401).json({ message: 'Super admin refresh token not found in cookies' });
        return;
      }

      const tokens = await this.authService.refreshToken({ refreshToken });

      // Get user info to determine cookie names
      const user = await this.authService.getUserFromRefreshToken(refreshToken);

      this.authService.setAuthCookies(res, tokens.accessToken, tokens.refreshToken, user);
      res.json(tokens);
    } catch (err: any) {
      const status = err?.status || 500;
      const message = err?.message || 'Super admin token refresh failed';
      console.error('[AuthController] super admin refresh error:', { status, message });

      if (!res.headersSent) {
        res.status(status).json({ message });
      }
    }
  }

  @Get('csrf-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get CSRF token' })
  @ApiResponse({ status: 200, description: 'CSRF token retrieved successfully' })
  getCSRFToken(@Request() req: any): { csrfToken: string } {
    // CSRF token is already set in cookie by login
    // Try regular user cookie names
    const csrfToken = req.cookies?.csrfToken;
    return { csrfToken };
  }

  @Get('super-admin/csrf-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get super admin CSRF token' })
  @ApiResponse({ status: 200, description: 'CSRF token retrieved successfully' })
  getSuperAdminCSRFToken(@Request() req: any): { csrfToken: string } {
    // CSRF token is already set in cookie by login
    // Try super admin cookie names
    const csrfToken = req.cookies?.superAdminCsrfToken;
    return { csrfToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Auditable({
    action: AuditAction.LOGOUT,
    resource: 'user_logout_endpoint',
    severity: AuditSeverity.LOW,
    metadata: { endpoint: 'logout' }
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user and invalidate tokens' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(@Request() req: any, @Response() res: any): Promise<void> {
    await this.authService.logout(req.user.id);
    this.authService.clearAuthCookies(res, req.user);
    res.json({ message: 'Logged out successfully' });
  }

  @Post('super-admin/logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Auditable({
    action: AuditAction.LOGOUT,
    resource: 'super_admin_logout_endpoint',
    severity: AuditSeverity.LOW,
    metadata: { endpoint: 'super_admin_logout' }
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout super admin and invalidate tokens' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async superAdminLogout(@Request() req: any, @Response() res: any): Promise<void> {
    await this.authService.logout(req.user.id);
    this.authService.clearAuthCookies(res, req.user);
    res.json({ message: 'Logged out successfully' });
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Auditable({
    action: AuditAction.PASSWORD_CHANGED,
    resource: 'password_change_endpoint',
    severity: AuditSeverity.HIGH,
    excludeFields: ['currentPassword', 'newPassword'],
    metadata: { endpoint: 'change_password' }
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(req.user.id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Post('super-admin/change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Auditable({
    action: AuditAction.PASSWORD_CHANGED,
    resource: 'super_admin_password_change_endpoint',
    severity: AuditSeverity.HIGH,
    excludeFields: ['currentPassword', 'newPassword'],
    metadata: { endpoint: 'super_admin_change_password' }
  })
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change super admin password' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid current password' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async superAdminChangePassword(
    @Request() req: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    await this.authService.changePassword(req.user.id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Post('reset-password-request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  async requestPasswordReset(@Body('email') email: string): Promise<{ message: string }> {
    await this.authService.requestPasswordReset(email);
    return { message: 'If the email exists, a password reset link has been sent' };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password using token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    return { message: 'Password reset successfully' };
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify user email address' })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    await this.authService.verifyEmail(verifyEmailDto.token);
    return { message: 'Email verified successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: any): any {
    // Ensure user context is available
    if (!req.user) {
      throw new UnauthorizedException('Authentication required');
    }

    // Validate user ID format
    if (!req.user.sub) {
      throw new BadRequestException('User ID is missing from request context');
    }

    // Check if user is a super admin and deny access
    if (req.user.roles.includes(EUserRole.SUPER_ADMIN) || req.user.roles.includes(EUserRole.DELEGATED_SUPER_ADMIN)) {
      throw new UnauthorizedException('Super admin users should use the super admin profile endpoint');
    }

    return req.user;
  }

  @Get('super-admin/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current super admin profile' })
  @ApiResponse({
    status: 200,
    description: 'Super admin profile retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getSuperAdminProfile(@Request() req: any): any {
    this.logger.log('[getSuperAdminProfile] Request received');
    this.logger.log('[getSuperAdminProfile] req.user:', JSON.stringify(req.user, null, 2));
    this.logger.log('[getSuperAdminProfile] req.headers:', JSON.stringify(req.headers, null, 2));

    // Ensure user context is available
    if (!req.user) {
      this.logger.error('[getSuperAdminProfile] No req.user found');
      throw new UnauthorizedException('Authentication required');
    }

    // Validate user ID format
    if (!req.user.sub) {
      this.logger.error('[getSuperAdminProfile] User ID is missing from request context');
      throw new BadRequestException('User ID is missing from request context');
    }

    // Check if user is NOT a super admin and deny access
    if (!req.user.roles.includes(EUserRole.SUPER_ADMIN) && !req.user.roles.includes(EUserRole.DELEGATED_SUPER_ADMIN)) {
      this.logger.error('[getSuperAdminProfile] User is not a super admin. Roles:', req.user.roles);
      throw new UnauthorizedException('Regular users should use the regular profile endpoint');
    }

    this.logger.log('[getSuperAdminProfile] Returning user profile:', JSON.stringify(req.user, null, 2));
    return req.user;
  }

  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async resendVerification(@Request() req: any): Promise<{ message: string }> {
    // Check if user is a super admin and deny access
    if (req.user.roles.includes(EUserRole.SUPER_ADMIN) || req.user.roles.includes(EUserRole.DELEGATED_SUPER_ADMIN)) {
      throw new UnauthorizedException('Super admin users should use the super admin resend verification endpoint');
    }
    
    // TODO: Implement resend verification logic
    return { message: 'Verification email sent' };
  }

  @Post('super-admin/resend-verification')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend super admin email verification' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async superAdminResendVerification(@Request() req: any): Promise<{ message: string }> {
    // Check if user is NOT a super admin and deny access
    if (!req.user.roles.includes(EUserRole.SUPER_ADMIN) && !req.user.roles.includes(EUserRole.DELEGATED_SUPER_ADMIN)) {
      throw new UnauthorizedException('Regular users should use the regular resend verification endpoint');
    }
    
    // TODO: Implement resend verification logic
    return { message: 'Verification email sent' };
  }

  // MFA endpoints from Security Auth Controller
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
  ): Promise<any> {
    this.logger.log(`MFA setup for user: ${req.user.userId}, method: ${data.method}`);

    if (data.method === 'totp') {
      return this.mfaService.setupTotp(req.user.userId);
    } else if (data.method === 'sms') {
      // For SMS, we need phone number from request body
      const phoneNumber = req.body.phoneNumber;
      if (!phoneNumber) {
        throw new BadRequestException('Phone number required for SMS MFA');
      }
      return this.mfaService.setupSms(req.user.userId, phoneNumber);
    } else {
      throw new BadRequestException('Unsupported MFA method');
    }
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

    if (data.method === 'totp') {
      await this.mfaService.verifyAndEnableTotp(req.user.userId, data.verificationToken);
    } else if (data.method === 'sms') {
      await this.mfaService.verifySmsSetup(req.user.userId, data.verificationToken);
    } else {
      throw new BadRequestException('Unsupported MFA method');
    }
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
    await this.mfaService.disableMfa(req.user.userId);
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

    if (data.method === 'totp') {
      const isValid = await this.mfaService.verifyTotp(data.userId, data.token);
      return { verified: isValid, message: isValid ? 'MFA verified successfully' : 'Invalid MFA token' };
    } else if (data.method === 'sms') {
      const isValid = await this.mfaService.verifySmsCode(data.userId, data.token);
      return { verified: isValid, message: isValid ? 'SMS MFA verified successfully' : 'Invalid SMS code' };
    } else {
      throw new BadRequestException('Unsupported MFA method');
    }
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
    return {
      method: data.method,
      testToken: '123456',
      message: `Test ${data.method} token generated. Use this token to verify MFA functionality.`,
      expiresIn: 300,
    };
  }

  // Session management endpoint
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
    // Check if user is a super admin and deny access
    if (req.user.roles.includes(EUserRole.SUPER_ADMIN) || req.user.roles.includes(EUserRole.DELEGATED_SUPER_ADMIN)) {
      throw new UnauthorizedException('Super admin users should use the super admin session status endpoint');
    }
    
    this.logger.log(`Session status check for user: ${req.user.userId}`);
    return this.sessionService.getSessionStats(req.user.userId);
  }

  @Get('super-admin/session/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get super admin session status',
    description: 'Check current super admin session status and validity.',
  })
  @ApiResponse({
    status: 200,
    description: 'Session status retrieved',
  })
  async getSuperAdminSessionStatus(@Request() req: any): Promise<any> {
    // Check if user is NOT a super admin and deny access
    if (!req.user.roles.includes(EUserRole.SUPER_ADMIN) && !req.user.roles.includes(EUserRole.DELEGATED_SUPER_ADMIN)) {
      throw new UnauthorizedException('Regular users should use the regular session status endpoint');
    }
    
    this.logger.log(`Session status check for super admin: ${req.user.userId}`);
    return this.sessionService.getSessionStats(req.user.userId);
  }
}