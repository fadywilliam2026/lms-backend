import { Injectable } from '@nestjs/common';
import { PredefinedFee, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { ipmt, irr } from 'financial';
import { InstallmentHelperService } from '../../installment/installment.helper.service';
import { AmountCalculationService } from './amount-calculation.service';

@Injectable()
export class AmortizationService {
  constructor(
    private readonly amountCalculationService: AmountCalculationService,
    private readonly installmentHelper: InstallmentHelperService,
  ) {}
  getFees(fee: PredefinedFee, loanAccount: Prisma.LoanAccountGetPayload<{ include: { installments } }>) {
    switch (fee.amortizationProfile) {
      // case 'EFFECTIVE_INTEREST_RATE':
      //   return this.effectiveInterestRate(fee, loanAccount);
      // case 'STRAIGHT_LINE':
      //   return this.straightLine(fee, loanAccount);
      // case 'SUM_OF_YEARS_DIGITS':
      //   return this.sumOfYearsDigits(fee, loanAccount);
      case 'NONE':
        return this.amountCalculationService.getAmount(fee, loanAccount);
      default:
        return 0;
    }
  }
  effectiveInterestRate(
    fee: PredefinedFee,
    loanAccount: Prisma.LoanAccountGetPayload<{ include: { installments: true } }>,
  ) {
    const { numInstallments, loanAmount, installments } = loanAccount;
    const eir = irr([
      -loanAmount + fee.amount,
      ...installments.map(installment => this.installmentHelper.getDueAmount(installment)),
    ]);
    return installments.map(
      (installment, i) =>
        +new Decimal(ipmt(eir, i + 1, numInstallments, -loanAmount + fee.amount))
          .sub(installment.interestDue)
          .toFixed(2),
    );
  }
  straightLine(fee: PredefinedFee, loanAccount: Prisma.LoanAccountGetPayload<{ include: { installments } }>) {
    const { numInstallments, installments } = loanAccount;
    const monthlyFee = +Decimal.div(this.amountCalculationService.getAmount(fee, loanAccount), numInstallments).toFixed(
      2,
    );
    return installments.map(() => monthlyFee);
  }
  sumOfYearsDigits(fee: PredefinedFee, loanAccount: Prisma.LoanAccountGetPayload<{ include: { installments } }>) {
    const { numInstallments } = loanAccount;
    const sumOfYears = (numInstallments ** 2 + numInstallments) / 2;
    const totalFees = new Decimal(this.amountCalculationService.getAmount(fee, loanAccount));
    return loanAccount.installments.map(
      (_, i) =>
        +totalFees
          .mul(numInstallments - i)
          .div(sumOfYears)
          .toFixed(2),
    );
  }
}
