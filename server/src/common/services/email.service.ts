// Academia Pro - Email Service
// Service for sending emails

import { Injectable } from '@nestjs/common';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

@Injectable()
export class EmailService {
  async sendEmail(options: EmailOptions): Promise<void> {
    // TODO: Implement email sending logic
    // This could use nodemailer, sendgrid, etc.
    console.log('Sending email:', options);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to Academia Pro',
      html: `<h1>Welcome ${name}!</h1><p>Your account has been created successfully.</p>`,
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Password Reset',
      html: `<p>Click the link to reset your password: ${resetToken}</p>`,
    });
  }
}