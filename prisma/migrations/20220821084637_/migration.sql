-- DropForeignKey
ALTER TABLE "loan_products" DROP CONSTRAINT "loan_products_principal_payment_settings_id_fkey";

-- AlterTable
ALTER TABLE "loan_products" ALTER COLUMN "principal_payment_settings_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_principal_payment_settings_id_fkey" FOREIGN KEY ("principal_payment_settings_id") REFERENCES "principal_payment_product_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
