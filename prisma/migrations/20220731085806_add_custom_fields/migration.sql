/*
  Warnings:

  - You are about to drop the column `home_phone` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `middle_name` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `mobile_phone_1` on the `clients` table. All the data in the column will be lost.
  - You are about to drop the column `mobile_phone_2` on the `clients` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "clients" DROP COLUMN "home_phone",
DROP COLUMN "middle_name",
DROP COLUMN "mobile_phone_1",
DROP COLUMN "mobile_phone_2",
ADD COLUMN     "custom_fields" JSONB,
ADD COLUMN     "mobile_phone" TEXT;
