import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'nestjs-prisma';
import { FinancialResource, GLAccountType, GLJournalEntryType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class RetainedEarningsJobService {
  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async updateNetProfit() {
    console.log('start net profit cron');
    const totalIncome = await this.prisma.gLJournalEntry
      .aggregate({
        where: {
          glAccount: {
            type: GLAccountType.INCOME,
          },
        },
        _sum: {
          amount: true,
        },
      })
      .then(totalIncome => totalIncome._sum.amount || new Decimal(0.0));

    const totalExpense = await this.prisma.gLJournalEntry
      .aggregate({
        where: {
          glAccount: {
            type: GLAccountType.EXPENSE,
          },
        },
        _sum: {
          amount: true,
        },
      })
      .then(totalExpense => totalExpense._sum.amount || new Decimal(0.0));

    const netProfit = totalIncome.sub(totalExpense);

    const retainedEarningsAccount = await this.prisma.gLAccount.findUnique({
      where: { name: FinancialResource.RETAINED_EARNINGS, type: GLAccountType.EQUITY },
    });

    const netProfitAccount = await this.prisma.gLAccount.findUnique({
      where: { name: FinancialResource.NET_PROFIT, type: GLAccountType.INCOME_EXPENSE },
    });

    const debitAccountId = +netProfit < 0 ? netProfitAccount.id : retainedEarningsAccount.id; //net profit debit;
    const creditAccountId = +netProfit > 0 ? retainedEarningsAccount.id : netProfitAccount.id; // net profti credit;

    await this.prisma.gLJournalEntry.createMany({
      data: [
        {
          amount: netProfit, //netprofit  //check if we can add it with -ve
          bookingDate: new Date(), //date.now
          type: GLJournalEntryType.DEBIT,
          glAccountId: debitAccountId,
        },
        {
          amount: netProfit, //netprofit  //check if we can add it with -ve
          bookingDate: new Date(), //date.now
          type: GLJournalEntryType.CREDIT,
          glAccountId: creditAccountId,
        },
      ],
    });
  }
}
