/*
  Warnings:

  - The values [ON_REPAYMENT] on the enum `interest_application_method` will be removed. If these variants are still used in the database, this will fail.
  - The values [RESCHEDULE_REMAINING_REPAYMENTS,RECALCULATE_SCHEDULE_KEEP_SAME_TOTAL_REPAYMENT_AMOUNT] on the enum `prepayment_calculation_method` will be removed. If these variants are still used in the database, this will fail.
  - The values [RESCHEDULE_REMAINING_REPAYMENTS,RECALCULATE_SCHEDULE_KEEP_SAME_TOTAL_REPAYMENT_AMOUNT] on the enum `prepayment_recalculation_method` will be removed. If these variants are still used in the database, this will fail.
  - The values [USING_REPAYMENT_PERIODICITY] on the enum `schedule_interest_days_count_method` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `disbursement_date` on the `disbursement_details` table. All the data in the column will be lost.
  - You are about to drop the column `expected_disbursement_date` on the `disbursement_details` table. All the data in the column will be lost.
  - You are about to drop the column `first_repayment_date` on the `disbursement_details` table. All the data in the column will be lost.
  - You are about to drop the column `pre_payments_allowed` on the `loan_accounts` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "interest_application_method_new" AS ENUM ('ON_DISBURSEMENT', 'ON_INSTALLMENT');
ALTER TABLE "loan_products" ALTER COLUMN "interest_application_method" DROP DEFAULT;
ALTER TABLE "loan_products" ALTER COLUMN "interest_application_method" TYPE "interest_application_method_new" USING ("interest_application_method"::text::"interest_application_method_new");
ALTER TABLE "loan_accounts" ALTER COLUMN "interest_application_method" TYPE "interest_application_method_new" USING ("interest_application_method"::text::"interest_application_method_new");
ALTER TYPE "interest_application_method" RENAME TO "interest_application_method_old";
ALTER TYPE "interest_application_method_new" RENAME TO "interest_application_method";
DROP TYPE "interest_application_method_old";
ALTER TABLE "loan_products" ALTER COLUMN "interest_application_method" SET DEFAULT 'ON_DISBURSEMENT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "prepayment_calculation_method_new" AS ENUM ('NO_RECALCULATION', 'RESCHEDULE_REMAINING_INSTALLMENTS', 'RECALCULATE_SCHEDULE_KEEP_SAME_NUMBER_OF_TERMS', 'RECALCULATE_SCHEDULE_KEEP_SAME_PRINCIPAL_AMOUNT', 'RECALCULATE_SCHEDULE_KEEP_SAME_TOTAL_INSTALLMENT_AMOUNT', 'REDUCE_AMOUNT_PER_INSTALLMENT', 'REDUCE_NUMBER_OF_INSTALLMENTS');
ALTER TYPE "prepayment_calculation_method" RENAME TO "prepayment_calculation_method_old";
ALTER TYPE "prepayment_calculation_method_new" RENAME TO "prepayment_calculation_method";
DROP TYPE "prepayment_calculation_method_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "prepayment_recalculation_method_new" AS ENUM ('NO_RECALCULATION', 'RESCHEDULE_REMAINING_INSTALLMENTS', 'RECALCULATE_SCHEDULE_KEEP_SAME_NUMBER_OF_TERMS', 'RECALCULATE_SCHEDULE_KEEP_SAME_PRINCIPAL_AMOUNT', 'RECALCULATE_SCHEDULE_KEEP_SAME_TOTAL_INSTALLMENT_AMOUNT', 'REDUCE_AMOUNT_PER_INSTALLMENT', 'REDUCE_NUMBER_OF_INSTALLMENTS');
ALTER TABLE "loan_products" ALTER COLUMN "prepayment_recalculation_method" DROP DEFAULT;
ALTER TABLE "loan_products" ALTER COLUMN "prepayment_recalculation_method" TYPE "prepayment_recalculation_method_new" USING ("prepayment_recalculation_method"::text::"prepayment_recalculation_method_new");
ALTER TABLE "loan_accounts" ALTER COLUMN "prepayment_recalculation_method" TYPE "prepayment_recalculation_method_new" USING ("prepayment_recalculation_method"::text::"prepayment_recalculation_method_new");
ALTER TYPE "prepayment_recalculation_method" RENAME TO "prepayment_recalculation_method_old";
ALTER TYPE "prepayment_recalculation_method_new" RENAME TO "prepayment_recalculation_method";
DROP TYPE "prepayment_recalculation_method_old";
ALTER TABLE "loan_products" ALTER COLUMN "prepayment_recalculation_method" SET DEFAULT 'NO_RECALCULATION';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "schedule_interest_days_count_method_new" AS ENUM ('USING_INSTALLMENT_PERIODICITY', 'USING_ACTUAL_DAYS_COUNT');
ALTER TABLE "loan_products" ALTER COLUMN "schedule_interest_days_count_method" TYPE "schedule_interest_days_count_method_new" USING ("schedule_interest_days_count_method"::text::"schedule_interest_days_count_method_new");
ALTER TYPE "schedule_interest_days_count_method" RENAME TO "schedule_interest_days_count_method_old";
ALTER TYPE "schedule_interest_days_count_method_new" RENAME TO "schedule_interest_days_count_method";
DROP TYPE "schedule_interest_days_count_method_old";
COMMIT;

-- AlterTable
ALTER TABLE "disbursement_details" DROP COLUMN "disbursement_date",
DROP COLUMN "expected_disbursement_date",
DROP COLUMN "first_repayment_date",
ADD COLUMN     "disbursement_at" TIMESTAMP(3),
ADD COLUMN     "expected_disbursement_at" TIMESTAMP(3),
ADD COLUMN     "first_installment_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "loan_accounts" DROP COLUMN "pre_payments_allowed",
ADD COLUMN     "prepayments_acceptance" BOOLEAN NOT NULL DEFAULT false;
