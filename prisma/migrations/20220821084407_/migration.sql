-- DropForeignKey
ALTER TABLE "loan_products" DROP CONSTRAINT "loan_products_arrears_settings_id_fkey";

-- AlterTable
ALTER TABLE "loan_products" ALTER COLUMN "arrears_settings_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_arrears_settings_id_fkey" FOREIGN KEY ("arrears_settings_id") REFERENCES "arrears_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
