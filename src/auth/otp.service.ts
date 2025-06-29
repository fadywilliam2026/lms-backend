import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '@prisma/client';
import { argon2id, hash, Options, verify } from 'argon2';
import { PrismaService } from 'nestjs-prisma';
import { AuthService } from './auth.service';
import moment = require('moment');

@Injectable()
export class OTPService {
  get getArginOptions(): Options & { raw?: false } {
    const secret = this.configService.get<string>('ARGON2_SECRET');

    return {
      type: argon2id,
      memoryCost: 2 ** 16,
      hashLength: 50,
      secret: Buffer.from(secret),
    };
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {}

  validateOtp(otp: string, hashedOtp: string): Promise<boolean> {
    return verify(hashedOtp, otp, this.getArginOptions);
  }

  hashOtp(otp: string): Promise<string> {
    return hash(otp, this.getArginOptions);
  }

  generateOTP() {
    let otp = '';
    for (let i = 0; i < 6; i++) {
      otp += Math.floor(Math.random() * 10).toString();
    }

    return otp;
  }

  async sendSMSToUser(user: User, code: string) {
    return await this.httpService.axiosRef({
      method: 'POST',
      url: 'https://smsmisr.com/api/vSMS/',
      params: {
        Username: this.configService.get<string>('SMS_USER_NAME'),
        password: this.configService.get<string>('SMS_PASSWORD'),
        Mobile: user.phone,
        Code: code,
        Msignature: this.configService.get<string>('MSIGNATURE'),
        Token: this.configService.get<string>('SMS_TOKEN'),
      },
    });
  }

  async sendOTP(user: User) {
    const otp = this.generateOTP();
    const hashedOtp = await this.hashOtp(otp);
    await this.prisma.oTP.upsert({
      where: { userId: user.id },
      update: { otp: hashedOtp, expiresAt: moment().add(10, 'm').toDate() },
      create: { userId: user.id, otp: hashedOtp, expiresAt: moment().add(10, 'm').toDate() },
    });

    const smsSent = await this.sendSMSToUser(user, otp);

    return smsSent;
  }

  async verifyOTP(phone, otp) {
    const user = await this.prisma.user.findFirst({
      where: {
        phone: phone,
      },
      include: { role: true },
    });

    if (!user) {
      throw new NotFoundException(`No user found for phone number: ${phone}`);
    }

    const hashedOtp = await this.prisma.oTP.findFirst({
      where: { userId: user.id, expiresAt: { gte: new Date() } },
    });

    if (!hashedOtp) {
      throw new BadRequestException('OTP has expired or not sent');
    }

    const validOtp = await this.validateOtp(otp, hashedOtp.otp);

    if (!validOtp) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.prisma.oTP.deleteMany({ where: { userId: user.id } });

    const tokens = await this.authService.generateTokens({ userId: user.id, organizationId: user.organizationId });
    return { ...user, ...tokens };
  }
}
