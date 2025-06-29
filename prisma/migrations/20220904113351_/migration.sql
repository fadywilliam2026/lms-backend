-- DropForeignKey
ALTER TABLE "loan_transactions" DROP CONSTRAINT "loan_transactions_loan_account_id_fkey";

-- AddForeignKey
ALTER TABLE "loan_transactions" ADD CONSTRAINT "loan_transactions_loan_account_id_fkey" FOREIGN KEY ("loan_account_id") REFERENCES "loan_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
