import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'nestjs-prisma';
import { InstallmentHelperService } from '../../installment/installment.helper.service';
import { HelperService } from '../../principal-interest/calculation/helper.service';

@Injectable()
export class ReduceNumberOfInstallmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helperService: HelperService,
    private readonly installmentHelperService: InstallmentHelperService,
  ) {}
  async recalculate(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: true; disbursementDetails: true; product: true };
    }>,
  ) {
    // TODO review !!! @ms10596 recalculate for declining sometimes call declining equal and vice versa !!!
    const installments = this.installmentHelperService.getUnPaidInstallments(loanAccount.installments);
    const lastPaidInstallment = this.installmentHelperService.getLastPaidInstallment(loanAccount.installments);
    let outstandingPrincipal = new Decimal(loanAccount.principalBalance);
    let previousDueDate = lastPaidInstallment.dueDate;

    for (let i = 0; i < installments.length; i++) {
      const interestDue = this.helperService.calculateInterest(
        outstandingPrincipal,
        installments[i].dueDate,
        previousDueDate,
        loanAccount,
      );
      const principalDue = Decimal.min(
        new Decimal(installments[i].interestDue).plus(installments[i].principalDue).sub(interestDue),
        outstandingPrincipal,
      );

      installments[i].interestDue = new Decimal(interestDue.toFixed(2));
      installments[i].principalDue = new Decimal(principalDue.toFixed(2));

      outstandingPrincipal = outstandingPrincipal.sub(principalDue);
      previousDueDate = installments[i].dueDate;
    }
    return await this.prisma.$transaction(
      installments.map(({ id, interestDue, principalDue }) =>
        this.prisma.installment.update({
          where: { id },
          data: {
            principalDue,
            interestDue,
            state: +principalDue === 0 && +interestDue === 0 ? 'PAID' : 'PENDING',
          },
        }),
      ),
    );
  }
}
