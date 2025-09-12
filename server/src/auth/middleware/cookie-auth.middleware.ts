import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import * as bcrypt from 'bcryptjs';

export interface AuthenticatedRequest extends Request {
  user?: any;
  cookies: {
    accessToken?: string;
    refreshToken?: string;
    csrfToken?: string;
    superAdminAccessToken?: string;
    superAdminRefreshToken?: string;
    superAdminCsrfToken?: string;
  };
}

@Injectable()
export class CookieAuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Skip authentication for auth routes
    if (req.path.startsWith('/api/v1/auth/') || req.path.startsWith('/api/v1/super-admin/auth/')) {
      return next();
    }

    try {
      // Intelligently select the appropriate tokens based on request context
      let accessToken: string | undefined;
      let refreshToken: string | undefined;
      let isSuperAdmin = false;

      const isSuperAdminRoute = req.path.includes('/super-admin/');

      if (isSuperAdminRoute) {
        // For super admin routes, prioritize super admin tokens
        accessToken = req.cookies.superAdminAccessToken || req.cookies.accessToken;
        refreshToken = req.cookies.superAdminRefreshToken || req.cookies.refreshToken;
        isSuperAdmin = !!req.cookies.superAdminAccessToken;
      } else {
        // For regular routes, prioritize regular tokens
        accessToken = req.cookies.accessToken || req.cookies.superAdminAccessToken;
        refreshToken = req.cookies.refreshToken || req.cookies.superAdminRefreshToken;
        isSuperAdmin = !req.cookies.accessToken && !!req.cookies.superAdminAccessToken;
      }

      if (!accessToken) {
        // If no access token, try to refresh
        if (refreshToken) {
          await this.handleTokenRefresh(req, res, isSuperAdmin);
        } else {
          return next();
        }
      } else {
        // Verify access token
        try {
          const payload = this.jwtService.verify(accessToken);
          const user = await this.usersService.findOneForAuth(payload.sub);

          if (user && user.status === 'active') {
            req.user = user;
          }
        } catch (error) {
          // Access token expired, try refresh
          if (refreshToken) {
            await this.handleTokenRefresh(req, res, isSuperAdmin);
          }
        }
      }

      next();
    } catch (error) {
      next();
    }
  }

  private async handleTokenRefresh(req: AuthenticatedRequest, res: Response, isSuperAdmin: boolean = false) {
    try {
      const refreshToken = isSuperAdmin ? req.cookies.superAdminRefreshToken : req.cookies.refreshToken;
      if (!refreshToken) return;

      // Verify refresh token
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOneForRefreshToken(payload.sub);

      if (!user || !user.refreshToken) return;

      // Check if refresh token is expired
      if (user.refreshTokenExpires && user.refreshTokenExpires < new Date()) return;

      // Verify stored refresh token
      const isRefreshTokenValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isRefreshTokenValid) return;

      // Generate new tokens
      const newPayload = {
        email: user.email,
        sub: user.id,
        roles: user.roles,
        schoolId: user.schoolId,
      };

      const newAccessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      // Update stored refresh token
      await this.usersService.updateRefreshToken(
        user.id,
        newRefreshToken,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      );

      // Set new cookies
      this.setAuthCookies(res, newAccessToken, newRefreshToken, isSuperAdmin);

      // Set user on request
      const fullUser = await this.usersService.findOneForAuth(user.id);

      if (fullUser && fullUser.status === 'active') {
        req.user = fullUser;
      }
    } catch (error) {
      // Silent refresh failed, continue without authentication
    }
  }

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string, isSuperAdmin: boolean = false) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict' as const,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    const accessTokenKey = isSuperAdmin ? 'superAdminAccessToken' : 'accessToken';
    const refreshTokenKey = isSuperAdmin ? 'superAdminRefreshToken' : 'refreshToken';

    res.cookie(accessTokenKey, accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.cookie(refreshTokenKey, refreshToken, cookieOptions);
  }
}