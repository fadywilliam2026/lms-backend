import { Module } from '@nestjs/common';
import { GlModule } from '../gl/gl.module';
import { LoanProductsController } from './loanProducts.controller';
import { LoanProductsService } from './loanProducts.service';

@Module({
  controllers: [LoanProductsController],
  providers: [LoanProductsService],
  exports: [LoanProductsService],
  imports: [GlModule],
})
export class LoanProductsModule {}
