import { Module } from '@nestjs/common';
import { FeesModule } from '../fees/fees.module';
import { InstallmentModule } from '../installment/installment.module';
import { CalculationModule } from '../principal-interest/calculation/calculation.module';
import { PrincipalInterestModule } from '../principal-interest/principal-interest.module';
import { LoanCalculationService } from './loan-calculation.service';

@Module({
  imports: [PrincipalInterestModule, FeesModule, InstallmentModule, CalculationModule],
  providers: [LoanCalculationService],
  exports: [LoanCalculationService],
})
export class LoanCalculationModule {}
