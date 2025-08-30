// Academia Pro - Multi-Factor Authentication Service
// Handles TOTP, SMS, and backup code MFA operations

import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/user.entity';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

export interface MfaSetupResponse {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export interface MfaVerificationResponse {
  verified: boolean;
  message: string;
}

@Injectable()
export class MfaService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Setup TOTP MFA for user
   */
  async setupTotp(userId: string): Promise<MfaSetupResponse> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'firstName', 'lastName', 'mfaSecret', 'mfaEnabled'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled for this user');
    }

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `Academia Pro (${user.email})`,
      issuer: 'Academia Pro',
      length: 32,
    });

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Generate QR code URL
    const qrCodeUrl = speakeasy.otpauthURL({
      secret: secret.ascii,
      label: encodeURIComponent(`Academia Pro (${user.email})`),
      issuer: 'Academia Pro',
      algorithm: 'sha1',
      digits: 6,
      period: 30,
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl);

    // Store temporary secret (will be confirmed later)
    await this.usersRepository.update(userId, {
      mfaSecret: secret.base32,
      mfaBackupCodes: backupCodes,
    });

    return {
      secret: secret.base32,
      qrCodeUrl: qrCodeDataUrl,
      backupCodes,
    };
  }

  /**
   * Verify and enable TOTP MFA
   */
  async verifyAndEnableTotp(userId: string, token: string): Promise<MfaVerificationResponse> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'mfaSecret', 'mfaEnabled'],
    });

    if (!user || !user.mfaSecret) {
      throw new BadRequestException('MFA setup not initiated');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled');
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 2, // Allow 2 time windows (30 seconds each)
    });

    if (!verified) {
      throw new UnauthorizedException('Invalid TOTP token');
    }

    // Enable MFA
    await this.usersRepository.update(userId, {
      mfaEnabled: true,
      mfaMethod: 'totp',
    });

    return {
      verified: true,
      message: 'MFA has been successfully enabled',
    };
  }

  /**
   * Verify TOTP token for authentication
   */
  async verifyTotp(userId: string, token: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'mfaSecret', 'mfaEnabled', 'mfaMethod'],
    });

    if (!user || !user.mfaEnabled || user.mfaMethod !== 'totp' || !user.mfaSecret) {
      return false;
    }

    return speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 2,
    });
  }

  /**
   * Setup SMS MFA
   */
  async setupSms(userId: string, phoneNumber: string): Promise<MfaVerificationResponse> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'mfaEnabled', 'phoneNumber'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled for this user');
    }

    // Generate verification code
    const verificationCode = this.generateSmsCode();

    // Store verification code temporarily
    await this.usersRepository.update(userId, {
      mfaVerificationCode: verificationCode,
      mfaVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      phoneNumber,
    });

    // TODO: Send SMS with verification code
    // await this.smsService.sendSms(phoneNumber, `Your MFA verification code is: ${verificationCode}`);

    return {
      verified: false,
      message: 'Verification code sent to your phone number',
    };
  }

  /**
   * Verify SMS MFA setup
   */
  async verifySmsSetup(userId: string, code: string): Promise<MfaVerificationResponse> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'mfaVerificationCode', 'mfaVerificationExpires', 'mfaEnabled'],
    });

    if (!user || !user.mfaVerificationCode || !user.mfaVerificationExpires) {
      throw new BadRequestException('SMS verification not initiated');
    }

    if (user.mfaEnabled) {
      throw new BadRequestException('MFA is already enabled');
    }

    if (user.mfaVerificationExpires < new Date()) {
      throw new BadRequestException('Verification code has expired');
    }

    if (user.mfaVerificationCode !== code) {
      throw new BadRequestException('Invalid verification code');
    }

    // Enable SMS MFA
    await this.usersRepository.update(userId, {
      mfaEnabled: true,
      mfaMethod: 'sms',
      mfaVerificationCode: null,
      mfaVerificationExpires: null,
    });

    return {
      verified: true,
      message: 'SMS MFA has been successfully enabled',
    };
  }

  /**
   * Send SMS verification code for login
   */
  async sendSmsCode(userId: string): Promise<MfaVerificationResponse> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'phoneNumber', 'mfaEnabled', 'mfaMethod'],
    });

    if (!user || !user.mfaEnabled || user.mfaMethod !== 'sms' || !user.phoneNumber) {
      throw new BadRequestException('SMS MFA not configured');
    }

    const verificationCode = this.generateSmsCode();

    await this.usersRepository.update(userId, {
      mfaVerificationCode: verificationCode,
      mfaVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
    });

    // TODO: Send SMS
    // await this.smsService.sendSms(user.phoneNumber, `Your login code is: ${verificationCode}`);

    return {
      verified: false,
      message: 'Verification code sent to your phone',
    };
  }

  /**
   * Verify SMS code for login
   */
  async verifySmsCode(userId: string, code: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'mfaVerificationCode', 'mfaVerificationExpires', 'mfaEnabled', 'mfaMethod'],
    });

    if (!user || !user.mfaEnabled || user.mfaMethod !== 'sms') {
      return false;
    }

    if (!user.mfaVerificationCode || !user.mfaVerificationExpires) {
      return false;
    }

    if (user.mfaVerificationExpires < new Date()) {
      return false;
    }

    if (user.mfaVerificationCode !== code) {
      return false;
    }

    // Clear verification code
    await this.usersRepository.update(userId, {
      mfaVerificationCode: null,
      mfaVerificationExpires: null,
    });

    return true;
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'mfaBackupCodes', 'mfaEnabled'],
    });

    if (!user || !user.mfaEnabled || !user.mfaBackupCodes) {
      return false;
    }

    const backupCodes = user.mfaBackupCodes;
    const codeIndex = backupCodes.indexOf(code);

    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1);
    await this.usersRepository.update(userId, {
      mfaBackupCodes: backupCodes,
    });

    return true;
  }

  /**
   * Disable MFA
   */
  async disableMfa(userId: string): Promise<MfaVerificationResponse> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'mfaEnabled'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.mfaEnabled) {
      throw new BadRequestException('MFA is not enabled');
    }

    await this.usersRepository.update(userId, {
      mfaEnabled: false,
      mfaMethod: null,
      mfaSecret: null,
      mfaBackupCodes: null,
      mfaVerificationCode: null,
      mfaVerificationExpires: null,
    });

    return {
      verified: true,
      message: 'MFA has been disabled',
    };
  }

  /**
   * Get MFA status
   */
  async getMfaStatus(userId: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'mfaEnabled', 'mfaMethod', 'phoneNumber', 'mfaBackupCodes'],
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return {
      enabled: user.mfaEnabled,
      method: user.mfaMethod,
      phoneNumber: user.phoneNumber ? this.maskPhoneNumber(user.phoneNumber) : null,
      backupCodesRemaining: user.mfaBackupCodes ? user.mfaBackupCodes.length : 0,
    };
  }

  /**
   * Regenerate backup codes
   */
  async regenerateBackupCodes(userId: string): Promise<string[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'mfaEnabled'],
    });

    if (!user || !user.mfaEnabled) {
      throw new BadRequestException('MFA must be enabled to regenerate backup codes');
    }

    const backupCodes = this.generateBackupCodes();

    await this.usersRepository.update(userId, {
      mfaBackupCodes: backupCodes,
    });

    return backupCodes;
  }

  // Private helper methods
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }

  private generateSmsCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private maskPhoneNumber(phoneNumber: string): string {
    if (phoneNumber.length <= 4) return phoneNumber;
    return '*'.repeat(phoneNumber.length - 4) + phoneNumber.slice(-4);
  }
}