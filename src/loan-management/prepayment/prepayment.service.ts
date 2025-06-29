import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { NoRecalculationService } from './noRecalculation.service';
import { ReduceAmountPerInstallmentService } from './reduceAmountPerInstallment.service';
import { ReduceNumberOfInstallmentsService } from './reduceNumberOfInstallments.service';

@Injectable()
export class PrepaymentService {
  constructor(
    private readonly noRecalculation: NoRecalculationService,
    private readonly reduceAmountPerInstallment: ReduceAmountPerInstallmentService,
    private readonly reduceNumberOfInstallments: ReduceNumberOfInstallmentsService,
  ) {}
  makePrepayment(
    loanAccount: Prisma.LoanAccountGetPayload<{
      include: { installments: { include: { loanAccount: { include: { product: true } } } } };
    }>,
    payment: Decimal,
    valueDate: Date,
  ) {
    switch (loanAccount.prepaymentRecalculationMethod) {
      case 'NO_RECALCULATION':
        return this.noRecalculation.makePrepayment(loanAccount, payment, valueDate);
      case 'REDUCE_AMOUNT_PER_INSTALLMENT':
        return this.reduceAmountPerInstallment.makePrepayment(loanAccount, payment, valueDate);
      case 'REDUCE_NUMBER_OF_INSTALLMENTS':
        return this.reduceNumberOfInstallments.makePrepayment(loanAccount, payment, valueDate);
      default:
        throw new NotFoundException(
          `Unknown prepayment recalculation method: ${loanAccount.prepaymentRecalculationMethod}`,
        );
    }
  }
}
