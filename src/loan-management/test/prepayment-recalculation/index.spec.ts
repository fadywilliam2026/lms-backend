import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { AppModule } from '../../../app.module';
import { LoanManagementService } from '../../loan-management.service';
import map from 'lodash/map';
import pick from 'lodash/pick';
import { LoanProductsService } from '../../../loanProducts/loanProducts.service';
import { INestApplication } from '@nestjs/common';

describe('PrepaymentRecalculation', () => {
  let app: INestApplication;
  let loanManagementService: LoanManagementService;
  let loanProductService: LoanProductsService;
  let prisma: PrismaService;

  const loanProductIds: number[] = [];
  const loanAccountIds: number[] = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    loanManagementService = module.get<LoanManagementService>(LoanManagementService);
    prisma = module.get<PrismaService>(PrismaService);
    loanProductService = module.get<LoanProductsService>(LoanProductsService);
  });

  afterAll(async () => {
    await prisma.loanProduct.deleteMany({ where: { id: { in: loanProductIds } } });
    await prisma.loanAccount.deleteMany({ where: { id: { in: loanAccountIds } } });
    await app.close();
  });

  test('declining-discounted-reduce-amount-per-installment', async () => {
    const { loanAccountInput, installments, installmentsAfter, loanProductInput } = await import(
      './declining-discounted-reduce-amount-per-installment'
    );
    const loanProduct = await loanProductService.create(loanProductInput);
    loanProductIds.push(loanProduct.id);

    let loanAccount = await prisma.loanAccount.create({
      data: { ...loanAccountInput, product: { connect: { id: loanProduct.id } } },
      include: { installments: true },
    });
    loanAccountIds.push(loanAccount.id);

    await loanManagementService.generateInstallments(loanAccount.id);
    loanAccount = await prisma.loanAccount.findUnique({
      where: { id: loanAccount.id },
      include: { installments: true },
    });
    expect(map(loanAccount.installments, row => pick(row, Object.keys(installments[0])))).toEqual(
      expect.arrayContaining(installments),
    );
    await loanManagementService.makeRepayment(loanAccount.id, { amount: 600, valueDate: new Date('2017-03-21') });
    loanAccount = await prisma.loanAccount.findUnique({
      where: { id: loanAccount.id },
      include: { installments: true },
    });
    expect(map(loanAccount.installments, row => pick(row, Object.keys(installmentsAfter[0])))).toEqual(
      expect.arrayContaining(installmentsAfter),
    );
  });
  test('declining-discounted-reduce-number-of-installments', async () => {
    const { loanAccountInput, installments, installmentsAfter, loanProductInput } = await import(
      './declining-discounted-reduce-number-of-installments'
    );
    const loanProduct = await loanProductService.create(loanProductInput);
    loanProductIds.push(loanProduct.id);

    let loanAccount = await prisma.loanAccount.create({
      data: { ...loanAccountInput, product: { connect: { id: loanProduct.id } } },
      include: { installments: true },
    });
    loanAccountIds.push(loanAccount.id);

    await loanManagementService.generateInstallments(loanAccount.id);
    loanAccount = await prisma.loanAccount.findUnique({
      where: { id: loanAccount.id },
      include: { installments: true },
    });
    expect(map(loanAccount.installments, row => pick(row, Object.keys(installments[0])))).toEqual(installments);
    await loanManagementService.makeRepayment(loanAccount.id, { amount: 600, valueDate: new Date('2017-03-21') });
    loanAccount = await prisma.loanAccount.findUnique({
      where: { id: loanAccount.id },
      include: { installments: true },
    });
    expect(map(loanAccount.installments, row => pick(row, Object.keys(installmentsAfter[0])))).toEqual(
      expect.arrayContaining(installmentsAfter),
    );
  });
  test('declining-no-recalculation', async () => {
    const { loanAccountInput, installments, installmentsAfter, loanProductInput } = await import(
      './declining-no-recalculation'
    );
    const loanProduct = await loanProductService.create(loanProductInput);
    loanProductIds.push(loanProduct.id);

    let loanAccount = await prisma.loanAccount.create({
      data: { ...loanAccountInput, product: { connect: { id: loanProduct.id } } },
      include: { installments: true },
    });
    loanAccountIds.push(loanAccount.id);

    await loanManagementService.generateInstallments(loanAccount.id);
    loanAccount = await prisma.loanAccount.findUnique({
      where: { id: loanAccount.id },
      include: { installments: true },
    });

    expect(map(loanAccount.installments, row => pick(row, Object.keys(installments[0])))).toEqual(installments);

    await loanManagementService.makeRepayment(loanAccount.id, { amount: 600, valueDate: new Date('2017-03-21') });
    loanAccount = await prisma.loanAccount.findUnique({
      where: { id: loanAccount.id },
      include: { installments: true },
    });

    expect(map(loanAccount.installments, row => pick(row, Object.keys(installmentsAfter[0])))).toEqual(
      expect.arrayContaining(installmentsAfter),
    );
  });
  test('declining-reduce-amount-per-installments', async () => {
    const { loanAccountInput, installments, installmentsAfter, loanProductInput } = await import(
      './declining-reduce-amount-per-installments'
    );
    const loanProduct = await loanProductService.create(loanProductInput);
    loanProductIds.push(loanProduct.id);

    let loanAccount = await prisma.loanAccount.create({
      data: { ...loanAccountInput, product: { connect: { id: loanProduct.id } } },
      include: { installments: true },
    });
    loanAccountIds.push(loanAccount.id);

    await loanManagementService.generateInstallments(loanAccount.id);
    loanAccount = await prisma.loanAccount.findUnique({
      where: { id: loanAccount.id },
      include: { installments: true },
    });
    expect(map(loanAccount.installments, row => pick(row, Object.keys(installments[0])))).toEqual(installments);
    await loanManagementService.makeRepayment(loanAccount.id, { amount: 600, valueDate: new Date('2017-03-21') });
    loanAccount = await prisma.loanAccount.findUnique({
      where: { id: loanAccount.id },
      include: { installments: true },
    });
    expect(map(loanAccount.installments, row => pick(row, Object.keys(installmentsAfter[0])))).toEqual(
      expect.arrayContaining(installmentsAfter),
    );
  });
  test('declining-reduce-number-of-installments', async () => {
    const { loanAccountInput, installments, installmentsAfter, loanProductInput } = await import(
      './declining-reduce-number-of-installments'
    );
    const loanProduct = await loanProductService.create(loanProductInput);
    loanProductIds.push(loanProduct.id);

    let loanAccount = await prisma.loanAccount.create({
      data: { ...loanAccountInput, product: { connect: { id: loanProduct.id } } },
      include: { installments: true },
    });
    loanAccountIds.push(loanAccount.id);

    await loanManagementService.generateInstallments(loanAccount.id);
    loanAccount = await prisma.loanAccount.findUnique({
      where: { id: loanAccount.id },
      include: { installments: true },
    });
    expect(map(loanAccount.installments, row => pick(row, Object.keys(installments[0])))).toEqual(installments);
    await loanManagementService.makeRepayment(loanAccount.id, { amount: 600, valueDate: new Date('2017-03-21') });
    loanAccount = await prisma.loanAccount.findUnique({
      where: { id: loanAccount.id },
      include: { installments: true },
    });

    expect(map(loanAccount.installments, row => pick(row, Object.keys(installmentsAfter[0])))).toEqual(
      expect.arrayContaining(installmentsAfter),
    );
  });
});
