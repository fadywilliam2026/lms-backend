-- DropIndex
DROP INDEX "users_phone_number_key";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "phone_number" DROP DEFAULT;
