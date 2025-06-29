import { Injectable } from '@nestjs/common';
import { FinancialResource, GLJournalEntryType, Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class FeeChargedTransactionService {
  constructor(private readonly prisma: PrismaService) {}
  async create(data: Prisma.XOR<Prisma.LoanTransactionCreateInput, Prisma.LoanTransactionUncheckedCreateInput>) {
    const { product } = await this.prisma.loanAccount.findUnique({
      where: { id: data.loanAccountId },
      select: { product: { select: { id: true } } },
    });
    const [debit, credit] = await this.prisma.$transaction([
      this.prisma.gLAccountingRule.findUnique({
        where: {
          loanProductId_financialResource: {
            loanProductId: product.id,
            financialResource: FinancialResource.TRANSACTION_SOURCE,
          },
        },
        select: { glAccountId: true },
      }),
      this.prisma.gLAccountingRule.findUnique({
        where: {
          loanProductId_financialResource: {
            loanProductId: product.id,
            financialResource: FinancialResource.FEE_INCOME,
          },
        },
        select: { glAccountId: true },
      }),
    ]);
    return await this.prisma.loanTransaction.create({
      data: {
        ...data,
        gLJournalEntry: {
          createMany: {
            data: [
              {
                amount: data.amount,
                bookingDate: data.entryDate,
                type: GLJournalEntryType.DEBIT,
                glAccountId: debit.glAccountId,
                loanProductId: product.id,
                loanAccountId: data.loanAccountId,
              },
              {
                amount: data.amount,
                bookingDate: data.entryDate,
                type: GLJournalEntryType.CREDIT,
                glAccountId: credit.glAccountId,
                loanProductId: product.id,
                loanAccountId: data.loanAccountId,
              },
            ],
          },
        },
      },
    });
  }
}
