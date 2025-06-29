-- AlterTable
ALTER TABLE "loan_products" ALTER COLUMN "max_grace_period" SET DEFAULT 30,
ALTER COLUMN "max_loan_amount" SET DEFAULT 1000000.0,
ALTER COLUMN "max_num_installments" SET DEFAULT 100,
ALTER COLUMN "max_number_of_disbursement_tranches" SET DEFAULT 100,
ALTER COLUMN "maxpenalty_rate" SET DEFAULT 100.0,
ALTER COLUMN "max_first_installment_due_date_offset" SET DEFAULT 30;
