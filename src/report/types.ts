import { Decimal } from '@prisma/client/runtime/library';

export type TopClient = {
  id: number;
  first_name: string;
  last_name: string;
  commercial_name: string;
  industry: string;
  organization_id: number;
  total_loan_amount: Decimal;
  total_loan_with_income: Decimal;
  fees_due: Decimal;
  penalty_due: Decimal;
  interest_due: Decimal;
  outstanding_loan_amount: Decimal;
  outstanding_loan_amount_with_dues: Decimal;
  outstanding_loan_ratio: Decimal;
  first_loan_disbursement_at: Date;
  loans_count: number;
};

export type TopIndustries = {
  industry: string;
  outstanding_loan_amount: Decimal;
  outstanding_loan_ratio: Decimal;
};

export type NPL = Omit<TopClient, 'outstanding_loan_ratio'> & {
  due_date: Date;
  past_due_loan_amount: Decimal;
  security: number;
  past_due_days: number;
};

export type LoanPortfolio = {
  loan_amount_group: number;
  outstanding_loan_amount: Decimal;
  loans_count: number;
  clients_count: number;
  due_loan_amount: number;
  loan_with_due: number;
};

export type TotalPortfolio = {
  client_id: number;
  current_account_state: 'OUTSTANDING' | 'CLOSED';
  total_loan_amount: Decimal;
  outstanding_loan_amount: Decimal;
  count_active_loans: number;
  count_active_clients: number;
};

export type Trend = {
  first_name: string;
  last_name: string;
  partner_name: string;
  total_loan_amount: Decimal;
  first_loan_disbursement_at: Date;
  last_loan_disbursement_at: Date;
  days_since_last_loan: number;
  loans_count: number;
};

export type Partner = {
  id: number;
  name: string;
  client_count: number;
  outstanding_loan_amount: Decimal;
  loans_count: number;
  due_amount: number;
  client_with_due: number;
};

export type FraNPL = {
  label: string;
  due_loan_amount: Decimal;
  loans_count: number;
  clients_count: number;
  interest_due: Decimal;
};
