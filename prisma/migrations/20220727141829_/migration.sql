/*
  Warnings:

  - The values [OVERDUE_BALANCE,OVERDUE_BALANCE_AND_INTEREST] on the enum `loan_penalty_calculation_method` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Installment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `date_calculation_method` to the `account_arrears_settings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "amortization_profile" AS ENUM ('NONE', 'SUM_OF_YEARS_DIGITS', 'STRAIGHT_LINE', 'EFFECTIVE_INTEREST_RATE');

-- CreateEnum
CREATE TYPE "amount_calculation_method" AS ENUM ('FLAT', 'LOAN_AMOUNT_PERCENTAGE', 'REPAYMENT_PRINCIPAL_AMOUNT_PERCENTAGE', 'FLAT_NUMBER_OF_INSTALLMENTS', 'LOAN_AMOUNT_PERCENTAGE_NUMBER_OF_INSTALLMENTS');

-- CreateEnum
CREATE TYPE "apply_date_method" AS ENUM ('MONTHLY_FROM_ACTIVATION', 'FIRST_OF_EVERY_MONTH');

-- CreateEnum
CREATE TYPE "fee_amortization_upon_reschedule_option" AS ENUM ('END_AMORTIZATION_ON_THE_ORIGINAL_ACCOUNT', 'CONTINUE_AMORTIZATION_ON_THE_RESCHEDULED_REFINANCED_ACCOUNT');

-- CreateEnum
CREATE TYPE "fee_application" AS ENUM ('REQUIRED', 'OPTIONAL');

-- CreateEnum
CREATE TYPE "trigger_predefined_fee" AS ENUM ('MANUAL', 'DISBURSEMENT', 'CAPITALIZED_DISBURSEMENT', 'LATE_REPAYMENT', 'MONTHLY_FEE', 'PAYMENT_DUE', 'ARBITRARY');

-- CreateEnum
CREATE TYPE "date_calculation_method" AS ENUM ('ACCOUNT_FIRST_WENT_TO_ARREARS', 'LAST_LATE_REPAYMENT');

-- AlterEnum
BEGIN;
CREATE TYPE "loan_penalty_calculation_method_new" AS ENUM ('NONE', 'OVERDUE_PRINCIPAL', 'OVERDUE_PRINCIPAL_AND_INTEREST', 'OUTSTANDING_PRINCIPAL');
ALTER TABLE "loan_products" ALTER COLUMN "loan_penalty_calculation_method" DROP DEFAULT;
ALTER TABLE "loan_products" ALTER COLUMN "loan_penalty_calculation_method" TYPE "loan_penalty_calculation_method_new" USING ("loan_penalty_calculation_method"::text::"loan_penalty_calculation_method_new");
ALTER TABLE "loan_accounts" ALTER COLUMN "loan_penalty_calculation_method" TYPE "loan_penalty_calculation_method_new" USING ("loan_penalty_calculation_method"::text::"loan_penalty_calculation_method_new");
ALTER TYPE "loan_penalty_calculation_method" RENAME TO "loan_penalty_calculation_method_old";
ALTER TYPE "loan_penalty_calculation_method_new" RENAME TO "loan_penalty_calculation_method";
DROP TYPE "loan_penalty_calculation_method_old";
ALTER TABLE "loan_products" ALTER COLUMN "loan_penalty_calculation_method" SET DEFAULT 'NONE';
COMMIT;

-- DropForeignKey
ALTER TABLE "Installment" DROP CONSTRAINT "Installment_loan_account_id_fkey";

-- AlterTable
ALTER TABLE "account_arrears_settings" ADD COLUMN     "date_calculation_method" "date_calculation_method" NOT NULL;

-- DropTable
DROP TABLE "Installment";

-- CreateTable
CREATE TABLE "predefined_fees" (
    "active" BOOLEAN NOT NULL,
    "amortization_profile" "amortization_profile" NOT NULL,
    "amount" INTEGER NOT NULL,
    "amount_calculation_method" "amount_calculation_method" NOT NULL,
    "apply_date_method" "apply_date_method" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fee_amortization_upon_reschedule_option" "fee_amortization_upon_reschedule_option" NOT NULL,
    "fee_application" "fee_application" NOT NULL,
    "id" SERIAL NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "percentage_amount" DOUBLE PRECISION NOT NULL,
    "triggerPredefinedFee" "trigger_predefined_fee" NOT NULL,
    "loan_product_id" INTEGER NOT NULL,

    CONSTRAINT "predefined_fees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installments" (
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

    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "periodic_payments" (
    "id" SERIAL NOT NULL,
    "ending_installment_position" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "loan_account_id" INTEGER NOT NULL,
    "payment_plan_index" INTEGER NOT NULL,
    "pmt" INTEGER NOT NULL,

    CONSTRAINT "periodic_payments_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "predefined_fees" ADD CONSTRAINT "predefined_fees_loan_product_id_fkey" FOREIGN KEY ("loan_product_id") REFERENCES "loan_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "installments" ADD CONSTRAINT "installments_loan_account_id_fkey" FOREIGN KEY ("loan_account_id") REFERENCES "loan_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "periodic_payments" ADD CONSTRAINT "periodic_payments_loan_account_id_fkey" FOREIGN KEY ("loan_account_id") REFERENCES "loan_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
