import { Injectable, ConsoleLogger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CreateClientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: ConsoleLogger,
  ) {}
  async seed() {
    this.logger.log('Creating client');
    await this.prisma.client.create({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'mail@mail.com',
        phone: '0123456789',
        address: 'address',
        nationalId: '123456789',
        taxRecordId: '123456789',
        commercialName: 'Commercial Name',
        state: 'ACTIVE',
        notes: '',
        currentLimit: 1_000_000_000,
        approvedLimit: 1_000_000_000,
        initialLimit: 1_000_000_000,
        user: {
          connect: {
            email: 'agent@test.com',
          },
        },
        customFields: {
          industry: 'PHARMACY',
        },
      },
    });
  }
}
