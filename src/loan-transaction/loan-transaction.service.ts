import { Injectable, NotAcceptableException } from '@nestjs/common';
import { GLAccountType, GLJournalEntryType, LoanTransactionType, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'nestjs-prisma';
import { CreateGLJournalEntryDTO } from '../gl/dto/gl-journal-entry.dto';
import { DisbursementTransactionService } from './disbursement-transaction.service';
import { FeeChargedTransactionService } from './fee-charged.service';
import { RepaymentTransactionService } from './repayment-transaction.service';
import { WriteOffTransactionService } from './write-off-transaction.service';
import { RescheduleTransactionService } from './reschedule-transaction.service';
import { PrismaTransaction } from '../loan-management/loan-management.service';

@Injectable()
export class LoanTransactionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly disbursementTransaction: DisbursementTransactionService,
    private readonly repaymentTransaction: RepaymentTransactionService,
    private readonly writeOffTransaction: WriteOffTransactionService,
    private readonly feeChargedTransaction: FeeChargedTransactionService,
    private readonly rescheduleTransaction: RescheduleTransactionService,
  ) {}
  async create(args: Prisma.LoanTransactionCreateArgs, txnPrisma: PrismaTransaction = this.prisma) {
    switch (args.data.type) {
      case LoanTransactionType.DISBURSEMENT:
        return this.disbursementTransaction.create(args.data);
      case LoanTransactionType.WRITE_OFF:
        return this.writeOffTransaction.create(args.data);
      case LoanTransactionType.REPAYMENT: {
        return this.repaymentTransaction.create(args.data, txnPrisma);
      }
      case LoanTransactionType.FEE: {
        return this.feeChargedTransaction.create(args.data);
      }
      case LoanTransactionType.PAYMENT_RESCHEDULE:
        return this.rescheduleTransaction.create(args.data);
      default:
        return this.prisma.loanTransaction.create(args);
    }
  }
  async createManualTransaction(userId: number, data: CreateGLJournalEntryDTO) {
    if (await this.isBalanced(data)) {
      return await this.prisma.loanTransaction.create({
        data: {
          amount: +Decimal.sum(...[0, ...data.credits.map(c => c.amount)])
            .sub(Decimal.sum(...[0, ...data.debits.map(c => c.amount)]))
            .valueOf(),
          type: LoanTransactionType.TRANSFER,
          entryDate: data.date,
          userId,
          comment: data.notes,
          gLJournalEntry: {
            createMany: {
              data: [
                ...data.credits.map(entry => ({
                  amount: entry.amount,
                  bookingDate: data.date,
                  glAccountId: entry.glAccountId,
                  notes: data.notes,
                  userId,
                  type: GLJournalEntryType.CREDIT,
                })),
                ...data.debits.map(entry => ({
                  amount: entry.amount,
                  bookingDate: data.date,
                  glAccountId: entry.glAccountId,
                  notes: data.notes,
                  userId,
                  type: GLJournalEntryType.DEBIT,
                })),
              ],
            },
          },
        },
      });
    } else throw new NotAcceptableException('The transaction is not balanced');
  }
  async isBalanced(data: CreateGLJournalEntryDTO) {
    const accounts = await this.prisma.gLAccount.findMany({
      where: {
        id: {
          in: data.credits.map(c => c.glAccountId).concat(data.debits.map(d => d.glAccountId)),
        },
      },
      select: {
        id: true,
        type: true,
      },
    });

    const accountsCredited = data.credits.map(element => ({
      ...element,
      type: accounts.find(a => a.id === element.glAccountId).type,
    }));
    const accountsDebited = data.debits.map(element => ({
      ...element,
      type: accounts.find(a => a.id === element.glAccountId).type,
    }));

    const asset = this.getAccountingElementValue(accountsCredited, accountsDebited, GLAccountType.ASSET);
    const liability = this.getAccountingElementValue(accountsCredited, accountsDebited, GLAccountType.LIABILITY);
    const equity = this.getAccountingElementValue(accountsCredited, accountsDebited, GLAccountType.EQUITY);
    const income = this.getAccountingElementValue(accountsCredited, accountsDebited, GLAccountType.INCOME);
    const expense = this.getAccountingElementValue(accountsCredited, accountsDebited, GLAccountType.EXPENSE);
    // asset - liability === equity + income - expense;
    return asset.sub(liability).eq(equity.add(income).sub(expense));
  }
  getAccountingElementValue(
    credits: { amount: number; glAccountId?: number; type?: GLAccountType }[],
    debits: { amount: number; glAccountId?: number; type?: GLAccountType }[],
    element: GLAccountType,
  ) {
    const filteredCredits = credits.filter(c => c.type === element).map(row => row.amount);
    const newCredits = filteredCredits.length > 0 ? filteredCredits : [0];

    const filteredDebits = debits.filter(d => d.type === element).map(row => row.amount);
    const newDebits = filteredDebits.length > 0 ? filteredDebits : [0];

    if (element === GLAccountType.ASSET || element === GLAccountType.EXPENSE) {
      return Decimal.sum(...newDebits).sub(Decimal.sum(...newCredits));
    }

    return Decimal.sum(...newCredits).sub(Decimal.sum(...newDebits));
  }

  getClientLoanTransaction(clientId: number) {
    return this.prisma.loanTransaction.findMany({
      where: {
        loanAccount: {
          clientId: clientId,
          accountState: {
            equals: 'ACTIVE_IN_ARREARS',
          },
        },
      },
    });
  }
}
