/*
  Warnings:

  - The values [EVERY_FOUR_WEEKS] on the enum `interest_charge_frequency` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "interest_charge_frequency_new" AS ENUM ('ANNUALIZED', 'EVERY_QUARTER', 'EVERY_MONTH', 'EVERY_WEEK', 'EVERY_DAY');
ALTER TABLE "loan_accounts" ALTER COLUMN "interest_charge_frequency" DROP DEFAULT;
ALTER TABLE "interest_product_settings" ALTER COLUMN "compounding_frequency" DROP DEFAULT;
ALTER TABLE "interest_product_settings" ALTER COLUMN "compounding_frequency" TYPE "interest_charge_frequency_new" USING ("compounding_frequency"::text::"interest_charge_frequency_new");
ALTER TABLE "loan_accounts" ALTER COLUMN "interest_charge_frequency" TYPE "interest_charge_frequency_new" USING ("interest_charge_frequency"::text::"interest_charge_frequency_new");
ALTER TYPE "interest_charge_frequency" RENAME TO "interest_charge_frequency_old";
ALTER TYPE "interest_charge_frequency_new" RENAME TO "interest_charge_frequency";
DROP TYPE "interest_charge_frequency_old";
ALTER TABLE "loan_accounts" ALTER COLUMN "interest_charge_frequency" SET DEFAULT 'ANNUALIZED';
ALTER TABLE "interest_product_settings" ALTER COLUMN "compounding_frequency" SET DEFAULT 'ANNUALIZED';
COMMIT;
