import { Injectable } from '@nestjs/common';
import { FinancialResource, GLJournalEntryType, Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class RescheduleTransactionService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.XOR<Prisma.LoanTransactionCreateInput, Prisma.LoanTransactionUncheckedCreateInput>) {
    return this.prisma.loanTransaction.create({
      data: {
        ...data,
        gLJournalEntry: {
          createMany: {
            data: [
              ...(await this.createPrincipalEntry(data)),
              ...(await this.createFeesEntry(data)),
              ...(await this.createInterestEntry(data)),
              ...(await this.createPenaltyEntry(data)),
            ],
          },
        },
      },
    });
  }
  async createPrincipalEntry(data: Prisma.LoanTransactionCreateInput) {
    return data.principalAmount
      ? await this.createEntry(
          { ...data, amount: data.principalAmount },
          FinancialResource.WRITE_OFF_EXPENSE,
          FinancialResource.PORTFOLIO_CONTROL,
        )
      : [];
  }
  async createFeesEntry(data: Prisma.LoanTransactionCreateInput) {
    return data.feesAmount
      ? await this.createEntry(
          { ...data, amount: data.feesAmount },
          FinancialResource.PORTFOLIO_CONTROL,
          FinancialResource.FEE_INCOME,
        )
      : [];
  }
  async createInterestEntry(data: Prisma.LoanTransactionCreateInput) {
    return data.interestAmount
      ? await this.createEntry(
          { ...data, amount: data.interestAmount },
          FinancialResource.PORTFOLIO_CONTROL,
          FinancialResource.INTEREST_INCOME,
        )
      : [];
  }
  async createPenaltyEntry(data: Prisma.LoanTransactionCreateInput) {
    return data.penaltyAmount
      ? await this.createEntry(
          { ...data, amount: data.penaltyAmount },
          FinancialResource.PORTFOLIO_CONTROL,
          FinancialResource.PENALTY_INCOME,
        )
      : [];
  }

  async createEntry(
    data: Prisma.XOR<Prisma.LoanTransactionCreateInput, Prisma.LoanTransactionUncheckedCreateInput>,
    debit: FinancialResource,
    credit: FinancialResource,
  ) {
    const { product } = await this.prisma.loanAccount.findUnique({
      where: { id: data.loanAccountId },
      select: { product: { select: { id: true } } },
    });
    const [debitRecord, creditRecord] = await this.prisma.$transaction([
      this.prisma.gLAccountingRule.findUnique({
        where: { loanProductId_financialResource: { loanProductId: product.id, financialResource: debit } },
        select: { glAccountId: true },
      }),
      this.prisma.gLAccountingRule.findUnique({
        where: { loanProductId_financialResource: { loanProductId: product.id, financialResource: credit } },
        select: { glAccountId: true },
      }),
    ]);
    return [
      {
        amount: data.amount,
        bookingDate: data.entryDate,
        type: GLJournalEntryType.DEBIT,
        glAccountId: debitRecord.glAccountId,
        loanProductId: product.id,
        loanAccountId: data.loanAccountId,
      },
      {
        amount: data.amount,
        bookingDate: data.entryDate,
        type: GLJournalEntryType.CREDIT,
        glAccountId: creditRecord.glAccountId,
        loanProductId: product.id,
        loanAccountId: data.loanAccountId,
      },
    ];
  }
}
