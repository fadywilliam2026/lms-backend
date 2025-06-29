-- CreateEnum
CREATE TYPE "ClientState" AS ENUM ('PENDING_APPROVAL', 'INACTIVE', 'ACTIVE', 'EXITED', 'BLACKLISTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "PreferredLanguage" AS ENUM ('ENGLISH', 'ARABIC');

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "activated_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "first_name" TEXT NOT NULL,
    "middle_name" TEXT,
    "last_name" TEXT,
    "email_address" TEXT,
    "home_phone" TEXT,
    "mobile_phone_1" TEXT,
    "mobile_phone_2" TEXT,
    "gender" "Gender",
    "birth_date" TIMESTAMP(3),
    "address" TEXT,
    "national_id" TEXT,
    "tax_record_id" TEXT,
    "notes" TEXT,
    "preferred_language" "PreferredLanguage" NOT NULL DEFAULT E'ENGLISH',
    "loanCycle" INTEGER NOT NULL DEFAULT 0,
    "user_id" INTEGER NOT NULL,
    "state" "ClientState" NOT NULL DEFAULT E'PENDING_APPROVAL',

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
