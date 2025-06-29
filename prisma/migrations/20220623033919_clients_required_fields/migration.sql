/*
  Warnings:

  - You are about to drop the column `loanCycle` on the `clients` table. All the data in the column will be lost.
  - Made the column `national_id` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tax_record_id` on table `clients` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "loanCycle",
ADD COLUMN     "loan_cycle" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "national_id" SET NOT NULL,
ALTER COLUMN "tax_record_id" SET NOT NULL;
