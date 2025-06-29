import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import moment = require('moment');
import { InstallmentService } from '../installment/installment.service';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService, private readonly installmentService: InstallmentService) {}
  // pay installments in the past first

  async makeRepayment(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: { include: { loanAccount: { include: { product: true } } } } };
    }>,
    paymentAmount: Decimal,
    valueDate: Date,
  ) {
    const queries = [];
    for (const installment of loanAccount.installments) {
      if (
        moment(valueDate).isSameOrAfter(installment.dueDate) &&
        paymentAmount.isPositive() &&
        installment.state !== 'PAID'
      ) {
        const { paymentAmount: newPaymentAmount, query } = this.installmentService.makeRepayment(
          installment,
          paymentAmount,
          valueDate,
        );
        paymentAmount = newPaymentAmount;
        queries.push(query);
      } else break;
    }
    const queryResult = await this.prisma.$transaction(queries);
    loanAccount = queryResult.at(-1) || loanAccount;
    return { paymentAmount, loanAccount };
  }
}
