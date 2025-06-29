/*
  Warnings:

  - You are about to drop the column `due_date` on the `payment_plan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "installments" ADD COLUMN     "no_interest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "payment_plan" DROP COLUMN "due_date",
ADD COLUMN     "period_count" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "period_unit" "installment_period_unit" NOT NULL DEFAULT 'MONTHS';
