/*
  Warnings:

  - The `compounding_frequency` column on the `interest_product_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
ALTER TYPE "installment_period_unit" ADD VALUE 'QUARTERS';

-- AlterTable
ALTER TABLE "interest_product_settings" DROP COLUMN "compounding_frequency",
ADD COLUMN     "compounding_frequency" "interest_charge_frequency" DEFAULT 'ANNUALIZED';

-- DropEnum
DROP TYPE "compounding_frequency";
