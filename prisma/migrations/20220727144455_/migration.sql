/*
  Warnings:

  - Made the column `default_principal_installment_interval` on table `loan_products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "loan_accounts" ALTER COLUMN "account_state" SET DEFAULT E'PARTIAL_APPLICATION';

-- AlterTable
ALTER TABLE "loan_products" ALTER COLUMN "default_principal_installment_interval" SET NOT NULL;
