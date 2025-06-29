import { Module } from '@nestjs/common';
import { DisbursementModule } from './disbursement/disbursement.module';
import { FeesService } from './fees.service';
import { PaymentDueModule } from './payment-due/payment-due.module';
import { SettlementFeeService } from './settlement/index.service';

@Module({
  imports: [DisbursementModule, PaymentDueModule],
  providers: [FeesService, SettlementFeeService],
  exports: [FeesService],
})
export class FeesModule {}
