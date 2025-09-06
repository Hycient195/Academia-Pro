import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../users/user.entity';
import { EUserRole, EUserStatus } from '@academia-pro/types/users';

@Injectable()
export class SuperAdminSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    console.log('Running super admin seeder...');
    await this.seed();
  }

  async seed(): Promise<void> {
    try {
      // Check if super admin already exists
      const existingSuperAdmin = await this.usersRepository.findOne({
        where: { email: 'admin@admin.com' },
      });

      if (existingSuperAdmin) {
        console.log('Super admin user already exists');
        return;
      }

      // Hash the password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash('Admin1234$', saltRounds);

      // Create super admin user
      const superAdmin = this.usersRepository.create({
        email: 'admin@admin.com',
        firstName: 'Super',
        lastName: 'Admin',
        passwordHash,
        role: EUserRole.SUPER_ADMIN,
        status: EUserStatus.ACTIVE,
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.usersRepository.save(superAdmin);
      console.log('✅ Super admin user created successfully');
      console.log('Email: admin@admin.com');
      console.log('Password: Admin1234$');
    } catch (error) {
      console.error('❌ Error creating super admin user:', error);
      throw error;
    }
  }
}