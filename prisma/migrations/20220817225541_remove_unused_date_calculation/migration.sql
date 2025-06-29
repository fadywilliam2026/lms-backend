/*
  Warnings:

  - You are about to drop the column `date_calculation_method` on the `account_arrears_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "account_arrears_settings" DROP COLUMN "date_calculation_method";
