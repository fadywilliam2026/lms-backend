import { Injectable } from '@nestjs/common';
import { FinancialResource, Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import uniq from 'lodash/uniq';
import uniqBy from 'lodash/uniqBy';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class GlService {
  constructor(private readonly prisma: PrismaService) {}
  initialCodes: Record<number, FinancialResource> = {
    100: FinancialResource.PORTFOLIO_CONTROL,
    101: FinancialResource.TRANSACTION_SOURCE,
    500: FinancialResource.WRITE_OFF_EXPENSE,
    501: FinancialResource.PARTNER_COMMISSION_EXPENSE,
    400: FinancialResource.INTEREST_INCOME,
    401: FinancialResource.FEE_INCOME,
    402: FinancialResource.PENALTY_INCOME,
  };

  async createDefaultGLRulesBody() {
    const glAccounts = await this.prisma.gLAccount.findMany({
      where: {
        code: {
          in: Object.keys(this.initialCodes).map(key => +key),
        },
      },
    });

    return Prisma.validator<Prisma.Enumerable<Prisma.GLAccountingRuleCreateManyProductInput>>()(
      glAccounts.map(({ id, code }, i) => ({
        financialResource: this.initialCodes[code],
        index: i,
        glAccountId: id,
      })),
    );
  }

  getAccountBalance(glAccountId: number) {
    return this.prisma.$queryRaw<Array<{ id: number; balance: Decimal }>>`
      WITH gl_accounts_with_balance AS (
        SELECT
          gl_accounts.id,
          gl_accounts.type as gl_account_type,
          gl_journal_entries.type as gl_journal_entries_type,
          SUM(gl_journal_entries.amount ) AS balance
        FROM gl_journal_entries
        JOIN gl_accounts
        ON gl_journal_entries.gl_account_id  = gl_accounts.id
        WHERE gl_account_id = ${glAccountId}
        GROUP BY gl_accounts.id, gl_account_type, gl_journal_entries_type
      )
      SELECT id, SUM(
	      CASE WHEN ((gl_journal_entries_type = 'DEBIT' and gl_account_type in ('EXPENSE', 'ASSET')) or
	      (gl_journal_entries_type = 'CREDIT' and gl_account_type in ('LIABILITY', 'INCOME', 'EQUITY'))
        )
	  	  THEN balance
	  	  ELSE balance * -1
	    end
	    ) AS balance
      FROM gl_accounts_with_balance
      GROUP BY id, gl_account_type;`;
  }
  async getBalanceSheet(startDate: string, endDate: string) {
    const result = await this.prisma.$queryRaw`
      WITH balance_sheet_journal_entries AS (
        SELECT amount, gl_account_id, type as gl_journal_entries_type
        FROM gl_journal_entries
        WHERE gl_journal_entries.booking_date BETWEEN TO_DATE(${startDate}, 'YYYY-MM-DD') AND TO_DATE(${endDate}, 'YYYY-MM-DD')
      ),
      balances as (
      SELECT gl_accounts.id, gl_accounts.name, gl_accounts.type,
        SUM(
          CASE WHEN
            ((gl_journal_entries_type = 'DEBIT' and gl_accounts.type in ('EXPENSE', 'ASSET')) or
            (gl_journal_entries_type = 'CREDIT' and gl_accounts.type in ('LIABILITY', 'INCOME', 'EQUITY'))
            )
          THEN amount
          ELSE amount * -1
          end
          ) AS balance
      FROM gl_accounts
      LEFT JOIN balance_sheet_journal_entries
      ON balance_sheet_journal_entries.gl_account_id = gl_accounts.id
      WHERE gl_accounts.type in ('ASSET', 'LIABILITY', 'EQUITY')
      GROUP BY gl_accounts.id, gl_accounts.type
    )
    select *
    from balances;`;
    return result;
  }
  async getProfitAndLoss(startDate: string, endDate: string) {
    const result = await this.prisma.$queryRaw`
      WITH balance_sheet_journal_entries AS (
        SELECT amount, gl_account_id, type as gl_journal_entries_type
        FROM gl_journal_entries
        WHERE gl_journal_entries.booking_date BETWEEN TO_DATE(${startDate}, 'YYYY-MM-DD') AND TO_DATE(${endDate}, 'YYYY-MM-DD')
      ),
      balances as (
      SELECT gl_accounts.id, gl_accounts.name, gl_accounts.type,
        SUM(
          CASE WHEN
            ((gl_journal_entries_type = 'DEBIT' and gl_accounts.type in ('EXPENSE', 'ASSET')) or
            (gl_journal_entries_type = 'CREDIT' and gl_accounts.type in ('LIABILITY', 'INCOME', 'EQUITY'))
            )
          THEN amount
          ELSE amount * -1
          end
          ) AS balance
      FROM gl_accounts
      LEFT JOIN balance_sheet_journal_entries
      ON balance_sheet_journal_entries.gl_account_id = gl_accounts.id
      WHERE gl_accounts.type in ('INCOME', 'EXPENSE')
      GROUP BY gl_accounts.id, gl_accounts.type
    )
    select *
    from balances;`;
    return result;
  }
  async getTrialBalance(startDate: string, endDate: string) {
    const result = await this.prisma.$queryRaw`
      WITH opening_gl_journal_entries AS (
        SELECT gl_account_id, amount, type
        FROM gl_journal_entries
        WHERE gl_journal_entries.booking_date < TO_DATE(${startDate}, 'YYYY-MM-DD')
      ),
      current_gl_journal_entries AS (
        SELECT gl_account_id, amount, type
        FROM gl_journal_entries
        WHERE gl_journal_entries.booking_date BETWEEN TO_DATE(${startDate}, 'YYYY-MM-DD') AND TO_DATE(${endDate}, 'YYYY-MM-DD')
      ),
      gl_accounts_opening_balance AS (
        SELECT gl_accounts.id,
        gl_accounts.name,
         SUM(
	      CASE WHEN ((opening_gl_journal_entries.type = 'DEBIT' and gl_accounts.type in ('EXPENSE', 'ASSET')) or
	      (opening_gl_journal_entries.type = 'CREDIT' and gl_accounts.type in ('LIABILITY', 'INCOME', 'EQUITY'))
        )
	  	  THEN opening_gl_journal_entries.amount
	  	  ELSE opening_gl_journal_entries.amount * -1
	    end
	    ) AS balance
        FROM gl_accounts
        LEFT JOIN opening_gl_journal_entries
        ON opening_gl_journal_entries.gl_account_id = gl_accounts.id
        GROUP BY gl_accounts.id
      ),
      gl_accounts_current_balance AS (
        SELECT gl_accounts.id,
        gl_accounts.name,
        SUM(CASE WHEN current_gl_journal_entries.type = 'DEBIT' THEN current_gl_journal_entries.amount ELSE '0' END) AS debits,
        SUM(CASE WHEN current_gl_journal_entries.type = 'CREDIT' THEN current_gl_journal_entries.amount ELSE '0' END) AS credits,
        SUM(
	      CASE WHEN ((current_gl_journal_entries.type = 'DEBIT' and gl_accounts.type in ('EXPENSE', 'ASSET')) or
	      (current_gl_journal_entries.type = 'CREDIT' and gl_accounts.type in ('LIABILITY', 'INCOME', 'EQUITY'))
        )
	  	  THEN current_gl_journal_entries.amount
	  	  ELSE current_gl_journal_entries.amount * -1
	    end
	    ) AS balance
        FROM gl_accounts
        LEFT JOIN current_gl_journal_entries
        ON current_gl_journal_entries.gl_account_id = gl_accounts.id
        GROUP BY gl_accounts.id
      ),
      all_fields_except_closing_balance AS (
        SELECT gl_accounts_opening_balance.id,
        gl_accounts_opening_balance.name,
        gl_accounts_current_balance.debits AS debits,
        gl_accounts_current_balance.credits AS credits,
        coalesce(gl_accounts_opening_balance.balance, '0')  AS "openingBalance",
        coalesce(gl_accounts_current_balance.balance, '0') AS "netChange"
        FROM gl_accounts_opening_balance
        LEFT JOIN gl_accounts_current_balance
        ON gl_accounts_opening_balance.id = gl_accounts_current_balance.id
      )
      SELECT *, "openingBalance" + "netChange" AS "closingBalance"
      FROM all_fields_except_closing_balance;
    `;
    return result;
  }

  async getFundUtilization() {
    const glAccountingRules = await this.prisma.gLAccountingRule.findMany({
      select: {
        financialResource: true,
        glAccount: true,
      },
      where: {
        financialResource: {
          in: [FinancialResource.PORTFOLIO_CONTROL, FinancialResource.TRANSACTION_SOURCE],
        },
      },
    });
    const portfolioControlIds = uniq(
      glAccountingRules
        .filter(row => row.financialResource === FinancialResource.PORTFOLIO_CONTROL)
        .map(row => row?.glAccount.id),
    );
    const transactionSourceIds = uniq(
      glAccountingRules
        .filter(row => row.financialResource === FinancialResource.TRANSACTION_SOURCE)
        .map(row => row?.glAccount.id),
    );
    const balances = await this.prisma
      .$transaction([...portfolioControlIds, ...transactionSourceIds].map(id => this.getAccountBalance(id)))
      .then(result =>
        result.map(row => ({
          id: row?.[0]?.id,
          balance: row?.[0]?.balance ?? new Decimal(0),
        })),
      );

    const transactionSourceBalances = balances
      .filter(row => transactionSourceIds.includes(row.id))
      .map(row => row.balance);

    // NO Cash entries yet
    if (transactionSourceBalances.length == 0)
      return {
        totalPortfolio: 0,
        availableFunds: 0,
        fundUtilization: 0,
      };

    const transactionSourceBalance = Decimal.sum(...transactionSourceBalances);

    const portfolioControlBalance = Decimal.sum(
      ...balances.filter(row => portfolioControlIds.includes(row.id)).map(row => row.balance),
    );

    const totalPortfolio = portfolioControlBalance.plus(transactionSourceBalance);
    return {
      totalPortfolio: totalPortfolio.toNumber(),
      availableFunds: transactionSourceBalance.toNumber(),
      fundUtilization: portfolioControlBalance.div(totalPortfolio).toNumber(),
    };
  }

  async getFundSources() {
    const glAccountingRules = await this.prisma.gLAccountingRule.findMany({
      select: {
        financialResource: true,
        glAccount: true,
      },
      where: {
        financialResource: FinancialResource.TRANSACTION_SOURCE,
      },
    });
    const balances = await this.prisma
      .$transaction(
        uniqBy(glAccountingRules, 'glAccount.id').map(glAccountingRule =>
          this.getAccountBalance(glAccountingRule.glAccount.id),
        ),
      )
      .then(result => {
        return result
          .filter(row => row.length)
          .map(row => ({
            id: row?.[0]?.id,
            balance: row?.[0]?.balance ?? new Decimal(0),
          }));
      });
    return balances;
  }
}
