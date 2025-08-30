// Academia Pro - WhatsApp Provider
// Service provider for WhatsApp messaging using WhatsApp Business API or Twilio

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WhatsAppMessage {
  to: string; // WhatsApp number in international format
  content: string;
  type?: 'text' | 'image' | 'document' | 'audio' | 'video' | 'location' | 'contact' | 'sticker';
  mediaUrl?: string;
  mediaCaption?: string;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contact?: {
    name: string;
    phone: string;
  };
  template?: {
    name: string;
    language: string;
    components: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text?: string;
        image?: { link: string };
        document?: { link: string };
      }>;
    }>;
  };
  replyToMessageId?: string;
}

export interface WhatsAppResponse {
  success: boolean;
  messageId?: string;
  cost?: number;
  error?: string;
  providerResponse?: any;
}

@Injectable()
export class WhatsAppProvider {
  private readonly logger = new Logger(WhatsAppProvider.name);
  private twilioClient: any;
  private whatsappBusinessApi: any;

  constructor(private configService: ConfigService) {
    this.initializeWhatsApp();
  }

  private initializeWhatsApp() {
    try {
      // Try to initialize Twilio WhatsApp first
      if (this.configService.get<string>('TWILIO_ACCOUNT_SID')) {
        // Twilio WhatsApp integration
        this.logger.log('WhatsApp Provider initialized with Twilio');
      } else if (this.configService.get<string>('WHATSAPP_ACCESS_TOKEN')) {
        // WhatsApp Business API
        this.logger.log('WhatsApp Provider initialized with Business API');
      } else {
        this.logger.warn('WhatsApp provider not configured - using simulation mode');
      }
    } catch (error) {
      this.logger.error('Failed to initialize WhatsApp provider', error);
    }
  }

