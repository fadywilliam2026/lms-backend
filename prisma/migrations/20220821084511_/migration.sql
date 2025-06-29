-- DropForeignKey
ALTER TABLE "loan_products" DROP CONSTRAINT "loan_products_interest_rate_settings_id_fkey";

-- AlterTable
ALTER TABLE "loan_products" ALTER COLUMN "interest_rate_settings_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_interest_rate_settings_id_fkey" FOREIGN KEY ("interest_rate_settings_id") REFERENCES "interest_product_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
