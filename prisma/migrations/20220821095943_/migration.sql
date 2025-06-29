-- AlterTable
ALTER TABLE "account_arrears_settings" ALTER COLUMN "monthly_tolerance_day" DROP NOT NULL,
ALTER COLUMN "monthly_tolerance_day" SET DEFAULT 0,
ALTER COLUMN "tolerance_percentage_of_outstanding_principal" DROP NOT NULL,
ALTER COLUMN "tolerance_percentage_of_outstanding_principal" SET DEFAULT 0,
ALTER COLUMN "tolerance_period" DROP NOT NULL,
ALTER COLUMN "tolerance_period" SET DEFAULT 0;
