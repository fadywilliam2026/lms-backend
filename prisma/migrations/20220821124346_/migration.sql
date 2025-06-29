-- AlterTable
ALTER TABLE "periodic_payments" ALTER COLUMN "index" DROP NOT NULL,
ALTER COLUMN "payment_plan_index" DROP NOT NULL;
