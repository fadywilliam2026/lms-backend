-- DropForeignKey
ALTER TABLE "loan_accounts" DROP CONSTRAINT "loan_accounts_user_id_fkey";

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
