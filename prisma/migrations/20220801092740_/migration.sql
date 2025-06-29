-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_user_id_fkey";

-- DropForeignKey
ALTER TABLE "installments" DROP CONSTRAINT "installments_loan_account_id_fkey";

-- DropForeignKey
ALTER TABLE "loan_accounts" DROP CONSTRAINT "loan_accounts_product_id_fkey";

-- DropForeignKey
ALTER TABLE "periodic_payments" DROP CONSTRAINT "periodic_payments_loan_account_id_fkey";

-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "installments" ALTER COLUMN "loan_account_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "loan_accounts" ALTER COLUMN "product_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_loan_account_id_fkey" FOREIGN KEY ("loan_account_id") REFERENCES "loan_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodic_payments" ADD CONSTRAINT "periodic_payments_loan_account_id_fkey" FOREIGN KEY ("loan_account_id") REFERENCES "loan_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "loan_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
