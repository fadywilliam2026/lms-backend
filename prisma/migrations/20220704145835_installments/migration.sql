-- CreateEnum
CREATE TYPE "InstallmentState" AS ENUM ('PENDING', 'LATE', 'PAID', 'PARTIALLY_PAID', 'GRACE');

-- CreateTable
CREATE TABLE "Installment" (
    "id" SERIAL NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "fees_due" INTEGER NOT NULL DEFAULT 0,
    "fees_paid" INTEGER NOT NULL DEFAULT 0,
    "funders_interest_due" INTEGER NOT NULL DEFAULT 0,
    "interest_due" INTEGER NOT NULL DEFAULT 0,
    "interest_paid" INTEGER NOT NULL DEFAULT 0,
    "last_paid_date" TIMESTAMP(3) NOT NULL,
    "last_penalty_applied_date" TIMESTAMP(3) NOT NULL,
    "organization_commission_due" INTEGER NOT NULL DEFAULT 0,
    "penalty_due" INTEGER NOT NULL DEFAULT 0,
    "penalty_paid" INTEGER NOT NULL DEFAULT 0,
    "principal_due" INTEGER NOT NULL DEFAULT 0,
    "principal_paid" INTEGER NOT NULL DEFAULT 0,
    "repaid_date" TIMESTAMP(3) NOT NULL,
    "state" "InstallmentState" NOT NULL DEFAULT E'PENDING',
    "loan_account_id" INTEGER NOT NULL,

    CONSTRAINT "Installment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanAccount" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "LoanAccount_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Installment" ADD CONSTRAINT "Installment_loan_account_id_fkey" FOREIGN KEY ("loan_account_id") REFERENCES "LoanAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
