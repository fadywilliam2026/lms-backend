import { Injectable } from '@nestjs/common';
import { FinancialResource, GLJournalEntryType, Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { PrismaTransaction } from '../loan-management/loan-management.service';
import { RetainedEarningsJobService } from '../cron/retained-earnings-job.service';

@Injectable()
export class RepaymentTransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly retainedEarningsJobService: RetainedEarningsJobService,
  ) {}
  async create(
    data: Prisma.XOR<Prisma.LoanTransactionCreateInput, Prisma.LoanTransactionUncheckedCreateInput>,
    txnPrisma: PrismaTransaction = this.prisma,
  ) {
    return await txnPrisma.loanTransaction.create({
      data: {
        ...data,
        gLJournalEntry: {
          createMany: {
            data: [
              ...(await this.createPrincipalEntry(data)),
              ...(await this.createFeesEntry(data)),
              ...(await this.createInterestEntry(data)),
              ...(await this.createPenaltyEntry(data)),
              ...(await this.createCommissionEntry(data)),
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
          FinancialResource.TRANSACTION_SOURCE,
          FinancialResource.PORTFOLIO_CONTROL,
        )
      : [];
  }
  async createFeesEntry(data: Prisma.LoanTransactionCreateInput) {
    return data.feesAmount
      ? await this.createEntry(
          { ...data, amount: data.feesAmount },
          FinancialResource.TRANSACTION_SOURCE,
          FinancialResource.FEE_INCOME,
        )
      : [];
  }
  async createInterestEntry(data: Prisma.LoanTransactionCreateInput) {
    return data.interestAmount
      ? await this.createEntry(
          { ...data, amount: data.interestAmount },
          FinancialResource.TRANSACTION_SOURCE,
          FinancialResource.INTEREST_INCOME,
        )
      : [];
  }
  async createPenaltyEntry(data: Prisma.LoanTransactionCreateInput) {
    return data.penaltyAmount
      ? await this.createEntry(
          { ...data, amount: data.penaltyAmount },
          FinancialResource.TRANSACTION_SOURCE,
          FinancialResource.PENALTY_INCOME,
        )
      : [];
  }

  async createCommissionEntry(data: Prisma.LoanTransactionCreateInput) {
    return data.organizationCommissionAmount
      ? await this.createEntry(
          { ...data, amount: data.organizationCommissionAmount },
          FinancialResource.PARTNER_COMMISSION_EXPENSE,
          FinancialResource.TRANSACTION_SOURCE,
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
    const debitRecord = await this.prisma.gLAccountingRule.findUnique({
      where: { loanProductId_financialResource: { loanProductId: product.id, financialResource: debit } },
      select: { glAccountId: true },
    });
    const creditRecord = await this.prisma.gLAccountingRule.findUnique({
      where: { loanProductId_financialResource: { loanProductId: product.id, financialResource: credit } },
      select: { glAccountId: true },
    });

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
