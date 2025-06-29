-- DropForeignKey
ALTER TABLE "loan_accounts" DROP CONSTRAINT "loan_accounts_client_id_fkey";

-- AlterTable
ALTER TABLE "loan_accounts" ALTER COLUMN "client_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
