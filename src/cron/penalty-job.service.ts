import { Injectable } from '@nestjs/common';
import { LoanManagementService } from '../loan-management/loan-management.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class PenaltyJobService {
  constructor(private readonly loanManagementService: LoanManagementService, private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updatePenalties() {
    console.log('start penalty cron');
    const loanAccountIds = await this.prisma.loanAccount.findMany({
      select: { id: true },
      where: {
        accountState: { in: ['ACTIVE', 'ACTIVE_IN_ARREARS'] },
      },
    });
    await loanAccountIds.map(({ id }) => this.loanManagementService.changeInstallmentsState(id));
    await loanAccountIds.map(({ id }) => this.loanManagementService.applyPenalty(id));
  }
}
