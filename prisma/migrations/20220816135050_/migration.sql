/*
  Warnings:

  - The values [FLAT_NUMBER_OF_INSTALLMENTS,LOAN_AMOUNT_PERCENTAGE_NUMBER_OF_INSTALLMENTS] on the enum `amount_calculation_method` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `periodic_payment` on the `loan_accounts` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "amount_calculation_method_new" AS ENUM ('FLAT', 'LOAN_AMOUNT_PERCENTAGE', 'INSTALLMENT_PRINCIPAL_AMOUNT_PERCENTAGE');
ALTER TABLE "predefined_fees" ALTER COLUMN "amount_calculation_method" TYPE "amount_calculation_method_new" USING ("amount_calculation_method"::text::"amount_calculation_method_new");
ALTER TYPE "amount_calculation_method" RENAME TO "amount_calculation_method_old";
ALTER TYPE "amount_calculation_method_new" RENAME TO "amount_calculation_method";
DROP TYPE "amount_calculation_method_old";
COMMIT;

-- AlterTable
ALTER TABLE "loan_accounts" DROP COLUMN "periodic_payment",
ADD COLUMN     "balloon_periodic_payment" DOUBLE PRECISION;
