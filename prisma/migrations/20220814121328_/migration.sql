/*
  Warnings:

  - The values [REPAYMENT_PRINCIPAL_AMOUNT_PERCENTAGE] on the enum `amount_calculation_method` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "amount_calculation_method_new" AS ENUM ('FLAT', 'LOAN_AMOUNT_PERCENTAGE', 'INSTALLMENT_PRINCIPAL_AMOUNT_PERCENTAGE', 'FLAT_NUMBER_OF_INSTALLMENTS', 'LOAN_AMOUNT_PERCENTAGE_NUMBER_OF_INSTALLMENTS');
ALTER TABLE "predefined_fees" ALTER COLUMN "amount_calculation_method" TYPE "amount_calculation_method_new" USING ("amount_calculation_method"::text::"amount_calculation_method_new");
ALTER TYPE "amount_calculation_method" RENAME TO "amount_calculation_method_old";
ALTER TYPE "amount_calculation_method_new" RENAME TO "amount_calculation_method";
DROP TYPE "amount_calculation_method_old";
COMMIT;
