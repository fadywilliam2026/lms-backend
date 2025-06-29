import { Test, TestingModule } from '@nestjs/testing';
import { LoanManagementService } from '../../loan-management.service';
import { PrismaService } from 'nestjs-prisma';
import { AppModule } from '../../../app.module';
import { LoanAccount, LoanProduct } from '@prisma/client';
import { LoanProductsService } from '../../../loanProducts/loanProducts.service';

describe('Penalty', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let loanManagementService: LoanManagementService;
  let loanAccount: LoanAccount;
  let loanProduct: LoanProduct;
  let loanProductService: LoanProductsService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    loanManagementService = module.get<LoanManagementService>(LoanManagementService);
    loanProductService = module.get<LoanProductsService>(LoanProductsService);

    loanProduct = await loanProductService.create({
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
        loanPenaltyCalculationMethod: 'OVERDUE_PRINCIPAL',
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

  afterAll(async () => {
    await prisma.loanAccount.delete({
      where: {
        id: loanAccount.id,
      },
    });

    await prisma.loanProduct.delete({
      where: {
        id: loanProduct.id,
      },
    });

    await module.close();
  });
  it('should be defined', async () => {
    expect(loanManagementService).toBeDefined();
  });
  it('penalty should be applied', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2020-04-02'));
    await loanManagementService.changeInstallmentsState(loanAccount.id);
    await loanManagementService.applyPenalty(loanAccount.id);
    const installments = await loanManagementService.getInstallments(loanAccount.id);
    expect(+installments[0].penaltyDue).toBeGreaterThan(0);
  });
  afterEach(() => {
    jest.clearAllTimers();
  });
});
