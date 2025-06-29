-- AlterTable
ALTER TABLE "loan_accounts" ALTER COLUMN "fees_due" SET DEFAULT 0.0,
ALTER COLUMN "fees_paid" SET DEFAULT 0.0,
ALTER COLUMN "interest_charge_frequency" SET DEFAULT 'ANNUALIZED';
