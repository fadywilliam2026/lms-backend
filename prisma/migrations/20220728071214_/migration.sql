/*
  Warnings:

  - You are about to drop the column `fee_application` on the `predefined_fees` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "predefined_fees" DROP COLUMN "fee_application",
ALTER COLUMN "active" DROP NOT NULL,
ALTER COLUMN "active" SET DEFAULT true,
ALTER COLUMN "amount" DROP NOT NULL,
ALTER COLUMN "amount" SET DEFAULT 0,
ALTER COLUMN "apply_date_method" SET DEFAULT E'MONTHLY_FROM_ACTIVATION',
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "percentage_amount" DROP NOT NULL,
ALTER COLUMN "percentage_amount" SET DEFAULT 0,
ALTER COLUMN "triggerPredefinedFee" DROP NOT NULL;

-- DropEnum
DROP TYPE "fee_application";
