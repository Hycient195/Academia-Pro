import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

export interface CSRFRequest extends Request {
  csrfToken?: string;
}

@Injectable()
export class CSRFMiddleware implements NestMiddleware {
  private readonly csrfTokens = new Map<string, { token: string; expires: number }>();

  use(req: CSRFRequest, res: Response, next: NextFunction) {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Normalize path (supports both Express req.path and req.url)
    const path = (req as any).path || (req as any).url || '';

    // Skip CSRF check for authentication endpoints regardless of global prefix
    // This covers both '/api/v1/auth/*' and '/auth/*' as well as super-admin auth scopes
    if (
      path.startsWith('/api/v1/auth/') ||
      path.startsWith('/auth/') ||
      path.startsWith('/api/v1/super-admin/') ||
      path.startsWith('/super-admin/')
    ) {
      return next();
    }

    const csrfToken =
      (req.headers['x-csrf-token'] as string) ||
      (req.body?._csrf as string) ||
      (req.query._csrf as string);

    const sessionId = this.getSessionId(req);

    if (!csrfToken) {
      // Explicit 403 response to avoid hanging requests if thrown inside middleware chain
      return res.status(403).json({ message: 'CSRF token missing' });
    }

    const storedToken = this.csrfTokens.get(sessionId);
    if (!storedToken || storedToken.token !== csrfToken) {
      return res.status(403).json({ message: 'Invalid CSRF token' });
    }

    // Check if token is expired
    if (Date.now() > storedToken.expires) {
      this.csrfTokens.delete(sessionId);
      return res.status(403).json({ message: 'CSRF token expired' });
    }

    next();
  }

  generateCSRFToken(req: Request): string {
    const sessionId = this.getSessionId(req);
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + (60 * 60 * 1000); // 1 hour

    this.csrfTokens.set(sessionId, { token, expires });

    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();

    return token;
  }

  private getSessionId(req: Request): string {
    // Use access token as session identifier
    const accessToken = (req as any).cookies?.accessToken;
    if (accessToken) {
      return crypto.createHash('sha256').update(accessToken).digest('hex');
    }

    // Fallback to IP + User-Agent
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return crypto.createHash('sha256').update(`${ip}-${userAgent}`).digest('hex');
  }

  private cleanupExpiredTokens() {
    const now = Date.now();
    for (const [sessionId, data] of this.csrfTokens.entries()) {
      if (now > data.expires) {
        this.csrfTokens.delete(sessionId);
      }
    }
  }
}