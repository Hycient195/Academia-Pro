// Academia Pro - JWT Authentication Guard
// Guard to protect routes that require JWT authentication

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Handle request after JWT validation
   * This method is called after the JWT strategy validates the token
   */
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Handle authentication errors
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
      }
      if (info?.name === 'NotBeforeError') {
        throw new UnauthorizedException('Token not active');
      }
      throw err || new UnauthorizedException('Authentication failed');
    }

    // Attach user to request object
    return user;
  }

  /**
   * Check if route can be activated
   * Override to add custom logic if needed
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Call parent canActivate method
    const canActivate = await super.canActivate(context);

    if (!canActivate) {
      return false;
    }

    // Additional custom logic can be added here
    // For example: check if user account is active, check IP restrictions, etc.

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Example: Check if user account is active
    if (user && user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    return true;
  }
}