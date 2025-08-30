// Academia Pro - Attendance Guard
// Guard for protecting attendance-related endpoints

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AttendanceGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Basic authentication check
    if (!user) {
      return false;
    }

    // Allow access for authenticated users
    // Additional role-based checks can be added here
    return true;
  }
}