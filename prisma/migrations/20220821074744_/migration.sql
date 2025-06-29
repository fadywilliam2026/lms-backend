-- AlterTable
ALTER TABLE "loan_products" ALTER COLUMN "days_in_year" DROP NOT NULL,
ALTER COLUMN "days_in_year" SET DEFAULT 'ACTUAL_365_FIXED',
ALTER COLUMN "payment_method" DROP NOT NULL,
ALTER COLUMN "payment_method" SET DEFAULT 'HORIZONTAL',
ALTER COLUMN "installment_currency_rounding" DROP NOT NULL,
ALTER COLUMN "installment_currency_rounding" SET DEFAULT 'NO_ROUNDING',
ALTER COLUMN "installment_elements_rounding_method" SET DEFAULT 'NO_ROUNDING';
