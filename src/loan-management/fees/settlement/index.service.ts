import { Injectable } from '@nestjs/common';
import { PredefinedFee, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class SettlementFeeService {
  getFees(fee: PredefinedFee, loanAccount: Prisma.LoanAccountGetPayload<{ include: { installments } }>) {
    switch (fee.amountCalculationMethod) {
      case 'FLAT':
        return fee.amount;
      case 'LOAN_AMOUNT_PERCENTAGE':
        return +new Decimal(loanAccount.loanAmount).mul(fee.percentageAmount / 100).toFixed(2);
      default:
        return 0;
    }
  }
}
