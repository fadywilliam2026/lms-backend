import { PrismaService } from 'nestjs-prisma';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { createLoanAccount } from './test/loan-account/creatLoanAccount';
import { AccountState, Client, LoanAccount, LoanTransactionType, User } from '@prisma/client';
import { LoanAccountsService } from './loan-accounts.service';
import { AccountStateActions } from './types/account-state-actions';
import { UnprocessableEntityException } from '@nestjs/common';

const ProductName = 'Weekly loan Zero interest Fees 1.5%';

describe('Loan Account Service', () => {
  let module: TestingModule;
  let loanAccountService: LoanAccountsService;
  let prisma: PrismaService;
  let adminUser: User;
  let loanAccount: LoanAccount;
  let client: Client;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    prisma = module.get<PrismaService>(PrismaService);
    loanAccountService = module.get<LoanAccountsService>(LoanAccountsService);

    adminUser = await prisma.user.findFirstOrThrow({
      where: {
        role: {
          name: 'admin',
        },
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await module.close();
  });

  describe('Early Payment Action', () => {
    beforeAll(async () => {
      const product = await prisma.loanProduct.findFirst({
        where: { name: ProductName },
      });
      client = await prisma.client.create({
        data: {
          firstName: 'Early',
          lastName: 'Payment',
          commercialName: 'Early Payment',
          nationalId: '1234567890',
          initialLimit: 10000,
          currentLimit: 10000,
          approvedLimit: 10000,
        },
      });

      loanAccount = await loanAccountService.create(adminUser.id, {
        ...createLoanAccount,
        clientId: client.id,
        productId: product.id,
      });

      await prisma.loanAccount.update({
        where: { id: loanAccount.id },
        data: { accountState: AccountState.APPROVED, approvedAt: new Date() },
      });

      await loanAccountService.changeState(loanAccount.id, AccountStateActions.DISBURSE, {
        disbursementAt: new Date(),
        userId: adminUser.id,
      });
    });

    afterAll(async () => {
      await prisma.loanAccount.delete({
        where: {
          id: loanAccount.id,
        },
      });
      await prisma.client.delete({
        where: {
          id: client.id,
        },
      });
    });

    it('Throw error for amount greater than or equal to loan account', async () => {
      const amount = loanAccount.loanAmount;
      try {
        await loanAccountService.changeState(loanAccount.id, AccountStateActions.EARLY_PAYMENT, {
          makeRepaymentDto: { amount, valueDate: new Date() },
          userId: adminUser.id,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
      }
    });

    it('Throw error when value date exceeded early payment period', async () => {
      const amount = 2000;
      const installment = await prisma.installment.findFirst({
        where: { loanAccountId: loanAccount.id },
        orderBy: { dueDate: 'asc' },
      });

      const valueDate = installment.dueDate;
      try {
        await loanAccountService.changeState(loanAccount.id, AccountStateActions.EARLY_PAYMENT, {
          makeRepaymentDto: { amount, valueDate },
          userId: adminUser.id,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
      }
    });
    it('Successfully Early Payment ', async () => {
      const oldLoanAccount = await prisma.loanAccount.findUnique({
        where: { id: loanAccount.id },
        include: { installments: true },
      });

      const prevAccountTransactions = await prisma.loanTransaction.findMany({
        where: {
          loanAccountId: loanAccount.id,
        },
      });

      const amount = 2000;
      await loanAccountService.changeState(loanAccount.id, AccountStateActions.EARLY_PAYMENT, {
        makeRepaymentDto: { amount, valueDate: new Date() },
        userId: adminUser.id,
      });

      const newLoanAccount = await prisma.loanAccount.findUnique({
        where: { id: loanAccount.id },
        include: { installments: true },
      });

      const currentAccountTransactions = await prisma.loanTransaction.findMany({
        where: {
          loanAccountId: loanAccount.id,
        },
      });

      expect(+oldLoanAccount.loanAmount).toBeGreaterThan(+newLoanAccount.loanAmount);
      expect(+oldLoanAccount.principalBalance).toBeGreaterThan(+newLoanAccount.principalBalance);
      expect(oldLoanAccount.feesDue).toEqual(newLoanAccount.feesDue);

      expect(prevAccountTransactions.length).toBeLessThan(currentAccountTransactions.length);

      expect(currentAccountTransactions.some(transaction => transaction.type === LoanTransactionType.REPAYMENT)).toBe(
        true,
      );

      expect(currentAccountTransactions.find(t => t.type === LoanTransactionType.FEE)?.amount).toEqual(
        +newLoanAccount.feesDue,
      );
    });
  });
});