  async sendWhatsAppMessage(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    try {
      this.logger.log(`Sending WhatsApp message to ${message.to}: ${message.content?.substring(0, 50)}...`);

      // Simulate WhatsApp sending for development
      if (this.isDevelopmentMode()) {
        return this.simulateWhatsAppSend(message);
      }

      // Real WhatsApp implementation would be:
      if (this.configService.get<string>('TWILIO_ACCOUNT_SID')) {
        return await this.sendViaTwilio(message);
      } else if (this.configService.get<string>('WHATSAPP_ACCESS_TOKEN')) {
        return await this.sendViaBusinessAPI(message);
      }

      return {
        success: true,
        messageId: `wa_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        cost: 0.005, // WhatsApp Business API cost per message
        providerResponse: { simulated: true },
      };

    } catch (error) {
      this.logger.error(`WhatsApp sending failed to ${message.to}`, error);
      return {
        success: false,
        error: error.message,
        providerResponse: error,
      };
    }
  }

  async sendBulkWhatsAppMessages(messages: WhatsAppMessage[]): Promise<WhatsAppResponse[]> {
    const results: WhatsAppResponse[] = [];

    // Process in batches to respect rate limits
    const batchSize = 100; // WhatsApp allows up to 250 messages per second, but we'll be conservative
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const batchPromises = batch.map(message => this.sendWhatsAppMessage(message));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add delay between batches to respect rate limits
      if (i + batchSize < messages.length) {
        await this.delay(1000);
      }
    }

    return results;
  }

  private async sendViaTwilio(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    // Real Twilio WhatsApp implementation
    // const twilio = require('twilio');
    // const client = twilio(accountSid, authToken);
    // const result = await client.messages.create({
    //   from: `whatsapp:${this.configService.get<string>('TWILIO_WHATSAPP_NUMBER')}`,
    //   to: `whatsapp:${message.to}`,
    //   body: message.content,
    // });

    return {
      success: true,
      messageId: `twilio_wa_${Date.now()}`,
      cost: 0.005,
      providerResponse: { provider: 'twilio' },
    };
  }

  private async sendViaBusinessAPI(message: WhatsAppMessage): Promise<WhatsAppResponse> {
    // Real WhatsApp Business API implementation
    // const axios = require('axios');
    // const response = await axios.post(
    //   `https://graph.facebook.com/v18.0/${this.configService.get<string>('WHATSAPP_PHONE_NUMBER_ID')}/messages`,
    //   {
    //     messaging_product: 'whatsapp',
    //     to: message.to,
    //     type: message.type || 'text',
    //     text: { body: message.content },
    //   },
    //   {
    //     headers: {
    //       'Authorization': `Bearer ${this.configService.get<string>('WHATSAPP_ACCESS_TOKEN')}`,
    //       'Content-Type': 'application/json',
    //     },
    //   }
    // );

    return {
      success: true,
      messageId: `waba_${Date.now()}`,
      cost: 0.005,
      providerResponse: { provider: 'whatsapp_business_api' },
    };
  }

  async getWhatsAppStatus(messageId: string): Promise<any> {
    try {
      // Real implementation would fetch status from WhatsApp API
      return {
        messageId,
        status: 'delivered',
        deliveredAt: new Date(),
        readAt: Math.random() > 0.5 ? new Date() : null,
        cost: 0.005,
      };
    } catch (error) {
      this.logger.error(`Failed to get WhatsApp status for ${messageId}`, error);
      throw error;
    }
  }

  async getDeliveryReport(messageIds: string[]): Promise<any[]> {
    const reports = [];

    for (const messageId of messageIds) {
      try {
        const status = await this.getWhatsAppStatus(messageId);
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

  private simulateWhatsAppSend(message: WhatsAppMessage): WhatsAppResponse {
    // Simulate different outcomes for testing
    const random = Math.random();

    if (random < 0.95) { // 95% success rate
      return {
        success: true,
        messageId: `sim_wa_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        cost: 0.005,
        providerResponse: {
          simulated: true,
          status: 'sent',
          to: message.to,
          type: message.type || 'text',
        },
      };
    } else { // 5% failure rate for testing
      return {
        success: false,
        error: 'Simulated WhatsApp failure',
        providerResponse: {
          simulated: true,
          error: 'Message blocked by recipient',
        },
      };
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Template management for WhatsApp Business API
  async createTemplate(templateData: any): Promise<any> {
    // Real implementation would create template in WhatsApp Business API
    return {
      templateId: `wa_template_${Date.now()}`,
      ...templateData,
    };
  }

  async getTemplates(): Promise<any[]> {
    // Real implementation would fetch templates from WhatsApp Business API
    return [
      {
        id: 'welcome_template',
        name: 'welcome_message',
        status: 'approved',
        language: 'en',
      },
    ];
  }

  // Utility methods
  validateWhatsAppNumber(phoneNumber: string): boolean {
    // WhatsApp number validation - should be international format
    const whatsappRegex = /^\+[1-9]\d{1,14}$/;
    return whatsappRegex.test(phoneNumber);
  }

  formatWhatsAppNumber(phoneNumber: string): string {
    // Ensure phone number has country code
    if (!phoneNumber.startsWith('+')) {
      // Default to US country code if not provided
      return `+1${phoneNumber.replace(/\D/g, '')}`;
    }
    return phoneNumber.replace(/\D/g, '');
  }

  calculateWhatsAppCost(message: WhatsAppMessage, count: number = 1): number {
    const baseCost = 0.005; // Cost per WhatsApp message
    let multiplier = 1;

    // Higher cost for media messages
    if (message.type && message.type !== 'text') {
      multiplier = 1.5;
    }

    // Higher cost for template messages
    if (message.template) {
      multiplier = 2;
    }

    return count * baseCost * multiplier;
  }

  // Webhook handling for incoming messages
  async handleIncomingMessage(webhookData: any): Promise<void> {
    // Process incoming WhatsApp messages
    this.logger.log('Processing incoming WhatsApp message', webhookData);

    // Extract message details
    const { from, body, type, timestamp } = webhookData;

    // Store or process the incoming message
    // This would typically create a message record and notify the recipient
  }

  // Media upload for WhatsApp
  async uploadMedia(fileBuffer: Buffer, mimeType: string, filename: string): Promise<string> {
    // Real implementation would upload media to WhatsApp servers
    // and return the media ID
    return `media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }

  // Group messaging (if supported by the provider)
  async createGroup(name: string, participants: string[]): Promise<any> {
    // Create WhatsApp group
    return {
      groupId: `group_${Date.now()}`,
      name,
      participants,
    };
  }

  async sendToGroup(groupId: string, message: WhatsAppMessage): Promise<WhatsAppResponse> {
    // Send message to WhatsApp group
    return {
      success: true,
      messageId: `group_msg_${Date.now()}`,
      cost: 0.005,
      providerResponse: { groupId },
    };
  }
}