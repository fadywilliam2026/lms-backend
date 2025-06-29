/*
  Warnings:

  - You are about to drop the `LoanTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "LoanTransaction";

-- CreateTable
CREATE TABLE "loan_transactions" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "fees_amount" DOUBLE PRECISION NOT NULL,
    "interest_amount" DOUBLE PRECISION NOT NULL,
    "penalty_amount" DOUBLE PRECISION NOT NULL,
    "principal_amount" DOUBLE PRECISION NOT NULL,
    "principal_balance" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "entry_date" TIMESTAMP(3) NOT NULL,
    "type" "loan_transaction_type" NOT NULL,
    "user_id" INTEGER NOT NULL,
    "loan_account_id" INTEGER NOT NULL,

    CONSTRAINT "loan_transactions_pkey" PRIMARY KEY ("id")
);
