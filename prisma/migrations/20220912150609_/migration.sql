/*
  Warnings:

  - Changed the type of `financial_resource` on the `gl_accounting_rules` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "financial_resource" AS ENUM ('PORTFOLIO_CONTROL', 'FUND_SOURCE', 'WRITE_OFF_EXPENSE', 'INTEREST_INCOME', 'FEE_INCOME', 'PENALTY_INCOME');

-- AlterTable
ALTER TABLE "gl_accounting_rules" DROP COLUMN "financial_resource",
ADD COLUMN     "financial_resource" "financial_resource" NOT NULL;
