-- CreateEnum
CREATE TYPE "gl_account_type" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE');

-- CreateEnum
CREATE TYPE "GLCategory" AS ENUM ('DETAIL', 'HEADER');

-- CreateEnum
CREATE TYPE "gl_journal_entry_type" AS ENUM ('DEBIT', 'CREDIT');

-- CreateTable
CREATE TABLE "gl_accounts" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "gl_account_type" NOT NULL,
    "activated" BOOLEAN DEFAULT true,
    "allow_manual_journal_entries" BOOLEAN DEFAULT true,
    "strip_trailing_zeros" BOOLEAN DEFAULT true,
    "usage" "GLCategory" DEFAULT 'DETAIL',

    CONSTRAINT "gl_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gl_accounting_rules" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "financial_resource" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "gl_account_id" INTEGER,
    "loan_product_id" INTEGER,

    CONSTRAINT "gl_accounting_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gl_journal_entries" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "amount" MONEY NOT NULL,
    "booking_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "type" "gl_journal_entry_type" NOT NULL,
    "gl_account_id" INTEGER,
    "loan_product_id" INTEGER,
    "loan_account_id" INTEGER,
    "reversal_entry_id" INTEGER,
    "transaction_id" INTEGER,
    "user_id" INTEGER,

    CONSTRAINT "gl_journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "gl_journal_entries_reversal_entry_id_key" ON "gl_journal_entries"("reversal_entry_id");

-- AddForeignKey
ALTER TABLE "gl_accounting_rules" ADD CONSTRAINT "gl_accounting_rules_gl_account_id_fkey" FOREIGN KEY ("gl_account_id") REFERENCES "gl_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_accounting_rules" ADD CONSTRAINT "gl_accounting_rules_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "loan_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_journal_entries" ADD CONSTRAINT "gl_journal_entries_gl_account_id_fkey" FOREIGN KEY ("gl_account_id") REFERENCES "gl_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_journal_entries" ADD CONSTRAINT "gl_journal_entries_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "loan_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_journal_entries" ADD CONSTRAINT "gl_journal_entries_loan_account_id_fkey" FOREIGN KEY ("loan_account_id") REFERENCES "loan_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_journal_entries" ADD CONSTRAINT "gl_journal_entries_reversal_entry_id_fkey" FOREIGN KEY ("reversal_entry_id") REFERENCES "gl_journal_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_journal_entries" ADD CONSTRAINT "gl_journal_entries_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "loan_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gl_journal_entries" ADD CONSTRAINT "gl_journal_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
