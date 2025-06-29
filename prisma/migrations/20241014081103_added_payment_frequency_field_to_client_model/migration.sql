-- CreateEnum
CREATE TYPE "PaymentFrequency" AS ENUM ('EVERY_7_DAYS', 'EVERY_15_DAYS', 'EVERY_MONTH');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "payment_frequency" "PaymentFrequency" DEFAULT 'EVERY_MONTH';
