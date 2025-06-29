/*
  Warnings:

  - The values [ACTUAL_364,E30_360] on the enum `days_in_year` will be removed. If these variants are still used in the database, this will fail.
  - The values [RESCHEDULE_REMAINING_INSTALLMENTS,RECALCULATE_SCHEDULE_KEEP_SAME_NUMBER_OF_TERMS,RECALCULATE_SCHEDULE_KEEP_SAME_PRINCIPAL_AMOUNT,RECALCULATE_SCHEDULE_KEEP_SAME_TOTAL_INSTALLMENT_AMOUNT] on the enum `prepayment_calculation_method` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "days_in_year_new" AS ENUM ('ACTUAL_365_FIXED', 'ACTUAL_360');
ALTER TABLE "loan_products" ALTER COLUMN "days_in_year" DROP DEFAULT;
ALTER TABLE "loan_products" ALTER COLUMN "days_in_year" TYPE "days_in_year_new" USING ("days_in_year"::text::"days_in_year_new");
ALTER TYPE "days_in_year" RENAME TO "days_in_year_old";
ALTER TYPE "days_in_year_new" RENAME TO "days_in_year";
DROP TYPE "days_in_year_old";
ALTER TABLE "loan_products" ALTER COLUMN "days_in_year" SET DEFAULT 'ACTUAL_365_FIXED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "prepayment_calculation_method_new" AS ENUM ('NO_RECALCULATION', 'REDUCE_AMOUNT_PER_INSTALLMENT', 'REDUCE_NUMBER_OF_INSTALLMENTS');
ALTER TYPE "prepayment_calculation_method" RENAME TO "prepayment_calculation_method_old";
ALTER TYPE "prepayment_calculation_method_new" RENAME TO "prepayment_calculation_method";
DROP TYPE "prepayment_calculation_method_old";
COMMIT;
