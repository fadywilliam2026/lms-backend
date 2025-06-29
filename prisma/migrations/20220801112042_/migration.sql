-- AlterTable
ALTER TABLE "installments" ALTER COLUMN "funders_interest_due" DROP NOT NULL,
ALTER COLUMN "last_paid_date" DROP NOT NULL,
ALTER COLUMN "last_penalty_applied_date" DROP NOT NULL,
ALTER COLUMN "organization_commission_due" DROP NOT NULL,
ALTER COLUMN "repaid_date" DROP NOT NULL;
