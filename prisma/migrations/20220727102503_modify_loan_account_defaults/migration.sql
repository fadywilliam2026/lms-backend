/*
  Warnings:

  - You are about to drop the column `installments_count` on the `loan_accounts` table. All the data in the column will be lost.
  - Added the required column `num_installments` to the `loan_accounts` table without a default value. This is not possible if the table is not empty.
  - Made the column `accrued_interest` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accrued_penalty` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accrue_interest_after_maturity` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `arrears_tolerance_period` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `fees_balance` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `hold_balance` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `interest_balance` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `interest_from_arrears_accrued` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `interest_from_arrears_balance` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `interest_from_arrears_due` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `interest_from_arrears_paid` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `interest_rate_source` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `penalty_balance` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `principal_balance` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `principal_paid` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `redraw_balance` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "loan_accounts" DROP COLUMN "installments_count",
ADD COLUMN     "num_installments" INTEGER NOT NULL,
ALTER COLUMN "accrued_interest" SET NOT NULL,
ALTER COLUMN "accrued_interest" SET DEFAULT 0.0,
ALTER COLUMN "accrued_penalty" SET NOT NULL,
ALTER COLUMN "accrued_penalty" SET DEFAULT 0.0,
ALTER COLUMN "accrue_interest_after_maturity" SET NOT NULL,
ALTER COLUMN "accrue_interest_after_maturity" SET DEFAULT false,
ALTER COLUMN "arrears_tolerance_period" SET NOT NULL,
ALTER COLUMN "arrears_tolerance_period" SET DEFAULT 0,
ALTER COLUMN "fees_balance" SET NOT NULL,
ALTER COLUMN "fees_balance" SET DEFAULT 0.0,
ALTER COLUMN "hold_balance" SET NOT NULL,
ALTER COLUMN "hold_balance" SET DEFAULT 0.0,
ALTER COLUMN "interest_balance" SET NOT NULL,
ALTER COLUMN "interest_balance" SET DEFAULT 0.0,
ALTER COLUMN "interest_due" SET DEFAULT 0.0,
ALTER COLUMN "interest_from_arrears_accrued" SET NOT NULL,
ALTER COLUMN "interest_from_arrears_accrued" SET DEFAULT 0.0,
ALTER COLUMN "interest_from_arrears_balance" SET NOT NULL,
ALTER COLUMN "interest_from_arrears_balance" SET DEFAULT 0.0,
ALTER COLUMN "interest_from_arrears_due" SET NOT NULL,
ALTER COLUMN "interest_from_arrears_due" SET DEFAULT 0.0,
ALTER COLUMN "interest_from_arrears_paid" SET NOT NULL,
ALTER COLUMN "interest_from_arrears_paid" SET DEFAULT 0.0,
ALTER COLUMN "interest_paid" SET DEFAULT 0.0,
ALTER COLUMN "interest_rate_source" SET NOT NULL,
ALTER COLUMN "interest_rate_source" SET DEFAULT E'FIXED_INTEREST_RATE',
ALTER COLUMN "penalty_balance" SET NOT NULL,
ALTER COLUMN "penalty_balance" SET DEFAULT 0.0,
ALTER COLUMN "penalty_due" SET DEFAULT 0.0,
ALTER COLUMN "penalty_paid" SET DEFAULT 0.0,
ALTER COLUMN "principal_balance" SET NOT NULL,
ALTER COLUMN "principal_balance" SET DEFAULT 0.0,
ALTER COLUMN "principal_due" SET DEFAULT 0.0,
ALTER COLUMN "principal_paid" SET NOT NULL,
ALTER COLUMN "principal_paid" SET DEFAULT 0.0,
ALTER COLUMN "redraw_balance" SET NOT NULL,
ALTER COLUMN "redraw_balance" SET DEFAULT 0.0,
ALTER COLUMN "prepayments_acceptance" DROP NOT NULL,
ALTER COLUMN "prepayments_acceptance" DROP DEFAULT;

-- AlterTable
ALTER TABLE "loan_products" ADD COLUMN     "default_installment_period_count" INTEGER NOT NULL DEFAULT 0;
