import { Injectable } from '@nestjs/common';
import _, { filter, find, omit, sumBy } from 'lodash';
import { PrismaService } from 'nestjs-prisma';
import { AccountState, InstallmentPeriodUnit } from '@prisma/client';
import moment from 'moment';
import { InstallmentHelperService } from '../loan-management/installment/installment.helper.service';
import { json2csv } from 'json-2-csv';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly installmentHelper: InstallmentHelperService,
  ) {}

  async getLoansStates() {
    const x = await this.prismaService.loanAccount.groupBy({
      by: ['accountState'],
      _count: {
        accountState: true,
      },
      _sum: {
        loanAmount: true,
        principalBalance: true,
      },
    });

    return {
      partialApplication: {
        count: find(x, { accountState: 'PARTIAL_APPLICATION' })?._count.accountState || 0,
        amount: find(x, { accountState: 'PARTIAL_APPLICATION' })?._sum.loanAmount || 0,
      },
      pendingApproval: {
        count: find(x, { accountState: 'PENDING_APPROVAL' })?._count.accountState || 0,
        amount: find(x, { accountState: 'PENDING_APPROVAL' })?._sum.loanAmount || 0,
      },
      approved: {
        count: find(x, { accountState: 'APPROVED' })?._count.accountState || 0,
        amount: find(x, { accountState: 'APPROVED' })?._sum.loanAmount || 0,
      },
      active: {
        count: find(x, { accountState: 'ACTIVE' })?._count.accountState || 0,
        amount: find(x, { accountState: 'ACTIVE' })?._sum.loanAmount || 0,
        principalBalance: find(x, { accountState: 'ACTIVE' })?._sum.principalBalance || 0,
      },
      activeInArrears: {
        count: find(x, { accountState: 'ACTIVE_IN_ARREARS' })?._count.accountState || 0,
        amount: find(x, { accountState: 'ACTIVE_IN_ARREARS' })?._sum.loanAmount || 0,
        principalBalance: find(x, { accountState: 'ACTIVE_IN_ARREARS' })?._sum.principalBalance || 0,
      },
      closed: {
        count: find(x, { accountState: 'CLOSED' })?._count.accountState || 0,
        amount: find(x, { accountState: 'CLOSED' })?._sum.loanAmount || 0,
      },
    };
  }

  getClientsTotalbyState() {
    return this.prismaService.client.groupBy({
      by: ['state'],
      _count: { id: true },
    });
  }

  async getLoanAmountsStats() {
    const sumLoanAmount = await this.prismaService.loanAccount.aggregate({
      _sum: { loanAmount: true },
      _count: { loanAmount: true },
      where: {
        accountState: {
          in: ['ACTIVE', 'ACTIVE_IN_ARREARS'],
        },
      },
    });

    const grossLoanPortfolio = await this.prismaService.loanAccount.aggregate({
      _sum: { principalBalance: true },
      _count: { principalBalance: true },
      where: {
        accountState: {
          in: ['ACTIVE', 'ACTIVE_IN_ARREARS'],
        },
      },
    });

    return {
      grossLoanPortfolio: {
        sum: grossLoanPortfolio._sum.principalBalance,
        count: grossLoanPortfolio._count.principalBalance,
      },
      totalLoanAmount: { sum: (await sumLoanAmount)._sum.loanAmount, count: (await sumLoanAmount)._count.loanAmount },
    };
  }

  async getRepaymentTransactions({
    start = moment().subtract(50, 'year').startOf('day').toDate(),
    end = moment().add(50, 'year').endOf('day').toDate(),
  }) {
    const result = this.prismaService.$queryRaw`
      SELECT DATE_TRUNC('day', entry_date) AS date, 
      SUM(principal_amount)  +  SUM(fees_amount) + SUM(penalty_amount) + SUM(interest_amount) AS amount, 
      COUNT(*)::int AS count
      FROM loan_transactions 
      WHERE type = 'REPAYMENT' 
      AND cast(entry_date as date) BETWEEN TO_DATE(${start?.toISOString()}, 'YYYY-MM-DD') AND TO_DATE(${end?.toISOString()}, 'YYYY-MM-DD')
      GROUP BY DATE_TRUNC('day', entry_date)`;
    return result;
  }

  async getDisbursementTransactions({
    start = moment().subtract(50, 'year').startOf('day').toDate(),
    end = moment().add(50, 'year').endOf('day').toDate(),
  }) {
    const result = await this.prismaService.$queryRaw`
      SELECT DATE_TRUNC('day', entry_date) as date, 
      organizations.name as organization,
      SUM(amount) AS amount,
      COUNT(*)::int AS count
      FROM loan_transactions 
      join loan_accounts on loan_accounts.id = loan_transactions.loan_account_id
      join clients on loan_accounts.client_id = clients.id
      left join organizations on organizations.id = clients.organizatation_id
      WHERE loan_transactions.type = 'DISBURSEMENT'
      AND cast(entry_date as date) BETWEEN TO_DATE(${start?.toISOString()}, 'YYYY-MM-DD') AND TO_DATE(${end?.toISOString()}, 'YYYY-MM-DD') 
      GROUP BY DATE_TRUNC('day', entry_date) , organizations.name`;
    return result;
  }

  async getExpectedInstallments({
    start = moment().subtract(50, 'year').startOf('day').toDate(),
    end = moment().add(50, 'year').endOf('day').toDate(),
  }) {
    const installments = await this.prismaService.installment.findMany({
      where: {
        state: { not: 'PAID' },
        dueDate: { gte: start, lte: end },
      },
      include: {
        loanAccount: true,
      },
    });
    return installments.map(installment => ({
      ...installment,
      totalDue: this.installmentHelper.getDueAmount(installment),
    }));
  }

  calculateDueNet = (due: Decimal, paid: Decimal) => +due.sub(paid).toFixed(2);

  async getLatePayments() {
    const data = await this.prismaService.installment.findMany({
      select: {
        id: true,
        penaltyDue: true,
        penaltyPaid: true,
        principalDue: true,
        principalPaid: true,
        interestDue: true,
        interestPaid: true,
        feesDue: true,
        feesPaid: true,
        loanAccount: {
          select: {
            id: true,
            clientId: true,
            userId: true,
            user: {
              select: {
                organizationId: true,
              },
            },
          },
        },
      },
      where: {
        state: { equals: 'LATE' },
      },
    });

    const aggregatedData = _(data)
      .map(o => {
        return {
          id: o.id,
          loanAccountId: o.loanAccount.id,
          principalDueNet: this.calculateDueNet(o.penaltyDue, o.penaltyPaid),
          interestDueNet: this.calculateDueNet(o.interestDue, o.interestPaid),
          penaltyDueNet: this.calculateDueNet(o.penaltyDue, o.penaltyPaid),
          feesDueNet: this.calculateDueNet(o.feesDue, o.feesPaid),
          clientId: o.loanAccount.clientId,
          userId: o.loanAccount.userId,
          organizationId: o.loanAccount?.user?.organizationId,
        };
      })
      .groupBy('loanAccountId')
      .map((value, key) => ({
        loanAccountId: parseInt(key),
        clientId: value[0].clientId,
        principalDueNet: sumBy(value, 'principalDueNet'),
        interestDueNet: sumBy(value, 'interestDueNet'),
        penaltyDueNet: sumBy(value, 'penaltyDueNet'),
        feesDueNet: sumBy(value, 'feesDueNet'),
        userId: value[0].userId,
        organizationId: value[0].organizationId,
      }))
      .unionBy('loanAccountId')
      .value();

    return aggregatedData;
  }

  async getActiveOrganizations(states: AccountState[]) {
    const data = await this.prismaService.loanAccount.findMany({
      select: {
        id: true,
        loanAmount: true,
        client: {
          select: {
            organization: {
              select: {
                name: true,
                customFields: true,
              },
            },
          },
        },
      },
      where: {
        accountState: {
          in: states,
        },
      },
    });

    const newData = _(data)
      .map(o => ({
        organization: o.client?.organization?.name || 'unassociated loans',
        organizationIndustry: (o.client?.organization?.customFields as any)?.industry || 'unknown industry',
        organizationSubIndustry: (o.client?.organization?.customFields as any)?.subIndustry || 'unknown industry',
        loanAccountId: o.id,
        loanAmount: o.loanAmount,
      }))
      .groupBy('organization')
      .map((value, key) => ({
        organization: key,
        organizationIndustry: value[0].organizationIndustry,
        organizationSubIndustry: value[0].organizationSubIndustry,
        countLoans: value.length,
        sumAmounts: this.sumDecimal(value, 'loanAmount'),
      }))
      .value();

    return newData;
  }

  async getLoansByOrganizationIndustry() {
    const data = await this.prismaService.loanAccount.findMany({
      select: {
        id: true,
        loanAmount: true,
        client: {
          select: {
            organization: {
              select: {
                customFields: true,
              },
            },
          },
        },
      },
      where: {
        accountState: 'ACTIVE',
      },
    });

    const aggregatedData = _(data)
      .map(o => ({
        organizationIndustry: (o.client?.organization?.customFields as any)?.industry || 'unknown industry',
        loanAccountId: o.id,
        loanAmount: o.loanAmount,
      }))
      .groupBy('organizationIndustry')
      .map((value, key) => ({
        organizationIndustry: key,
        countLoans: value.length,
        sumAmounts: this.sumDecimal(value, 'loanAmount'),
      }));

    return aggregatedData;
  }

  async getLoansByOrganizationSubIndustry() {
    const data = await this.prismaService.loanAccount.findMany({
      select: {
        id: true,
        loanAmount: true,
        client: {
          select: {
            organization: {
              select: {
                customFields: true,
              },
            },
          },
        },
      },
      where: {
        accountState: 'ACTIVE',
      },
    });

    const aggregatedData = _(data)
      .map(o => ({
        organizationSubIndustry: (o.client?.organization?.customFields as any)?.subIndustry || 'unknown industry',
        loanAccountId: o.id,
        loanAmount: o.loanAmount,
      }))
      .groupBy('organizationSubIndustry')
      .map((value, key) => ({
        organizationSubIndustry: key,
        countLoans: value.length,
        sumAmounts: this.sumDecimal(value, 'loanAmount'),
      }))
      .value();

    return aggregatedData;
  }

  async getLoansByClientIndustry(states: AccountState[]) {
    const data = await this.prismaService.loanAccount.findMany({
      select: {
        id: true,
        loanAmount: true,
        client: {
          select: {
            customFields: true,
          },
        },
      },
      where: {
        accountState: {
          in: states,
        },
      },
    });
    const aggregatedData = _(data)
      .map(o => ({
        clientIndustry: (o.client.customFields as any)?.industry || 'unknown industry',
        loanAccountId: o.id,
        loanAmount: o.loanAmount,
      }))
      .groupBy('clientIndustry')
      .map((value, key) => ({
        clientIndustry: key,
        countLoans: value.length,
        sumAmounts: this.sumDecimal(value, 'loanAmount'),
      }))
      .value();

    return aggregatedData;
  }

  async getLoansByTenor(states: AccountState[]) {
    const tenorCategories = [
      { category: '1 day', min: 0, max: 1 },
      { category: '1 month', min: 1, max: 31 },
      { category: '2 months', min: 31, max: 62 },
      { category: '3 months', min: 62, max: 92 },
      { category: '6 months', min: 92, max: 183 },
      { category: '1 year', min: 183, max: 365 },
      { category: '> 1 year', min: 365, max: 3650 },
    ];

    const data = await this.prismaService.loanAccount.findMany({
      select: {
        id: true,
        loanAmount: true,
        numInstallments: true,
        installmentPeriodCount: true,
        installmentPeriodUnit: true,
      },
      where: {
        accountState: {
          in: states,
        },
      },
    });

    const aggregatedData = data.map(o => {
      const numDays =
        o.installmentPeriodUnit === InstallmentPeriodUnit.YEARS
          ? 365
          : o.installmentPeriodUnit === InstallmentPeriodUnit.QUARTERS
            ? 90
            : o.installmentPeriodUnit === InstallmentPeriodUnit.MONTHS
              ? 30
              : o.installmentPeriodUnit === InstallmentPeriodUnit.WEEKS
                ? 7
                : 1;
      const tenor = numDays * o.installmentPeriodCount * o.numInstallments;
      return {
        loanAccountId: o.id,
        loanAmount: +o.loanAmount,
        tenor: tenor,
      };
    });

    const loansByTenor = tenorCategories.map(o => {
      const loansInCategory = filter(aggregatedData, loan => loan.tenor > o.min && loan.tenor <= o.max);

      return {
        tenorCategory: o.category,
        countLoans: loansInCategory.length,
        sumAmounts: sumBy(loansInCategory, 'loanAmount'),
      };
    });
    return loansByTenor;
  }

  async getValueAtRisk() {
    const loansInArrears = await this.prismaService.loanAccount.findMany({
      select: {
        principalBalance: true,
        setToArrearsAt: true,
        interestBalance: true,
        penaltyBalance: true,
      },
      where: {
        accountState: 'ACTIVE_IN_ARREARS',
      },
    });

    const totalVAR = this.sumDecimal(loansInArrears, 'principalBalance').toNumber();

    const totalInterestInSuspense = this.sumDecimal(loansInArrears, 'interestBalance').toNumber();

    const totalPenaltyBalance = this.sumDecimal(loansInArrears, 'penaltyBalance').toNumber();

    const loansInArrearsWithDaysInArrears = loansInArrears.map(o => ({
      ...o,
      daysInArrears: moment().diff(moment(o.setToArrearsAt), 'days'),
    }));

    const var7 = filter(loansInArrearsWithDaysInArrears, o => o.daysInArrears > 7 && o.daysInArrears <= 15);

    const var15 = filter(loansInArrearsWithDaysInArrears, o => o.daysInArrears > 15 && o.daysInArrears <= 30);

    const var30 = filter(loansInArrearsWithDaysInArrears, o => o.daysInArrears > 30 && o.daysInArrears <= 90);

    const var90 = filter(loansInArrearsWithDaysInArrears, o => o.daysInArrears > 90);

    return {
      totalValueAtRisk: {
        amount: totalVAR,
        count: loansInArrears?.length || 0,
      },
      totalInterestInSuspense: {
        amount: totalInterestInSuspense,
        count: loansInArrears?.length || 0,
      },
      totalPenaltyBalance: {
        amount: totalPenaltyBalance,
        count: loansInArrears?.length || 0,
      },
      var7: {
        amount: this.sumDecimal(var7, 'principalBalance').toNumber(),
        count: var7.length,
      },
      var15: {
        amount: this.sumDecimal(var15, 'principalBalance').toNumber(),
        count: var15.length,
      },
      var30: {
        amount: this.sumDecimal(var30, 'principalBalance').toNumber(),
        count: var30.length,
      },
      var90: {
        amount: this.sumDecimal(var90, 'principalBalance').toNumber(),
        count: var90.length,
      },
    };
  }

  async getValueAtRiskData() {
    const x = await this.prismaService.loanAccount.findMany({
      select: {
        id: true,
        loanName: true,
        principalBalance: true,
        interestDue: true,
        setToArrearsAt: true,
        clientId: true,
        userId: true,
        user: {
          select: {
            organizationId: true,
          },
        },
      },
      where: {
        accountState: 'ACTIVE_IN_ARREARS',
      },
    });

    const data = x.map(o => {
      return {
        ...omit(o, 'user'),
        organizationId: o.user?.organizationId,
        varDays: moment().diff(moment(o.setToArrearsAt), 'days'),
      };
    });

    return data;
  }

  async getCreditLimits() {
    const sumCreditLimits = await this.prismaService.client.aggregate({
      _sum: {
        approvedLimit: true,
      },
      where: {
        state: 'ACTIVE',
      },
    });

    const totalOutstandingPortfolio = await this.prismaService.loanAccount.aggregate({
      _sum: { principalBalance: true },
      where: {
        accountState: {
          in: ['ACTIVE', 'ACTIVE_IN_ARREARS'],
        },
      },
    });

    return {
      sumCreditLimits: sumCreditLimits?._sum.approvedLimit || 0,
      totalOutstandingPortfolio: totalOutstandingPortfolio?._sum.principalBalance || 0,
    };
  }

  async getLoanTransaction() {
    const loanTransactions = await this.prismaService.loanTransaction.findMany({
      include: {
        loanAccount: {
          include: {
            client: true,
          },
        },
      },
    });

    const loans = loanTransactions.map(row => {
      return {
        id: row.id,
        createdAt: row.createdAt,
        amount: row.amount,
        feesAmount: row.feesAmount,
        interestAmount: row.interestAmount,
        penaltyAmount: row.penaltyAmount,
        principalAmount: row.principalAmount,
        partnerCommissionAmount: row.organizationCommissionAmount,
        type: row.type,
        userId: row.userId,
        loanAccountId: row.loanAccountId,
        interestRate: row.loanAccount.interestRate,
        partnerCommissionPercent: row.loanAccount.organizationCommissionPercent,
        firstName: row.loanAccount.client.firstName,
        lastName: row.loanAccount.client.lastName,
        commercialName: row.loanAccount.client.commercialName,
        companyName: row.loanAccount.client.customFields ? row.loanAccount.client.customFields['companyName'] : '',
      };
    });

    const csvFile = json2csv(loans, { excelBOM: true, unwindArrays: true });

    return Buffer.from(csvFile, 'utf8');
  }

  sumDecimal(data: any[] | undefined, property: string): Decimal {
    if (!data) return new Decimal(0);
    return data?.reduce((sum, item) => sum.plus(item[property]), new Decimal(0)) || new Decimal(0);
  }
}
