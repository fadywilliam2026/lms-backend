import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AccountState, AccountSubState } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'nestjs-prisma';
import { FraNPL, LoanPortfolio, NPL, Partner, TopClient, TopIndustries, TotalPortfolio, Trend } from './types';
import { omit } from 'lodash';
import { NPLsByIntervalDto } from './dto/NPLs-by-interval.dto';
import moment from 'moment';

@Injectable()
export class ReportService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
  }

  PAID_IN_CAPITAL = new Decimal(this.configService.get<number>('PAID_IN_CAPITAL'));

  async getClients(limit?: number) {
    const limitClause = limit ? 'LIMIT ' + limit : '';
    try {
      await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
      return await this.prismaService.$queryRawUnsafe<TopClient[]>(`
     SELECT c.id , c.first_name , c.last_name , c.commercial_name , c.custom_fields ->> 'industry' as industry, c.organizatation_id as organization_id,
        SUM(l.loan_amount) as total_loan_amount, 
        SUM(l.loan_amount + l.fees_due + l.penalty_due + l.interest_due + l.fees_paid + l.penalty_paid + l.interest_paid) as total_loan_with_income,
        SUM(l.fees_due) as fees_due,
        SUM(l.penalty_due) as penalty_due,
        SUM(l.interest_due) as interest_due,
        SUM(l.principal_balance) as outstanding_loan_amount,
        SUM(l.principal_balance + l.fees_due + l.penalty_due + l.interest_due ) as outstanding_loan_amount_with_dues,
        MIN(d.disbursement_at) as first_loan_disbursement_at,
        CAST(COUNT(l.id) as INTEGER) as loans_count,
        CAST(SUM(l.principal_balance) / ${this.PAID_IN_CAPITAL} as DECIMAL) as outstanding_loan_ratio
      FROM clients c
      left JOIN organizations o ON c.organizatation_id = o.id 
      JOIN loan_accounts l ON c.id = l.client_id
      left JOIN disbursement_details d ON l.disbursement_details_id = d.id
      WHERE l.account_state IN ( 'ACTIVE', 'ACTIVE_IN_ARREARS')
      GROUP BY c.id , o.id
      ORDER BY total_loan_amount DESC
      ${limitClause}
    `);
    } catch (error) {
      throw new UnprocessableEntityException(error.meta.message);
    }
  }

  async getTopClients(limit: number = 50) {
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    return (await this.getClients(limit)).map(client => ({
      ...omit(client, [
        'fees_due',
        'penalty_due',
        'interest_due',
        'outstanding_loan_amount_with_dues',
        'total_loan_with_income',
      ]),
    }));
  }

  async getTopIndustries() {
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;

    return await this.prismaService.$queryRaw<TopIndustries[]>`SELECT c.custom_fields ->> 'industry' as industry , 
             SUM(l.principal_balance)  as outstanding_loan_amount , 
             CAST(SUM(l.principal_balance)/${this.PAID_IN_CAPITAL} as DECIMAL) as outstanding_loan_ratio
        FROM clients c
        JOIN loan_accounts l ON c.id = l.client_id 
        WHERE l.account_state IN ('ACTIVE_IN_ARREARS' , 'ACTIVE')
        AND c.custom_fields IS NOT NULL
        GROUP BY industry 
        ORDER BY outstanding_loan_amount DESC LIMIT 10`;
  }

  async getTrend() {
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    return await this.prismaService.$queryRaw<Trend[]>`
       SELECT c.first_name , c.last_name,  o.name AS partner_name,
        SUM(l.loan_amount) AS total_loan_amount, 
        MIN(d.disbursement_at) AS first_loan_disbursement_at,
        MAX(d.disbursement_at) AS last_loan_disbursement_at,
        CAST(COUNT(l.id) AS INTEGER) AS loans_count,
        (CURRENT_DATE)::DATE - MAX(d.disbursement_at)::DATE AS days_since_last_loan
      FROM clients c
      left JOIN organizations o ON c.organizatation_id = o.id 
      JOIN loan_accounts l ON c.id = l.client_id
      JOIN disbursement_details d ON l.disbursement_details_id = d.id
      WHERE l.account_state IN ('ACTIVE' , 'ACTIVE_IN_ARREARS','CLOSED')
      GROUP BY c.id , o.name
      ORDER BY c.id
    `;
  }

  async getFraNpls() {
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const labelNames = ['Up to 30 days', '31 - 90 Days', '91 - 120 Days', '121 - 180 Days', 'More than 180 Days'];
    const fraNplsData = await this.prismaService.$queryRaw<FraNPL[]>`
      SELECT
      CASE
        WHEN CURRENT_DATE - DATE(i.due_date) > 0 AND CURRENT_DATE - DATE(i.due_date) <= 30 THEN 1
        WHEN CURRENT_DATE - DATE(i.due_date) > 30 AND CURRENT_DATE - DATE(i.due_date) <= 90 THEN 2
        WHEN CURRENT_DATE - DATE(i.due_date) > 90 AND CURRENT_DATE - DATE(i.due_date) <= 120 THEN 3
        WHEN CURRENT_DATE - DATE(i.due_date) > 120 AND CURRENT_DATE - DATE(i.due_date) <= 180 THEN 4
        WHEN CURRENT_DATE - DATE(i.due_date) > 181 THEN 5
      END AS label,
      SUM(i.fees_due + i.principal_due + i.funders_interest_due + i.interest_due + i.penalty_due + i.organization_commission_due) AS due_loan_amount,
      SUM(i.interest_due) AS interest_due,
      COUNT(DISTINCT loan_account_id):: INTEGER AS loans_count,
      COUNT(DISTINCT client_id):: INTEGER AS clients_count
    FROM
      installments i
    JOIN
      loan_accounts l ON i.loan_account_id = l.id
    WHERE
      l.account_state = 'ACTIVE_IN_ARREARS'
      AND i.state = 'LATE'
    GROUP BY
      label
    ORDER BY
      label
 `;

    return fraNplsData
      .map(fraNplDatum => ({
        ...fraNplDatum,
        label: labelNames[+fraNplDatum.label - 1],
      }))
      .filter(fraNplDatum => fraNplDatum.label !== undefined);
  }

  async getNPLs() {
    try {
      await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
      return await this.prismaService.$queryRaw<NPL[]>`
      SELECT c.id , c.first_name , c.last_name, c.custom_fields ->> 'industry' as industry ,
          o.name as partner_name,
          SUM(l.loan_amount) as total_loan_amount, 
          SUM(l.principal_balance) as outstanding_loan_amount,
          MIN(d.disbursement_at) as first_loan_disbursement_at,
          CAST(COUNT(l.id) as INTEGER) as loans_count,
          MIN(i.due_date) as due_date,
          SUM(i.principal_due) as due_loan_amount,
          0 as security,
          (CURRENT_DATE)::DATE - MIN(i.due_date)::DATE as past_due_days
        FROM clients c
        JOIN loan_accounts l ON c.id = l.client_id
        LEFT JOIN disbursement_details d ON l.disbursement_details_id = d.id
        LEFT JOIN organizations o ON c.organizatation_id = o.id
        LEFT JOIN (
            SELECT loan_account_id, MIN(due_date) as due_date, SUM(principal_due + penalty_due + interest_due + fees_due + organization_commission_due + funders_interest_due) as principal_due
            FROM installments
            WHERE state IN ('LATE')
            GROUP BY loan_account_id
        ) i ON l.id = i.loan_account_id
        WHERE l.account_state IN ('ACTIVE_IN_ARREARS')
        GROUP BY c.id, o.name
        ORDER BY total_loan_amount DESC
    `;
    } catch (error) {
      console.log('Error: ', error);
    }
  }

  async getLoanPortfolio() {
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const labelNames = [
      'Loan Amount < 50K',
      'Loan Amount 50k-200k',
      'Loan Amount 200k-400k',
      'Loan Amount 400k-700k',
      'Loan Amount 700k-1m',
      'Loan Amount 1m-2m',
      'Loan Amount >2m',
    ];

    const result = await this.prismaService.$queryRaw<LoanPortfolio[]>`
      SELECT 
        CASE 
          WHEN la.loan_amount::NUMERIC < 50000 THEN 1
          WHEN la.loan_amount::NUMERIC BETWEEN 50000 AND 200000 THEN 2
          WHEN la.loan_amount::NUMERIC BETWEEN 200000 AND 400000 THEN 3
          WHEN la.loan_amount::NUMERIC BETWEEN 400000 AND 700000 THEN 4
          WHEN la.loan_amount::NUMERIC BETWEEN 700000 AND 1000000 THEN 5
          WHEN la.loan_amount::NUMERIC BETWEEN 1000000 AND 2000000 THEN 6
          ELSE 7
        END AS loan_amount_group,
        SUM(la.principal_balance) AS outstanding_loan_amount ,
        CAST(COUNT(la.id) AS INTEGER) AS loans_count,
        CAST(COUNT(DISTINCT c.id) AS INTEGER) AS clients_count ,
        COALESCE(SUM(i.sum_dues)::NUMERIC , '0')::TEXT AS due_loan_amount,
        CAST(COUNT(DISTINCT CASE WHEN i.sum_dues::numeric > 0 THEN la.id END) AS INTEGER) AS loan_with_due
      FROM clients c 
      JOIN loan_accounts la ON c.id = la.client_id
      LEFT JOIN (
          SELECT loan_account_id , 
              SUM(principal_due + penalty_due + interest_due + fees_due + organization_commission_due + funders_interest_due) AS sum_dues
          FROM installments i 
          WHERE state IN ('LATE' ,'PARTIALLY_PAID' , 'GRACE')
          GROUP BY loan_account_id 
      ) i ON la.id = i.loan_account_id
      WHERE la.account_state IN ('ACTIVE' , 'ACTIVE_IN_ARREARS', 'CLOSED')
      GROUP BY loan_amount_group `;

    return result.map(loanPortfolio => ({
      ...loanPortfolio,
      loan_amount_group: labelNames[+loanPortfolio.loan_amount_group - 1],
    }));
  }

  async getPartners() {
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;

    return await this.prismaService.$queryRaw<Partner[]>`
     SELECT o.id AS partner_id, o.name AS partner_name, 
            CAST(COUNT(c.id) AS INTEGER) AS clients_count, 
            COALESCE(SUM(la.principal_balance)::NUMERIC , 0) AS outstanding_loan_amount , 
            CAST(COUNT(la.id) AS INTEGER) AS loans_count , 
            COALESCE(SUM(i.principal_due)::NUMERIC , '0')::TEXT AS due_loan_amount,
            CAST(COUNT(DISTINCT CASE WHEN i.principal_due::numeric > 0 THEN c.id END) AS INTEGER) AS client_with_due
    FROM organizations o
    LEFT JOIN clients c ON o.id = c.organizatation_id 
    LEFT JOIN loan_accounts la ON c.id = la.client_id 
    LEFT JOIN (
          SELECT loan_account_id , 
                  SUM(principal_due + penalty_due + interest_due + fees_due + organization_commission_due + funders_interest_due) AS principal_due 
          FROM installments 
          WHERE state IN ('LATE', 'PARTIALLY_PAID', 'GRACE')
          GROUP BY loan_account_id 
      ) i ON la.id = i.loan_account_id  
    GROUP BY partner_id`;
  }

  async getTotalPortfolio() {
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;

    const totalClients = await this.prismaService.client.count();
    const totalPortfolio = await this.prismaService.$queryRaw<TotalPortfolio[]>`
      SELECT  
        CASE
          WHEN l.account_state IN ('ACTIVE', 'ACTIVE_IN_ARREARS') THEN 'OUTSTANDING'
          WHEN (l.account_state in ('CLOSED') AND l.account_sub_state IN ('PAID', 'TERMINATED', 'WRITTEN_OFF')) THEN 'CLOSED'
        end as current_account_state,
   		  SUM(l.loan_amount) as total_loan_amount,
   		  SUM(l.principal_balance) as outstanding_loan_amount, 
        COUNT(l.id)::INTEGER as count_active_loans,
        COUNT(DISTINCT l.client_id)::INTEGER as count_active_clients
      FROM loan_accounts l
      WHERE (l.account_state IN ('ACTIVE', 'ACTIVE_IN_ARREARS') 
              OR (l.account_state in ('CLOSED') 
                  AND l.account_sub_state IN ('PAID', 'TERMINATED', 'WRITTEN_OFF')))
      GROUP BY current_account_state
      `;

    return [
      {
        totalNumberOfLoansDisbursed: totalPortfolio.reduce((acc, curr) => acc + curr.count_active_loans, 0),
        totalAmountOfLoansDisbursed: totalPortfolio.reduce(
          (acc, curr) => acc.add(curr.total_loan_amount),
          new Decimal(0),
        ),

        totalNumberOfLoansOutstanding: totalPortfolio
          .filter(portfolio => portfolio.current_account_state == 'OUTSTANDING')
          .reduce((acc, curr) => acc + curr.count_active_loans, 0),

        outstandingLoansAmount: totalPortfolio
          .filter(portfolio => portfolio.current_account_state == 'OUTSTANDING')
          .reduce((acc, curr) => acc.add(curr.outstanding_loan_amount), new Decimal(0)),

        totalNumberOfClients: totalClients,

        numberOfOutstandingClients: totalPortfolio
          .filter(portfolio => portfolio.current_account_state == 'OUTSTANDING')
          .reduce((acc, curr) => acc + curr.count_active_clients, 0),
      },
    ];
  }

  async getRejectedLoans() {
    const rejectedLoans = await this.prismaService.loanAccount.findMany({
      where: {
        accountState: AccountState.CLOSED,
        accountSubState: AccountSubState.REJECTED,
      },
      select: {
        loanAmount: true,
        createdAt: true,
        client: {
          select: {
            firstName: true,
            lastName: true,
            commercialName: true,
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return rejectedLoans.map(loan => ({
      first_name: loan.client.firstName || null,
      last_name: loan.client.lastName || null,
      commercial_name: loan.client.commercialName || null,
      partner_name: loan.client.organization?.name || null,
      ...omit(loan, ['client']),
      rejectionReason: 'TO BE IMPLEMENTED....',
    }));
  }

  async getNPLsByInterval(NPLsByIntervalDto: NPLsByIntervalDto) {
    const { referenceDate, dueField, intervalLimitDays } = NPLsByIntervalDto;
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;

    const intervals = [];
    for (let intervalStartDay = 0; intervalStartDay < intervalLimitDays; intervalStartDay += 30) {
      intervals.push({ start: intervalStartDay, end: intervalStartDay + 30 });
    }

    const sumQuery =
      dueField === 'total_due'
        ? `i.principal_due + i.penalty_due + i.interest_due + i.fees_due + i.organization_commission_due + i.funders_interest_due`
        : `i.${dueField}`;

    const query = `
      WITH ref_date AS (
        SELECT $1::DATE as today
      ),
      installments_cte AS (
        SELECT
          c.id AS client_id,
          c.commercial_name,
          i.due_date,
          CASE WHEN i.state = 'LATE' THEN (${sumQuery})::NUMERIC ELSE 0 END AS principal_due,
          CASE WHEN i.state IN ('PENDING', 'PARTIALLY_PAID', 'GRACE') THEN (${sumQuery})::NUMERIC ELSE 0 END AS not_due,
          CASE WHEN i.state NOT IN ('PAID') THEN (${sumQuery})::NUMERIC ELSE 0 END AS current_balance,
          (${sumQuery})::NUMERIC AS total_amount
        FROM
          installments i
          JOIN loan_accounts l ON i.loan_account_id = l.id
          JOIN clients c ON l.client_id = c.id
        WHERE
          l.account_state = 'ACTIVE_IN_ARREARS'
      )
      SELECT
        client_id AS id,
        commercial_name,
        ${intervals
          .map(
            interval => `
          SUM(CASE WHEN (SELECT today FROM ref_date) - due_date::DATE > ${interval.start} AND (SELECT today FROM ref_date) - due_date::DATE <= ${interval.end} THEN principal_due ELSE 0 END) AS "${interval.start}-${interval.end} Days"`,
          )
          .join(',\n')},
        SUM(CASE WHEN (SELECT today FROM ref_date) - due_date::DATE > ${intervalLimitDays} THEN principal_due ELSE 0 END) AS "More than ${intervalLimitDays} Days",
       SUM(principal_due) AS total_due,
        SUM(current_balance) AS current_balance,
        SUM(total_amount - current_balance) AS total_paid,
        SUM(not_due) AS not_due,
        SUM(total_amount) AS total_amount
      FROM
        installments_cte
      GROUP BY
        client_id,
        commercial_name
      ORDER BY
        client_id
    `;
    try {
      const queryResult = await this.prismaService.$queryRawUnsafe<any[]>(query, referenceDate);

      return [...queryResult, { id: '-', commercial_name: 'Total', ...this.addTotalRow(queryResult) }];
    } catch (error) {
      console.error('Error executing query:', error);
      throw new UnprocessableEntityException(error.meta?.message || 'An error occurred while processing the request.');
    }
  }

  addTotalRow(data: any[]) {
    return data.reduce((acc, item) => {
      // Sum dynamic interval keys
      Object.keys(item).forEach(key => {
        if (key !== 'id' && key !== 'commercial_name') {
          acc[key] = Decimal.sum(acc[key] || 0, item[key]).toFixed(2);
        }
      });
      return acc;
    }, {});
  }

  async getActiveSMEs() {
    const clientsSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();

    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    c.custom_fields ->> 'industry' AS industry,
    ${clientsSinceLunchDateRange
      .map(
        month =>
          `COUNT(
            DISTINCT CASE 
              WHEN (la.closed_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
                AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
              THEN c.id::NUMERIC
              ELSE NULL
          END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM loan_accounts la
    JOIN clients c ON c.id = la.client_id
    JOIN disbursement_details d ON d.id = la.disbursement_details_id
    GROUP BY
        industry`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getOnboardingSMEs() {
    const clientsSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();

    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    c.custom_fields ->> 'industry' AS industry,
    ${clientsSinceLunchDateRange
      .map(
        month =>
          `SUM(CASE WHEN TO_CHAR(c.created_at, 'Mon, YYYY') = TO_CHAR('${month}'::DATE, 'Mon, YYYY') THEN 1::NUMERIC ELSE 0 END) AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM clients c
    GROUP BY
        industry`;
    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getWrittenOffLoansForOnboardingSMEsByIndustry() {
    const select = `c.custom_fields ->> 'industry' AS industry,`;
    const groupBy = `industry`;

    return await this.getWrittenOffLoansForOnboardingSMEs(select, groupBy);
  }

  async getPrincipalOfWrittenOffLoansForOnboardingSMEsByIndustry() {
    const select = `c.custom_fields ->> 'industry' AS industry,`;
    const groupBy = `industry`;

    return await this.getPrincipalOfWrittenOffLoansForOnboardingSMEs(select, groupBy);
  }

  async getWrittenOffLoansForOnboardingSMEsByTenor() {
    const select = `CASE la.installment_period_unit
    WHEN 'DAYS' THEN ROUND(la.num_installments::numeric / 30)
    WHEN 'WEEKS' THEN ROUND((la.num_installments::numeric * 7) / 30)
    WHEN 'MONTHS' THEN la.num_installments
    WHEN 'QUARTERS' THEN la.num_installments::numeric * 4
    WHEN 'YEARS' THEN la.num_installments * 12
    ELSE NULL
    END AS "Tenor(Monthly)",`;

    const groupBy = `"Tenor(Monthly)"`;
    return await this.getWrittenOffLoansForOnboardingSMEs(select, groupBy);
  }

  async getPrincipalOfWrittenOffLoansForOnboardingSMEsByTenor() {
    const select = `CASE la.installment_period_unit
    WHEN 'DAYS' THEN ROUND(la.num_installments::numeric / 30)
    WHEN 'WEEKS' THEN ROUND((la.num_installments::numeric * 7) / 30)
    WHEN 'MONTHS' THEN la.num_installments
    WHEN 'QUARTERS' THEN la.num_installments::numeric * 4
    WHEN 'YEARS' THEN la.num_installments * 12
    ELSE NULL
    END AS "Tenor(Monthly"),`;

    const groupBy = `"Tenor(Monthly)"`;
    return await this.getPrincipalOfWrittenOffLoansForOnboardingSMEs(select, groupBy);
  }

  async getWrittenOffLoansForActiveSMEsByIndustry() {
    const select = `c.custom_fields ->> 'industry' AS industry,`;
    const groupBy = `industry`;

    return await this.getWrittenOffLoansForActiveSMEs(select, groupBy);
  }

  async getPrincipalOfWrittenOffLoansForActiveSMEsByIndustry() {
    const select = `c.custom_fields ->> 'industry' AS industry,`;
    const groupBy = `industry`;
    return await this.getPrincipalOfWrittenOffLoansForActiveSMEs(select, groupBy);
  }

  async getWrittenOffLoansForActiveSMEsByTenor() {
    const select = `CASE la.installment_period_unit
    WHEN 'DAYS' THEN ROUND(la.num_installments::numeric / 30)
    WHEN 'WEEKS' THEN ROUND((la.num_installments::numeric * 7) / 30)
    WHEN 'MONTHS' THEN la.num_installments
    WHEN 'QUARTERS' THEN la.num_installments::numeric * 4
    WHEN 'YEARS' THEN la.num_installments * 12
    ELSE NULL
    END AS "Tenor(Monthly)",`;

    const groupBy = `"Tenor(Monthly)"`;
    return await this.getWrittenOffLoansForActiveSMEs(select, groupBy);
  }

  async getPrincipalOfWrittenOffLoansForActiveSMEsByTenor() {
    const select = `CASE la.installment_period_unit
    WHEN 'DAYS' THEN ROUND(la.num_installments::numeric / 30)
    WHEN 'WEEKS' THEN ROUND((la.num_installments::numeric * 7) / 30)
    WHEN 'MONTHS' THEN la.num_installments
    WHEN 'QUARTERS' THEN la.num_installments::numeric * 4
    WHEN 'YEARS' THEN la.num_installments * 12
    ELSE NULL
    END AS "Tenor(Monthly)",`;

    const groupBy = `"Tenor(Monthly)"`;
    return await this.getPrincipalOfWrittenOffLoansForActiveSMEs(select, groupBy);
  }

  async getLateRepaymentsLoansForOnboardingSMEsByIndustry() {
    const select = `c.custom_fields ->> 'industry' AS industry,`;
    const groupBy = `industry`;

    return await this.getLateRepaymentsLoansForOnboardingSMEs(select, groupBy);
  }

  async getPrincipalLateRepaymentsLoansForOnboardingSMEsByIndustry() {
    const select = `c.custom_fields ->> 'industry' AS industry,`;
    const groupBy = `industry`;

    return await this.getPrincipalLateRepaymentsLoansForOnboardingSMEs(select, groupBy);
  }

  async getIncomeLateRepaymentsLoansForOnboardingSMEsByIndustry() {
    const select = `c.custom_fields ->> 'industry' AS industry,`;
    const groupBy = `industry`;

    return await this.getIncomeLateRepaymentsLoansForOnboardingSMEs(select, groupBy);
  }

  async getLateRepaymentsLoansForOnboardingSMEsByTenor() {
    const select = `CASE la.installment_period_unit
    WHEN 'DAYS' THEN ROUND(la.num_installments::numeric / 30)
    WHEN 'WEEKS' THEN ROUND((la.num_installments::numeric * 7) / 30)
    WHEN 'MONTHS' THEN la.num_installments
    WHEN 'QUARTERS' THEN la.num_installments::numeric * 4
    WHEN 'YEARS' THEN la.num_installments * 12
    ELSE NULL
    END AS "Tenor(Monthly)",`;

    const groupBy = `"Tenor(Monthly)"`;
    return await this.getLateRepaymentsLoansForOnboardingSMEs(select, groupBy);
  }

  async getPrincipalLateRepaymentsLoansForOnboardingSMEsByTenor() {
    const select = `CASE la.installment_period_unit
    WHEN 'DAYS' THEN ROUND(la.num_installments::numeric / 30)
    WHEN 'WEEKS' THEN ROUND((la.num_installments::numeric * 7) / 30)
    WHEN 'MONTHS' THEN la.num_installments
    WHEN 'QUARTERS' THEN la.num_installments::numeric * 4
    WHEN 'YEARS' THEN la.num_installments * 12
    ELSE NULL
    END AS "Tenor(Monthly)",`;

    const groupBy = `"Tenor(Monthly)"`;
    return await this.getPrincipalLateRepaymentsLoansForOnboardingSMEs(select, groupBy);
  }

  async getIncomeLateRepaymentsLoansForOnboardingSMEsByTenor() {
    const select = `CASE la.installment_period_unit
    WHEN 'DAYS' THEN ROUND(la.num_installments::numeric / 30)
    WHEN 'WEEKS' THEN ROUND((la.num_installments::numeric * 7) / 30)
    WHEN 'MONTHS' THEN la.num_installments
    WHEN 'QUARTERS' THEN la.num_installments::numeric * 4
    WHEN 'YEARS' THEN la.num_installments * 12
    ELSE NULL
    END AS "Tenor(Monthly)",`;

    const groupBy = `"Tenor(Monthly)"`;
    return await this.getIncomeLateRepaymentsLoansForOnboardingSMEs(select, groupBy);
  }

  async getLateRepaymentsLoansForActiveSMEsByTenor() {
    const select = `CASE la.installment_period_unit
    WHEN 'DAYS' THEN ROUND(la.num_installments::numeric / 30)
    WHEN 'WEEKS' THEN ROUND((la.num_installments::numeric * 7) / 30)
    WHEN 'MONTHS' THEN la.num_installments
    WHEN 'QUARTERS' THEN la.num_installments::numeric * 4
    WHEN 'YEARS' THEN la.num_installments * 12
    ELSE NULL
    END AS "Tenor(Monthly)",`;

    const groupBy = `"Tenor(Monthly)"`;

    return await this.getLateRepaymentsLoansForActiveSMEs(select, groupBy);
  }

  async getLateRepaymentsLoansForActiveSMEsByIndustry() {
    const select = `c.custom_fields ->> 'industry' AS industry,`;
    const groupBy = `industry`;

    return await this.getLateRepaymentsLoansForActiveSMEs(select, groupBy);
  }

  async getPrincipalLateRepaymentsLoansForActiveSMEsByIndustry() {
    const select = `c.custom_fields ->> 'industry' AS industry,`;
    const groupBy = `industry`;

    return await this.getPrincipalLateRepaymentsLoansForActiveSMEs(select, groupBy);
  }

  async getPrincipalLateRepaymentsLoansForActiveSMEsByTenor() {
    const select = `CASE la.installment_period_unit
    WHEN 'DAYS' THEN ROUND(la.num_installments::numeric / 30)
    WHEN 'WEEKS' THEN ROUND((la.num_installments::numeric * 7) / 30)
    WHEN 'MONTHS' THEN la.num_installments
    WHEN 'QUARTERS' THEN la.num_installments::numeric * 4
    WHEN 'YEARS' THEN la.num_installments * 12
    ELSE NULL
    END AS "Tenor(Monthly)",`;

    const groupBy = `"Tenor(Monthly)"`;

    return await this.getPrincipalLateRepaymentsLoansForActiveSMEs(select, groupBy);
  }

  async getIncomeLateRepaymentsLoansForActiveSMEsByIndustry() {
    const select = `c.custom_fields ->> 'industry' AS industry,`;
    const groupBy = `industry`;

    return await this.getIncomeLateRepaymentsLoansForActiveSMEs(select, groupBy);
  }

  async getIncomeLateRepaymentsLoansForActiveSMEsByTenor() {
    const select = `CASE la.installment_period_unit
    WHEN 'DAYS' THEN ROUND(la.num_installments::numeric / 30)
    WHEN 'WEEKS' THEN ROUND((la.num_installments::numeric * 7) / 30)
    WHEN 'MONTHS' THEN la.num_installments
    WHEN 'QUARTERS' THEN la.num_installments::numeric * 4
    WHEN 'YEARS' THEN la.num_installments * 12
    ELSE NULL
    END AS "Tenor(Monthly)",`;

    const groupBy = `"Tenor(Monthly)"`;

    return await this.getIncomeLateRepaymentsLoansForActiveSMEs(select, groupBy);
  }

  private async getWrittenOffLoansForOnboardingSMEs(select: string, groupBy: string) {
    const clientsSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
          ${select}
          ${clientsSinceLunchDateRange
            .map(
              month =>
                `SUM(
              CASE WHEN (la.closed_at <= '${moment(month).startOf('month').format('YYYY-MM-DD')}')
                AND la.account_sub_state = 'WRITTEN_OFF' 
                AND (SELECT COUNT(*) FROM loan_accounts la2 WHERE la2.client_id = c.id) = 1 
                THEN 1::NUMERIC ELSE 0 END) AS "${moment(month).format('MMM YYYY')}"`,
            )
            .join(', ')}
          FROM clients c
          LEFT JOIN loan_accounts la ON c.id = la.client_id
          GROUP BY ${groupBy}`;

    try {
      return await this.prismaService.$queryRawUnsafe(query);
    } catch (error) {
      console.log(error);
    }
  }

  private async getWrittenOffLoansForActiveSMEs(select: string, groupBy: string) {
    const clientsSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${select}
    ${clientsSinceLunchDateRange
      .map(
        month =>
          `SUM(CASE WHEN TO_CHAR(c.created_at, 'Mon, YYYY') = TO_CHAR('${month}'::DATE, 'Mon, YYYY') 
          AND la.account_sub_state = 'WRITTEN_OFF' 
          AND (SELECT COUNT(*) FROM loan_accounts la2 WHERE la2.client_id = c.id) > 1 
          THEN 1::NUMERIC ELSE 0 END) AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM clients c
    LEFT JOIN loan_accounts la ON c.id = la.client_id
    GROUP BY ${groupBy}`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  private async getPrincipalOfWrittenOffLoansForOnboardingSMEs(select: string, groupBy: string) {
    const clientsSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${select}
    ${clientsSinceLunchDateRange
      .map(
        month =>
          `SUM(CASE WHEN TO_CHAR(c.created_at, 'Mon, YYYY') = TO_CHAR('${month}'::DATE, 'Mon, YYYY') 
          AND la.account_sub_state = 'WRITTEN_OFF' 
          AND (SELECT COUNT(*) FROM loan_accounts la2 WHERE la2.client_id = c.id) = 1 
          THEN la.principal_balance::NUMERIC ELSE 0 END) AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM clients c
    LEFT JOIN loan_accounts la ON c.id = la.client_id
    GROUP BY ${groupBy}`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  private async getPrincipalOfWrittenOffLoansForActiveSMEs(select: string, groupBy: string) {
    const clientsSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${select}
    ${clientsSinceLunchDateRange
      .map(
        month =>
          `SUM(CASE WHEN TO_CHAR(c.created_at, 'Mon, YYYY') = TO_CHAR('${month}'::DATE, 'Mon, YYYY') 
          AND la.account_sub_state = 'WRITTEN_OFF' 
          AND (SELECT COUNT(*) FROM loan_accounts la2 WHERE la2.client_id = c.id) > 1
          THEN la.principal_balance::NUMERIC ELSE 0 END) AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM clients c
    LEFT JOIN loan_accounts la ON c.id = la.client_id
    GROUP BY ${groupBy}`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  private async getLateRepaymentsLoansForOnboardingSMEs(select: string, groupBy: string) {
    const clientsSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${select}
    ${clientsSinceLunchDateRange
      .map(
        month =>
          `COUNT(
            DISTINCT CASE 
              WHEN (la.closed_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
                AND la.closed_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
                AND la.penalty_paid::NUMERIC > 0
                AND (
                SELECT COUNT(*) 
                FROM loan_accounts la_sub 
                WHERE la_sub.client_id = la.client_id
              ) = 1
              THEN la.id::NUMERIC
              ELSE NULL
          END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM loan_accounts la
    JOIN clients c ON c.id = la.client_id
    JOIN disbursement_details d ON d.id = la.disbursement_details_id
    GROUP BY ${groupBy}`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getNumberOfLoansDisbursedByIndustryForActiveClients() {
    const loansSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    c.custom_fields ->> 'industry' AS industry,
    ${loansSinceLunchDateRange
      .map(
        month =>
          `COUNT(
        DISTINCT CASE 
        WHEN (d.disbursement_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
        AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        THEN la.id
        ELSE NULL END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
      FROM loan_accounts la
      JOIN clients c ON c.id = la.client_id
      JOIN disbursement_details d ON d.id = la.disbursement_details_id
      GROUP BY industry`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  private async getLateRepaymentsLoansForActiveSMEs(select: string, groupBy: string) {
    const clientsSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${select}
    ${clientsSinceLunchDateRange
      .map(
        month =>
          `COUNT(
            DISTINCT CASE 
              WHEN (la.closed_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
                AND la.closed_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
                AND la.penalty_paid::NUMERIC > 0
              THEN la.id::NUMERIC
              ELSE NULL
          END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM loan_accounts la
    JOIN clients c ON c.id = la.client_id
    JOIN disbursement_details d ON d.id = la.disbursement_details_id
    GROUP BY ${groupBy}`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getNumberOfLoansDisbursedByIndustryForOrdinaryClients() {
    const loansSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    c.custom_fields ->> 'industry' AS industry,
    ${loansSinceLunchDateRange
      .map(
        month =>
          `COUNT(
        CASE 
        WHEN (d.disbursement_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
        AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        AND (SELECT COUNT(*) FROM loan_accounts la2 WHERE la2.client_id = c.id) = 1
        THEN la.id
        ELSE NULL END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
      FROM loan_accounts la
      JOIN clients c ON c.id = la.client_id
      JOIN disbursement_details d ON d.id = la.disbursement_details_id
    GROUP BY
        industry`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  private async getPrincipalLateRepaymentsLoansForOnboardingSMEs(select: string, groupBy: string) {
    const clientsSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${select}
    ${clientsSinceLunchDateRange
      .map(
        month =>
          `SUM(
        CASE 
        WHEN (la.closed_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
          AND la.closed_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
          AND la.penalty_paid::NUMERIC > 0
          AND lt.entry_date < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
          AND lt.type <> 'DISBURSEMENT'
          AND (
                SELECT COUNT(*) 
                FROM loan_accounts la_sub 
                WHERE la_sub.client_id = la.client_id
              ) = 1
          THEN lt.principal_amount::NUMERIC
          ELSE 0 END) AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
      FROM loan_accounts la
      JOIN clients c ON c.id = la.client_id
      JOIN disbursement_details d ON d.id = la.disbursement_details_id
      JOIN loan_transactions lt ON lt.loan_account_id = la.id
      GROUP BY ${groupBy}`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getNumberOfLoansDisbursedByTenorForActiveClients() {
    const loansSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${this.monthlyTenorSelectClause()},
    ${loansSinceLunchDateRange
      .map(
        month =>
          `COUNT(
        DISTINCT CASE 
        WHEN (d.disbursement_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
        AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        THEN la.id
        ELSE NULL END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
      FROM loan_accounts la
      JOIN clients c ON c.id = la.client_id
      JOIN disbursement_details d ON d.id = la.disbursement_details_id
      GROUP BY "Tenor(Monthly)"
      ORDER BY "Tenor(Monthly)"`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getNumberOfLoansDisbursedByTenorForOrdinaryClients() {
    const loansSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${this.monthlyTenorSelectClause()},
    ${loansSinceLunchDateRange
      .map(
        month =>
          `COUNT(
        CASE 
        WHEN (d.disbursement_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
        AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        AND (SELECT COUNT(*) FROM loan_accounts la2 WHERE la2.client_id = c.id) = 1
        THEN la.id
        ELSE NULL END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
      FROM loan_accounts la
      JOIN clients c ON c.id = la.client_id
      JOIN disbursement_details d ON d.id = la.disbursement_details_id
      GROUP BY "Tenor(Monthly)"
      ORDER BY "Tenor(Monthly)"`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getValueOfLoansDisbursedByIndustryForActiveClients() {
    const loansSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    c.custom_fields ->> 'industry' AS industry,
    ${loansSinceLunchDateRange
      .map(
        month =>
          `SUM(
        CASE 
        WHEN (d.disbursement_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
        AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        THEN la.loan_amount::numeric
        ELSE 0 END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
      FROM loan_accounts la
      JOIN clients c ON c.id = la.client_id
      JOIN disbursement_details d ON d.id = la.disbursement_details_id
    GROUP BY
        industry`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  private async getPrincipalLateRepaymentsLoansForActiveSMEs(select: string, groupBy: string) {
    const clientsSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${select}
    ${clientsSinceLunchDateRange
      .map(
        month =>
          `SUM(
        CASE 
        WHEN (la.closed_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
          AND la.closed_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
          AND la.penalty_paid::NUMERIC > 0
          AND lt.entry_date < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
          AND lt.type <> 'DISBURSEMENT'
          THEN lt.principal_amount::NUMERIC
          ELSE 0 END) AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM loan_accounts la
    JOIN clients c ON c.id = la.client_id
    JOIN disbursement_details d ON d.id = la.disbursement_details_id
    JOIN loan_transactions lt ON lt.loan_account_id = la.id
    GROUP BY ${groupBy}`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getValueOfLoansDisbursedByIndustryForOrdinaryClients() {
    const loansSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    c.custom_fields ->> 'industry' AS industry,
    ${loansSinceLunchDateRange
      .map(
        month =>
          `SUM(
        CASE 
        WHEN (d.disbursement_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
        AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        AND (SELECT COUNT(*) FROM loan_accounts la2 WHERE la2.client_id = c.id) = 1
        THEN la.loan_amount::numeric
        ELSE 0 END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM loan_accounts la
    JOIN clients c ON c.id = la.client_id
    JOIN disbursement_details d ON d.id = la.disbursement_details_id
    GROUP BY
        industry`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  private async getIncomeLateRepaymentsLoansForOnboardingSMEs(select: string, groupBy: string) {
    const clientsSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${select}
    ${clientsSinceLunchDateRange
      .map(
        month =>
          `SUM(
        CASE 
        WHEN (la.closed_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
          AND la.closed_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
          AND la.penalty_paid::NUMERIC > 0
          AND lt.entry_date < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
          AND lt.type <> 'DISBURSEMENT'
          AND (SELECT COUNT(*) FROM loan_accounts la2 WHERE la2.client_id = c.id) = 1 
          THEN lt.fees_amount::NUMERIC + lt.penalty_amount::NUMERIC + lt.interest_amount::NUMERIC
          ELSE 0 END) AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM loan_accounts la
    JOIN clients c ON c.id = la.client_id
    JOIN disbursement_details d ON d.id = la.disbursement_details_id
    JOIN loan_transactions lt ON lt.loan_account_id = la.id
    GROUP BY ${groupBy}`;

    return await this.prismaService.$queryRawUnsafe(query);
  }
  private async getIncomeLateRepaymentsLoansForActiveSMEs(select: string, groupBy: string) {
    const clientsSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${select}
    ${clientsSinceLunchDateRange
      .map(
        month =>
          `SUM(
        CASE 
        WHEN (la.closed_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
          AND la.closed_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
          AND la.penalty_paid::NUMERIC > 0
          AND lt.entry_date < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
          AND lt.type <> 'DISBURSEMENT'
          THEN lt.fees_amount::NUMERIC + lt.penalty_amount::NUMERIC + lt.interest_amount::NUMERIC
          ELSE 0 END) AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM loan_accounts la
    JOIN clients c ON c.id = la.client_id
    JOIN disbursement_details d ON d.id = la.disbursement_details_id
    JOIN loan_transactions lt ON lt.loan_account_id = la.id
    GROUP BY ${groupBy}`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getValueOfLoansDisbursedByTenorForActiveClients() {
    const loansSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${this.monthlyTenorSelectClause()},
    ${loansSinceLunchDateRange
      .map(
        month =>
          `SUM(
        CASE 
        WHEN (d.disbursement_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
        AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        THEN la.loan_amount::numeric
        ELSE 0 END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM loan_accounts la
    JOIN clients c ON c.id = la.client_id
    JOIN disbursement_details d ON d.id = la.disbursement_details_id
    GROUP BY "Tenor(Monthly)"
    ORDER BY "Tenor(Monthly)"`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getValueOfLoansDisbursedByTenorForOrdinaryClients() {
    const loansSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${this.monthlyTenorSelectClause()},
    ${loansSinceLunchDateRange
      .map(
        month =>
          `SUM(
        CASE 
        WHEN (d.disbursement_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
        AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        AND (SELECT COUNT(*) FROM loan_accounts la_sub WHERE la_sub.client_id = la.client_id) = 1
        THEN la.loan_amount::numeric
        ELSE 0 END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
      FROM loan_accounts la
      JOIN clients c ON c.id = la.client_id
      JOIN disbursement_details d ON d.id = la.disbursement_details_id
    GROUP BY "Tenor(Monthly)"
    ORDER BY "Tenor(Monthly)"`;
    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getIncomeOfLoansDisbursedByIndustryForActiveClients() {
    const loansSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    c.custom_fields ->> 'industry' AS industry,
    ${loansSinceLunchDateRange
      .map(
        month =>
          `SUM(
        CASE 
        WHEN (d.disbursement_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
        AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        AND lt.entry_date < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        AND lt.type <> 'DISBURSEMENT'
        THEN lt.fees_amount::NUMERIC + lt.penalty_amount::NUMERIC + lt.interest_amount::NUMERIC
        ELSE 0 END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM loan_accounts la
    JOIN clients c ON c.id = la.client_id
    JOIN disbursement_details d ON d.id = la.disbursement_details_id
    JOIN loan_transactions lt ON lt.loan_account_id = la.id
    GROUP BY
        industry`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getIncomeOfLoansDisbursedByIndustryForOrdinaryClients() {
    const loansSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    c.custom_fields ->> 'industry' AS industry,
    ${loansSinceLunchDateRange
      .map(
        month =>
          `SUM(
        CASE 
        WHEN (d.disbursement_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
        AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        AND lt.entry_date < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        AND lt.type <> 'DISBURSEMENT'
        AND (SELECT COUNT(*) FROM loan_accounts la2 WHERE la2.client_id = c.id) = 1
        THEN lt.fees_amount::NUMERIC + lt.penalty_amount::NUMERIC + lt.interest_amount::NUMERIC
        ELSE 0 END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM loan_accounts la
    JOIN clients c ON c.id = la.client_id
    JOIN disbursement_details d ON d.id = la.disbursement_details_id
    JOIN loan_transactions lt ON lt.loan_account_id = la.id
    GROUP BY
        industry`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getIncomeOfLoansDisbursedByTenorForActiveClients() {
    const loansSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${this.monthlyTenorSelectClause()},
    ${loansSinceLunchDateRange
      .map(
        month =>
          `SUM(
        CASE 
        WHEN (d.disbursement_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
        AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        AND lt.entry_date < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        AND lt.type <> 'DISBURSEMENT'
        THEN lt.fees_amount::NUMERIC + lt.penalty_amount::NUMERIC + lt.interest_amount::NUMERIC
        ELSE 0 END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM loan_accounts la
    JOIN clients c ON c.id = la.client_id
    JOIN disbursement_details d ON d.id = la.disbursement_details_id
    JOIN loan_transactions lt ON lt.loan_account_id = la.id
    GROUP BY "Tenor(Monthly)"
    ORDER BY "Tenor(Monthly)"`;

    return await this.prismaService.$queryRawUnsafe(query);
  }

  async getIncomeOfLoansDisbursedByTenorForOrdinaryClients() {
    const loansSinceLunchDateRange = await this.getMonthsSinceLunchDateRange();
    await this.prismaService.$executeRaw`SET lc_monetary = 'en_US.UTF-8';`;
    const query = `SELECT
    ${this.monthlyTenorSelectClause()},
    ${loansSinceLunchDateRange
      .map(
        month =>
          `SUM(
        CASE 
        WHEN (d.disbursement_at > '${moment(month).startOf('month').format('YYYY-MM-DD')}' OR la.closed_at IS NULL)
        AND d.disbursement_at < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        AND lt.entry_date < '${moment(month).endOf('month').format('YYYY-MM-DD')}'
        AND lt.type <> 'DISBURSEMENT'
        AND (SELECT COUNT(*) FROM loan_accounts la2 WHERE la2.client_id = c.id) = 1
        THEN lt.fees_amount::NUMERIC + lt.penalty_amount::NUMERIC + lt.interest_amount::NUMERIC
        ELSE 0 END)::INTEGER AS "${moment(month).format('MMM YYYY')}"`,
      )
      .join(', ')}
    FROM loan_accounts la
    JOIN clients c ON c.id = la.client_id
    JOIN disbursement_details d ON d.id = la.disbursement_details_id
    JOIN loan_transactions lt ON lt.loan_account_id = la.id
    GROUP BY "Tenor(Monthly)"
    ORDER BY "Tenor(Monthly)"`;

    return await this.prismaService.$queryRawUnsafe(query);
  }
  private monthlyTenorSelectClause() {
    return `CASE la.installment_period_unit
      WHEN 'DAYS' THEN ROUND(la.num_installments::numeric / 30)
      WHEN 'WEEKS' THEN ROUND((la.num_installments::numeric * 7) / 30)
      WHEN 'MONTHS' THEN la.num_installments
      WHEN 'QUARTERS' THEN la.num_installments::numeric * 4
      WHEN 'YEARS' THEN la.num_installments * 12
      ELSE NULL
      END AS "Tenor(Monthly)"`;
  }

  async getMonthsSinceLunchDateRange() {
    const clients = await this.prismaService.client.aggregate({
      _min: {
        createdAt: true,
      },
    });
    const startDate = moment(clients._min.createdAt);
    const endDate = moment();

    // Initialize an array to store the dates
    const monthsArray = [];

    // Loop through each month until reaching the end date
    const currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(moment(endDate))) {
      monthsArray.push(currentDate.format('YYYY-MM-DD'));
      currentDate.add(1, 'month');
    }

    return monthsArray;
  }
}
