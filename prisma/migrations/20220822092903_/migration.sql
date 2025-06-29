/*
  Warnings:

  - Made the column `arrears_settings_id` on table `loan_products` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "loan_products" DROP CONSTRAINT "loan_products_arrears_settings_id_fkey";

-- DropForeignKey
ALTER TABLE "predefined_fees" DROP CONSTRAINT "predefined_fees_loan_product_id_fkey";

-- AlterTable
ALTER TABLE "loan_products" ALTER COLUMN "arrears_settings_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "predefined_fees" ALTER COLUMN "apply_date_method" DROP NOT NULL,
ALTER COLUMN "fee_amortization_upon_reschedule_option" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_arrears_settings_id_fkey" FOREIGN KEY ("arrears_settings_id") REFERENCES "arrears_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predefined_fees" ADD CONSTRAINT "predefined_fees_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "loan_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
