import { Injectable } from '@nestjs/common';
import { Client } from '@prisma/client';
import { MailService } from '../mail/mail.service';
import { PrismaService } from 'nestjs-prisma';
import { SmsService } from './sms.service';
import Mustache = require('mustache');

@Injectable()
export class NotifyClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  async notifyClient(eventName: string, client: Client, loan?: object) {
    const smsTemplate = await this.prisma.notificationTemplate.findFirst({
      where: { event: { contains: eventName }, type: 'SMS' },
    });

    const mailTemplate = await this.prisma.notificationTemplate.findFirst({
      where: { event: { contains: eventName }, type: 'EMAIL' },
    });

    client.preferredLanguage === 'ARABIC'
      ? await this.mailService.sendMail(
          client.email,
          Mustache.render(mailTemplate.bodyAr, { ...client, ...loan }),
          mailTemplate.titleAr,
          eventName,
        )
      : await this.mailService.sendMail(
          client.email,
          Mustache.render(mailTemplate.bodyEn, { ...client, ...loan }),
          mailTemplate.titleEn,
          eventName,
        );

    client.preferredLanguage === 'ARABIC'
      ? await this.smsService.sendSMS(client.phone, Mustache.render(smsTemplate.bodyAr, { ...client, ...loan }))
      : await this.smsService.sendSMS(client.phone, Mustache.render(smsTemplate.bodyEn, { ...client, ...loan }));
  }
}
