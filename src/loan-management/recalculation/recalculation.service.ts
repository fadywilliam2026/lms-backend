import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DecliningBalanceService } from './declining-balance/declining-balance.service';
import { DecliningBalanceDiscountedService } from './declining-balance-discounted/declining-balance-discounted.service';

@Injectable()
export class RecalculationService {
  constructor(
    private readonly decliningBalanceService: DecliningBalanceService,
    private readonly decliningBalanceDiscountedService: DecliningBalanceDiscountedService,
  ) {}
  recalculate(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: true; product: true; disbursementDetails: true; paymentPlans: true };
    }>,
  ) {
    switch (loanAccount.interestCalculationMethod) {
      case 'DECLINING_BALANCE_DISCOUNTED':
        return this.decliningBalanceDiscountedService.recalculate(loanAccount);
      case 'DECLINING_BALANCE':
        return this.decliningBalanceService.recalculate(loanAccount);
      default:
        throw new NotFoundException(`Unknown interest calculation method: ${loanAccount.interestCalculationMethod}`);
    }
  }
}
