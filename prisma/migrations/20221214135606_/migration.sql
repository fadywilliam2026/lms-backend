/*
  Warnings:

  - The values [FUND_SOURCE] on the enum `financial_resource` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "financial_resource_new" AS ENUM ('PORTFOLIO_CONTROL', 'TRANSACTION_SOURCE', 'WRITE_OFF_EXPENSE', 'INTEREST_INCOME', 'FEE_INCOME', 'PENALTY_INCOME');
ALTER TABLE "gl_accounting_rules" ALTER COLUMN "financial_resource" TYPE "financial_resource_new" USING ("financial_resource"::text::"financial_resource_new");
ALTER TYPE "financial_resource" RENAME TO "financial_resource_old";
ALTER TYPE "financial_resource_new" RENAME TO "financial_resource";
DROP TYPE "financial_resource_old";
COMMIT;
