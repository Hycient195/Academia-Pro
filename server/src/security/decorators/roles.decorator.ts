import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export const RESOURCE_OWNER_KEY = 'resourceOwnerOnly';
export const ResourceOwnerOnly = () => SetMetadata(RESOURCE_OWNER_KEY, true);

export const REQUIRES_MFA_KEY = 'requiresMfa';
export const RequiresMfa = () => SetMetadata(REQUIRES_MFA_KEY, true);

export const PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(PUBLIC_KEY, true);