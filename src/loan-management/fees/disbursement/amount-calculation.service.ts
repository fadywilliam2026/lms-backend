import { Injectable, NotFoundException } from '@nestjs/common';
import { LoanAccount, PredefinedFee } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AmountCalculationService {
  getAmount(fee: PredefinedFee, loanAccount: LoanAccount) {
    switch (fee.amountCalculationMethod) {
      case 'FLAT':
        return this.flat(fee);
      case 'LOAN_AMOUNT_PERCENTAGE':
        return this.loanAmountPercentage(fee, loanAccount);
      default:
        throw new NotFoundException(`Unknown amount calculation method: ${fee.amountCalculationMethod}`);
    }
  }
  flat(fee: PredefinedFee) {
    return +new Decimal(fee.amount).toFixed(2);
  }
  loanAmountPercentage(fee: PredefinedFee, loanAccount: LoanAccount) {
    return +new Decimal(loanAccount.loanAmount).mul(fee.percentageAmount / 100).toFixed(2);
  }
}
