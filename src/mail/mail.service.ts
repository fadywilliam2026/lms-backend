import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}
  sendMail(mail: string, mailBody: string, subject: string, eventName: string) {
    return this.mailerService.sendMail({
      to: mail,
      subject: subject,
      html: mailBody,
      headers: {
        'X-SES-CONFIGURATION-SET': 'Emails',
        'X-SES-MESSAGE-TAGS': `Category=${eventName}`,
      },
    });
  }
}
