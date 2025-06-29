-- AlterTable
ALTER TABLE "loan_products" ALTER COLUMN "installment_period_unit" SET DEFAULT 'MONTHS',
ALTER COLUMN "default_installment_period_count" SET DEFAULT 1;
