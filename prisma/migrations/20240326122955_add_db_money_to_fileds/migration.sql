/*
  Warnings:

  - The `fees_due` column on the `installments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fees_paid` column on the `installments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `interest_due` column on the `installments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `interest_paid` column on the `installments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `penalty_due` column on the `installments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `penalty_paid` column on the `installments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `principal_due` column on the `installments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `principal_paid` column on the `installments` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fees_balance` column on the `loan_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fees_due` column on the `loan_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `fees_paid` column on the `loan_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `interest_balance` column on the `loan_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `interest_due` column on the `loan_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `interest_paid` column on the `loan_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `penalty_balance` column on the `loan_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `penalty_due` column on the `loan_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `penalty_paid` column on the `loan_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `principal_balance` column on the `loan_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `principal_due` column on the `loan_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `principal_paid` column on the `loan_accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `loan_amount` on the `loan_accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "installments"
ALTER COLUMN "fees_due" TYPE MONEY USING "fees_due"::NUMERIC::MONEY,
ALTER COLUMN "fees_paid" TYPE MONEY USING "fees_paid"::NUMERIC::MONEY,
ALTER COLUMN "interest_due" TYPE MONEY USING "interest_due"::NUMERIC::MONEY,
ALTER COLUMN "interest_paid" TYPE MONEY USING "interest_paid"::NUMERIC::MONEY,
ALTER COLUMN "penalty_due" TYPE MONEY USING "penalty_due"::NUMERIC::MONEY,
ALTER COLUMN "penalty_paid" TYPE MONEY USING "penalty_paid"::NUMERIC::MONEY,
ALTER COLUMN "principal_due" TYPE MONEY USING "principal_due"::NUMERIC::MONEY,
ALTER COLUMN "principal_paid" TYPE MONEY USING "principal_paid"::NUMERIC::MONEY;

-- AlterTable
ALTER TABLE "loan_accounts"
ALTER COLUMN "fees_balance" TYPE MONEY USING "fees_balance"::NUMERIC::MONEY,
ALTER COLUMN "fees_due" TYPE MONEY USING "fees_due"::NUMERIC::MONEY,
ALTER COLUMN "fees_paid" TYPE MONEY USING "fees_paid"::NUMERIC::MONEY,
ALTER COLUMN "interest_balance" TYPE MONEY USING "interest_balance"::NUMERIC::MONEY,
ALTER COLUMN "interest_due" TYPE MONEY USING "interest_due"::NUMERIC::MONEY,
ALTER COLUMN "interest_paid" TYPE MONEY USING "interest_paid"::NUMERIC::MONEY,
ALTER COLUMN "loan_amount" TYPE MONEY USING "loan_amount"::NUMERIC::MONEY,
ALTER COLUMN "penalty_balance" TYPE MONEY USING "penalty_balance"::NUMERIC::MONEY,
ALTER COLUMN "penalty_due" TYPE MONEY USING "penalty_due"::NUMERIC::MONEY,
ALTER COLUMN "penalty_paid" TYPE MONEY USING "penalty_paid"::NUMERIC::MONEY,
ALTER COLUMN "principal_balance" TYPE MONEY USING "principal_balance"::NUMERIC::MONEY,
ALTER COLUMN "principal_due" TYPE MONEY USING "principal_due"::NUMERIC::MONEY,
ALTER COLUMN "principal_paid" TYPE MONEY USING "principal_paid"::NUMERIC::MONEY;

-- AlterTable
ALTER TABLE "installments"
ALTER COLUMN "funders_interest_due" TYPE MONEY USING "funders_interest_due"::numeric::MONEY,
ALTER COLUMN "organization_commission_due" TYPE MONEY USING "organization_commission_due"::numeric::MONEY;


