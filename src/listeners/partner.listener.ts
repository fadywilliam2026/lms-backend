import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { OnEvent } from '@nestjs/event-emitter';
import { Events } from '../common/types/event';
import { User } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { SmsService } from './sms.service';
import Mustache = require('mustache');
import { HttpService } from '@nestjs/axios';

interface LoanDisbursementPayload {
  clientId: number;
  commercialName: string;
  loanLimit: number;
  disbursmentTime: Date;
}

@Injectable()
export class PartnerListener {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
    private readonly httpService: HttpService,
  ) {}

  @OnEvent(Events.LoanAccountDisbursement)
  async handleLoanAccountDisbursementEventWithPartner(loanAccount: {
    userId: number;
    clientId: number;
    commercialName: string;
    loanLimit: number;
    disbursmentTime: Date;
  }) {
    if (!loanAccount) throw new NotFoundException('Loan account not found');

    const user = await this.prismaService.user.findFirst({
      where: { id: loanAccount.userId, role: { name: 'agent' } },
    });

    if (!user) throw new NotFoundException('User not found');

    await this.notifyPartner(Events.LoanAccountDisbursement, user, {
      clientId: loanAccount.clientId,
      commercialName: loanAccount.commercialName,
      loanLimit: loanAccount.loanLimit,
      disbursmentTime: loanAccount.disbursmentTime,
    });
  }

  private async notifyPartner(eventName: string, user: User, loanAccount: LoanDisbursementPayload) {
    const smsTemplate = await this.prismaService.notificationTemplate.findFirst({
      where: { event: { contains: eventName }, type: 'SMS' },
    });

    const emailTemplate = await this.prismaService.notificationTemplate.findFirst({
      where: { event: { contains: eventName }, type: 'EMAIL' },
    });

    await this.mailService.sendMail(
      user.email,
      Mustache.render(emailTemplate.bodyEn, { ...user, ...loanAccount }),
      emailTemplate.titleEn,
      eventName,
    );

    await this.smsService.sendSMS(user.phone, Mustache.render(smsTemplate.bodyEn, { ...user, ...loanAccount }));

    if (user.webhookUrl) {
      const payload = {
        body: {
          clientId: loanAccount.clientId,
          commercialName: loanAccount.commercialName,
          loanLimit: loanAccount.loanLimit,
          disbursmentTime: loanAccount.disbursmentTime,
        },
        status: 'LOAN_DISBURSED',
      };

      await this.sendNotificationRetry(user.webhookUrl, 3, payload);
    }
  }

  private async sendNotificationRetry(url: string, retries = 3, data: any) {
    for (let i = 0; i < retries; i++) {
      const response = await this.httpService.axiosRef.post(url, data);
      if (response.status >= 200 && response.status < 300) return response;

      await new Promise(resolve => setTimeout(resolve, 600000 * (i + 1)));
    }
    throw new Error('Failed to send notification');
  }
}
