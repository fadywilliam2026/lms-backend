-- DropForeignKey
ALTER TABLE "loan_accounts" DROP CONSTRAINT "loan_accounts_client_id_fkey";

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
