-- AlterTable
ALTER TABLE "loan_transactions" ALTER COLUMN "fees_amount" DROP NOT NULL,
ALTER COLUMN "fees_amount" SET DEFAULT 0,
ALTER COLUMN "interest_amount" DROP NOT NULL,
ALTER COLUMN "interest_amount" SET DEFAULT 0,
ALTER COLUMN "penalty_amount" DROP NOT NULL,
ALTER COLUMN "penalty_amount" SET DEFAULT 0,
ALTER COLUMN "principal_amount" DROP NOT NULL,
ALTER COLUMN "principal_amount" SET DEFAULT 0,
ALTER COLUMN "principal_balance" DROP NOT NULL,
ALTER COLUMN "principal_balance" SET DEFAULT 0;
