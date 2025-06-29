import { ConsoleLogger, Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { CreateUserDto } from '../auth/dto/auth.dto';
import { Roles } from '../common/types/role';
import { PrismaService } from 'nestjs-prisma';
import { Holder, Transfer } from '@prisma/client';

@Injectable()
export class CreateUserService {
  constructor(
    private readonly auth: AuthService,
    private readonly logger: ConsoleLogger,
    private readonly prisma: PrismaService,
  ) {}
  async seed() {
    this.logger.log('Creating user');

    const partner = await this.prisma.organization.findFirst({
      where: {
        name: 'Agent Partner',
      },
    });

    const roles = await this.prisma.role.findMany();

    const users: CreateUserDto[] = [
      {
        email: 'agent@test.com',
        firstName: 'Agent',
        password: '12345678',
        lastName: 'user',
        phone: '2000',
        role: Roles.agent,
        organizationId: partner.id,
        roleId: roles.find(role => role.name === Roles.agent).id,
        controlOfCashFlow: Holder.partner,
        carrierOfPaymentRisk: Holder.partner,
        methodOfLoanRepayment: Transfer.partner,
      },
      {
        email: 'admin@test.com',
        firstName: 'Admin',
        password: '12345678',
        phone: '20000000000',
        role: Roles.admin,
        roleId: roles.find(role => role.name === Roles.admin).id,
        controlOfCashFlow: Holder.partner,
        carrierOfPaymentRisk: Holder.partner,
        methodOfLoanRepayment: Transfer.partner,
      },
      {
        email: 'flendid@test.com',
        firstName: 'Flend',
        password: '12345678',
        phone: '01234551297',
        role: Roles.agent,
        roleId: roles.find(role => role.name === Roles.agent).id,
        controlOfCashFlow: Holder.partner,
        carrierOfPaymentRisk: Holder.partner,
        methodOfLoanRepayment: Transfer.partner,
      },
    ];
    for (const user of users) await this.auth.createUser(null, user);
  }
}
