import { Module } from '@nestjs/common';
import { ClientsModule } from '../clients/clients.module';
import { LoanManagementModule } from '../loan-management/loan-managment.module';
import { LoanTransactionModule } from '../loan-transaction/loan-transaction.module';
import { LoanProductsModule } from '../loanProducts/loanProducts.module';
import { LoanAccountsController } from './loan-accounts.controller';
import { LoanAccountsService } from './loan-accounts.service';
import { LoanAccountLifeCycleService } from './life-cycle.service';
import { LoanCalculationModule } from '../loan-management/loan-calculation/loan-calculation.module';

@Module({
  imports: [ClientsModule, LoanProductsModule, LoanManagementModule, LoanTransactionModule, LoanCalculationModule],
  controllers: [LoanAccountsController],
  providers: [LoanAccountsService, LoanAccountLifeCycleService],
})
export class LoanAccountsModule {}
