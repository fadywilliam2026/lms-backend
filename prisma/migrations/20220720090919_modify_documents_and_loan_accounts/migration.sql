/*
  Warnings:

  - The values [LOAN_ACCOUNT] on the enum `DocumentOwnerType` will be removed. If these variants are still used in the database, this will fail.
  - The `installment_allocation_order` column on the `loan_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `interest_balance_calculation_method` column on the `loan_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "installment_allocation" AS ENUM ('PRINCIPAL', 'INTEREST', 'FEES', 'PENALTY');

-- CreateEnum
CREATE TYPE "interest_balance_calculation_method" AS ENUM ('ONLY_PRINCIPAL', 'PRINCIPAL_AND_INTEREST');

-- CreateEnum
CREATE TYPE "account_state" AS ENUM ('PARTIAL_APPLICATION', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'ACTIVE_IN_ARREARS', 'CLOSED', 'CLOSED_WRITTEN_OFF', 'CLOSED_REJECTED');

-- CreateEnum
CREATE TYPE "account_sub_state" AS ENUM ('PARTIALLY_DISBURSED', 'REFINANCED', 'RESCHEDULED', 'WITHDRAWN', 'LOCKED', 'LOCKED_CAPPING');

-- CreateEnum
CREATE TYPE "future_payments_acceptance" AS ENUM ('NO_FUTURE_PAYMENTS', 'ACCEPT_FUTURE_PAYMENTS', 'ACCEPT_OVERPAYMENTS');

-- CreateEnum
CREATE TYPE "interest_charge_frequency" AS ENUM ('ANNUALIZED', 'EVERY_MONTH', 'EVERY_FOUR_WEEKS', 'EVERY_DAY');

-- CreateEnum
CREATE TYPE "interest_rate_review_unit" AS ENUM ('DAYS', 'WEEKS', 'MONTHS');

-- CreateEnum
CREATE TYPE "InterestRateSource" AS ENUM ('FIXED_INTEREST_RATE', 'INDEX_INTEREST_RATE');

-- CreateEnum
CREATE TYPE "interest_rounding_version" AS ENUM ('VERSION_1', 'VERSION_2', 'VERSION_3');

-- CreateEnum
CREATE TYPE "prepayment_calculation_method" AS ENUM ('NO_RECALCULATION', 'RESCHEDULE_REMAINING_REPAYMENTS', 'RECALCULATE_SCHEDULE_KEEP_SAME_NUMBER_OF_TERMS', 'RECALCULATE_SCHEDULE_KEEP_SAME_PRINCIPAL_AMOUNT', 'RECALCULATE_SCHEDULE_KEEP_SAME_TOTAL_REPAYMENT_AMOUNT', 'REDUCE_AMOUNT_PER_INSTALLMENT', 'REDUCE_NUMBER_OF_INSTALLMENTS');

-- AlterEnum
BEGIN;
CREATE TYPE "DocumentOwnerType_new" AS ENUM ('CLIENT');
ALTER TABLE "documents" ALTER COLUMN "ownerType" TYPE "DocumentOwnerType_new" USING ("ownerType"::text::"DocumentOwnerType_new");
ALTER TYPE "DocumentOwnerType" RENAME TO "DocumentOwnerType_old";
ALTER TYPE "DocumentOwnerType_new" RENAME TO "DocumentOwnerType";
DROP TYPE "DocumentOwnerType_old";
COMMIT;

-- AlterTable
ALTER TABLE "loan_products" DROP COLUMN "installment_allocation_order",
ADD COLUMN     "installment_allocation_order" "installment_allocation"[],
DROP COLUMN "interest_balance_calculation_method",
ADD COLUMN     "interest_balance_calculation_method" "interest_balance_calculation_method" DEFAULT E'ONLY_PRINCIPAL';

-- DropEnum
DROP TYPE "InstallmentAllocation";

-- DropEnum
DROP TYPE "InterestBalanceCalculationMethod";

-- CreateTable
CREATE TABLE "account_arrears_settings" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "monthly_tolerance_day" INTEGER NOT NULL,
    "tolerance_percentage_of_outstanding_principal" DOUBLE PRECISION NOT NULL,
    "tolerance_period" INTEGER NOT NULL,

    CONSTRAINT "account_arrears_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loan_accounts" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "client_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "account_arrears_settings_id" INTEGER,
    "account_state" "account_state" NOT NULL,
    "account_sub_state" "account_sub_state",
    "accrued_interest" DOUBLE PRECISION,
    "accrued_penalty" DOUBLE PRECISION,
    "accrue_interest_after_maturity" BOOLEAN,
    "accrue_late_interest" BOOLEAN,
    "apply_automatic_interest_on_prepayment" BOOLEAN,
    "approved_at" TIMESTAMP(3),
    "arrears_tolerance_period" INTEGER,
    "closed_at" TIMESTAMP(3),
    "default_first_installment_due_date_offset" DOUBLE PRECISION,
    "elements_recalculation_method" "elements_recalculation_method",
    "fees_balance" DOUBLE PRECISION,
    "fees_due" DOUBLE PRECISION NOT NULL,
    "fees_paid" DOUBLE PRECISION NOT NULL,
    "fixed_days_of_month" INTEGER[],
    "future_payments_acceptance" BOOLEAN NOT NULL DEFAULT false,
    "grace_period" INTEGER,
    "grace_period_type" "GracePeriodType",
    "has_custom_schedule" BOOLEAN NOT NULL DEFAULT false,
    "hold_balance" DOUBLE PRECISION,
    "interest_application_method" "interest_application_method",
    "interest_balance" DOUBLE PRECISION,
    "interest_balance_calculation_method" "interest_balance_calculation_method",
    "interest_calculation_method" "interest_calculation_method" NOT NULL,
    "interest_charge_frequency" "interest_charge_frequency" NOT NULL,
    "interest_comission" DOUBLE PRECISION,
    "interest_due" DOUBLE PRECISION NOT NULL,
    "interest_from_arrears_accrued" DOUBLE PRECISION,
    "interest_from_arrears_balance" DOUBLE PRECISION,
    "interest_from_arrears_due" DOUBLE PRECISION,
    "interest_from_arrears_paid" DOUBLE PRECISION,
    "interest_paid" DOUBLE PRECISION NOT NULL,
    "interest_rate" DOUBLE PRECISION NOT NULL,
    "interest_rate_review_count" INTEGER,
    "interest_rate_review_unit" "interest_rate_review_unit",
    "interest_rate_source" "InterestRateSource",
    "interest_type" "interest_type",
    "account_appraisal_at" TIMESTAMP(3),
    "interest_applied_at" TIMESTAMP(3),
    "interest_review_at" TIMESTAMP(3),
    "locked_at" TIMESTAMP(3),
    "set_to_arrears_at" TIMESTAMP(3),
    "tax_rate_review_at" TIMESTAMP(3),
    "loan_amount" DOUBLE PRECISION NOT NULL,
    "loan_name" TEXT NOT NULL,
    "loan_penalty_calculation_method" "loan_penalty_calculation_method",
    "locked_operations" TEXT[],
    "notes" TEXT,
    "paymentmethods" "payment_method",
    "penalty_balance" DOUBLE PRECISION,
    "penalty_due" DOUBLE PRECISION NOT NULL,
    "penalty_paid" DOUBLE PRECISION NOT NULL,
    "penalty_rate" DOUBLE PRECISION,
    "periodic_payment" DOUBLE PRECISION,
    "pre_payments_allowed" BOOLEAN NOT NULL DEFAULT false,
    "prepayment_recalculation_method" "prepayment_recalculation_method",
    "principal_balance" DOUBLE PRECISION,
    "principal_due" DOUBLE PRECISION NOT NULL,
    "principal_paid" DOUBLE PRECISION,
    "principal_paid_installment_status" "principal_paid_installment_status",
    "principal_installment_interval" INTEGER,
    "product_id" INTEGER NOT NULL,
    "redraw_balance" DOUBLE PRECISION,
    "installments_count" INTEGER NOT NULL,
    "installment_period_count" INTEGER NOT NULL,
    "installment_period_unit" "installment_period_unit" NOT NULL,
    "installment_schedule_method" "InstallmentScheduleMethod",
    "schedule_due_dates_method" "schedule_due_dates_method",
    "short_month_handling_method" "ShortMonthHandlingMethod",
    "tax_rate" DOUBLE PRECISION,

    CONSTRAINT "loan_accounts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "loan_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_accounts" ADD CONSTRAINT "loan_accounts_account_arrears_settings_id_fkey" FOREIGN KEY ("account_arrears_settings_id") REFERENCES "account_arrears_settings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
