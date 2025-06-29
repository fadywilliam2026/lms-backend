import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { PrismaService } from 'nestjs-prisma';
import {
  LoanAccount,
  LoanPenaltyCalculationMethod,
  LoanProduct,
  InstallmentState,
  User,
  AccountSubState,
  Client,
} from '@prisma/client';
import { LoanAccountsService } from '../loan-accounts/loan-accounts.service';
import { createLoanAccount } from '../loan-accounts/test/loan-account/creatLoanAccount';
import { AccountStateActions } from '../loan-accounts/types/account-state-actions';
import { AccountState } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import moment from 'moment';
import { LoanManagementService } from '../loan-management/loan-management.service';
import { mapKeys, min, omit, snakeCase } from 'lodash';
import { ReportService } from './report.service';
import { FraNPL, TopIndustries, Trend } from './types';
import { NPLsByIntervalDto } from './dto/NPLs-by-interval.dto';

const LOAN_PRODUCT_NAME = 'Weekly loan Zero interest Fees 1.5%';

describe('reportService', () => {
  let module: TestingModule;
  let prismaService: PrismaService;
  let reportService: ReportService;
  let loanAccountService: LoanAccountsService;

  let loanProduct: LoanProduct;
  let adminUser: User;
  let createdClient: Client;
  let loan: LoanAccount;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    reportService = module.get<ReportService>(ReportService);
    loanAccountService = module.get<LoanAccountsService>(LoanAccountsService);

    loanProduct = await prismaService.loanProduct.findFirst({ where: { name: LOAN_PRODUCT_NAME } });

    adminUser = await prismaService.user.findFirst({ where: { role: { name: 'admin' } } });
  });

  it('should be defined', () => {
    expect(reportService).toBeDefined();
  });

  describe('getTopClients', () => {
    beforeAll(async () => {
      createdClient = await prismaService.client.create({
        data: {
          firstName: 'top',
          lastName: 'clients',
          nationalId: '12345678912',
          approvedLimit: 10000,
          currentLimit: 10000,
          initialLimit: 10000,
          organization: {
            create: {
              name: 'TOP CLIENT ORG.',
            },
          },
        },
      });

      loan = await loanAccountService.create(adminUser.id, {
        ...createLoanAccount,
        loanName: 'Top Clients Loan',
        productId: loanProduct.id,
        clientId: createdClient.id,
      });

      await prismaService.loanAccount.update({
        where: { id: loan.id },
        data: { accountState: AccountState.APPROVED, approvedAt: moment().toDate() },
      });
      await loanAccountService.changeState(loan.id, AccountStateActions.DISBURSE, {
        disbursementAt: moment().toDate(),
        userId: adminUser.id,
      });
    });
    it('should return top clients', async () => {
      const clients = await prismaService.client.findMany({
        where: {
          loanAccounts: {
            some: {
              accountState: {
                in: ['ACTIVE', 'ACTIVE_IN_ARREARS'],
              },
            },
          },
        },
        include: {
          loanAccounts: true,
        },
        take: 50,
      });

      const expectedResult = [];
      for (const client of clients) {
        const amount = await prismaService.loanAccount.aggregate({
          where: { clientId: client.id, accountState: { in: ['ACTIVE', 'ACTIVE_IN_ARREARS'] } },
          _sum: { loanAmount: true, principalBalance: true },
          _count: true,
        });

        if (!amount._sum.loanAmount) continue;

        const disbursementAt = await prismaService.disbursementDetails.aggregate({
          where: {
            loanAccount: {
              some: {
                clientId: client.id,
                accountState: { in: ['ACTIVE', 'ACTIVE_IN_ARREARS'] },
                disbursementDetails: {
                  disbursementAt: {
                    not: null,
                  },
                },
              },
            },
          },
          _min: { disbursementAt: true },
        });

        if (!disbursementAt._min.disbursementAt) continue;

        const industry = client.customFields ? client.customFields['industry'] : null;
        expectedResult.push({
          id: client.id,
          first_name: client.firstName,
          last_name: client.lastName,
          commercial_name: client.commercialName,
          industry,
          organization_id: client.organizationId,
          total_loan_amount: amount._sum.loanAmount,
          outstanding_loan_amount: amount._sum.principalBalance,
          first_loan_disbursement_at: disbursementAt._min.disbursementAt,
          loans_count: amount._count,
          outstanding_loan_ratio: new Decimal(Math.round(+amount._sum.loanAmount / 15_000_000)),
        });
      }

      const result = await reportService.getTopClients().then(clients => clients.sort((a, b) => a.id - b.id));
      expect(result).toEqual(expectedResult);
    });

    it('should return all clients', async () => {
      const allClients = await reportService.getClients();
      const clients = await prismaService.client.findMany({
        where: {
          loanAccounts: {
            some: {
              accountState: {
                in: ['ACTIVE', 'ACTIVE_IN_ARREARS'],
              },
            },
          },
        },
      });
      const expectedResult = [];
      for (const client of clients) {
        const amount = await prismaService.loanAccount.aggregate({
          where: { clientId: client.id, accountState: { in: ['ACTIVE', 'ACTIVE_IN_ARREARS'] } },
          _sum: {
            loanAmount: true,
            principalBalance: true,
            feesDue: true,
            penaltyDue: true,
            interestDue: true,
            principalDue: true,
            feesPaid: true,
            penaltyPaid: true,
            interestPaid: true,
          },
          _count: true,
        });
        if (!amount._sum.loanAmount) continue;

        const disbursementAt = await prismaService.disbursementDetails.aggregate({
          where: {
            loanAccount: {
              some: {
                clientId: client.id,
                accountState: { in: ['ACTIVE', 'ACTIVE_IN_ARREARS'] },
                disbursementDetails: {
                  disbursementAt: {
                    not: null,
                  },
                },
              },
            },
          },
          _min: { disbursementAt: true },
        });
        if (!disbursementAt._min.disbursementAt) continue;

        const industry = client.customFields ? client.customFields['industry'] : null;

        expectedResult.push({
          id: client.id,
          first_name: client.firstName,
          last_name: client.lastName,
          commercial_name: client.commercialName,
          industry,
          organization_id: client.organizationId || null,
          total_loan_amount: amount._sum.loanAmount,
          total_loan_with_income: Decimal.sum(
            amount._sum.loanAmount,
            amount._sum.feesDue,
            amount._sum.penaltyDue,
            amount._sum.interestDue,
            amount._sum.feesPaid,
            amount._sum.penaltyPaid,
            amount._sum.interestPaid,
          ),
          fees_due: amount._sum.feesDue,
          penalty_due: amount._sum.penaltyDue,
          interest_due: amount._sum.interestDue,
          outstanding_loan_amount: amount._sum.principalBalance,
          outstanding_loan_amount_with_dues: Decimal.sum(
            amount._sum.principalBalance,
            amount._sum.feesDue,
            amount._sum.penaltyDue,
            amount._sum.interestDue,
          ),
          first_loan_disbursement_at: disbursementAt._min.disbursementAt,
          loans_count: amount._count,
          outstanding_loan_ratio: new Decimal(Math.round(+amount._sum.principalBalance / 15_000_000)),
        });
      }
      expect(allClients).toEqual(expectedResult);
    });
  });

  describe('Top Industries Report', () => {
    const PAID_IN_CAPITAL = parseFloat(process.env.PAID_IN_CAPITAL);

    it('should get top ten industries', async () => {
      const clients = await prismaService.client.findMany({
        where: {
          customFields: { not: null },
        },
        select: {
          customFields: true,
          loanAccounts: {
            where: {
              accountState: {
                in: [AccountState.ACTIVE, AccountState.ACTIVE_IN_ARREARS],
              },
            },
            select: {
              principalBalance: true,
            },
          },
        },
      });

      const uniqueIndustries = [...new Set(clients.flatMap(client => client.customFields['industry']))];
      const topIndustriesFromClients: TopIndustries[] = [];

      uniqueIndustries.forEach(industry => {
        const principalBalances = clients
          .filter(client => client.customFields['industry'] === industry)
          .flatMap(client => client.loanAccounts.flatMap(loanAccount => loanAccount.principalBalance));

        if (principalBalances.every(p => p == null)) return;

        const principalBalance = principalBalances.reduce((a, c) => a.add(c), new Decimal(0));

        const outstanding_loan_ratio = new Decimal(principalBalance?.dividedBy(PAID_IN_CAPITAL).toFixed(2));

        topIndustriesFromClients.push({
          industry,
          outstanding_loan_amount: principalBalance,
          outstanding_loan_ratio,
        });
      });

      const result = await reportService.getTopIndustries();

      expect(result).toEqual(topIndustriesFromClients);
    });
  });

  describe('getTrend', () => {
    it('should return trend', async () => {
      const clients = await prismaService.client.findMany({
        where: {
          loanAccounts: {
            some: {
              accountState: {
                in: ['ACTIVE', 'ACTIVE_IN_ARREARS', 'CLOSED'],
              },
            },
          },
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          organization: {
            select: {
              name: true,
            },
          },
        },

        orderBy: { id: 'asc' },
      });

      const expectedTrends: Trend[] = [];
      for (const client of clients) {
        const loanAccount = await prismaService.loanAccount.aggregate({
          where: { clientId: client.id, accountState: { in: ['ACTIVE', 'ACTIVE_IN_ARREARS', 'CLOSED'] } },
          _sum: { loanAmount: true },
          _count: true,
        });

        if (loanAccount._count === 0) continue;

        const disbursementAt = await prismaService.disbursementDetails.aggregate({
          where: {
            loanAccount: {
              some: { clientId: client.id, accountState: { in: ['ACTIVE', 'ACTIVE_IN_ARREARS', 'CLOSED'] } },
            },
          },
          _min: { disbursementAt: true },
          _max: { disbursementAt: true },
        });

        if (!disbursementAt._min.disbursementAt) continue;

        expectedTrends.push({
          first_name: client.firstName,
          last_name: client.lastName,
          partner_name: client.organization?.name || null,
          total_loan_amount: loanAccount._sum.loanAmount,
          first_loan_disbursement_at: disbursementAt._min.disbursementAt,
          last_loan_disbursement_at: disbursementAt._max.disbursementAt,
          loans_count: loanAccount._count,
          days_since_last_loan: moment().diff(moment(disbursementAt._max.disbursementAt), 'days'),
        });
      }

      const trends = await reportService.getTrend();

      expect(trends).toEqual(expectedTrends);
    });
  });

  describe('getNPLs', () => {
    let loanManagementService: LoanManagementService;
    const currentDate = new Date(moment().format('YYYY-MM-DD'));
    let loanAccount: LoanAccount;

    beforeAll(async () => {
      loanManagementService = module.get(LoanManagementService);

      loanAccount = await loanAccountService.create(adminUser.id, {
        ...createLoanAccount,
        loanAmount: 50_000,
        loanPenaltyCalculationMethod: LoanPenaltyCalculationMethod.OVERDUE_PRINCIPAL,
        penaltyRate: 10,
        loanName: 'NPL loan',
        productId: loanProduct.id,
      });

      await prismaService.loanAccount.update({
        where: { id: loanAccount.id },
        data: { accountState: 'APPROVED', approvedAt: moment().toDate() },
      });

      await loanAccountService.changeState(loanAccount.id, AccountStateActions.DISBURSE, {
        disbursementAt: new Date(moment(currentDate).subtract(1, 'months').format('YYYY-MM-DD')),
        userId: adminUser.id,
      });
      await loanManagementService.changeInstallmentsState(loanAccount.id);

      await loanManagementService.applyPenalty(loanAccount.id);
    });

    afterAll(async () => {
      await prismaService.loanAccount.delete({ where: { id: loanAccount.id } });
    });

    it('should return NPLs', async () => {
      const expectedArray = [];
      const clients = await prismaService.client.findMany({
        where: { loanAccounts: { some: { accountState: { in: ['ACTIVE_IN_ARREARS'] } } } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          customFields: true,
          organization: {
            select: {
              name: true,
              id: true,
            },
          },
          loanAccounts: {
            where: { accountState: { in: ['ACTIVE_IN_ARREARS'] } },
            include: {
              disbursementDetails: true,
              installments: { where: { state: 'LATE' } },
            },
          },
        },
      });
      const nPLs = await reportService.getNPLs();

      for (const client of clients) {
        const loanAmount = client.loanAccounts.reduce((acc, loan) => acc.add(loan.loanAmount), new Decimal(0));
        const principalBalance = client.loanAccounts.reduce(
          (acc, loan) => acc.add(loan.principalBalance),
          new Decimal(0),
        );
        const totalNumberOfLoans = client.loanAccounts.length;

        const disbursementAt = min(
          client.loanAccounts.flatMap(loanAccount => loanAccount.disbursementDetails.disbursementAt),
        );

        const installments = client.loanAccounts.flatMap(loanAccount => loanAccount.installments);
        const installmentAggregation = {
          _min: { dueDate: min(installments.flatMap(installment => installment.dueDate)) },
          _sum: installments.reduce(
            (acc, installment) =>
              acc.add(
                Decimal.sum(
                  installment.principalDue,
                  installment.penaltyDue,
                  installment.interestDue,
                  installment.feesDue,
                  installment.organizationCommissionDue,
                  installment.fundersInterestDue,
                ),
              ),
            new Decimal(0),
          ),
        };

        expectedArray.push({
          ...mapKeys(
            omit(client, ['organization', 'customFields', 'organizationId', 'approvedLimit', 'loanAccounts']),
            (_, key) => snakeCase(key),
          ),
          id: client.id,
          first_name: client.firstName,
          last_name: client.lastName,
          industry: client.customFields['industry'] || null,
          partner_name: client.organization?.name || null,
          total_loan_amount: loanAmount,
          outstanding_loan_amount: principalBalance,
          first_loan_disbursement_at: disbursementAt,
          loans_count: totalNumberOfLoans,
          due_date: installmentAggregation._min.dueDate,
          due_loan_amount: installmentAggregation._sum,
          past_due_days: moment().diff(moment(installmentAggregation._min.dueDate), 'days'),
          security: 0,
        });
      }

      expect(nPLs).toEqual(expectedArray);
    });
  });

  describe('loan Portfolio Report', () => {
    it('should get loan portfolio report', async () => {
      const loanAccounts = await prismaService.loanAccount.findMany({
        where: {
          accountState: {
            in: ['ACTIVE', 'ACTIVE_IN_ARREARS', 'CLOSED'],
          },
        },
        include: {
          client: {
            select: {
              id: true,
            },
          },
          installments: {
            where: {
              state: {
                in: ['LATE', 'PARTIALLY_PAID', 'GRACE'],
              },
            },
            select: {
              principalDue: true,
              penaltyDue: true,
              interestDue: true,
              feesDue: true,
              fundersInterestDue: true,
              organizationCommissionDue: true,
            },
          },
        },
      });

      const loanGroups = [
        {
          groupName: 'Loan Amount < 50K',
          min: 0,
          max: 49999,
        },
        {
          groupName: 'Loan Amount 50k-200k',
          min: 50000,
          max: 200000,
        },
        {
          groupName: 'Loan Amount 200k-400k',
          min: 200000,
          max: 400000,
        },
        {
          groupName: 'Loan Amount 400k-700k',
          min: 400000,
          max: 700000,
        },
        {
          groupName: 'Loan Amount 700k-1m',
          min: 700000,
          max: 1000000,
        },
        {
          groupName: 'Loan Amount 1m-2m',
          min: 1000000,
          max: 2000000,
        },
        {
          groupName: 'Loan Amount >2m',
          min: 2000000,
          max: Infinity,
        },
      ];

      const expectedResult = loanGroups
        .map(group => {
          const loans = loanAccounts.filter(loan => loan.loanAmount.gte(group.min) && loan.loanAmount.lte(group.max));

          const total_principal_balance = loans.reduce((acc, loan) => acc.add(loan.principalBalance), new Decimal(0));
          const loans_count = loans.length;
          const clients_count = new Set(loans.map(loan => loan.clientId)).size;

          let due_loan_amount = new Decimal(0);
          let loan_with_due = 0;

          loans.forEach(loan => {
            const loanDueAmount = loan.installments.reduce((acc, installment) => {
              return Decimal.sum(acc)
                .add(installment.principalDue)
                .add(installment.penaltyDue)
                .add(installment.interestDue)
                .add(installment.feesDue)
                .add(installment.organizationCommissionDue)
                .add(installment.fundersInterestDue);
            }, new Decimal(0));
            due_loan_amount = due_loan_amount.add(loanDueAmount);

            if (loanDueAmount.gt(0)) loan_with_due += 1;
          });

          return {
            loan_amount_group: group.groupName,
            outstanding_loan_amount: total_principal_balance,
            loans_count,
            clients_count,
            due_loan_amount: due_loan_amount.toFixed(2) == '0.00' ? '0' : due_loan_amount.toFixed(2),
            loan_with_due,
          };
        })
        .filter(group => Object.values(group).some(value => +value > 0));

      const result = await reportService.getLoanPortfolio();

      expect(result).toEqual(expectedResult);
    });
  });

  describe('partners Report', () => {
    it('should get partners report', async () => {
      const partner = await prismaService.organization.findMany({
        select: {
          id: true,
          name: true,
          Client: {
            select: {
              id: true,
              loanAccounts: {
                select: {
                  id: true,
                  principalBalance: true,
                  installments: {
                    where: {
                      state: {
                        in: [InstallmentState.LATE, InstallmentState.PARTIALLY_PAID, InstallmentState.GRACE],
                      },
                    },
                    select: {
                      principalDue: true,
                      penaltyDue: true,
                      interestDue: true,
                      feesDue: true,
                      organizationCommissionDue: true,
                      fundersInterestDue: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const reportData = partner.map(organization => {
        const clients = organization.Client;
        const clientCount = clients.length;
        let totalPrincipalBalance = new Decimal(0);
        const dueAmount = new Decimal(0);
        let loansCount = 0;
        let clientWithDueCount = 0;

        clients.forEach(client => {
          client.loanAccounts.forEach(loanAccount => {
            totalPrincipalBalance = totalPrincipalBalance.add(loanAccount.principalBalance);
            loansCount += 1;

            const totalInstallmentDue = loanAccount.installments.reduce((acc, installment) => {
              return acc
                .add(installment.principalDue)
                .add(installment.penaltyDue)
                .add(installment.interestDue)
                .add(installment.feesDue)
                .add(installment.organizationCommissionDue)
                .add(installment.fundersInterestDue);
            }, new Decimal(0));

            dueAmount.add(totalInstallmentDue);

            if (totalInstallmentDue.gt(0)) clientWithDueCount += 1;
          });
        });

        return {
          partner_id: organization.id,
          partner_name: organization.name,
          clients_count: clientCount,
          outstanding_loan_amount: totalPrincipalBalance,
          loans_count: loansCount,
          due_loan_amount: dueAmount.toString(),
          client_with_due: clientWithDueCount,
        };
      });

      const result = await reportService.getPartners();

      expect(result).toEqual(reportData);
    });
  });

  describe('Total Portfolio Report', () => {
    it('get total portfolio', async () => {
      const activeLoans = await prismaService.loanAccount.aggregate({
        where: {
          accountState: { in: [AccountState.ACTIVE, AccountState.ACTIVE_IN_ARREARS] },
        },
        _sum: {
          loanAmount: true,
          principalBalance: true,
        },
        _count: true,
      });

      const activeClients = await prismaService.client.count({
        where: {
          loanAccounts: {
            some: {
              accountState: { in: [AccountState.ACTIVE, AccountState.ACTIVE_IN_ARREARS] },
            },
          },
        },
      });

      const closedLoans = await prismaService.loanAccount.aggregate({
        where: {
          accountState: AccountState.CLOSED,
          accountSubState: { in: [AccountSubState.PAID, AccountSubState.TERMINATED, AccountSubState.WRITTEN_OFF] },
        },
        _sum: {
          loanAmount: true,
          principalBalance: true,
        },
        _count: true,
      });

      const expectedTotalPortfolio = [
        {
          totalNumberOfLoansDisbursed: activeLoans._count + closedLoans._count,
          totalAmountOfLoansDisbursed: Decimal.add(activeLoans._sum.loanAmount || 0, closedLoans._sum.loanAmount || 0),
          totalNumberOfLoansOutstanding: activeLoans._count,
          outstandingLoansAmount: activeLoans._sum.principalBalance || new Decimal(0),
          totalNumberOfClients: await prismaService.client.count(),
          numberOfOutstandingClients: activeClients,
        },
      ];
      const result = await reportService.getTotalPortfolio();

      expect(result).toEqual(expectedTotalPortfolio);
    });
  });

  describe('Get Rejected Loans', () => {
    it('should return rejected loans', async () => {
      const rejectedLoans = await reportService.getRejectedLoans();

      const query = await prismaService.$queryRaw<[{ count: string }]>`
        SELECT COUNT(*)::NUMERIC FROM "loan_accounts" WHERE "account_state" = 'CLOSED' AND "account_sub_state" = 'REJECTED'
      `;

      expect(rejectedLoans.length).toEqual(parseInt(query[0].count));
    });
  });

  describe('getFraNPLs', () => {
    const groups = [
      { label: 'Up to 30 days', minDays: 0, maxDays: 30 },
      { label: '31 - 90 Days', minDays: 30, maxDays: 90 },
      { label: '91 - 120 Days', minDays: 90, maxDays: 120 },
      { label: '121 - 180 Days', minDays: 120, maxDays: 180 },
      { label: 'More than 180 Days', minDays: 180, maxDays: Infinity },
    ];

    it('should return Fra NPLs', async () => {
      const expectedArray: FraNPL[] = [];

      const installments = await prismaService.installment.findMany({
        where: {
          state: 'LATE',
          dueDate: { lte: new Date(moment().format('YYYY-MM-DD')) },
          loanAccount: {
            accountState: AccountState.ACTIVE_IN_ARREARS,
          },
        },
        select: {
          dueDate: true,
          feesDue: true,
          principalDue: true,
          fundersInterestDue: true,
          interestDue: true,
          penaltyDue: true,
          organizationCommissionDue: true,
          loanAccount: {
            select: {
              id: true,
              clientId: true,
            },
          },
        },
      });

      for (const group of groups) {
        const filteredInstallments = installments.filter(
          installment =>
            moment().diff(installment.dueDate, 'days') > group.minDays &&
            moment().diff(installment.dueDate, 'days') <= group.maxDays,
        );

        if (filteredInstallments.length === 0) continue;

        const totalDueAmount = filteredInstallments.reduce(
          (acc, i) =>
            Decimal.sum(
              acc,
              i.principalDue,
              i.penaltyDue,
              i.interestDue,
              i.feesDue,
              i.organizationCommissionDue,
              i.fundersInterestDue,
            ),
          new Decimal(0),
        );

        const loanInterestAmount = filteredInstallments.reduce(
          (acc, i) => Decimal.sum(acc, i.interestDue),
          new Decimal(0),
        );

        const uniqueLoans = new Set(filteredInstallments.map(i => i.loanAccount.id));
        const uniqueClients = new Set(filteredInstallments.map(i => i.loanAccount.clientId));

        expectedArray.push({
          label: group.label,
          due_loan_amount: totalDueAmount,
          interest_due: loanInterestAmount,
          loans_count: uniqueLoans.size,
          clients_count: uniqueClients.size,
        });
      }

      const result = await reportService.getFraNpls();
      expect(result).toEqual(expectedArray);
    });

    it('should get NPLs by interval', async () => {
      const query: NPLsByIntervalDto = {
        referenceDate: new Date(moment().format('YYYY-MM-DD')),
        intervalLimitDays: 60,
        dueField: 'principal_due',
      };

      const expectedArray = [];
      const clients = await prismaService.client.findMany({
        where: {
          loanAccounts: {
            some: {
              accountState: AccountState.ACTIVE_IN_ARREARS,
            },
          },
        },
        select: {
          id: true,
          commercialName: true,
          loanAccounts: {
            where: {
              accountState: AccountState.ACTIVE_IN_ARREARS,
            },
            include: {
              installments: true,
            },
          },
        },
      });
      for (const client of clients) {
        const localClient = {};
        for (let startDay = 0; startDay < query.intervalLimitDays; startDay += 30) {
          const filteredInstallments = client.loanAccounts
            .flatMap(l => l.installments)
            .filter(i => {
              if (i.state == 'LATE' && moment(query.referenceDate).diff(i.dueDate, 'days') === 0 && startDay === 0)
                return false;
              return (
                moment(query.referenceDate).diff(i.dueDate, 'days') > startDay + 1 &&
                moment(query.referenceDate).diff(i.dueDate, 'days') <= startDay + 30 &&
                i.state == 'LATE'
              );
            });

          const principal_due = filteredInstallments.reduce(
            (acc, installment) => Decimal.sum(acc, installment.principalDue),
            new Decimal(0),
          );
          localClient[`${startDay}-${startDay + 30} Days`] = principal_due;
        }

        const filteredInstallments = client.loanAccounts
          .flatMap(l => l.installments)
          .filter(
            i =>
              moment(query.referenceDate).diff(moment(i.dueDate), 'days') > query.intervalLimitDays &&
              i.state == 'LATE',
          );
        const principal_due = filteredInstallments.reduce(
          (acc, installment) => Decimal.sum(acc, installment.principalDue),
          new Decimal(0),
        );

        localClient[`More than ${query.intervalLimitDays} Days`] = principal_due;

        const installment = await prismaService.installment.aggregate({
          where: {
            loanAccountId: { in: client.loanAccounts.map(loanAccount => loanAccount.id) },
          },
          _sum: {
            principalDue: true,
          },
        });

        const currentBalance = await prismaService.installment.aggregate({
          where: {
            loanAccountId: { in: client.loanAccounts.map(loanAccount => loanAccount.id) },
            state: {
              not: InstallmentState.PAID,
            },
          },
          _sum: {
            principalDue: true,
          },
        });

        if (currentBalance._sum.principalDue === null) continue;

        const totalPaid = await prismaService.installment.aggregate({
          where: {
            loanAccountId: { in: client.loanAccounts.map(loanAccount => loanAccount.id) },
            state: InstallmentState.PAID,
          },
          _sum: {
            principalDue: true,
          },
        });

        const notDue = await prismaService.installment.aggregate({
          where: {
            loanAccountId: { in: client.loanAccounts.map(loanAccount => loanAccount.id) },
            state: {
              in: ['PENDING', 'PAID', 'PARTIALLY_PAID', 'GRACE'],
            },
          },
          _sum: {
            principalDue: true,
          },
        });

        const totalDue = client.loanAccounts
          .flatMap(l => l.installments)
          .filter(i => i.state === 'LATE')
          .reduce((acc, i) => Decimal.sum(acc, i.principalDue), new Decimal(0));

        expectedArray.push({
          id: client.id,
          commercial_name: client.commercialName,
          ...localClient,
          total_due: totalDue,
          current_balance: currentBalance._sum.principalDue,
          total_paid: totalPaid._sum.principalDue || new Decimal(0),
          not_due: notDue._sum.principalDue,
          total_amount: installment._sum.principalDue,
        });
      }

      const result = (await reportService.getNPLsByInterval(query)).filter(r => r.commercial_name !== 'Total');
      expect(result).toEqual(expectedArray);
    });
  });

  afterAll(async () => {
    await prismaService.loanAccount.delete({
      where: {
        id: loan.id,
      },
    });
    await prismaService.client.delete({
      where: {
        id: createdClient.id,
      },
    });
  });
});
