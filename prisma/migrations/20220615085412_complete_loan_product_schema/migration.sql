/*
  Warnings:

  - The values [none,cash,accrual] on the enum `accounting_method` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `accountInitialState` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `accountingMethod` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `accountlinkingenabled` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `accruelateinterest` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `allowarbitraryfees` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `allowcustomrepaymentallocation` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `amortizationmethod` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `applyInterestOnPrepaymentMethod` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `arrearsSettingsId` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `autocreatelinkedaccounts` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `autolinkaccounts` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `cappingapplyaccruedchargesbeforelocking` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `cappingconstrainttype` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `cappingmethod` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `cappingpercentage` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `creationdate` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `currencycode` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `daysinyear` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `defaultfirstrepaymentduedateoffset` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `defaultgraceperiod` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `defaultloanamount` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `defaultnuminstallments` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `defaultpenaltyrate` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `defaultprincipalrepaymentinterval` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `defaultrepaymentperiodcount` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `dormancyperioddays` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `elementsrecalculationmethod` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `fixeddaysofmonth` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `forallbranches` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `forhybridgroups` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `forindividuals` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `forpuregroups` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `futurepaymentsacceptance` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `generatedId` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `graceperiodtype` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `idgeneratortype` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `idpattern` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `interestaccrualcalculation` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `interestaccruedaccountingmethod` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `interestapplicationmethod` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `interestbalancecalculationmethod` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `interestcalculationmethod` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `interestratesettingsId` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `interesttype` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `lastmodifieddate` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `latepaymentsrecalculationmethod` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `lineofcreditrequirement` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the `ArrearsSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `indexratesource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `interestProductSettings` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_initial_state` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `account_linking_enabled` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accounting_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accruelate_interest` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `allow_arbitrary_fees` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `allow_custom_repayment_allocation` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `allow_redraw` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amortization_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrears_settings_id` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `autocreate_linked_accounts` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `autolink_accounts` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capping_apply_accrued_charges_before_locking` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capping_constraint_type` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capping_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capping_percentage` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creation_date` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency_code` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `days_in_year` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `default_first_repayment_duedate_offset` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `default_grace_period` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `default_loan_amount` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `default_num_installments` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `default_penalty_rate` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `default_principal_repayment_interval` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `default_repayment_period_count` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dormancy_period_days` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `elements_recalculation_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `for_all_branches` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `for_hybrid_groups` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `for_individuals` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `for_pure_groups` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `future_payments_acceptance` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `generated_id` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grace_period_type` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_generator_type` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_pattern` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interest_accrual_calculation` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interest_accrued_accounting_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interest_application_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interest_balance_calculation_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interest_calculation_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interest_rate_settings_id` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interest_type` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_modified_date` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `late_payments_recalculation_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `line_of_credit_requirement` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loan_penalty_calculation_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loan_penalty_grace_period` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `loan_product_type` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lock_period_days` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_first_repayment_due_date_offset` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_grace_period` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_loan_amount` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_num_installments` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_number_of_disbursement_tranches` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxpenalty_rate` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `min_first_repayment_due_date_offset` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `min_grace_period` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `min_loan_amount` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `min_num_installments` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `min_penalty_rate` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `offset_percentage` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prepayment_acceptance` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prepayment_recalculation_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `principal_paid_installment_status` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `principal_payment_settings_id` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_description` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_name` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_security_settings_id` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repayment_currency_rounding` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repayment_elements_rounding_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repayment_period_unit` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repayment_rescheduling_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repayment_schedule_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rounding_repayment_schedule_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedule_due_dates_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedule_interest_days_count_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `settlement_options` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `short_month_handling_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax_calculation_method` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxes_on_fees_enabled` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxes_on_interest_enabled` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxes_on_penalty_enabled` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `loan_products` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "tax_calculation_method" AS ENUM ('INCLUSIVE', 'EXCLUSIVE');

-- CreateEnum
CREATE TYPE "settlement_options" AS ENUM ('FULL_DUE_AMOUNTS', 'PARTIAL_DUE_AMOUNTS');

-- CreateEnum
CREATE TYPE "schedule_interest_days_count_method" AS ENUM ('USING_REPAYMENT_PERIODICITY', 'USING_ACTUAL_DAYS_COUNT');

-- CreateEnum
CREATE TYPE "schedule_due_dates_method" AS ENUM ('INTERVAL', 'FIXED_DAYS_OF_MONTH');

-- CreateEnum
CREATE TYPE "rounding_repayment_schedule_method" AS ENUM ('NO_ROUNDING', 'ROUND_TO_NEAREST_WHOLE_UNIT');

-- CreateEnum
CREATE TYPE "repayment_period_unit" AS ENUM ('DAYS', 'WEEKS', 'MONTHS', 'YEARS');

-- CreateEnum
CREATE TYPE "repayment_currency_rounding" AS ENUM ('NO_ROUNDING', 'ROUND_TO_NEAREST_WHOLE_UNIT');

-- CreateEnum
CREATE TYPE "repayment_elements_rounding_method" AS ENUM ('NO_ROUNDING', 'ROUND_ALL', 'PAYMENT_DUE');

-- CreateEnum
CREATE TYPE "principal_paid_installment_status" AS ENUM ('PARTIALLY_PAID', 'PAID', 'ORIGINAL_TOTAL_EXPECTED_PAID');

-- CreateEnum
CREATE TYPE "prepayment_recalculation_method" AS ENUM ('NO_RECALCULATION', 'RESCHEDULE_REMAINING_REPAYMENTS', 'RECALCULATE_SCHEDULE_KEEP_SAME_NUMBER_OF_TERMS', 'RECALCULATE_SCHEDULE_KEEP_SAME_PRINCIPAL_AMOUNT', 'RECALCULATE_SCHEDULE_KEEP_SAME_TOTAL_REPAYMENT_AMOUNT', 'REDUCE_AMOUNT_PER_INSTALLMENT', 'REDUCE_NUMBER_OF_INSTALLMENTS');

-- CreateEnum
CREATE TYPE "payment_method" AS ENUM ('HORIZONTAL', 'VERTICAL');

-- CreateEnum
CREATE TYPE "loan_penalty_calculation_method" AS ENUM ('NONE', 'OVERDUE_BALANCE', 'OVERDUE_BALANCE_AND_INTEREST');

-- CreateEnum
CREATE TYPE "line_of_credit_requirement" AS ENUM ('OPTIONAL', 'REQUIRED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "late_payments_recalculation_method" AS ENUM ('INCREASE_OVERDUE_INSTALLMENTS', 'INCREASE_LAST_INSTALLMENT');

-- CreateEnum
CREATE TYPE "interest_type" AS ENUM ('SIMPLE_INTEREST', 'CAPITALIZED_INTEREST');

-- CreateEnum
CREATE TYPE "interest_calculation_method" AS ENUM ('FLAT', 'DECLINING_BALANCE', 'DECLINING_BALANCE_DISCOUNTED');

-- CreateEnum
CREATE TYPE "interest_application_method" AS ENUM ('ON_DISBURSEMENT', 'ON_REPAYMENT');

-- CreateEnum
CREATE TYPE "interest_accrued_accounting_method" AS ENUM ('NONE', 'DAILY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "interest_accrual_calculation" AS ENUM ('BREAKDOWN_PER_ACCOUNT', 'AGGREGATED_AMOUNT', 'NONE');

-- CreateEnum
CREATE TYPE "id_generator_type" AS ENUM ('RANDOM_PATTERN', 'INCREMENTAL_NUMBER');

-- CreateEnum
CREATE TYPE "elements_recalculation_method" AS ENUM ('FIXED_PRINCIPAL_EXPECTED', 'FIXED_TOTAL_EXPECTED');

-- CreateEnum
CREATE TYPE "days_in_year" AS ENUM ('ACTUAL_365_FIXED', 'ACTUAL_364', 'ACTUAL_360', 'E30_360');

-- CreateEnum
CREATE TYPE "category" AS ENUM ('PERSONAL_LENDING', 'PURCHASE_FINANCING', 'RETAIL_MORTGAGES', 'SME_LENDING', 'COMMERCIAL', 'UNCATEGORIZED');

-- CreateEnum
CREATE TYPE "capping_method" AS ENUM ('OUTSTANDING_PRINCIPAL_PERCENTAGE', 'ORIGINAL_PRINCIPAL_PERCENTAGE');

-- CreateEnum
CREATE TYPE "capping_constraint_type" AS ENUM ('SOFT_CAP', 'HARD_CAP');

-- CreateEnum
CREATE TYPE "account_initial_state" AS ENUM ('PENDING_APPROVAL', 'PARTIAL_APPLICATION');

-- CreateEnum
CREATE TYPE "amortization_method" AS ENUM ('STANDARD_PAYMENTS', 'BALLOON_PAYMENTS');

-- AlterEnum
-- BEGIN;
-- CREATE TYPE "accounting_method_new" AS ENUM ('NONE', 'CASH', 'ACCRUAL');
-- ALTER TABLE "loan_products" ALTER COLUMN "accounting_method" TYPE "accounting_method_new" USING ("accounting_method"::text::"accounting_method_new");
-- ALTER TYPE "accounting_method" RENAME TO "accounting_method_old";
-- ALTER TYPE "accounting_method_new" RENAME TO "accounting_method";
-- DROP TYPE "accounting_method_old";
-- COMMIT;

-- DropForeignKey
ALTER TABLE "interestProductSettings" DROP CONSTRAINT "interestProductSettings_indexSourceId_fkey";

-- DropForeignKey
ALTER TABLE "loan_products" DROP CONSTRAINT "loan_products_arrearsSettingsId_fkey";

-- DropForeignKey
ALTER TABLE "loan_products" DROP CONSTRAINT "loan_products_interestratesettingsId_fkey";

-- AlterTable
ALTER TABLE "loan_products" DROP COLUMN "accountInitialState",
DROP COLUMN "accountingMethod",
DROP COLUMN "accountlinkingenabled",
DROP COLUMN "accruelateinterest",
DROP COLUMN "allowarbitraryfees",
DROP COLUMN "allowcustomrepaymentallocation",
DROP COLUMN "amortizationmethod",
DROP COLUMN "applyInterestOnPrepaymentMethod",
DROP COLUMN "arrearsSettingsId",
DROP COLUMN "autocreatelinkedaccounts",
DROP COLUMN "autolinkaccounts",
DROP COLUMN "cappingapplyaccruedchargesbeforelocking",
DROP COLUMN "cappingconstrainttype",
DROP COLUMN "cappingmethod",
DROP COLUMN "cappingpercentage",
DROP COLUMN "creationdate",
DROP COLUMN "currencycode",
DROP COLUMN "daysinyear",
DROP COLUMN "defaultfirstrepaymentduedateoffset",
DROP COLUMN "defaultgraceperiod",
DROP COLUMN "defaultloanamount",
DROP COLUMN "defaultnuminstallments",
DROP COLUMN "defaultpenaltyrate",
DROP COLUMN "defaultprincipalrepaymentinterval",
DROP COLUMN "defaultrepaymentperiodcount",
DROP COLUMN "dormancyperioddays",
DROP COLUMN "elementsrecalculationmethod",
DROP COLUMN "fixeddaysofmonth",
DROP COLUMN "forallbranches",
DROP COLUMN "forhybridgroups",
DROP COLUMN "forindividuals",
DROP COLUMN "forpuregroups",
DROP COLUMN "futurepaymentsacceptance",
DROP COLUMN "generatedId",
DROP COLUMN "graceperiodtype",
DROP COLUMN "idgeneratortype",
DROP COLUMN "idpattern",
DROP COLUMN "interestaccrualcalculation",
DROP COLUMN "interestaccruedaccountingmethod",
DROP COLUMN "interestapplicationmethod",
DROP COLUMN "interestbalancecalculationmethod",
DROP COLUMN "interestcalculationmethod",
DROP COLUMN "interestratesettingsId",
DROP COLUMN "interesttype",
DROP COLUMN "lastmodifieddate",
DROP COLUMN "latepaymentsrecalculationmethod",
DROP COLUMN "lineofcreditrequirement",
DROP COLUMN "name",
ADD COLUMN     "account_initial_state" "account_initial_state" NOT NULL,
ADD COLUMN     "account_linking_enabled" BOOLEAN NOT NULL,
ADD COLUMN     "accounting_method" "accounting_method" NOT NULL,
ADD COLUMN     "accruelate_interest" BOOLEAN NOT NULL,
ADD COLUMN     "allow_arbitrary_fees" BOOLEAN NOT NULL,
ADD COLUMN     "allow_custom_repayment_allocation" BOOLEAN NOT NULL,
ADD COLUMN     "allow_redraw" BOOLEAN NOT NULL,
ADD COLUMN     "amortization_method" "amortization_method" NOT NULL,
ADD COLUMN     "arrears_settings_id" INTEGER NOT NULL,
ADD COLUMN     "autocreate_linked_accounts" BOOLEAN NOT NULL,
ADD COLUMN     "autolink_accounts" BOOLEAN NOT NULL,
ADD COLUMN     "capping_apply_accrued_charges_before_locking" BOOLEAN NOT NULL,
ADD COLUMN     "capping_constraint_type" "capping_constraint_type" NOT NULL,
ADD COLUMN     "capping_method" "capping_method" NOT NULL,
ADD COLUMN     "capping_percentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "creation_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "currency_code" TEXT NOT NULL,
ADD COLUMN     "days_in_year" "days_in_year" NOT NULL,
ADD COLUMN     "default_first_repayment_duedate_offset" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "default_grace_period" INTEGER NOT NULL,
ADD COLUMN     "default_loan_amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "default_num_installments" INTEGER NOT NULL,
ADD COLUMN     "default_penalty_rate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "default_principal_repayment_interval" INTEGER NOT NULL,
ADD COLUMN     "default_repayment_period_count" INTEGER NOT NULL,
ADD COLUMN     "dormancy_period_days" INTEGER NOT NULL,
ADD COLUMN     "elements_recalculation_method" "elements_recalculation_method" NOT NULL,
ADD COLUMN     "fixed_days_of_month" INTEGER[],
ADD COLUMN     "for_all_branches" BOOLEAN NOT NULL,
ADD COLUMN     "for_hybrid_groups" BOOLEAN NOT NULL,
ADD COLUMN     "for_individuals" BOOLEAN NOT NULL,
ADD COLUMN     "for_pure_groups" BOOLEAN NOT NULL,
ADD COLUMN     "future_payments_acceptance" TEXT NOT NULL,
ADD COLUMN     "generated_id" TEXT NOT NULL,
ADD COLUMN     "grace_period_type" TEXT NOT NULL,
ADD COLUMN     "id_generator_type" "id_generator_type" NOT NULL,
ADD COLUMN     "id_pattern" TEXT NOT NULL,
ADD COLUMN     "interest_accrual_calculation" "interest_accrual_calculation" NOT NULL,
ADD COLUMN     "interest_accrued_accounting_method" "interest_accrued_accounting_method" NOT NULL,
ADD COLUMN     "interest_application_method" "interest_application_method" NOT NULL,
ADD COLUMN     "interest_balance_calculation_method" TEXT NOT NULL,
ADD COLUMN     "interest_calculation_method" "interest_calculation_method" NOT NULL,
ADD COLUMN     "interest_rate_settings_id" INTEGER NOT NULL,
ADD COLUMN     "interest_type" "interest_type" NOT NULL,
ADD COLUMN     "last_modified_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "late_payments_recalculation_method" "late_payments_recalculation_method" NOT NULL,
ADD COLUMN     "line_of_credit_requirement" "line_of_credit_requirement" NOT NULL,
ADD COLUMN     "loan_penalty_calculation_method" "loan_penalty_calculation_method" NOT NULL,
ADD COLUMN     "loan_penalty_grace_period" INTEGER NOT NULL,
ADD COLUMN     "loan_product_type" TEXT NOT NULL,
ADD COLUMN     "lock_period_days" INTEGER NOT NULL,
ADD COLUMN     "max_first_repayment_due_date_offset" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "max_grace_period" INTEGER NOT NULL,
ADD COLUMN     "max_loan_amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "max_num_installments" INTEGER NOT NULL,
ADD COLUMN     "max_number_of_disbursement_tranches" INTEGER NOT NULL,
ADD COLUMN     "maxpenalty_rate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "min_first_repayment_due_date_offset" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "min_grace_period" INTEGER NOT NULL,
ADD COLUMN     "min_loan_amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "min_num_installments" INTEGER NOT NULL,
ADD COLUMN     "min_penalty_rate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "offset_percentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "payment_method" "payment_method" NOT NULL,
ADD COLUMN     "prepayment_acceptance" TEXT NOT NULL,
ADD COLUMN     "prepayment_recalculation_method" "prepayment_recalculation_method" NOT NULL,
ADD COLUMN     "principal_paid_installment_status" "principal_paid_installment_status" NOT NULL,
ADD COLUMN     "principal_payment_settings_id" INTEGER NOT NULL,
ADD COLUMN     "product_description" TEXT NOT NULL,
ADD COLUMN     "product_name" TEXT NOT NULL,
ADD COLUMN     "product_security_settings_id" INTEGER NOT NULL,
ADD COLUMN     "repayment_allocation_order" TEXT[],
ADD COLUMN     "repayment_currency_rounding" "repayment_currency_rounding" NOT NULL,
ADD COLUMN     "repayment_elements_rounding_method" "repayment_elements_rounding_method" NOT NULL,
ADD COLUMN     "repayment_period_unit" "repayment_period_unit" NOT NULL,
ADD COLUMN     "repayment_rescheduling_method" TEXT NOT NULL,
ADD COLUMN     "repayment_schedule_edit_options" TEXT[],
ADD COLUMN     "repayment_schedule_method" TEXT NOT NULL,
ADD COLUMN     "rounding_repayment_schedule_method" "rounding_repayment_schedule_method" NOT NULL,
ADD COLUMN     "schedule_due_dates_method" "schedule_due_dates_method" NOT NULL,
ADD COLUMN     "schedule_interest_days_count_method" "schedule_interest_days_count_method" NOT NULL,
ADD COLUMN     "settlement_options" "settlement_options" NOT NULL,
ADD COLUMN     "short_month_handling_method" TEXT NOT NULL,
ADD COLUMN     "tax_calculation_method" "tax_calculation_method" NOT NULL,
ADD COLUMN     "taxes_on_fees_enabled" BOOLEAN NOT NULL,
ADD COLUMN     "taxes_on_interest_enabled" BOOLEAN NOT NULL,
ADD COLUMN     "taxes_on_penalty_enabled" BOOLEAN NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" "category" NOT NULL;

-- DropTable
DROP TABLE "ArrearsSettings";

-- DropTable
DROP TABLE "indexratesource";

-- DropTable
DROP TABLE "interestProductSettings";

-- DropEnum
DROP TYPE "AccountInitialState";

-- DropEnum
DROP TYPE "Amortizationmethod";

-- DropEnum
DROP TYPE "CappingConstraintType";

-- DropEnum
DROP TYPE "CappingMethod";

-- DropEnum
DROP TYPE "Category";

-- DropEnum
DROP TYPE "DaysInYear";

-- DropEnum
DROP TYPE "ElementsRecalculationMethod";

-- DropEnum
DROP TYPE "InterestType";

-- DropEnum
DROP TYPE "idgeneratortype";

-- DropEnum
DROP TYPE "interestaccrualcalculation";

-- DropEnum
DROP TYPE "interestaccruedaccountingmethod";

-- DropEnum
DROP TYPE "interestapplicationmethod";

-- DropEnum
DROP TYPE "interestcalculationmethod";

-- DropEnum
DROP TYPE "latepaymentsrecalculationmethod";

-- DropEnum
DROP TYPE "lineofcreditrequirement";

-- CreateTable
CREATE TABLE "product_security_settings" (
    "id" SERIAL NOT NULL,
    "funder_interest_commission_allocation_type" TEXT NOT NULL,
    "funder_interest_commission_id" INTEGER NOT NULL,
    "is_collateral_enabled" BOOLEAN NOT NULL,
    "is_guarantors_enabled" BOOLEAN NOT NULL,
    "is_investorfundsenabled" BOOLEAN NOT NULL,
    "lock_funds_at_approval" BOOLEAN NOT NULL,
    "organization_interest_commission_id" INTEGER NOT NULL,
    "required_quaranties" DOUBLE PRECISION NOT NULL,
    "required_investor_funds" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "product_security_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "principal_payment_product_settings" (
    "id" SERIAL NOT NULL,
    "default_amount" DOUBLE PRECISION NOT NULL,
    "default_percentage" DOUBLE PRECISION NOT NULL,
    "max_amount" DOUBLE PRECISION NOT NULL,
    "max_percentage" DOUBLE PRECISION NOT NULL,
    "min_amount" DOUBLE PRECISION NOT NULL,
    "min_percentage" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "principal_payment_product_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interest_product_settings" (
    "id" SERIAL NOT NULL,
    "allow_negative_interest_rate" BOOLEAN NOT NULL,
    "compounding_frequency" TEXT NOT NULL,
    "default_interest_rate" DOUBLE PRECISION NOT NULL,
    "index_source_id" INTEGER NOT NULL,

    CONSTRAINT "interest_product_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "index_rate_source" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "type" "type" NOT NULL,

    CONSTRAINT "index_rate_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "arrears_settings" (
    "id" SERIAL NOT NULL,
    "default_tolerance_percentage_of_outstanding_principal" DOUBLE PRECISION NOT NULL,
    "default_tolerance_period" INTEGER NOT NULL,
    "max_tolerance_percentage_of_outstanding_principal" DOUBLE PRECISION NOT NULL,
    "max_tolerance_period" INTEGER NOT NULL,
    "min_tolerance_percentage_of_outstanding_principal" DOUBLE PRECISION NOT NULL,
    "min_tolerance_period" INTEGER NOT NULL,
    "monthly_tolerance_day" INTEGER NOT NULL,

    CONSTRAINT "arrears_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_product_security_settings_id_fkey" FOREIGN KEY ("product_security_settings_id") REFERENCES "product_security_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_principal_payment_settings_id_fkey" FOREIGN KEY ("principal_payment_settings_id") REFERENCES "principal_payment_product_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_interest_rate_settings_id_fkey" FOREIGN KEY ("interest_rate_settings_id") REFERENCES "interest_product_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_arrears_settings_id_fkey" FOREIGN KEY ("arrears_settings_id") REFERENCES "arrears_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interest_product_settings" ADD CONSTRAINT "interest_product_settings_index_source_id_fkey" FOREIGN KEY ("index_source_id") REFERENCES "index_rate_source"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
