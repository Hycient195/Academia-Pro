// Academia Pro - Email Provider
// Service provider for email notifications using SendGrid

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface EmailMessage {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
    disposition: string;
  }>;
  templateId?: string;
  dynamicTemplateData?: Record<string, any>;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  cost?: number;
  error?: string;
  providerResponse?: any;
}

@Injectable()
export class EmailProvider {
  private readonly logger = new Logger(EmailProvider.name);
  private sendGridClient: any;

  constructor(private configService: ConfigService) {
    this.initializeSendGrid();
  }

  private initializeSendGrid() {
    try {
      // In a real implementation, you would import and initialize SendGrid
      // const sgMail = require('@sendgrid/mail');
      // sgMail.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
      // this.sendGridClient = sgMail;

      this.logger.log('Email Provider initialized (SendGrid simulation)');
    } catch (error) {
      this.logger.error('Failed to initialize Email provider', error);
    }
  }

  async sendEmail(message: EmailMessage): Promise<EmailResponse> {
    try {
      this.logger.log(`Sending email to ${Array.isArray(message.to) ? message.to.join(', ') : message.to}: ${message.subject}`);

      // Simulate email sending for development
      if (this.isDevelopmentMode()) {
        return this.simulateEmailSend(message);
      }

      // Real SendGrid implementation would be:
      // const msg = {
      //   to: message.to,
      //   from: message.from || this.configService.get<string>('SENDGRID_FROM_EMAIL'),
      //   subject: message.subject,
      //   html: message.html,
      //   text: message.text,
      //   cc: message.cc,
      //   bcc: message.bcc,
      //   replyTo: message.replyTo,
      //   attachments: message.attachments,
      //   templateId: message.templateId,
      //   dynamicTemplateData: message.dynamicTemplateData,
      // };

      // const result = await this.sendGridClient.send(msg);

      // return {
      //   success: true,
      //   messageId: result[0]?.headers?.['x-message-id'],
      //   cost: 0.0001, // SendGrid cost per email
      //   providerResponse: result,
      // };

      return {
        success: true,
        messageId: `email_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        cost: 0.0001, // Simulated cost
        providerResponse: { simulated: true },
      };

    } catch (error) {
      this.logger.error(`Email sending failed to ${message.to}`, error);
      return {
        success: false,
        error: error.message,
        providerResponse: error,
      };
    }
  }

  async sendBulkEmail(messages: EmailMessage[]): Promise<EmailResponse[]> {
    const results: EmailResponse[] = [];

    // Process in batches to avoid rate limits
    const batchSize = 100; // SendGrid allows up to 1000 per request, but we'll be conservative
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const batchPromises = batch.map(message => this.sendEmail(message));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < messages.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  async getEmailStatus(messageId: string): Promise<any> {
    try {
      // Real implementation would fetch status from SendGrid API
      // This would require storing message IDs and querying the SendGrid API

      // Simulate status response
      return {
        messageId,
        status: 'delivered',
        deliveredAt: new Date(),
        openedAt: Math.random() > 0.5 ? new Date() : null,
        clickedAt: Math.random() > 0.7 ? new Date() : null,
        cost: 0.0001,
      };
    } catch (error) {
      this.logger.error(`Failed to get email status for ${messageId}`, error);
      throw error;
    }
  }

  async getDeliveryReport(messageIds: string[]): Promise<any[]> {
    const reports = [];

    for (const messageId of messageIds) {
      try {
        const status = await this.getEmailStatus(messageId);
        reports.push(status);
      } catch (error) {
        reports.push({
          messageId,
          status: 'error',
          error: error.message,
        });
      }
    }

    return reports;
  }

  private isDevelopmentMode(): boolean {
    return this.configService.get<string>('NODE_ENV') !== 'production';
  }

  private simulateEmailSend(message: EmailMessage): EmailResponse {
    // Simulate different outcomes for testing
    const random = Math.random();

    if (random < 0.95) { // 95% success rate
      return {
        success: true,
        messageId: `sim_email_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        cost: 0.0001,
        providerResponse: {
          simulated: true,
          status: 'sent',
          to: message.to,
          subject: message.subject,
        },
      };
    } else { // 5% failure rate for testing
      return {
        success: false,
        error: 'Simulated email failure',
        providerResponse: {
          simulated: true,
          error: 'Mailbox full',
        },
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Template management methods
  async createTemplate(templateData: any): Promise<any> {
    // Real implementation would create template in SendGrid
    return {
      templateId: `template_${Date.now()}`,
      ...templateData,
    };
  }

  async updateTemplate(templateId: string, templateData: any): Promise<any> {
    // Real implementation would update template in SendGrid
    return {
      templateId,
      ...templateData,
      updated: true,
    };
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    // Real implementation would delete template from SendGrid
    return true;
  }

  // Utility methods
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  formatEmailList(emails: string | string[]): string[] {
    if (typeof emails === 'string') {
      return [emails];
    }
    return emails;
  }

  calculateEmailSize(message: EmailMessage): number {
    // Rough calculation of email size in bytes
    let size = 0;

    if (message.subject) size += message.subject.length * 2; // UTF-16
    if (message.html) size += message.html.length * 2;
    if (message.text) size += message.text.length;

    if (message.attachments) {
      message.attachments.forEach(attachment => {
        size += attachment.content.length;
      });
    }

    return size;
  }

  estimateCost(message: EmailMessage, count: number = 1): number {
    const costPerEmail = 0.0001; // Example cost per email
    return count * costPerEmail;
  }

  // HTML email template helpers
  generateHtmlEmail(subject: string, content: string, options?: {
    headerColor?: string;
    footerText?: string;
    logoUrl?: string;
  }): string {
    const {
      headerColor = '#4F46E5',
      footerText = 'Academia Pro - School Management System',
      logoUrl,
    } = options || {};

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4;">
            <tr>
              <td align="center" style="padding: 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                  ${logoUrl ? `
                    <tr>
                      <td style="padding: 20px; text-align: center; background-color: ${headerColor};">
                        <img src="${logoUrl}" alt="Academia Pro" style="max-width: 200px; height: auto;">
                      </td>
                    </tr>
                  ` : `
                    <tr>
                      <td style="padding: 20px; text-align: center; background-color: ${headerColor}; color: white;">
                        <h1 style="margin: 0; font-size: 24px;">Academia Pro</h1>
                      </td>
                    </tr>
                  `}
                  <tr>
                    <td style="padding: 30px;">
                      ${content}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px; text-align: center; background-color: #f8f9fa; color: #6c757d; font-size: 12px;">
                      ${footerText}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  }
}