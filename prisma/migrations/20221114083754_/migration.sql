-- AlterTable
ALTER TABLE "predefined_fees" ALTER COLUMN "amortization_profile" DROP NOT NULL,
ALTER COLUMN "amortization_profile" SET DEFAULT 'NONE';
