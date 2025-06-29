import { Module } from '@nestjs/common';
import { LoanTransactionModule } from '../loan-transaction/loan-transaction.module';
import { InstallmentModule } from './installment/installment.module';
import { LoanCalculationModule } from './loan-calculation/loan-calculation.module';
import { LoanManagementService } from './loan-management.service';
import { LoanManagementController } from './loan-managment.controller';
import { PaymentModule } from './payment/payment.module';
import { PrepaymentModule } from './prepayment/prepayment.module';
import { RecalculationModule } from './recalculation/recalculation.module';

@Module({
  imports: [
    InstallmentModule,
    PrepaymentModule,
    LoanCalculationModule,
    PaymentModule,
    InstallmentModule,
    RecalculationModule,
    LoanTransactionModule,
  ],
  providers: [LoanManagementService],
  exports: [LoanManagementService],
  controllers: [LoanManagementController],
})
export class LoanManagementModule {}
