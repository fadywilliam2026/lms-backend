/*
  Warnings:

  - A unique constraint covering the columns `[email_address]` on the table `clients` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mobile_phone]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_address_key" ON "clients"("email_address");

-- CreateIndex
CREATE UNIQUE INDEX "clients_mobile_phone_key" ON "clients"("mobile_phone");
