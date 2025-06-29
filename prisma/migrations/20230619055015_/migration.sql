/*
  Warnings:

  - Made the column `interest_only_period_count` on table `loan_accounts` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "loan_accounts" ALTER COLUMN "interest_only_period_count" SET NOT NULL;
