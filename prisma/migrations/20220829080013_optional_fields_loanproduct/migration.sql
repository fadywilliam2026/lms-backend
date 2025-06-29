-- AlterTable
ALTER TABLE "loan_products" ALTER COLUMN "installment_elements_rounding_method" DROP NOT NULL,
ALTER COLUMN "installment_rescheduling_method" DROP NOT NULL;
