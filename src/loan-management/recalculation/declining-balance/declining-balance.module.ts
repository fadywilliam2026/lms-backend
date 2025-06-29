import { Module } from '@nestjs/common';
import { DatesService } from '../../dates/dates.service';
import { InstallmentModule } from '../../installment/installment.module';
import { CalculationModule } from '../../principal-interest/calculation/calculation.module';
import { DecliningBalanceService } from './declining-balance.service';
import { NoRecalculationService } from './no-recalculation.service';
import { ReduceAmountPerInstallmentService } from './reduce-amount-per-installment.service';
import { ReduceNumberOfInstallmentsService } from './reduce-number-of-installments.service';

@Module({
  imports: [CalculationModule, InstallmentModule],
  providers: [
    DecliningBalanceService,
    NoRecalculationService,
    ReduceAmountPerInstallmentService,
    ReduceNumberOfInstallmentsService,
    DatesService,
  ],
  exports: [DecliningBalanceService],
})
export class DecliningBalanceModule {}
