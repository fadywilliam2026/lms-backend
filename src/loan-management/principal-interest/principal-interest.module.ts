import { Module } from '@nestjs/common';
import { InstallmentModule } from '../installment/installment.module';
import AmortizationModule from './amortization/amortization.module';
import { CalculationModule } from './calculation/calculation.module';
import { PrincipalInterestService } from './principal-interest.service';
import { DatesModule } from '../dates/dates.module';

@Module({
  providers: [PrincipalInterestService],
  imports: [CalculationModule, AmortizationModule, InstallmentModule, DatesModule],
  exports: [PrincipalInterestService],
})
export class PrincipalInterestModule {}
