import { forwardRef, Module } from '@nestjs/common';
import { LoanManagementModule } from '../loan-management/loan-managment.module';
import { PenaltyJobService } from './penalty-job.service';
import { RetainedEarningsJobService } from './retained-earnings-job.service';

@Module({
  imports: [forwardRef(() => LoanManagementModule)],
  providers: [PenaltyJobService, RetainedEarningsJobService],
  exports: [RetainedEarningsJobService],
})
export class CronModule {}
