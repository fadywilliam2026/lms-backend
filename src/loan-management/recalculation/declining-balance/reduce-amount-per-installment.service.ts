import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { InstallmentHelperService } from '../../installment/installment.helper.service';
import { DecliningBalanceService } from '../../principal-interest/calculation/declining-balance.service';

@Injectable()
export class ReduceAmountPerInstallmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly decliningBalanceCalculationService: DecliningBalanceService,
    private readonly installmentHelperService: InstallmentHelperService,
  ) {}
  async recalculate(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: true; disbursementDetails: true; product: true; paymentPlans: true };
    }>,
  ) {
    const installments = loanAccount.installments.filter(installment => installment.state === 'PENDING');
    const lastPartiallyPaidInstallment = loanAccount.installments.find(
      installment => installment.state === 'PARTIALLY_PAID',
    );
    const lastPaidInstallment = this.installmentHelperService.getLastPaidInstallment(loanAccount.installments);
    const newPrincipalInstallments = this.decliningBalanceCalculationService.generateInstallmentsWithExistingDates(
      {
        ...loanAccount,
        loanAmount: loanAccount.principalBalance,
        numInstallments: installments.length,
        disbursementDetails: {
          ...loanAccount.disbursementDetails,
          disbursementAt: lastPartiallyPaidInstallment.lastPaidDate,
        },
      },
      installments,
    );

    const newInstallmentInterest = this.decliningBalanceCalculationService.generateInterest({
      ...loanAccount,
      loanAmount: loanAccount.principalBalance,
      numInstallments: newPrincipalInstallments.length,
      disbursementDetails: {
        ...loanAccount.disbursementDetails,
        disbursementAt: lastPaidInstallment.dueDate,
      },
      installments: [lastPartiallyPaidInstallment, ...newPrincipalInstallments],
    });
    return await this.prisma.$transaction(
      newInstallmentInterest.map(({ id, interestDue, principalDue }) =>
        this.prisma.installment.update({
          where: { id },
          data: {
            interestDue: +interestDue.toFixed(2),
            principalDue: +principalDue.toFixed(2),
          },
        }),
      ),
    );
  }
}
