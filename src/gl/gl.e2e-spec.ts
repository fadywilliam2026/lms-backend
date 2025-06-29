import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { FinancialResource, User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'nestjs-prisma';
import { initTest } from '../common/helpers/spec.helper';

describe('gl', () => {
  let app: NestFastifyApplication;
  let admin: User & { accessToken: string; refreshToken: string };
  let prisma: PrismaService;
  beforeAll(async () => {
    ({ app, admin } = await initTest());
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('gl is working', async () => {
    const loanProduct = (
      await app.inject({
        method: 'POST',
        url: '/loanproducts',
        payload: {
          name: 'gl Product',
          amortizationMethod: 'STANDARD_PAYMENTS',
          interestRateSetting: { maxInterestRate: 121 },
          maxLoanAmount: 10000,
          maxNumInstallments: 120,
          defaultInstallmentPeriodCount: 12,
          defaultPrincipalInstallmentInterval: 0,
        },
        headers: { authorization: `Bearer ${admin.accessToken}` },
      })
    ).json();
    const client = (
      await app.inject({
        method: 'POST',
        url: '/clients',
        payload: {
          firstName: 'gl client',
          email: 'gl@gl.com',
          nationalId: '29605102100873',
          taxRecordId: '123456789',
          currentLimit: 10000,
          approvedLimit: 10000,
          initialLimit: 10000,
          commercialName: "gl's client",
        },
        headers: { authorization: `Bearer ${admin.accessToken}` },
      })
    ).json();
    const loanAccount = (
      await app.inject({
        method: 'POST',
        url: '/loans',
        payload: {
          loanName: 'gl loan account',
          interestRate: 120,
          interestCalculationMethod: 'FLAT',
          loanAmount: 1000,
          numInstallments: 4,
          productId: loanProduct.id,
          clientId: client.id,
        },
        headers: { authorization: `Bearer ${admin.accessToken}` },
      })
    ).json();

    await app.inject({
      method: 'PATCH',
      url: `/loans/${loanAccount.id}/changeState`,
      payload: {
        action: 'REQUEST_APPROVAL',
      },
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    await app.inject({
      method: 'PATCH',
      url: `/loans/${loanAccount.id}/changeState`,
      payload: {
        action: 'APPROVE',
      },
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });
    await app.inject({
      method: 'PATCH',
      url: `/loans/${loanAccount.id}/changeState`,
      payload: {
        action: 'DISBURSE',
      },
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });

    const installments = await prisma.installment.findMany({
      where: { loanAccountId: loanAccount.id, state: 'PENDING' },
    });
    await app.inject({
      method: 'POST',
      url: `/loans/${loanAccount.id}/installment/${installments[0].id}`,
      payload: {
        amount: +new Decimal(installments[0].interestDue).add(installments[0].principalDue),
        valueDate: new Date(),
      },
      headers: { authorization: `Bearer ${admin.accessToken}` },
    });

    const entries = await prisma.gLJournalEntry.findMany({
      where: {
        loanAccountId: loanAccount.id,
        loanProductId: loanProduct.id,
      },
      include: {
        glAccountRule: true,
      },
    });
    expect(entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'DEBIT',
          amount: new Decimal(loanAccount.loanAmount),
          glAccountRule: expect.objectContaining({ financialResource: FinancialResource.PORTFOLIO_CONTROL }),
        }),
        expect.objectContaining({
          type: 'CREDIT',
          amount: new Decimal(loanAccount.loanAmount),
          glAccountRule: expect.objectContaining({ financialResource: FinancialResource.TRANSACTION_SOURCE }),
        }),
        expect.objectContaining({
          type: 'DEBIT',
          amount: new Decimal(installments[0].principalDue),
          glAccountRule: expect.objectContaining({ financialResource: FinancialResource.TRANSACTION_SOURCE }),
        }),
        expect.objectContaining({
          type: 'CREDIT',
          amount: new Decimal(installments[0].principalDue),
          glAccountRule: expect.objectContaining({ financialResource: FinancialResource.PORTFOLIO_CONTROL }),
        }),
        expect.objectContaining({
          type: 'DEBIT',
          amount: new Decimal(installments[0].interestDue),
          glAccountRule: expect.objectContaining({ financialResource: FinancialResource.TRANSACTION_SOURCE }),
        }),
        expect.objectContaining({
          type: 'CREDIT',
          amount: new Decimal(installments[0].interestDue),
          glAccountRule: expect.objectContaining({ financialResource: FinancialResource.INTEREST_INCOME }),
        }),
      ]),
    );
  });
});
