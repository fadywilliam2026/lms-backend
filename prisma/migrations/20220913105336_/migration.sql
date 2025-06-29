/*
  Warnings:

  - Made the column `gl_account_id` on table `gl_accounting_rules` required. This step will fail if there are existing NULL values in that column.
  - Made the column `loan_product_id` on table `gl_accounting_rules` required. This step will fail if there are existing NULL values in that column.
  - Made the column `gl_account_id` on table `gl_journal_entries` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "gl_accounting_rules" ALTER COLUMN "gl_account_id" SET NOT NULL,
ALTER COLUMN "loan_product_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "gl_journal_entries" ALTER COLUMN "gl_account_id" SET NOT NULL;
