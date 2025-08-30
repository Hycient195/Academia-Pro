// Academia Pro - Single Sign-On Service
// Handles SSO integration with Google, Microsoft, and other identity providers

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';

export interface SSOProvider {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  userInfoUrl: string;
  scopes: string[];
  enabled: boolean;
}

export interface SSOProfile {
  provider: string;
  providerId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  rawProfile: any;
}

export interface SSOConfig {
  providers: SSOProvider[];
  defaultRedirectUrl: string;
  sessionTimeout: number;
  allowedDomains: string[];
}

@Injectable()
export class SSOService {
  private ssoConfig: SSOConfig = {
    providers: [
      {
        id: 'google',
        name: 'Google',
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
        scopes: ['openid', 'email', 'profile'],
        enabled: true,
      },
      {
        id: 'microsoft',
        name: 'Microsoft',
        clientId: process.env.MICROSOFT_CLIENT_ID || '',
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
        authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
        tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
        userInfoUrl: 'https://graph.microsoft.com/v1.0/me',
        scopes: ['openid', 'email', 'profile', 'User.Read'],
        enabled: true,
      },
    ],
    defaultRedirectUrl: process.env.SSO_REDIRECT_URL || 'http://localhost:3000/auth/callback',
    sessionTimeout: 3600000, // 1 hour
    allowedDomains: ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com'],
  };

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Get SSO configuration
   */
  getSSOConfig(): SSOConfig {
    return this.ssoConfig;
  }

  /**
   * Get enabled SSO providers
   */
  getEnabledProviders(): SSOProvider[] {
    return this.ssoConfig.providers.filter(provider => provider.enabled);
  }

