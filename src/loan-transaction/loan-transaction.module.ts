import { forwardRef, Module } from '@nestjs/common';
import { DisbursementTransactionService } from './disbursement-transaction.service';
import { FeeChargedTransactionService } from './fee-charged.service';
import { LoanTransactionService } from './loan-transaction.service';
import { RepaymentTransactionService } from './repayment-transaction.service';
import { WriteOffTransactionService } from './write-off-transaction.service';
import { RescheduleTransactionService } from './reschedule-transaction.service';
import { CronModule } from '../cron/cron.module';

@Module({
  imports: [forwardRef(() => CronModule)],
  providers: [
    LoanTransactionService,
    DisbursementTransactionService,
    RepaymentTransactionService,
    WriteOffTransactionService,
    FeeChargedTransactionService,
    RescheduleTransactionService,
  ],
  exports: [LoanTransactionService],
})
export class LoanTransactionModule {}
