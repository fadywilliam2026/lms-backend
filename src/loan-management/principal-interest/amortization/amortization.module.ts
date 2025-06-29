import { Module } from '@nestjs/common';
import { CalculationModule } from '../calculation/calculation.module';
import { AmortizationService } from './amortization.service';
import { BalloonService } from './balloon.service';
import { PaymentPlanService } from './payment-plan.service';
import { StandardPaymentService } from './standard-payment.service';
import { DatesModule } from '../../dates/dates.module';

@Module({
  imports: [CalculationModule, DatesModule],
  providers: [AmortizationService, PaymentPlanService, StandardPaymentService, BalloonService],
  exports: [AmortizationService],
})
export default class AmortizationModule {}
