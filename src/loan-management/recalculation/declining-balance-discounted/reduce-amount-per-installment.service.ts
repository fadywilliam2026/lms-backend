import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { DecliningBalanceDiscountedService } from '../../principal-interest/calculation/declining-balance-discounted.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ReduceAmountPerInstallmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly decliningBalanceCalculationService: DecliningBalanceDiscountedService,
  ) {}
  async recalculate(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: true; disbursementDetails: true; product: true };
    }>,
  ) {
    let installments = loanAccount.installments
      .filter(installment => installment.state !== 'PAID' && +installment.principalPaid === 0)
      .sort((a, b) => a.dueDate.valueOf() - b.dueDate.valueOf());
    const lastPaidInstallment = loanAccount.installments
      .sort((a, b) => b.dueDate.valueOf() - a.dueDate.valueOf())
      .find(installment => installment.state === 'PAID');

    const newPrincipalInstallments = this.decliningBalanceCalculationService.generateInstallmentsWithExistingDates(
      {
        ...loanAccount,
        loanAmount: loanAccount.principalBalance,
        numInstallments: installments.length,
        disbursementDetails: {
          ...loanAccount.disbursementDetails,
          disbursementAt: lastPaidInstallment.lastPaidDate,
        },
      },
      installments,
    );

    installments = installments.map((installment, i) => ({
      ...installment,
      principalDue: new Decimal(newPrincipalInstallments[i].principalDue),
      interestDue: new Decimal(newPrincipalInstallments[i].interestDue),
    }));
    return await this.prisma.$transaction(
      installments.map(({ id, interestDue, principalDue }) =>
        this.prisma.installment.update({
          where: { id },
          data: {
            interestDue,
            principalDue,
          },
        }),
      ),
    );
  }
}
