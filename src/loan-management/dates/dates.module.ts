import { Module } from '@nestjs/common';
import { InstallmentModule } from '../installment/installment.module';
import { DatesService } from './dates.service';

@Module({
  imports: [InstallmentModule],
  providers: [DatesService],
  exports: [DatesService],
})
export class DatesModule {}
