-- CreateTable
CREATE TABLE "payment_plan" (
    "id" SERIAL NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "loan_account_id" INTEGER NOT NULL,

    CONSTRAINT "payment_plan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payment_plan" ADD CONSTRAINT "payment_plan_loan_account_id_fkey" FOREIGN KEY ("loan_account_id") REFERENCES "loan_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
