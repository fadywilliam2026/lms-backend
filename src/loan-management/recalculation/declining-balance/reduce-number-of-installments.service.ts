import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'nestjs-prisma';
import { DatesService } from '../../dates/dates.service';
import { DecliningBalanceDiscountedService } from '../../principal-interest/calculation/declining-balance-discounted.service';

@Injectable()
export class ReduceNumberOfInstallmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly decliningBalanceCalculationService: DecliningBalanceDiscountedService,
    private readonly datesService: DatesService,
  ) {}
  async recalculate(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: true; disbursementDetails: true; product: true };
    }>,
  ) {
    loanAccount.installments;
    const { interestRate } = loanAccount;
    const installments = loanAccount.installments.filter(installment => installment.state !== 'PAID');
    const lastPaidInstallment = loanAccount.installments
      .sort((a, b) => b.dueDate.valueOf() - a.dueDate.valueOf())
      .find(installment => installment.state === 'PAID');
    let outstandingPrincipal = new Decimal(loanAccount.principalBalance);
    let previousDueDate = lastPaidInstallment.dueDate;
    for (let i = 0; i < installments.length; i++) {
      const oldDue = Decimal.min(
        Decimal.add(installments[i].interestDue, installments[i].principalDue),
        outstandingPrincipal,
      );
      installments[i].interestDue = new Decimal(
        outstandingPrincipal
          .mul(interestRate / this.datesService.getDaysInYear(loanAccount.product.daysInYear) / 100)
          .mul(this.datesService.getDaysDifference(previousDueDate, installments[i].dueDate))
          .toFixed(2),
      );
      installments[i].principalDue = new Decimal(Decimal.sub(oldDue, installments[i].interestDue).toFixed(2));
      outstandingPrincipal = outstandingPrincipal.sub(installments[i].principalDue.plus(installments[i].interestDue));
      previousDueDate = installments[i].dueDate;
    }
    const newInstallments = this.decliningBalanceCalculationService.generateInterest({
      ...loanAccount,
      installments,
      disbursementDetails: {
        ...loanAccount.disbursementDetails,
        disbursementAt: lastPaidInstallment.dueDate,
      },
    });
    return await this.prisma.$transaction(
      newInstallments.map(({ id, interestDue, principalDue }) =>
        this.prisma.installment.update({
          where: { id },
          data: {
            principalDue,
            interestDue,
          },
        }),
      ),
    );
  }
}
