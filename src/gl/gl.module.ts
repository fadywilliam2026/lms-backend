import { Module } from '@nestjs/common';
import { LoanTransactionModule } from '../loan-transaction/loan-transaction.module';
import { GlController } from './gl.controller';
import { GlService } from './gl.service';

@Module({
  imports: [LoanTransactionModule],
  controllers: [GlController],
  providers: [GlService],
  exports: [GlService],
})
export class GlModule {}
