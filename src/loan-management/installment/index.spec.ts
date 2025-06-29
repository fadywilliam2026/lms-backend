import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { LoanManagementService } from '../loan-management.service';
import {
  InstallmentPeriodUnit,
  InstallmentState,
  InterestCalculationMethod,
  LoanAccount,
  LoanPenaltyCalculationMethod,
  LoanProduct,
  PrepaymentRecalculationMethod,
} from '@prisma/client';
import { LoanProductsService } from '../../loanProducts/loanProducts.service';
import { InstallmentService } from './installment.service';
import { AppModule } from '../../app.module';
import moment from 'moment';

describe('Penalty', () => {
  let module: TestingModule;
  let prisma: PrismaService;
  let loanManagementService: LoanManagementService;
  let loanAccount: LoanAccount;
  let loanProduct: LoanProduct;
  let loanProductService: LoanProductsService;
  let installmentService: InstallmentService;
  let currentDate: Date;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    loanManagementService = module.get<LoanManagementService>(LoanManagementService);
    loanProductService = module.get<LoanProductsService>(LoanProductsService);
    installmentService = module.get<InstallmentService>(InstallmentService);

    // NOTE: first installment should be paid on 2017-02-21
    currentDate = new Date('2017-02-21');
  });

  afterAll(async () => {
    await module.close();
  });

  afterEach(async () => {
    await prisma.loanProduct.delete({
      where: {
        id: loanProduct.id,
      },
    });

    await prisma.loanAccount.delete({
      where: {
        id: loanAccount.id,
      },
    });
  });

  beforeEach(async () => {
    loanProduct = await loanProductService.create({
      name: 'product',
      amortizationMethod: 'STANDARD_PAYMENTS',
      maxLoanAmount: 10000,
      maxNumInstallments: 120,
    });

    loanAccount = await prisma.loanAccount.create({
      data: {
        interestCalculationMethod: InterestCalculationMethod.DECLINING_BALANCE,
        loanAmount: 1000,
        loanName: 'new loan',
        interestRate: 10,
        installmentPeriodUnit: InstallmentPeriodUnit.MONTHS,
        penaltyRate: 1,
        numInstallments: 6,
        disbursementDetails: {
          create: {
            disbursementAt: moment(currentDate).subtract(1, 'months').toDate(),
          },
        },
        loanPenaltyCalculationMethod: LoanPenaltyCalculationMethod.OVERDUE_PRINCIPAL,
        accountArrearsSettings: {
          create: {},
        },
        prepaymentRecalculationMethod: PrepaymentRecalculationMethod.NO_RECALCULATION,
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

  it('should be defined', () => {
    expect(loanManagementService).toBeDefined();
  });

  it('1- paid on time.', async () => {
    jest.useFakeTimers({ doNotFake: ['nextTick'] }).setSystemTime(currentDate);
    await loanManagementService.applyPenalty(loanAccount.id);

    const installments = await loanManagementService.getInstallments(loanAccount.id);

    const installment = await prisma.installment.findUnique({
      where: { id: installments[0].id },
      include: { loanAccount: { include: { product: true } } },
    });

    const result = installmentService.makeRepayment(installment, loanAccount.loanAmount, currentDate);
    const { installments: resultedInstallments } = await result.query;

    const paidInstallment = resultedInstallments.find(installment => installment.state === InstallmentState.PAID);

    expect(+paidInstallment.penaltyPaid).toBe(0);
    expect(+paidInstallment.penaltyDue).toBe(0);
    expect(+paidInstallment.loanAccount.penaltyDue).toBe(0);
    expect(+paidInstallment.loanAccount.penaltyPaid).toBe(0);
  });

  it('2- paid late.', async () => {
    const laterTime = moment(currentDate).add(1, 'months').toDate();

    jest.useFakeTimers({ doNotFake: ['nextTick'] }).setSystemTime(laterTime);
    const penalizedInstallments = await loanManagementService.applyPenalty(loanAccount.id);
    const penalizedInstallment = penalizedInstallments[0];

    const installment = await prisma.installment.findUnique({
      where: { id: penalizedInstallment.id },
      include: { loanAccount: { include: { product: true } } },
    });

    const result = installmentService.makeRepayment(installment, loanAccount.loanAmount, laterTime);
    const { installments: resultedInstallments } = await result.query;

    const paidInstallment = resultedInstallments.find(installment => installment.state === InstallmentState.PAID);

    expect(+paidInstallment.penaltyPaid).toBeGreaterThan(0);
    expect(+paidInstallment.penaltyDue).toBe(+penalizedInstallment.penaltyDue);

    expect(+paidInstallment.loanAccount.penaltyDue).toBeGreaterThanOrEqual(+penalizedInstallment.penaltyDue);
    expect(+paidInstallment.loanAccount.penaltyPaid).toBeGreaterThan(0);
  });

  it('3- paid on time but recorded late.', async () => {
    const recordedAtTime = moment(currentDate).add(1, 'months').toDate();

    jest.useFakeTimers({ doNotFake: ['nextTick'] }).setSystemTime(recordedAtTime);
    const penalizedInstallments = await loanManagementService.applyPenalty(loanAccount.id);
    const penalizedInstallment = penalizedInstallments[0];

    const installment = await prisma.installment.findUnique({
      where: { id: penalizedInstallment.id },
      include: { loanAccount: { include: { product: true } } },
    });

    const result = installmentService.makeRepayment(installment, loanAccount.loanAmount, currentDate);
    const { installments: resultedInstallments } = await result.query;
    const paidInstallment = resultedInstallments.find(installment => installment.state === InstallmentState.PAID);

    expect(+paidInstallment.penaltyPaid).toBe(0);
    expect(+paidInstallment.penaltyDue).toBe(0);

    expect(+paidInstallment.loanAccount.penaltyDue).toBeLessThanOrEqual(+penalizedInstallment.penaltyDue);
    expect(+paidInstallment.loanAccount.penaltyPaid).toBe(0);
  });

  it('4- paid on time but recorded late & one late installment.', async () => {
    const recordedAtTime = moment(currentDate).add(2, 'months').toDate();

    jest.useFakeTimers({ doNotFake: ['nextTick'] }).setSystemTime(recordedAtTime);
    const penalizedInstallments = await loanManagementService.applyPenalty(loanAccount.id);
    const penalizedInstallment = penalizedInstallments[0];
    const lateInstallment = penalizedInstallments[1];

    const installment = await prisma.installment.findUnique({
      where: { id: penalizedInstallment.id },
      include: { loanAccount: { include: { product: true } } },
    });

    const result = installmentService.makeRepayment(installment, loanAccount.loanAmount, installment.dueDate);
    const { installments: resultedInstallments } = await result.query;
    const paidInstallment = resultedInstallments.find(installment => installment.state === 'PAID');

    expect(+paidInstallment.penaltyPaid).toBe(0);
    expect(+paidInstallment.penaltyDue).toBe(0);

    expect(+paidInstallment.loanAccount.penaltyDue).toBe(+lateInstallment.penaltyDue);
    expect(+paidInstallment.loanAccount.penaltyPaid).toBe(0);
    expect(+paidInstallment.loanAccount.penaltyBalance).toBe(+lateInstallment.penaltyDue);
  });

  afterEach(() => {
    jest.clearAllTimers();
  });
});