  /**
   * Generate authorization URL for SSO provider
   */
  generateAuthUrl(providerId: string, state?: string): string {
    const provider = this.ssoConfig.providers.find(p => p.id === providerId);
    if (!provider || !provider.enabled) {
      throw new BadRequestException(`SSO provider ${providerId} not found or disabled`);
    }

    const params = new URLSearchParams({
      client_id: provider.clientId,
      redirect_uri: this.ssoConfig.defaultRedirectUrl,
      response_type: 'code',
      scope: provider.scopes.join(' '),
      state: state || this.generateState(),
    });

    return `${provider.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(providerId: string, code: string): Promise<string> {
    const provider = this.ssoConfig.providers.find(p => p.id === providerId);
    if (!provider) {
      throw new BadRequestException(`SSO provider ${providerId} not found`);
    }

    try {
      // TODO: Implement actual HTTP request to token endpoint
      // For now, return mock token
      return `mock_token_${providerId}_${Date.now()}`;
    } catch (error) {
      throw new BadRequestException('Failed to exchange code for token');
    }
  }

  /**
   * Get user profile from SSO provider
   */
  async getUserProfile(providerId: string, accessToken: string): Promise<SSOProfile> {
    const provider = this.ssoConfig.providers.find(p => p.id === providerId);
    if (!provider) {
      throw new BadRequestException(`SSO provider ${providerId} not found`);
    }

    try {
      // TODO: Implement actual HTTP request to user info endpoint
      // For now, return mock profile
      return {
        provider: providerId,
        providerId: `provider_id_${Date.now()}`,
        email: `user@${providerId}.com`,
        firstName: 'John',
        lastName: 'Doe',
        avatar: `https://avatar.${providerId}.com/user.jpg`,
        rawProfile: {
          sub: `provider_id_${Date.now()}`,
          email: `user@${providerId}.com`,
          given_name: 'John',
          family_name: 'Doe',
          picture: `https://avatar.${providerId}.com/user.jpg`,
        },
      };
    } catch (error) {
      throw new BadRequestException('Failed to get user profile from SSO provider');
    }
  }

  /**
   * Find or create user from SSO profile
   */
  async findOrCreateUser(profile: SSOProfile): Promise<User> {
    // Check if user already exists with this SSO account
    let user = await this.usersRepository.findOne({
      where: { email: profile.email },
    });

    if (user) {
      // Update user with SSO information
      await this.usersRepository.update(user.id, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        // TODO: Store SSO provider information
      });
    } else {
      // Create new user
      user = this.usersRepository.create({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        role: 'student' as any, // Default role, can be changed later
        status: 'active' as any,
        isEmailVerified: true, // SSO emails are pre-verified
        // TODO: Store SSO provider information
      });

      user = await this.usersRepository.save(user);
    }

    return user;
  }

  /**
   * Handle SSO callback
   */
  async handleSSOCallback(providerId: string, code: string, state?: string): Promise<{
    user: User;
    accessToken: string;
    refreshToken: string;
  }> {
    // Exchange code for token
    const accessToken = await this.exchangeCodeForToken(providerId, code);

    // Get user profile
    const profile = await this.getUserProfile(providerId, accessToken);

    // Find or create user
    const user = await this.findOrCreateUser(profile);

    // Generate JWT tokens
    const jwtPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      schoolId: user.schoolId,
      provider: providerId,
    };

    // TODO: Use JwtService to generate tokens
    const jwtAccessToken = `jwt_${user.id}_${Date.now()}`;
    const jwtRefreshToken = `refresh_${user.id}_${Date.now()}`;

    return {
      user,
      accessToken: jwtAccessToken,
      refreshToken: jwtRefreshToken,
    };
  }

  /**
   * Link SSO account to existing user
   */
  async linkSSOAccount(userId: string, providerId: string, providerUserId: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // TODO: Store SSO provider linkage in database
    console.log(`Linked ${providerId} account ${providerUserId} to user ${userId}`);
  }

  /**
   * Unlink SSO account from user
   */
  async unlinkSSOAccount(userId: string, providerId: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // TODO: Remove SSO provider linkage from database
    console.log(`Unlinked ${providerId} account from user ${userId}`);
  }

  /**
   * Get linked SSO providers for user
   */
  async getLinkedProviders(userId: string): Promise<string[]> {
    // TODO: Query database for linked SSO providers
    return ['google']; // Mock data
  }

  /**
   * Validate SSO state parameter
   */
  validateState(state: string): boolean {
    // TODO: Implement proper state validation
    return state && state.length > 10;
  }

  /**
   * Check if email domain is allowed for SSO
   */
  isDomainAllowed(email: string): boolean {
    const domain = email.split('@')[1];
    return this.ssoConfig.allowedDomains.includes(domain);
  }

  /**
   * Get SSO provider by ID
   */
  getProvider(providerId: string): SSOProvider | null {
    return this.ssoConfig.providers.find(p => p.id === providerId) || null;
  }

  /**
   * Update SSO provider configuration
   */
  async updateProviderConfig(providerId: string, config: Partial<SSOProvider>): Promise<void> {
    const providerIndex = this.ssoConfig.providers.findIndex(p => p.id === providerId);
    if (providerIndex === -1) {
      throw new BadRequestException(`SSO provider ${providerId} not found`);
    }

    this.ssoConfig.providers[providerIndex] = {
      ...this.ssoConfig.providers[providerIndex],
      ...config,
    };

    // TODO: Persist configuration changes
  }

  /**
   * Enable/disable SSO provider
   */
  async toggleProvider(providerId: string, enabled: boolean): Promise<void> {
    const provider = this.ssoConfig.providers.find(p => p.id === providerId);
    if (!provider) {
      throw new BadRequestException(`SSO provider ${providerId} not found`);
    }

    provider.enabled = enabled;
    // TODO: Persist changes
  }

  /**
   * Get SSO statistics
   */
  async getSSOStats(): Promise<{
    totalLogins: number;
    providerBreakdown: Record<string, number>;
    recentActivity: any[];
  }> {
    // TODO: Query database for SSO statistics
    return {
      totalLogins: 1250,
      providerBreakdown: {
        google: 850,
        microsoft: 400,
      },
      recentActivity: [],
    };
  }

  // Private helper methods
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}