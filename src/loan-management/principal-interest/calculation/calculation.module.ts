import { Module } from '@nestjs/common';
import { DatesModule } from '../../dates/dates.module';
import { DatesService } from '../../dates/dates.service';
import { InstallmentModule } from '../../installment/installment.module';
import { CalculationService } from './calculation.service';
import { DecliningBalanceDiscountedService } from './declining-balance-discounted.service';
import { DecliningBalanceService } from './declining-balance.service';
import { FlatService } from './flat.service';
import { HelperService } from './helper.service';

@Module({
  imports: [DatesModule, InstallmentModule],
  providers: [
    CalculationService,
    FlatService,
    DecliningBalanceService,
    DecliningBalanceDiscountedService,
    DatesService,
    HelperService,
  ],
  exports: [CalculationService, DecliningBalanceService, DecliningBalanceDiscountedService, HelperService],
})
export class CalculationModule {}
