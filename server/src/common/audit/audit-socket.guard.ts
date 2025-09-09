import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';

interface AuthenticatedSocket {
  handshake: {
    auth?: { token?: string };
    headers?: { authorization?: string };
    query?: { token?: string };
  };
}

@Injectable()
export class AuditSocketGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const client: AuthenticatedSocket = context.switchToWs().getClient();

    try {
      const token = this.extractToken(client);

      if (!token) {
        return false;
      }

      const payload = this.jwtService.verify(token);
      const user = {
        id: payload.sub,
        role: payload.role,
        schoolId: payload.schoolId,
        sessionId: payload.sessionId,
      };

      // Check if user has audit access
      if (!this.hasAuditAccess(user.role)) {
        return false;
      }

      // Store user info on client for later use
      (client as any).user = user;

      return true;
    } catch (error) {
      console.error('WebSocket authentication failed:', error.message);
      return false;
    }
  }

  private extractToken(client: AuthenticatedSocket): string | null {
    // Try different sources for the token
    return (
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '') ||
      client.handshake.query?.token as string ||
      null
    );
  }

  private hasAuditAccess(role: string): boolean {
    const allowedRoles = ['super-admin', 'admin', 'auditor', 'security-officer'];
    return allowedRoles.includes(role);
  }
}