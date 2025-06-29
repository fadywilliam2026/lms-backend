import { Injectable, NotFoundException } from '@nestjs/common';
import { PredefinedFee, Prisma } from '@prisma/client';

import { AmountCalculationService } from './amount-calculation.service';

@Injectable()
export class AmortizationService {
  constructor(private readonly amountCalculationService: AmountCalculationService) {}

  getFees(fee: PredefinedFee, loanAccount: Prisma.LoanAccountGetPayload<{ include: { installments: true } }>) {
    switch (fee.amortizationProfile) {
      case 'NONE':
        return this.none(fee, loanAccount);
      default:
        throw new NotFoundException(`Unknown amortization profile: ${fee.amortizationProfile}`);
    }
  }
  none(fee: PredefinedFee, loanAccount: Prisma.LoanAccountGetPayload<{ include: { installments: true } }>) {
    return this.amountCalculationService.getAmount(fee, loanAccount);
  }
}
