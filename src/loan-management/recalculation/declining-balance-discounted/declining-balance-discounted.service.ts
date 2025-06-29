import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ReduceAmountPerInstallmentService } from './reduce-amount-per-installment.service';
import { ReduceNumberOfInstallmentsService } from './reduce-number-of-installments.service';

@Injectable()
export class DecliningBalanceDiscountedService {
  constructor(
    private readonly reduceAmountPerInstallmentService: ReduceAmountPerInstallmentService,
    private readonly reduceNumberOfInstallmentsService: ReduceNumberOfInstallmentsService,
  ) {}

  async recalculate(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: true; disbursementDetails: true; product: true };
    }>,
  ) {
    switch (loanAccount.prepaymentRecalculationMethod) {
      case 'REDUCE_AMOUNT_PER_INSTALLMENT':
        return this.reduceAmountPerInstallmentService.recalculate(loanAccount);
      case 'REDUCE_NUMBER_OF_INSTALLMENTS':
        return this.reduceNumberOfInstallmentsService.recalculate(loanAccount);
      default:
        return;
    }
  }
}
