import { Module } from '@nestjs/common';
import { LoanTransactionModule } from '../../loan-transaction/loan-transaction.module';
import { InstallmentHelperService } from './installment.helper.service';
import { InstallmentService } from './installment.service';

@Module({
  providers: [InstallmentService, InstallmentHelperService],
  exports: [InstallmentService, InstallmentHelperService],
  imports: [LoanTransactionModule],
})
export class InstallmentModule {}
