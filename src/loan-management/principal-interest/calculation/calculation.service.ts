import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DecliningBalanceDiscountedService } from './declining-balance-discounted.service';
import { DecliningBalanceService } from './declining-balance.service';
import { FlatService } from './flat.service';

@Injectable()
export class CalculationService {
  constructor(
    private readonly decliningBalance: DecliningBalanceService,
    private readonly decliningBalanceDiscounted: DecliningBalanceDiscountedService,
    private readonly flat: FlatService,
  ) {}

  generateInstallments(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { disbursementDetails: true; product: true; paymentPlans: true };
    }>,
  ) {
    switch (loanAccount.interestCalculationMethod) {
      case 'FLAT':
        return this.flat.generateInstallments(loanAccount);
      case 'DECLINING_BALANCE':
        return this.decliningBalance.generateInstallments(loanAccount);
      case 'DECLINING_BALANCE_DISCOUNTED':
        if (loanAccount.paymentPlans?.length > 0)
          throw new ConflictException(`Not possible to have a payment plan with equqal installments`);
        if (loanAccount.disbursementDetails.firstInstallmentAt)
          throw new ConflictException(`Not possible to have a custom first installment date with equqal installments`);
        return this.decliningBalanceDiscounted.generateInstallments(loanAccount);
      default:
        throw new NotFoundException(`Unknown interest calculation method: ${loanAccount.interestCalculationMethod}`);
    }
  }
}
