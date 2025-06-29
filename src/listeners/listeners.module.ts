import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { ClientsListener } from './client.listener';
import { LoanAccountListener } from './loan-account.listener';
import { NotifyClientService } from './notify-client.service';
import { SmsService } from './sms.service';
import { PartnerListener } from './partner.listener';
@Global()
@Module({
  providers: [NotifyClientService, ClientsListener, LoanAccountListener, SmsService, PartnerListener],
  imports: [HttpModule, MailModule],
  exports: [SmsService, NotifyClientService],
})
export class ListenersModule {}
