import { Module } from '@nestjs/common';
import { DecliningBalanceDiscountedModule } from './declining-balance-discounted/declining-balance-discounted.module';
import { DecliningBalanceModule } from './declining-balance/declining-balance.module';
import { RecalculationService } from './recalculation.service';

@Module({
  imports: [DecliningBalanceDiscountedModule, DecliningBalanceModule],
  providers: [RecalculationService],
  exports: [RecalculationService],
})
export class RecalculationModule {}
