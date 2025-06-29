/*
  Warnings:

  - The values [none,cash,accrual] on the enum `accounting_method` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `apply_interest_on_prepayment_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "accounting_method_new" AS ENUM ('NONE', 'CASH', 'ACCRUAL');
ALTER TABLE "loan_products" ALTER COLUMN "accounting_method" TYPE "accounting_method_new" USING ("accounting_method"::text::"accounting_method_new");
ALTER TYPE "accounting_method" RENAME TO "accounting_method_old";
ALTER TYPE "accounting_method_new" RENAME TO "accounting_method";
DROP TYPE "accounting_method_old";
COMMIT;

-- AlterTable
ALTER TABLE "loan_products" ADD COLUMN     "apply_interest_on_prepayment_method" TEXT NOT NULL;
