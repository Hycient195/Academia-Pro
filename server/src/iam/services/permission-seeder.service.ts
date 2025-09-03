import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission, PermissionResource, PermissionAction } from '../entities/permission.entity';

@Injectable()
export class PermissionSeederService {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  async seedDefaultPermissions(): Promise<void> {
    const defaultPermissions = [
      // Schools
      { name: 'schools:create', resource: PermissionResource.SCHOOLS, action: PermissionAction.CREATE, description: 'Create new schools' },
      { name: 'schools:read', resource: PermissionResource.SCHOOLS, action: PermissionAction.READ, description: 'View schools' },
      { name: 'schools:update', resource: PermissionResource.SCHOOLS, action: PermissionAction.UPDATE, description: 'Update school information' },
      { name: 'schools:delete', resource: PermissionResource.SCHOOLS, action: PermissionAction.DELETE, description: 'Delete schools' },
      { name: 'schools:manage', resource: PermissionResource.SCHOOLS, action: PermissionAction.MANAGE, description: 'Full management of schools' },

      // Users
      { name: 'users:create', resource: PermissionResource.USERS, action: PermissionAction.CREATE, description: 'Create new users' },
      { name: 'users:read', resource: PermissionResource.USERS, action: PermissionAction.READ, description: 'View users' },
      { name: 'users:update', resource: PermissionResource.USERS, action: PermissionAction.UPDATE, description: 'Update user information' },
      { name: 'users:delete', resource: PermissionResource.USERS, action: PermissionAction.DELETE, description: 'Delete users' },
      { name: 'users:manage', resource: PermissionResource.USERS, action: PermissionAction.MANAGE, description: 'Full management of users' },

      // Analytics
      { name: 'analytics:read', resource: PermissionResource.ANALYTICS, action: PermissionAction.READ, description: 'View analytics and reports' },

      // Audit
      { name: 'audit:read', resource: PermissionResource.AUDIT, action: PermissionAction.READ, description: 'View audit logs' },
      { name: 'audit:manage', resource: PermissionResource.AUDIT, action: PermissionAction.MANAGE, description: 'Manage audit logs' },

      // System
      { name: 'system:read', resource: PermissionResource.SYSTEM, action: PermissionAction.READ, description: 'View system health and metrics' },
      { name: 'system:manage', resource: PermissionResource.SYSTEM, action: PermissionAction.MANAGE, description: 'Manage system settings' },

      // Settings
      { name: 'settings:read', resource: PermissionResource.SETTINGS, action: PermissionAction.READ, description: 'View system settings' },
      { name: 'settings:update', resource: PermissionResource.SETTINGS, action: PermissionAction.UPDATE, description: 'Update system settings' },
      { name: 'settings:manage', resource: PermissionResource.SETTINGS, action: PermissionAction.MANAGE, description: 'Full management of settings' },

      // IAM (Identity & Access Management)
      { name: 'iam:read', resource: PermissionResource.ALL, action: PermissionAction.READ, description: 'View IAM settings' },
      { name: 'iam:manage', resource: PermissionResource.ALL, action: PermissionAction.MANAGE, description: 'Manage IAM (delegated accounts, roles, permissions)' },
    ];

    for (const perm of defaultPermissions) {
      const existing = await this.permissionRepository.findOne({
        where: { name: perm.name }
      });

      if (!existing) {
        await this.permissionRepository.save(
          this.permissionRepository.create(perm)
        );
      }
    }
  }
}