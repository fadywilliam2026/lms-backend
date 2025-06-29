import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NoRecalculationService } from './no-recalculation.service';
import { ReduceAmountPerInstallmentService } from './reduce-amount-per-installment.service';
import { ReduceNumberOfInstallmentsService } from './reduce-number-of-installments.service';

@Injectable()
export class DecliningBalanceService {
  constructor(
    private readonly noRecalculationService: NoRecalculationService,
    private readonly reduceAmountPerInstallmentService: ReduceAmountPerInstallmentService,
    private readonly reduceNumberOfInstallmentsService: ReduceNumberOfInstallmentsService,
  ) {}

  async recalculate(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: true; disbursementDetails: true; product: true; paymentPlans: true };
    }>,
  ) {
    switch (loanAccount.prepaymentRecalculationMethod) {
      case 'NO_RECALCULATION':
        return this.noRecalculationService.recalculate(loanAccount);
      case 'REDUCE_AMOUNT_PER_INSTALLMENT':
        return this.reduceAmountPerInstallmentService.recalculate(loanAccount);
      case 'REDUCE_NUMBER_OF_INSTALLMENTS':
        return this.reduceNumberOfInstallmentsService.recalculate(loanAccount);
      default:
        return;
    }
  }
}
