-- CreateTable
CREATE TABLE "loan_products" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "account_link_settings" JSONB,
    "accounting_settings" JSONB,
    "adjust_interest_for_first_installment" BOOLEAN,
    "allow_custom_repayment_allocation" BOOLEAN,
    "arrears_settings" JSONB,
    "availability_settings" JSONB,
    "category" TEXT,
    "creation_date" TIMESTAMP(3),
    "credit_arrangement_settings" JSONB NOT NULL,
    "currency" JSONB,
    "encoded_key" TEXT,
    "fees_settings" JSONB,
    "funding_settings" JSONB,
    "grace_period_settings" JSONB,
    "interest_settings" JSONB,
    "internal_controls" JSONB,
    "last_modified_date" TIMESTAMP(3),
    "loan_amount_settings" JSONB,
    "new_account_settings" JSONB,
    "notes" TEXT,
    "offset_settings" JSONB,
    "payment_settings" JSONB,
    "penalty_settings" JSONB,
    "redraw_settings" JSONB,
    "schedule_settings" JSONB,
    "security_settings" JSONB,
    "state" TEXT,
    "tax_settings" JSONB,
    "templates" JSONB[],

    CONSTRAINT "loan_products_pkey" PRIMARY KEY ("id")
);
