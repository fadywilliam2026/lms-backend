import { Test, TestingModule } from '@nestjs/testing';
import { LoanManagementService } from '../../loan-management.service';

import { PrismaService } from 'nestjs-prisma';
import { AppModule } from '../../../app.module';
import { LoanAccount } from '@prisma/client';
import { LoanProductsService } from '../../../loanProducts/loanProducts.service';
import { Decimal } from '@prisma/client/runtime/library';

describe('LoanManagementService', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let loanManagementService: LoanManagementService;
  let loanProductService: LoanProductsService;

  let loanAccount: LoanAccount;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    loanManagementService = module.get<LoanManagementService>(LoanManagementService);
    loanProductService = module.get<LoanProductsService>(LoanProductsService);
  });

  beforeEach(async () => {
    const loanProduct = await loanProductService.create({
      name: 'product',
      amortizationMethod: 'STANDARD_PAYMENTS',
      maxLoanAmount: 10000,
      maxNumInstallments: 120,
    });
    loanAccount = await prisma.loanAccount.create({
      data: {
        interestCalculationMethod: 'DECLINING_BALANCE',
        loanAmount: 1000,
        loanName: 'loan',
        interestRate: 10,
        installmentPeriodUnit: 'MONTHS',
        penaltyRate: 1,
        numInstallments: 6,
        disbursementDetails: {
          create: {
            disbursementAt: new Date('2017-01-21'),
          },
        },
        accountArrearsSettings: {
          create: {},
        },
        prepaymentRecalculationMethod: 'NO_RECALCULATION',
        product: {
          connect: {
            id: loanProduct.id,
          },
        },
        client: {
          connect: {
            email: 'mail@mail.com',
          },
        },
        user: {
          connect: {
            email: 'agent@test.com',
          },
        },
      },
    });
    await loanManagementService.generateInstallments(loanAccount.id);
  });

  afterEach(async () => {
    await prisma.loanAccount.deleteMany({ where: { id: loanAccount.id } });
    await prisma.loanProduct.deleteMany({ where: { id: loanAccount.productId } });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  it('should be defined', () => {
    expect(loanManagementService).toBeDefined();
  });

  it('prepayment', async () => {
    const s = await loanManagementService.makeRepayment(loanAccount.id, {
      amount: 100,
      valueDate: new Date('2017-03-21'),
    });
    expect(s).toBe(0);
  });

  it('generate installments', async () => {
    const installments = await loanManagementService.getInstallments(loanAccount.id);
    expect(installments.length).toBe(loanAccount.numInstallments);
  });

  it('pay first installment', async () => {
    await loanManagementService.makeRepayment(loanAccount.id, {
      amount: 600,
      valueDate: new Date('2017-03-21'),
    });
    const installments = await loanManagementService.getInstallments(loanAccount.id);
    expect(installments[0].principalDue.sub(installments[0].principalPaid)).toStrictEqual(new Decimal(0));
  });
});
