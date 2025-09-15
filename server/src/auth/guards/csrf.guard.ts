import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { EUserRole } from '@academia-pro/types/users';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as any;

    // Skip CSRF validation for GET, HEAD, and OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    console.log('🔒 CSRF Guard: Executing for', {
      method: request.method,
      url: request.url,
      hasUser: !!user,
      userRoles: user?.roles,
      cookies: Object.keys(request.cookies || {}),
      allCookies: request.cookies,
      csrfTokenFromHeader: request.headers['x-csrf-token'] as string,
      allHeaders: request.headers,
    });

    // Get CSRF token from header
    const csrfTokenFromHeader = request.headers['x-csrf-token'] as string;

    if (!csrfTokenFromHeader) {
      console.log('CSRF Guard: Token missing from header');
      throw new UnauthorizedException('CSRF token missing');
    }

    // Get expected CSRF token from cookies
    const isSuperAdmin = user?.roles?.includes(EUserRole.SUPER_ADMIN) || user?.roles?.includes(EUserRole.DELEGATED_SUPER_ADMIN);
    const csrfCookieName = isSuperAdmin ? 'superAdminCsrfToken' : 'csrfToken';
    const expectedCsrfToken = request.cookies?.[csrfCookieName];

    console.log('CSRF Guard Debug:', {
      isSuperAdmin,
      csrfCookieName,
      expectedCsrfToken: expectedCsrfToken ? '[PRESENT]' : '[MISSING]',
      cookieValue: request.cookies?.[csrfCookieName],
      headerTokenLength: csrfTokenFromHeader?.length,
      cookieTokenLength: expectedCsrfToken?.length,
      headerTokenPreview: csrfTokenFromHeader?.substring(0, 10) + '...',
      cookieTokenPreview: expectedCsrfToken?.substring(0, 10) + '...',
    });

    if (!expectedCsrfToken) {
      console.log('CSRF Guard: Token not found in cookies');
      throw new UnauthorizedException('CSRF token not found in cookies');
    }

    // Validate CSRF token
    if (csrfTokenFromHeader !== expectedCsrfToken) {
      console.log('CSRF Guard: Token mismatch', {
        headerToken: csrfTokenFromHeader,
        cookieToken: expectedCsrfToken,
        match: csrfTokenFromHeader === expectedCsrfToken,
        headerLength: csrfTokenFromHeader.length,
        cookieLength: expectedCsrfToken.length,
      });
      throw new UnauthorizedException('Invalid CSRF token from guard');
    }

    console.log('CSRF Guard: Token validation successful');
    return true;
  }
}