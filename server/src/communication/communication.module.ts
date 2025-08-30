// Academia Pro - Communication Module
// Comprehensive communication management system

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Message } from './entities/message.entity';
import { Notification } from './entities/notification.entity';
import { NoticeBoard, NoticeComment } from './entities/notice-board.entity';
import { CommunicationTemplate } from './entities/template.entity';

// Services
import { CommunicationService } from './services/communication.service';

// Providers
import { SMSProvider } from './providers/sms.provider';
import { EmailProvider } from './providers/email.provider';
import { PushProvider } from './providers/push.provider';
import { WhatsAppProvider } from './providers/whatsapp.provider';
import { TelegramProvider } from './providers/telegram.provider';

// Controllers
import { CommunicationController } from './controllers/communication.controller';

// Guards and Interceptors
import { CommunicationGuard } from './guards/communication.guard';
import { CommunicationInterceptor } from './interceptors/communication.interceptor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Message,
      Notification,
      NoticeBoard,
      NoticeComment,
      CommunicationTemplate,
    ]),
  ],
  controllers: [CommunicationController],
  providers: [
    CommunicationService,
    SMSProvider,
    EmailProvider,
    PushProvider,
    WhatsAppProvider,
    TelegramProvider,
    CommunicationGuard,
    CommunicationInterceptor,
  ],
  exports: [
    CommunicationService,
    SMSProvider,
    EmailProvider,
    PushProvider,
    WhatsAppProvider,
    TelegramProvider,
    CommunicationGuard,
    CommunicationInterceptor,
  ],
})
export class CommunicationModule {}