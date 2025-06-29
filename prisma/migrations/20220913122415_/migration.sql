/*
  Warnings:

  - A unique constraint covering the columns `[loan_product_id,financial_resource]` on the table `gl_accounting_rules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "gl_accounting_rules_loan_product_id_financial_resource_key" ON "gl_accounting_rules"("loan_product_id", "financial_resource");
