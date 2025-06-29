/*
  Warnings:

  - You are about to drop the column `index_source_id` on the `interest_product_settings` table. All the data in the column will be lost.
  - You are about to drop the column `account_initial_state` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `account_linking_enabled` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `accounting_method` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `accruelate_interest` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `activated` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `allow_arbitrary_fees` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `allow_custom_repayment_allocation` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `apply_interest_on_prepayment_method` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `autocreate_linked_accounts` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `autolink_accounts` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `default_first_repayment_duedate_offset` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `default_principal_repayment_interval` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `default_repayment_period_count` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `for_all_branches` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `for_hybrid_groups` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `for_individuals` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `for_pure_groups` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `interest_accrual_calculation` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `interest_accrued_accounting_method` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `line_of_credit_requirement` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `max_first_repayment_due_date_offset` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `min_first_repayment_due_date_offset` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `product_description` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `product_security_settings_id` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `repayment_allocation_order` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `repayment_currency_rounding` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `repayment_elements_rounding_method` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `repayment_period_unit` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `repayment_rescheduling_method` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `repayment_schedule_edit_options` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `repayment_schedule_method` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `rounding_repayment_schedule_method` on the `loan_products` table. All the data in the column will be lost.
  - The `currency_code` column on the `loan_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `future_payments_acceptance` column on the `loan_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `grace_period_type` column on the `loan_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `interest_balance_calculation_method` column on the `loan_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `loan_product_type` column on the `loan_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `prepayment_acceptance` column on the `loan_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `short_month_handling_method` column on the `loan_products` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `index_rate_source` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `product_security_settings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `max_interest_rate` to the `interest_product_settings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `min_interest_rate` to the `interest_product_settings` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `compounding_frequency` on the `interest_product_settings` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `installment_currency_rounding` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `installment_elements_rounding_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rounding_installment_schedule_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "LoanProductType" AS ENUM ('FIXED_TERM_LOAN', 'DYNAMIC_TERM_LOAN', 'INTEREST_FREE_LOAN', 'TRANCHED_LOAN', 'REVOLVING_CREDIT');

-- CreateEnum
CREATE TYPE "ShortMonthHandlingMethod" AS ENUM ('LAST_DAY_IN_MONTH', 'FIRST_DAY_OF_NEXT_MONTH');

-- CreateEnum
CREATE TYPE "InstallmentScheduleMethod" AS ENUM ('NONE', 'FIXED', 'DYNAMIC');

-- CreateEnum
CREATE TYPE "InstallmentReschedulingMethod" AS ENUM ('NONE', 'NEXT_WORKING_DAY', 'PREVIOUS_WORKING_DAY', 'EXTEND_SCHEDULE');

-- CreateEnum
CREATE TYPE "InstallmentAllocation" AS ENUM ('PRINCIPAL', 'INTEREST', 'FEES', 'PENALTY');

-- CreateEnum
CREATE TYPE "InterestBalanceCalculationMethod" AS ENUM ('ONLY_PRINCIPAL', 'PRINCIPAL_AND_INTEREST');

-- CreateEnum
CREATE TYPE "GracePeriodType" AS ENUM ('NONE', 'PAY_INTEREST_ONLY', 'INTEREST_FORGIVENESS');

-- CreateEnum
CREATE TYPE "currency_code" AS ENUM ('EGP', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "rounding_installment_schedule_method" AS ENUM ('NO_ROUNDING', 'ROUND_TO_NEAREST_WHOLE_UNIT');

-- CreateEnum
CREATE TYPE "installment_period_unit" AS ENUM ('DAYS', 'WEEKS', 'MONTHS', 'YEARS');

-- CreateEnum
CREATE TYPE "installment_currency_rounding" AS ENUM ('NO_ROUNDING', 'ROUND_TO_NEAREST_WHOLE_UNIT');

-- CreateEnum
CREATE TYPE "installment_elements_rounding_method" AS ENUM ('NO_ROUNDING', 'ROUND_ALL', 'PAYMENT_DUE');

-- CreateEnum
CREATE TYPE "compounding_frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- DropForeignKey
ALTER TABLE "interest_product_settings" DROP CONSTRAINT "interest_product_settings_index_source_id_fkey";

-- DropForeignKey
ALTER TABLE "loan_products" DROP CONSTRAINT "loan_products_product_security_settings_id_fkey";

-- AlterTable
ALTER TABLE "arrears_settings" ALTER COLUMN "default_tolerance_percentage_of_outstanding_principal" DROP NOT NULL,
ALTER COLUMN "default_tolerance_period" DROP NOT NULL,
ALTER COLUMN "max_tolerance_percentage_of_outstanding_principal" DROP NOT NULL,
ALTER COLUMN "max_tolerance_period" DROP NOT NULL,
ALTER COLUMN "min_tolerance_percentage_of_outstanding_principal" DROP NOT NULL,
ALTER COLUMN "min_tolerance_period" DROP NOT NULL,
ALTER COLUMN "monthly_tolerance_day" DROP NOT NULL;

-- AlterTable
ALTER TABLE "interest_product_settings" DROP COLUMN "index_source_id",
ADD COLUMN     "max_interest_rate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "min_interest_rate" DOUBLE PRECISION NOT NULL,
DROP COLUMN "compounding_frequency",
ADD COLUMN     "compounding_frequency" "compounding_frequency" NOT NULL;

-- AlterTable
ALTER TABLE "loan_products" DROP COLUMN "account_initial_state",
DROP COLUMN "account_linking_enabled",
DROP COLUMN "accounting_method",
DROP COLUMN "accruelate_interest",
DROP COLUMN "activated",
DROP COLUMN "allow_arbitrary_fees",
DROP COLUMN "allow_custom_repayment_allocation",
DROP COLUMN "apply_interest_on_prepayment_method",
DROP COLUMN "autocreate_linked_accounts",
DROP COLUMN "autolink_accounts",
DROP COLUMN "default_first_repayment_duedate_offset",
DROP COLUMN "default_principal_repayment_interval",
DROP COLUMN "default_repayment_period_count",
DROP COLUMN "for_all_branches",
DROP COLUMN "for_hybrid_groups",
DROP COLUMN "for_individuals",
DROP COLUMN "for_pure_groups",
DROP COLUMN "interest_accrual_calculation",
DROP COLUMN "interest_accrued_accounting_method",
DROP COLUMN "line_of_credit_requirement",
DROP COLUMN "max_first_repayment_due_date_offset",
DROP COLUMN "min_first_repayment_due_date_offset",
DROP COLUMN "product_description",
DROP COLUMN "product_security_settings_id",
DROP COLUMN "repayment_allocation_order",
DROP COLUMN "repayment_currency_rounding",
DROP COLUMN "repayment_elements_rounding_method",
DROP COLUMN "repayment_period_unit",
DROP COLUMN "repayment_rescheduling_method",
DROP COLUMN "repayment_schedule_edit_options",
DROP COLUMN "repayment_schedule_method",
DROP COLUMN "rounding_repayment_schedule_method",
ADD COLUMN     "accrue_late_interest" BOOLEAN DEFAULT true,
ADD COLUMN     "active" BOOLEAN DEFAULT true,
ADD COLUMN     "apply_automatic_interest_on_prepayment" BOOLEAN DEFAULT true,
ADD COLUMN     "default_first_installment_duedate_offset" INTEGER DEFAULT 0,
ADD COLUMN     "default_principal_installment_interval" INTEGER DEFAULT 0,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "installment_allocation_order" "InstallmentAllocation"[],
ADD COLUMN     "installment_currency_rounding" "installment_currency_rounding" NOT NULL,
ADD COLUMN     "installment_elements_rounding_method" "installment_elements_rounding_method" NOT NULL,
ADD COLUMN     "installment_period_unit" "installment_period_unit" DEFAULT E'DAYS',
ADD COLUMN     "installment_rescheduling_method" "InstallmentReschedulingMethod" NOT NULL DEFAULT E'NONE',
ADD COLUMN     "installment_schedule_method" "InstallmentScheduleMethod" DEFAULT E'NONE',
ADD COLUMN     "max_first_installment_due_date_offset" INTEGER DEFAULT 0,
ADD COLUMN     "min_first_installment_due_date_offset" INTEGER DEFAULT 0,
ADD COLUMN     "rounding_installment_schedule_method" "rounding_installment_schedule_method" NOT NULL,
ALTER COLUMN "allow_redraw" SET DEFAULT true,
ALTER COLUMN "amortization_method" DROP NOT NULL,
ALTER COLUMN "amortization_method" SET DEFAULT E'STANDARD_PAYMENTS',
ALTER COLUMN "capping_apply_accrued_charges_before_locking" DROP NOT NULL,
ALTER COLUMN "capping_apply_accrued_charges_before_locking" SET DEFAULT true,
ALTER COLUMN "capping_constraint_type" DROP NOT NULL,
ALTER COLUMN "capping_constraint_type" SET DEFAULT E'SOFT_CAP',
ALTER COLUMN "capping_method" DROP NOT NULL,
ALTER COLUMN "capping_method" SET DEFAULT E'OUTSTANDING_PRINCIPAL_PERCENTAGE',
ALTER COLUMN "capping_percentage" DROP NOT NULL,
ALTER COLUMN "capping_percentage" SET DEFAULT 0.0,
DROP COLUMN "currency_code",
ADD COLUMN     "currency_code" "currency_code" DEFAULT E'EGP',
ALTER COLUMN "default_grace_period" DROP NOT NULL,
ALTER COLUMN "default_grace_period" SET DEFAULT 0,
ALTER COLUMN "default_loan_amount" DROP NOT NULL,
ALTER COLUMN "default_loan_amount" SET DEFAULT 0.0,
ALTER COLUMN "default_num_installments" DROP NOT NULL,
ALTER COLUMN "default_num_installments" SET DEFAULT 0,
ALTER COLUMN "default_penalty_rate" DROP NOT NULL,
ALTER COLUMN "default_penalty_rate" SET DEFAULT 0.0,
ALTER COLUMN "dormancy_period_days" DROP NOT NULL,
ALTER COLUMN "dormancy_period_days" SET DEFAULT 0,
ALTER COLUMN "elements_recalculation_method" DROP NOT NULL,
ALTER COLUMN "elements_recalculation_method" SET DEFAULT E'FIXED_PRINCIPAL_EXPECTED',
DROP COLUMN "future_payments_acceptance",
ADD COLUMN     "future_payments_acceptance" BOOLEAN NOT NULL DEFAULT true,
DROP COLUMN "grace_period_type",
ADD COLUMN     "grace_period_type" "GracePeriodType" DEFAULT E'NONE',
ALTER COLUMN "interest_application_method" DROP NOT NULL,
ALTER COLUMN "interest_application_method" SET DEFAULT E'ON_DISBURSEMENT',
DROP COLUMN "interest_balance_calculation_method",
ADD COLUMN     "interest_balance_calculation_method" "InterestBalanceCalculationMethod" DEFAULT E'ONLY_PRINCIPAL',
ALTER COLUMN "interest_calculation_method" DROP NOT NULL,
ALTER COLUMN "interest_calculation_method" SET DEFAULT E'FLAT',
ALTER COLUMN "interest_type" DROP NOT NULL,
ALTER COLUMN "interest_type" SET DEFAULT E'SIMPLE_INTEREST',
ALTER COLUMN "late_payments_recalculation_method" DROP NOT NULL,
ALTER COLUMN "late_payments_recalculation_method" SET DEFAULT E'INCREASE_OVERDUE_INSTALLMENTS',
ALTER COLUMN "loan_penalty_calculation_method" DROP NOT NULL,
ALTER COLUMN "loan_penalty_calculation_method" SET DEFAULT E'NONE',
ALTER COLUMN "loan_penalty_grace_period" DROP NOT NULL,
ALTER COLUMN "loan_penalty_grace_period" SET DEFAULT 0,
DROP COLUMN "loan_product_type",
ADD COLUMN     "loan_product_type" "LoanProductType" NOT NULL DEFAULT E'FIXED_TERM_LOAN',
ALTER COLUMN "lock_period_days" DROP NOT NULL,
ALTER COLUMN "lock_period_days" SET DEFAULT 0,
ALTER COLUMN "max_grace_period" DROP NOT NULL,
ALTER COLUMN "max_grace_period" SET DEFAULT 0,
ALTER COLUMN "max_loan_amount" DROP NOT NULL,
ALTER COLUMN "max_loan_amount" SET DEFAULT 0.0,
ALTER COLUMN "max_num_installments" DROP NOT NULL,
ALTER COLUMN "max_num_installments" SET DEFAULT 0,
ALTER COLUMN "max_number_of_disbursement_tranches" DROP NOT NULL,
ALTER COLUMN "max_number_of_disbursement_tranches" SET DEFAULT 0,
ALTER COLUMN "maxpenalty_rate" DROP NOT NULL,
ALTER COLUMN "maxpenalty_rate" SET DEFAULT 0.0,
ALTER COLUMN "min_grace_period" DROP NOT NULL,
ALTER COLUMN "min_grace_period" SET DEFAULT 0,
ALTER COLUMN "min_loan_amount" DROP NOT NULL,
ALTER COLUMN "min_loan_amount" SET DEFAULT 0.0,
ALTER COLUMN "min_num_installments" DROP NOT NULL,
ALTER COLUMN "min_num_installments" SET DEFAULT 0,
ALTER COLUMN "min_penalty_rate" DROP NOT NULL,
ALTER COLUMN "min_penalty_rate" SET DEFAULT 0.0,
ALTER COLUMN "offset_percentage" DROP NOT NULL,
ALTER COLUMN "offset_percentage" SET DEFAULT 0.0,
DROP COLUMN "prepayment_acceptance",
ADD COLUMN     "prepayment_acceptance" BOOLEAN DEFAULT true,
ALTER COLUMN "prepayment_recalculation_method" DROP NOT NULL,
ALTER COLUMN "prepayment_recalculation_method" SET DEFAULT E'NO_RECALCULATION',
ALTER COLUMN "principal_paid_installment_status" DROP NOT NULL,
ALTER COLUMN "principal_paid_installment_status" SET DEFAULT E'PARTIALLY_PAID',
ALTER COLUMN "settlement_options" DROP NOT NULL,
ALTER COLUMN "settlement_options" SET DEFAULT E'FULL_DUE_AMOUNTS',
DROP COLUMN "short_month_handling_method",
ADD COLUMN     "short_month_handling_method" "ShortMonthHandlingMethod" DEFAULT E'LAST_DAY_IN_MONTH',
ALTER COLUMN "tax_calculation_method" DROP NOT NULL,
ALTER COLUMN "tax_calculation_method" SET DEFAULT E'INCLUSIVE',
ALTER COLUMN "taxes_on_fees_enabled" DROP NOT NULL,
ALTER COLUMN "taxes_on_fees_enabled" SET DEFAULT true,
ALTER COLUMN "taxes_on_interest_enabled" DROP NOT NULL,
ALTER COLUMN "taxes_on_interest_enabled" SET DEFAULT true,
ALTER COLUMN "taxes_on_penalty_enabled" DROP NOT NULL,
ALTER COLUMN "taxes_on_penalty_enabled" SET DEFAULT true,
ALTER COLUMN "category" DROP NOT NULL,
ALTER COLUMN "category" SET DEFAULT E'PERSONAL_LENDING';

-- DropTable
DROP TABLE "index_rate_source";

-- DropTable
DROP TABLE "product_security_settings";

-- DropEnum
DROP TYPE "repayment_currency_rounding";

-- DropEnum
DROP TYPE "repayment_elements_rounding_method";

-- DropEnum
DROP TYPE "repayment_period_unit";

-- DropEnum
DROP TYPE "rounding_repayment_schedule_method";

-- DropEnum
DROP TYPE "type";
