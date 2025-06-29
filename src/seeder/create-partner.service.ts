import { ConsoleLogger, Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CreatePartnerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: ConsoleLogger,
  ) {}

  async seed() {
    this.logger.log('Creating partner');
    await this.prisma.organization.create({
      data: {
        name: 'Agent Partner',
      },
    });
  }
}
