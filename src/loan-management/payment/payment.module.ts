import { Module } from '@nestjs/common';
import { InstallmentModule } from '../installment/installment.module';
import { PaymentService } from './payment.service';

@Module({
  imports: [InstallmentModule],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
