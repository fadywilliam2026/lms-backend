/*
  Warnings:

  - You are about to drop the `LoanAccount` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Installment" DROP CONSTRAINT "Installment_loan_account_id_fkey";

-- DropTable
DROP TABLE "LoanAccount";

-- AddForeignKey
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_loan_account_id_fkey" FOREIGN KEY ("loan_account_id") REFERENCES "loan_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
