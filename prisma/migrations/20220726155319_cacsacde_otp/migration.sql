-- DropForeignKey
ALTER TABLE "otps" DROP CONSTRAINT "otps_user_id_fkey";

-- AddForeignKey
ALTER TABLE "otps" ADD CONSTRAINT "otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
