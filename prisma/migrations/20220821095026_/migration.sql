-- AlterTable
ALTER TABLE "interest_product_settings" ALTER COLUMN "allow_negative_interest_rate" DROP NOT NULL,
ALTER COLUMN "allow_negative_interest_rate" SET DEFAULT false,
ALTER COLUMN "default_interest_rate" DROP NOT NULL,
ALTER COLUMN "default_interest_rate" SET DEFAULT 0,
ALTER COLUMN "max_interest_rate" DROP NOT NULL,
ALTER COLUMN "max_interest_rate" SET DEFAULT 0,
ALTER COLUMN "min_interest_rate" DROP NOT NULL,
ALTER COLUMN "min_interest_rate" SET DEFAULT 0,
ALTER COLUMN "compounding_frequency" DROP NOT NULL,
ALTER COLUMN "compounding_frequency" SET DEFAULT 'YEARLY';
