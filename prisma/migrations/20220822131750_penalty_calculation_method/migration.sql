/*
  Warnings:

  - The values [OUTSTANDING_PRINCIPAL] on the enum `loan_penalty_calculation_method` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "loan_penalty_calculation_method_new" AS ENUM ('NONE', 'OVERDUE_PRINCIPAL', 'OVERDUE_PRINCIPAL_AND_INTEREST');
ALTER TABLE "loan_products" ALTER COLUMN "loan_penalty_calculation_method" DROP DEFAULT;
ALTER TABLE "loan_products" ALTER COLUMN "loan_penalty_calculation_method" TYPE "loan_penalty_calculation_method_new" USING ("loan_penalty_calculation_method"::text::"loan_penalty_calculation_method_new");
ALTER TABLE "loan_accounts" ALTER COLUMN "loan_penalty_calculation_method" TYPE "loan_penalty_calculation_method_new" USING ("loan_penalty_calculation_method"::text::"loan_penalty_calculation_method_new");
ALTER TYPE "loan_penalty_calculation_method" RENAME TO "loan_penalty_calculation_method_old";
ALTER TYPE "loan_penalty_calculation_method_new" RENAME TO "loan_penalty_calculation_method";
DROP TYPE "loan_penalty_calculation_method_old";
ALTER TABLE "loan_products" ALTER COLUMN "loan_penalty_calculation_method" SET DEFAULT 'NONE';
COMMIT;
