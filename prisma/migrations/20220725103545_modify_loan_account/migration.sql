-- AlterTable
ALTER TABLE "loan_accounts" ADD COLUMN     "disbursement_details_id" INTEGER,
ADD COLUMN     "late_payments_recalculation_method" "late_payments_recalculation_method";

-- CreateTable
CREATE TABLE "disbursement_details" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "disbursement_date" TIMESTAMP(3),
    "expected_disbursement_date" TIMESTAMP(3),
    "first_repayment_date" TIMESTAMP(3),

    CONSTRAINT "disbursement_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_disbursement_details_id_fkey" FOREIGN KEY ("disbursement_details_id") REFERENCES "disbursement_details"("id") ON DELETE SET NULL ON UPDATE CASCADE;
