import { Injectable, NotFoundException } from '@nestjs/common';
import { LoanAccount, PredefinedFee, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AmountCalculationService {
  getAmount(fee: PredefinedFee, loanAccount: Prisma.LoanAccountGetPayload<{ include: { installments: true } }>) {
    switch (fee.amountCalculationMethod) {
      case 'FLAT':
        return this.flat(fee, loanAccount);
      case 'LOAN_AMOUNT_PERCENTAGE':
        return this.loanAmountPercentage(fee, loanAccount);
      case 'INSTALLMENT_PRINCIPAL_AMOUNT_PERCENTAGE':
        return this.installmentPrincipalAmountPercentage(fee, loanAccount);
      default:
        throw new NotFoundException(`Unknown amount calculation method: ${fee.amountCalculationMethod}`);
    }
  }
  flat(fee: PredefinedFee, loanAccount: LoanAccount) {
    return Array(loanAccount.numInstallments).fill(+new Decimal(fee.amount).toFixed(2));
  }
  loanAmountPercentage(fee: PredefinedFee, loanAccount: LoanAccount) {
    return Array(loanAccount.numInstallments).fill(
      +new Decimal(loanAccount.loanAmount).mul(fee.percentageAmount / 100).toFixed(2),
    );
  }
  installmentPrincipalAmountPercentage(
    fee: PredefinedFee,
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { installments: true } }>,
  ) {
    return loanAccount.installments.map(
      installment => +new Decimal(installment.principalDue).mul(fee.percentageAmount / 100).toFixed(2),
    );
  }
}
