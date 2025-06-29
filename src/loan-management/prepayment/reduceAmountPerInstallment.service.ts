import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { IPrepayment } from './prepayment';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ReduceAmountPerInstallmentService implements IPrepayment {
  constructor(private readonly prisma: PrismaService) {}
  async makePrepayment(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: { include: { loanAccount } } };
    }>,
    paymentAmount: Decimal,
    valueDate: Date,
  ) {
    const installment = loanAccount.installments
      .sort((a, b) => a.dueDate.valueOf() - b.dueDate.valueOf())
      .find(installment => installment.state !== 'PAID');

    const {
      toPay: { feesToPay, principalToPay },
      paymentAmount: newPaymentAmount,
    } = this.getPrepaymentAllocation(installment, paymentAmount);
    loanAccount = await this.prisma.loanAccount.update({
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
              state: 'PARTIALLY_PAID',
              lastPaidDate: valueDate,
            },
          },
        },
      },
    });
    return {
      paymentAmount: newPaymentAmount,
      loanAccount,
    };
  }

  getPrepaymentAllocation(
    installment: Prisma.InstallmentGetPayload<{
      include: { loanAccount };
    }>,
    paymentAmount: Decimal,
  ) {
    const toPay = {
      principalToPay: 0,
      feesToPay: 0,
    };
    const repaymentAllocationOrder = ['FEES'];
    for (const allocation of repaymentAllocationOrder) {
      if (paymentAmount.isZero()) break;
      const minAmount = Decimal.min(paymentAmount, installment[`${allocation.toLowerCase()}Due`]);
      toPay[`${allocation.toLowerCase()}ToPay`] = +minAmount.toFixed(2);
      paymentAmount = paymentAmount.sub(minAmount);
    }
    toPay.principalToPay = +paymentAmount.toFixed(2);
    paymentAmount = new Decimal(0);
    return { toPay, paymentAmount };
  }
}
