// Academia Pro - Roles Decorator
// Decorator for role-based access control

import { EUserRole } from '@academia-pro/types/users';
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: EUserRole[]) => SetMetadata(ROLES_KEY, roles);