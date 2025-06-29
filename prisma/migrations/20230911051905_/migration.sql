-- DropForeignKey
ALTER TABLE "loan_accounts" DROP CONSTRAINT "loan_accounts_account_arrears_settings_id_fkey";

-- DropForeignKey
ALTER TABLE "loan_accounts" DROP CONSTRAINT "loan_accounts_disbursement_details_id_fkey";

-- DropForeignKey
ALTER TABLE "loan_transactions" DROP CONSTRAINT "loan_transactions_loan_account_id_fkey";

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_account_arrears_settings_id_fkey" FOREIGN KEY ("account_arrears_settings_id") REFERENCES "account_arrears_settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_disbursement_details_id_fkey" FOREIGN KEY ("disbursement_details_id") REFERENCES "disbursement_details"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_transactions" ADD CONSTRAINT "loan_transactions_loan_account_id_fkey" FOREIGN KEY ("loan_account_id") REFERENCES "loan_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
