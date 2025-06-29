import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmsService {
  constructor(private readonly configService: ConfigService, private readonly httpService: HttpService) {}
  sendSMS(phone: string, message: string, language = 1) {
    return this.httpService.axiosRef({
      method: 'POST',
      url: 'https://smsmisr.com/api/webapi/',
      params: {
        Username: this.configService.get<string>('SMS_USER_NAME'),
        password: this.configService.get<string>('SMS_PASSWORD'),
        language, // TODO: GET preferred language from client
        sender: this.configService.get<string>('SMS_SENDER'),
        Mobile: phone,
        message: message,
      },
    });
  }
}
