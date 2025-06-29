/*
  Warnings:

  - A unique constraint covering the columns `[gl_account_id,loan_product_id]` on the table `gl_accounting_rules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "gl_accounting_rules_gl_account_id_loan_product_id_key" ON "gl_accounting_rules"("gl_account_id", "loan_product_id");

-- AddForeignKey
ALTER TABLE "gl_journal_entries" ADD CONSTRAINT "gl_journal_entries_gl_account_id_loan_product_id_fkey" FOREIGN KEY ("gl_account_id", "loan_product_id") REFERENCES "gl_accounting_rules"("gl_account_id", "loan_product_id") ON DELETE NO ACTION ON UPDATE CASCADE;
