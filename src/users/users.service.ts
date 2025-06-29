import { HttpService } from '@nestjs/axios';
import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { WebhookDto } from './webhook.dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prismaService: PrismaService,
  ) {}

  async addUserWebHook(user: User, webhook: WebhookDto) {
    return await this.prismaService
      .$transaction(async prisma => {
        await this.httpService.axiosRef.post(webhook.url, {
          message: 'ping',
        });

        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            webhookUrl: webhook.url,
          },
        });
        return { status: 'webhook successfully set!' };
      })
      .catch(() => {
        throw new UnprocessableEntityException('Could not set webhook');
      });
  }
}
