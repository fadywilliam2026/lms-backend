import fixedFlat from './flat';
import paymentPlanFlat from './flat-customPlan';
import decliningBalance from './decliningBalance';
import paymentPlanDecliningBalance from './decliningBalance-customPlan';
import decliningBalanceDiscounted from './decliningBalanceDiscounted';
import decliningBalanceDiscountedStartingInterestOnlyPeriodCount from './decliningBalanceDiscountedStartingInterestOnlyPeriodCount';
import { LoanCalculationService } from '../../loan-calculation/loan-calculation.service';
import { Test, TestingModule } from '@nestjs/testing';
import balloon from './balloon';
import balloonWithPrincipal from './balloonWithPrincipal';
import { AppModule } from '../../../app.module';
import { PrismaService } from 'nestjs-prisma';
import { LoanAccountsService } from '../../../loan-accounts/loan-accounts.service';
import { LoanProductsService } from '../../../loanProducts/loanProducts.service';
import { CreateLoanAccountDto } from '../../../loan-accounts/dto/create-loan-account.dto';
import merge from 'lodash/merge';
import decliningBalanceDiscountedPaymentPlan from './decliningBalanceDiscountedPaymentPlan';
import { Client } from '@prisma/client';

describe('InterestCalculation', () => {
  let module: TestingModule;
  let service: LoanCalculationService;
  let prisma: PrismaService;
  let loanAccountsService: LoanAccountsService;
  let loanProductsService: LoanProductsService;

  let client: Client;

  const loanAccountIds: number[] = [];
  const loanProductIds: number[] = [];

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    service = module.get<LoanCalculationService>(LoanCalculationService);
    prisma = module.get<PrismaService>(PrismaService);
    loanAccountsService = module.get<LoanAccountsService>(LoanAccountsService);
    loanProductsService = module.get<LoanProductsService>(LoanProductsService);
    client = await prisma.client.create({
      data: {
        firstName: 'interest',
        lastName: 'client',
        email: 'interest@email.com',
        nationalId: '12345678998784',
        state: 'ACTIVE',
        initialLimit: 2_000_000_000,
        approvedLimit: 2_000_000_000,
        currentLimit: 2_000_000_000,
        user: {
          connect: {
            email: 'agent@test.com',
          },
        },
        customFields: {
          industry: 'PHARMACY',
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.loanAccount.deleteMany({
      where: {
        id: {
          in: loanAccountIds,
        },
      },
    });

    await prisma.loanProduct.deleteMany({
      where: {
        id: {
          in: loanProductIds,
        },
      },
    });
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('FixedFlat', async () => {
    const { loanAccount, result, loanProduct } = fixedFlat;

    const createdLoanProduct = await loanProductsService.create(loanProduct);
    loanProductIds.push(createdLoanProduct.id);

    const createdLoanAccount = await loanAccountsService.create(
      client.userId,
      merge(new CreateLoanAccountDto(), {
        ...loanAccount,
        productId: createdLoanProduct.id,
        clientId: client.id,
      }),
    );
    loanAccountIds.push(createdLoanAccount.id);

    const foundLoanAccount = await prisma.loanAccount.findUnique({
      where: { id: createdLoanAccount.id },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        periodicPayments: true,
        installments: true,
        paymentPlans: true,
      },
    });
    expect(
      service
        .generateInstallments(foundLoanAccount)
        .installments.map(({ principalDue, interestDue, dueDate }) => ({ principalDue, interestDue, dueDate })),
    ).toStrictEqual(result);
  });

  it('FixedFlat With Payment Plan', async () => {
    const { loanAccount, result, loanProduct } = paymentPlanFlat;

    const createdLoanProduct = await loanProductsService.create(loanProduct);
    loanProductIds.push(createdLoanProduct.id);

    const createdLoanAccount = await loanAccountsService.create(
      client.userId,
      merge(new CreateLoanAccountDto(), {
        ...loanAccount,
        productId: createdLoanProduct.id,
        clientId: client.id,
      }),
    );
    loanAccountIds.push(createdLoanAccount.id);

    const foundLoanAccount = await prisma.loanAccount.findUnique({
      where: { id: createdLoanAccount.id },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        periodicPayments: true,
        installments: true,
        paymentPlans: true,
      },
    });
    expect(
      service
        .generateInstallments(foundLoanAccount)
        .installments.map(({ principalDue, interestDue, dueDate }) => ({ principalDue, interestDue, dueDate })),
    ).toStrictEqual(result);
  });

  it('DeclinedBalance', async () => {
    const { loanAccount, result, loanProduct } = decliningBalance;

    const createdLoanProduct = await loanProductsService.create(loanProduct);
    loanProductIds.push(createdLoanProduct.id);

    const createdLoanAccount = await loanAccountsService.create(
      client.userId,
      merge(new CreateLoanAccountDto(), {
        ...loanAccount,
        productId: createdLoanProduct.id,
        clientId: client.id,
      }),
    );
    loanAccountIds.push(createdLoanAccount.id);

    const foundLoanAccount = await prisma.loanAccount.findUnique({
      where: { id: createdLoanAccount.id },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        installments: true,
        periodicPayments: true,
        paymentPlans: true,
      },
    });
    expect(
      service
        .generateInstallments(foundLoanAccount)
        .installments.map(({ principalDue, interestDue, dueDate }) => ({ principalDue, interestDue, dueDate })),
    ).toStrictEqual(result);
  });

  it('DeclinedBalance with Custom Plan', async () => {
    const { loanAccount, result, loanProduct } = paymentPlanDecliningBalance;

    const createdLoanProduct = await loanProductsService.create(loanProduct);
    loanProductIds.push(createdLoanProduct.id);
    const createdLoanAccount = await loanAccountsService.create(
      client.userId,
      merge(new CreateLoanAccountDto(), {
        ...loanAccount,
        productId: createdLoanProduct.id,
        clientId: client.id,
      }),
    );
    loanAccountIds.push(createdLoanAccount.id);

    const foundLoanAccount = await prisma.loanAccount.findUnique({
      where: { id: createdLoanAccount.id },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        installments: true,
        periodicPayments: true,
        paymentPlans: true,
      },
    });
    expect(
      service
        .generateInstallments(foundLoanAccount)
        .installments.map(({ principalDue, interestDue, dueDate }) => ({ principalDue, interestDue, dueDate })),
    ).toStrictEqual(result);
  });
  it('DeclinedBalanceEqualInstallments', async () => {
    const { loanAccount, result, loanProduct } = decliningBalanceDiscounted;

    const createdLoanProduct = await loanProductsService.create(loanProduct);
    loanProductIds.push(createdLoanProduct.id);

    const createdLoanAccount = await loanAccountsService.create(
      client.userId,
      merge(new CreateLoanAccountDto(), {
        ...loanAccount,
        productId: createdLoanProduct.id,
        clientId: client.id,
      }),
    );
    loanAccountIds.push(createdLoanAccount.id);

    const foundLoanAccount = await prisma.loanAccount.findUnique({
      where: { id: createdLoanAccount.id },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        installments: true,
        periodicPayments: true,
        paymentPlans: true,
      },
    });
    expect(
      service
        .generateInstallments(foundLoanAccount)
        .installments.map(({ principalDue, interestDue, dueDate }) => ({ principalDue, interestDue, dueDate })),
    ).toStrictEqual(result);
  });
  it('DeclinedBalanceEqualInstallmentsStartingInterestOnlyPeriodCount', async () => {
    const { loanAccount, result, loanProduct } = decliningBalanceDiscountedStartingInterestOnlyPeriodCount;

    const createdLoanProduct = await loanProductsService.create(loanProduct);
    loanProductIds.push(createdLoanProduct.id);

    const createdLoanAccount = await loanAccountsService.create(
      client.userId,
      merge(new CreateLoanAccountDto(), {
        ...loanAccount,
        productId: createdLoanProduct.id,
        clientId: client.id,
      }),
    );
    loanAccountIds.push(createdLoanAccount.id);

    const foundLoanAccount = await prisma.loanAccount.findUnique({
      where: { id: createdLoanAccount.id },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        installments: true,
        periodicPayments: true,
        paymentPlans: true,
      },
    });
    const generatedInstallments = service
      .generateInstallments(foundLoanAccount)
      .installments.map(({ principalDue, interestDue, dueDate }) => ({ principalDue, interestDue, dueDate }));
    expect(
      generatedInstallments.map(({ principalDue, interestDue, dueDate }) => ({
        principalDue,
        interestDue,
        dueDate: dueDate.toDateString(),
      })),
    ).toStrictEqual(
      result.map(({ principalDue, interestDue, dueDate }) => ({
        principalDue,
        interestDue,
        dueDate: dueDate.toDateString(),
      })),
    );
  });
  it('PaymentPlan', async () => {
    const { loanAccount, result, loanProduct } = decliningBalanceDiscountedPaymentPlan;

    const createdLoanProduct = await loanProductsService.create(loanProduct);
    loanProductIds.push(createdLoanProduct.id);

    const createdLoanAccount = await loanAccountsService.create(
      client.userId,
      merge(new CreateLoanAccountDto(), {
        ...loanAccount,
        productId: createdLoanProduct.id,
        clientId: client.id,
      }),
    );
    loanAccountIds.push(createdLoanAccount.id);

    const foundLoanAccount = await prisma.loanAccount.findUnique({
      where: { id: createdLoanAccount.id },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        installments: true,
        periodicPayments: true,
        paymentPlans: true,
      },
    });
    expect(
      service
        .generateInstallments(foundLoanAccount)
        .installments.map(({ principalDue, interestDue, dueDate }) => ({ principalDue, interestDue, dueDate })),
    ).toStrictEqual(result);
  });
  it('Balloon', async () => {
    const { loanAccount, result, loanProduct } = balloon;

    const createdLoanProduct = await loanProductsService.create(loanProduct);
    loanProductIds.push(createdLoanProduct.id);

    const createdLoanAccount = await loanAccountsService.create(
      client.userId,
      merge(new CreateLoanAccountDto(), {
        ...loanAccount,
        productId: createdLoanProduct.id,
        clientId: client.id,
      }),
    );
    loanAccountIds.push(createdLoanAccount.id);

    const foundLoanAccount = await prisma.loanAccount.findUnique({
      where: { id: createdLoanAccount.id },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        installments: true,
        periodicPayments: true,
        paymentPlans: true,
      },
    });
    expect(
      service
        .generateInstallments(foundLoanAccount)
        .installments.map(({ principalDue, interestDue, dueDate }) => ({ principalDue, interestDue, dueDate })),
    ).toStrictEqual(result);
  });
  it('Balloon with principal', async () => {
    const { loanAccount, result, loanProduct } = balloonWithPrincipal;

    const createdLoanProduct = await loanProductsService.create(loanProduct);
    loanProductIds.push(createdLoanProduct.id);

    const createdLoanAccount = await loanAccountsService.create(
      client.userId,
      merge(new CreateLoanAccountDto(), {
        ...loanAccount,
        productId: createdLoanProduct.id,
        clientId: client.id,
      }),
    );
    loanAccountIds.push(createdLoanAccount.id);

    const foundLoanAccount = await prisma.loanAccount.findUnique({
      where: { id: createdLoanAccount.id },
      include: {
        disbursementDetails: true,
        product: { include: { predefinedFees: true } },
        installments: true,
        periodicPayments: true,
        paymentPlans: true,
      },
    });
    expect(
      service
        .generateInstallments(foundLoanAccount)
        .installments.map(({ principalDue, interestDue, dueDate }) => ({ principalDue, interestDue, dueDate })),
    ).toStrictEqual(result);
  });
});
