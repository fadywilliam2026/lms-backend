import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { InstallmentHelperService } from './installment.helper.service';
import { LoanTransactionType, Prisma, AccountState } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { LoanTransactionService } from '../../loan-transaction/loan-transaction.service';
import moment from 'moment';
import { PrismaTransaction } from '../loan-management.service';
@Injectable()
export class InstallmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly installmentHelper: InstallmentHelperService,
    private readonly loanTransactionService: LoanTransactionService,
  ) {}

  async createInstallments(
    loanAccountId: number,
    data: Prisma.LoanAccountGetPayload<{ include: { installments: true; disbursementDetails: true } }>,
    txnPrisma: PrismaTransaction = this.prisma,
    ignoreDisbursementFees: boolean = false,
  ) {
    const disbursementFees = +data.feesDue;
    if (!ignoreDisbursementFees && disbursementFees > 0) {
      await this.loanTransactionService.create({
        data: {
          amount: disbursementFees,
          entryDate: data.disbursementDetails.disbursementAt || new Date(),
          type: LoanTransactionType.FEE,
          loanAccountId,
          userId: data.userId,
        },
      });
    }

    return await txnPrisma.loanAccount.update({
      where: { id: loanAccountId },
      data: {
        principalDue: data.principalDue,
        interestDue: data.interestDue,
        feesDue: data.feesDue,
        feesPaid: disbursementFees,
        feesBalance: data.feesDue.sub(disbursementFees),
        principalBalance: data.principalDue,
        interestBalance: data.interestDue,
        installments: {
          createMany: {
            data: data.installments,
          },
        },
      },
      include: { installments: true, product: { include: { predefinedFees: true } } },
    });
  }

  makeRepayment(
    installment: Prisma.InstallmentGetPayload<{ include: { loanAccount: { include: { product: true } } } }>,
    paymentAmount: Decimal,
    valueDate: Date,
  ) {
    const {
      paymentAmount: newPaymentAmount,
      toPay: { feesToPay, interestToPay, penaltyToPay, principalToPay },
      state,
    } = this.installmentHelper.getPaymentAllocation(installment, paymentAmount);

    const daysLate = this.installmentHelper.getDaysLate(installment, moment(valueDate));
    const inGracePeriod = daysLate <= installment.loanAccount.gracePeriod;

    return {
      paymentAmount: newPaymentAmount,
      query: this.prisma.loanAccount.update({
        where: { id: installment.loanAccountId },
        include: {
          installments: {
            include: {
              loanAccount: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
        data: {
          interestPaid: {
            increment: interestToPay,
          },
          interestBalance: {
            decrement: interestToPay,
          },
          feesPaid: {
            increment: feesToPay,
          },
          feesBalance: {
            decrement: feesToPay,
          },
          penaltyDue: {
            decrement: inGracePeriod ? penaltyToPay : Number(0), // if not late decrement by penalty to pay else 0
          },
          penaltyPaid: {
            increment: inGracePeriod ? Number(0) : penaltyToPay,
          },
          penaltyBalance: {
            decrement: inGracePeriod ? penaltyToPay : Number(0),
          },
          principalPaid: {
            increment: principalToPay,
          },
          principalBalance: {
            decrement: principalToPay,
          },
          installments: {
            update: {
              where: { id: installment.id },
              data: {
                interestPaid: {
                  increment: interestToPay,
                },
                feesPaid: {
                  increment: feesToPay,
                },
                penaltyDue: {
                  decrement: inGracePeriod ? penaltyToPay : Number(0),
                },
                penaltyPaid: {
                  increment: inGracePeriod ? Number(0) : penaltyToPay,
                },
                principalPaid: {
                  increment: principalToPay,
                },
                state,
                lastPaidDate: valueDate,
                repaidDate: state === 'PAID' ? valueDate : null,
              },
            },
          },
        },
      }),
    };
  }

  applyPenalty(installment: Prisma.InstallmentGetPayload<{ include: { loanAccount: { include: { product } } } }>) {
    const daysLate = this.installmentHelper.getDaysLate(installment);
    if (daysLate > installment.loanAccount.gracePeriod) {
      const penaltyDue = +this.installmentHelper.getPenaltyPerDay(installment).mul(daysLate).toFixed(2);
      return this.prisma.installment.update({
        where: { id: installment.id },
        data: {
          penaltyDue,
          loanAccount: {
            update: {
              penaltyDue: {
                increment: new Decimal(penaltyDue).sub(installment.penaltyDue),
              },
              penaltyBalance: {
                increment: new Decimal(penaltyDue).sub(installment.penaltyDue),
              },
            },
          },
        },
      });
    }
  }

  changeInstallmentState(installment: Prisma.InstallmentGetPayload<{ include: { loanAccount: true } }>) {
    if (this.installmentHelper.isLate(installment)) {
      if (installment.loanAccount.accountState === AccountState.ACTIVE_IN_ARREARS)
        return this.prisma.installment.update({
          where: { id: installment.id },
          data: { state: 'LATE' },
        });
      else
        return this.prisma.installment.update({
          where: { id: installment.id },
          data: {
            state: 'LATE',
            loanAccount: {
              update: {
                accountState: 'ACTIVE_IN_ARREARS',
                setToArrearsAt: new Date(),
              },
            },
          },
        });
    } else if (this.installmentHelper.isGrace(installment)) {
      return this.prisma.installment.update({
        where: { id: installment.id },
        data: {
          state: 'GRACE',
        },
      });
    }
  }
}
