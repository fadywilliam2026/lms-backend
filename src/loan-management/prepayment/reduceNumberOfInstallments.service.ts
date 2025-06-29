import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';
import { IPrepayment } from './prepayment';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ReduceNumberOfInstallmentsService implements IPrepayment {
  constructor(private readonly prisma: PrismaService) {}

  async makePrepayment(
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { installments: { include: { loanAccount } } } }>,
    payment: Decimal,
    valueDate: Date,
  ) {
    const lastPaidInstallment = loanAccount.installments
      .sort((a, b) => b.dueDate.valueOf() - a.dueDate.valueOf())
      .find(installment => installment.state === 'PAID');
    loanAccount = await this.prisma.loanAccount.update({
      where: { id: lastPaidInstallment.loanAccountId },
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
          increment: +payment.toFixed(2),
        },
        principalBalance: {
          decrement: +payment.toFixed(2),
        },
        installments: {
          update: {
            where: { id: lastPaidInstallment.id },
            data: {
              principalPaid: {
                increment: +payment.toFixed(2),
              },
              lastPaidDate: valueDate,
            },
          },
        },
      },
    });
    return {
      paymentAmount: new Decimal(0),
      loanAccount,
    };
  }
}
