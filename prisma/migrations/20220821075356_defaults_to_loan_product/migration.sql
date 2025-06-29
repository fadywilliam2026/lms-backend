-- AlterTable
ALTER TABLE "loan_products" ALTER COLUMN "schedule_due_dates_method" DROP NOT NULL,
ALTER COLUMN "schedule_due_dates_method" SET DEFAULT 'INTERVAL',
ALTER COLUMN "schedule_interest_days_count_method" DROP NOT NULL,
ALTER COLUMN "schedule_interest_days_count_method" SET DEFAULT 'USING_ACTUAL_DAYS_COUNT',
ALTER COLUMN "rounding_installment_schedule_method" DROP NOT NULL,
ALTER COLUMN "rounding_installment_schedule_method" SET DEFAULT 'NO_ROUNDING';
