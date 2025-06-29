-- DropForeignKey
ALTER TABLE "gl_journal_entries" DROP CONSTRAINT "gl_journal_entries_loan_account_id_fkey";

-- AddForeignKey
ALTER TABLE "gl_journal_entries" ADD CONSTRAINT "gl_journal_entries_loan_account_id_fkey" FOREIGN KEY ("loan_account_id") REFERENCES "loan_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
