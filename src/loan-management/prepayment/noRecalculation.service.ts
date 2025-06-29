import { Injectable } from '@nestjs/common';
import uniq from 'lodash/uniq';
import without from 'lodash/without';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { IPrepayment } from './prepayment';
import { InstallmentHelperService } from '../installment/installment.helper.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class NoRecalculationService implements IPrepayment {
  constructor(
    private readonly prisma: PrismaService,
    private readonly installmentHelperService: InstallmentHelperService,
  ) {}
  async makePrepayment(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: { include: { loanAccount: { include: { product: true } } } } };
    }>,
    paymentAmount: Decimal,
    valueDate: Date,
  ) {
    const queries = [];
    const installments = this.installmentHelperService.getUnPaidInstallments(loanAccount.installments);
    for (const installment of installments) {
      if (paymentAmount.isZero()) break;
      const prepaymentAllocation = this.getPrepaymentAllocation(installment, paymentAmount);
      const {
        toPay: { feesToPay, principalToPay },
        state,
      } = prepaymentAllocation;
      paymentAmount = prepaymentAllocation.paymentAmount;
      queries.push(
        this.prisma.loanAccount.update({
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
            product: true,
            disbursementDetails: true,
            paymentPlans: true,
          },
          data: {
            principalPaid: {
              increment: principalToPay,
            },
            principalBalance: {
              decrement: principalToPay,
            },
            feesPaid: {
              increment: feesToPay,
            },
            feesBalance: {
              decrement: feesToPay,
            },
            installments: {
              update: {
                where: { id: installment.id },
                data: {
                  principalPaid: {
                    increment: principalToPay,
                  },
                  feesPaid: {
                    increment: feesToPay,
                  },
                  state: state as 'PAID' | 'PARTIALLY_PAID',
                  lastPaidDate: valueDate,
                },
              },
            },
          },
        }),
      );
    }
    const queryResult = await this.prisma.$transaction(queries);
    return { paymentAmount, loanAccount: queryResult.at(-1) };
  }

  getPrepaymentAllocation(
    installment: Prisma.InstallmentGetPayload<{ include: { loanAccount: { include: { product: true } } } }>,
    paymentAmount: Decimal,
  ) {
    const toPay = {
      principalToPay: 0,
      feesToPay: 0,
    };
    const repaymentAllocationOrder = without(
      uniq([...installment.loanAccount.product.installmentAllocationOrder, 'PRINCIPAL', 'FEES']),
      'INTEREST',
      'PENALTY',
    );
    for (const allocation of repaymentAllocationOrder) {
      if (paymentAmount.isZero()) break;
      const minAmount = Decimal.min(paymentAmount, installment[`${allocation.toLowerCase()}Due`]);
      toPay[`${allocation.toLowerCase()}ToPay`] = +minAmount.toFixed(2);
      paymentAmount = paymentAmount.sub(minAmount);
    }
    return {
      toPay,
      paymentAmount,
      state: 'PARTIALLY_PAID',
    };
  }
}
