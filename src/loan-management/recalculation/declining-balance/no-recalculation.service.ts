import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { InstallmentHelperService } from '../../installment/installment.helper.service';
import { DecliningBalanceService } from '../../principal-interest/calculation/declining-balance.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class NoRecalculationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly decliningBalanceCalculationService: DecliningBalanceService,
    private readonly installmentHelperService: InstallmentHelperService,
  ) {}
  async recalculate(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: true; disbursementDetails: true; product: true };
    }>,
  ) {
    const installments = this.installmentHelperService.getUnPaidInstallments(loanAccount.installments);
    const lastPaidInstallment = this.installmentHelperService.getLastPaidInstallment(loanAccount.installments);
    const newInstallments = this.decliningBalanceCalculationService.generateInterest({
      ...loanAccount,
      loanAmount: loanAccount.principalBalance,
      numInstallments: installments.length,
      disbursementDetails: {
        ...loanAccount.disbursementDetails,
        disbursementAt: lastPaidInstallment.lastPaidDate,
      },
      installments,
    });
    return await this.prisma.$transaction(
      newInstallments.map(({ id, interestDue }) =>
        this.prisma.installment.update({
          where: { id },
          data: {
            interestDue: new Decimal(interestDue.toFixed(2)),
          },
        }),
      ),
    );
  }
}
