import { Module } from '@nestjs/common';
import { DatesService } from '../../dates/dates.service';
import { InstallmentHelperService } from '../../installment/installment.helper.service';
import { InstallmentModule } from '../../installment/installment.module';
import { CalculationModule } from '../../principal-interest/calculation/calculation.module';
import { HelperService } from '../../principal-interest/calculation/helper.service';
import { DecliningBalanceDiscountedService } from './declining-balance-discounted.service';
import { ReduceAmountPerInstallmentService } from './reduce-amount-per-installment.service';
import { ReduceNumberOfInstallmentsService } from './reduce-number-of-installments.service';

@Module({
  imports: [CalculationModule, InstallmentModule],
  providers: [
    DecliningBalanceDiscountedService,
    ReduceAmountPerInstallmentService,
    ReduceNumberOfInstallmentsService,
    DatesService,
    HelperService,
    InstallmentHelperService,
  ],
  exports: [DecliningBalanceDiscountedService],
})
export class DecliningBalanceDiscountedModule {}
