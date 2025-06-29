import { Module } from '@nestjs/common';
import { InstallmentModule } from '../../installment/installment.module';
import { AmortizationService } from './amortization.service';
import { AmountCalculationService } from './amount-calculation.service';
import { DisbursementService } from './disbursement.service';

@Module({
  imports: [InstallmentModule],
  providers: [AmortizationService, AmountCalculationService, DisbursementService],
  exports: [DisbursementService],
})
export class DisbursementModule {}
