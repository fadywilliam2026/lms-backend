-- AlterTable
ALTER TABLE "loan_accounts" ADD COLUMN     "guarantor_id" INTEGER;

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_guarantor_id_fkey" FOREIGN KEY ("guarantor_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
