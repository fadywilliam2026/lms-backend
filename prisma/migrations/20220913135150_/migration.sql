-- DropForeignKey
ALTER TABLE "gl_accounting_rules" DROP CONSTRAINT "gl_accounting_rules_gl_account_id_fkey";

-- DropForeignKey
ALTER TABLE "gl_accounting_rules" DROP CONSTRAINT "gl_accounting_rules_loan_product_id_fkey";

-- DropForeignKey
ALTER TABLE "gl_journal_entries" DROP CONSTRAINT "gl_journal_entries_gl_account_id_fkey";

-- AddForeignKey
ALTER TABLE "gl_accounting_rules" ADD CONSTRAINT "gl_accounting_rules_gl_account_id_fkey" FOREIGN KEY ("gl_account_id") REFERENCES "gl_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_accounting_rules" ADD CONSTRAINT "gl_accounting_rules_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_journal_entries" ADD CONSTRAINT "gl_journal_entries_gl_account_id_fkey" FOREIGN KEY ("gl_account_id") REFERENCES "gl_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
