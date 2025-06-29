/*
  Warnings:

  - You are about to drop the column `paymentmethods` on the `loan_accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "loan_accounts" DROP COLUMN "paymentmethods",
ADD COLUMN     "payment_method" "payment_method";
