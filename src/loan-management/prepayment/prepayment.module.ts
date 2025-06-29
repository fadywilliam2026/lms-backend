import { Module } from '@nestjs/common';
import { InstallmentHelperService } from '../installment/installment.helper.service';
import { NoRecalculationService } from './noRecalculation.service';
import { PrepaymentService } from './prepayment.service';
import { ReduceAmountPerInstallmentService } from './reduceAmountPerInstallment.service';
import { ReduceNumberOfInstallmentsService } from './reduceNumberOfInstallments.service';

@Module({
  providers: [
    PrepaymentService,
    NoRecalculationService,
    ReduceAmountPerInstallmentService,
    ReduceNumberOfInstallmentsService,
    InstallmentHelperService,
  ],
  exports: [PrepaymentService],
})
export class PrepaymentModule {}
