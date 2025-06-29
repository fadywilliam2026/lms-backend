import { Module } from '@nestjs/common';
import { AmortizationService } from './amortization.service';
import { AmountCalculationService } from './amount-calculation.service';
import { PaymentDueService } from './payment-due.service';

@Module({
  providers: [AmortizationService, AmountCalculationService, PaymentDueService],
  exports: [PaymentDueService],
})
export class PaymentDueModule {}
