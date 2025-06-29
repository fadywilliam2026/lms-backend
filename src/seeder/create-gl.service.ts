import { ConsoleLogger, Injectable } from '@nestjs/common';
import { FinancialResource, GLAccountType } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class CreateGlService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: ConsoleLogger,
  ) {}

  async seed() {
    this.logger.log('Creating gl');
    await this.prisma.$transaction([
      this.createAccount(FinancialResource.PORTFOLIO_CONTROL, GLAccountType.ASSET, 100),
      this.createAccount(FinancialResource.TRANSACTION_SOURCE, GLAccountType.ASSET, 101),
      this.createAccount(FinancialResource.WRITE_OFF_EXPENSE, GLAccountType.EXPENSE, 500),
      this.createAccount(FinancialResource.PARTNER_COMMISSION_EXPENSE, GLAccountType.EXPENSE, 501),
      this.createAccount(FinancialResource.INTEREST_INCOME, GLAccountType.INCOME, 400),
      this.createAccount(FinancialResource.FEE_INCOME, GLAccountType.INCOME, 401),
      this.createAccount(FinancialResource.PENALTY_INCOME, GLAccountType.INCOME, 402),
      this.createAccount(FinancialResource.RETAINED_EARNINGS, GLAccountType.EQUITY, 300),
      this.createAccount(FinancialResource.NET_PROFIT, GLAccountType.INCOME_EXPENSE, 600),
    ]);
  }
  createAccount(financialResource: FinancialResource, type: GLAccountType, code: number) {
    return this.prisma.gLAccount.create({
      data: {
        name: financialResource,
        type,
        code,
      },
    });
  }
}

// Assets - Account codes 100-199
// Liabilities - 200-299
// Equity accounts - 300-399
// Income - 400-499
// Expenses - 500-599
//INCOME_EXPENSE - 600-699
