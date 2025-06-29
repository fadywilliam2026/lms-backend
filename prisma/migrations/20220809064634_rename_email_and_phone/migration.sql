/*
  Warnings:

  - You are about to drop the column `email_address` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `mobile_phone` on the `clients` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "clients_email_address_key";

-- DropIndex
DROP INDEX "clients_mobile_phone_key";

-- AlterTable
ALTER TABLE "clients" DROP COLUMN "email_address",
DROP COLUMN "mobile_phone",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE UNIQUE INDEX "clients_phone_key" ON "clients"("phone");
