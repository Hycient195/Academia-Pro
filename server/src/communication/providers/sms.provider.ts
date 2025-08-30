// Academia Pro - SMS Provider
// Service provider for SMS notifications using Twilio

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface SMSMessage {
  to: string;
  body: string;
  from?: string;
}

export interface SMSResponse {
  success: boolean;
  messageId?: string;
  cost?: number;
  error?: string;
  providerResponse?: any;
}

@Injectable()
export class SMSProvider {
  private readonly logger = new Logger(SMSProvider.name);
  private twilioClient: any;

  constructor(private configService: ConfigService) {
    this.initializeTwilio();
  }

  private initializeTwilio() {
    try {
      // In a real implementation, you would import and initialize Twilio
      // const twilio = require('twilio');
      // this.twilioClient = twilio(
      //   this.configService.get<string>('TWILIO_ACCOUNT_SID'),
      //   this.configService.get<string>('TWILIO_AUTH_TOKEN')
      // );

      this.logger.log('SMS Provider initialized (Twilio simulation)');
    } catch (error) {
      this.logger.error('Failed to initialize SMS provider', error);
    }
  }

  async sendSMS(message: SMSMessage): Promise<SMSResponse> {
    try {
      this.logger.log(`Sending SMS to ${message.to}: ${message.body.substring(0, 50)}...`);

      // Simulate SMS sending for development
      if (this.isDevelopmentMode()) {
        return this.simulateSMSSend(message);
      }

      // Real Twilio implementation would be:
      // const result = await this.twilioClient.messages.create({
      //   body: message.body,
      //   from: message.from || this.configService.get<string>('TWILIO_PHONE_NUMBER'),
      //   to: message.to,
      // });

      // return {
      //   success: true,
      //   messageId: result.sid,
      //   cost: parseFloat(result.price || '0'),
      //   providerResponse: result,
      // };

      return {
        success: true,
        messageId: `sms_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        cost: 0.01, // Simulated cost
        providerResponse: { simulated: true },
      };

    } catch (error) {
      this.logger.error(`SMS sending failed to ${message.to}`, error);
      return {
        success: false,
        error: error.message,
        providerResponse: error,
      };
    }
  }

  async sendBulkSMS(messages: SMSMessage[]): Promise<SMSResponse[]> {
    const results: SMSResponse[] = [];

    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const batchPromises = batch.map(message => this.sendSMS(message));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < messages.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  async getSMSStatus(messageId: string): Promise<any> {
    try {
      // Real implementation would fetch status from Twilio
      // const message = await this.twilioClient.messages(messageId).fetch();

      // Simulate status response
      return {
        messageId,
        status: 'delivered',
        deliveredAt: new Date(),
        cost: 0.01,
      };
    } catch (error) {
      this.logger.error(`Failed to get SMS status for ${messageId}`, error);
      throw error;
    }
  }

  async getDeliveryReport(messageIds: string[]): Promise<any[]> {
    const reports = [];

    for (const messageId of messageIds) {
      try {
        const status = await this.getSMSStatus(messageId);
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

  private simulateSMSSend(message: SMSMessage): SMSResponse {
    // Simulate different outcomes for testing
    const random = Math.random();

    if (random < 0.9) { // 90% success rate
      return {
        success: true,
        messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        cost: 0.01,
        providerResponse: {
          simulated: true,
          status: 'sent',
          to: message.to,
          body: message.body,
        },
      };
    } else { // 10% failure rate for testing
      return {
        success: false,
        error: 'Simulated SMS failure',
        providerResponse: {
          simulated: true,
          error: 'Network timeout',
        },
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  formatPhoneNumber(phoneNumber: string): string {
    // Ensure phone number has country code
    if (!phoneNumber.startsWith('+')) {
      // Default to US country code if not provided
      return `+1${phoneNumber.replace(/\D/g, '')}`;
    }
    return phoneNumber.replace(/\D/g, '');
  }

  calculateSMSCount(message: string): number {
    // SMS length limits: 160 characters for single SMS, 153 for concatenated
    const singleSMSLimit = 160;
    const concatenatedLimit = 153;

    if (message.length <= singleSMSLimit) {
      return 1;
    }

    // Calculate number of concatenated SMS needed
    const totalLength = message.length;
    const smsCount = Math.ceil(totalLength / concatenatedLimit);

    return smsCount;
  }

  estimateCost(message: string, count: number = 1): number {
    const smsCount = this.calculateSMSCount(message);
    const costPerSMS = 0.01; // Example cost per SMS

    return smsCount * count * costPerSMS;
  }
}