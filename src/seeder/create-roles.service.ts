import { Injectable, ConsoleLogger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CreateRolesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: ConsoleLogger,
  ) {}
  async seed() {
    this.logger.log('Creating roles');
    await this.prisma.role.createMany({
      data: [
        {
          name: 'admin',
          permissions: ['create:Users', 'create:LoanProducts', 'read:LoanProducts', 'update:LoanProducts'],
        },
        { name: 'moderator', permissions: ['create:Users'] },
        { name: 'financial', permissions: ['disburse:LoanAccount'] },
        { name: 'checker', permissions: ['approve:LoanAccount'] },
        {
          name: 'agent',
          permissions: [
            'create:Users',
            'create:Clients', // s at the end mean can read all clients (created by me and others)
            'read:Clients',
            'update:Clients',
            'create:Documents',
            'read:Documents',
            'update:Documents',
            'read:LoanProducts',
            'read:Organization',
            'read:LoanAccount',
            'update:LoanAccount',
            'create:LoanAccounts',
          ],
        },
        { name: 'reporting', permissions: [] },
        { name: 'teller', permissions: [] },
        { name: 'support', permissions: [] },
        { name: 'delivery', permissions: [] },
      ],
    });
  }
}
