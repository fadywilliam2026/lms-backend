/*
  Warnings:

  - You are about to drop the column `account_link_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `accounting_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `adjust_interest_for_first_installment` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `allow_custom_repayment_allocation` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `arrears_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `availability_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `creation_date` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `credit_arrangement_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `encoded_key` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `fees_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `funding_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `grace_period_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `interest_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `internal_controls` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `last_modified_date` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `loan_amount_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `new_account_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `offset_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `payment_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `penalty_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `redraw_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `schedule_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `security_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `tax_settings` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `templates` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `loan_products` table. All the data in the column will be lost.
  - Added the required column `accountInitialState` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountingMethod` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accountlinkingenabled` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `accruelateinterest` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `activated` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `allowarbitraryfees` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `allowcustomrepaymentallocation` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amortizationmethod` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `applyInterestOnPrepaymentMethod` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `arrearsSettingsId` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `autocreatelinkedaccounts` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `autolinkaccounts` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cappingapplyaccruedchargesbeforelocking` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cappingconstrainttype` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cappingmethod` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cappingpercentage` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creationdate` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencycode` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `daysinyear` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultfirstrepaymentduedateoffset` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultgraceperiod` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultloanamount` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultnuminstallments` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultpenaltyrate` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultprincipalrepaymentinterval` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultrepaymentperiodcount` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dormancyperioddays` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `elementsrecalculationmethod` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fixeddaysofmonth` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `forallbranches` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `forhybridgroups` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `forindividuals` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `forpuregroups` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `futurepaymentsacceptance` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `generatedId` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `graceperiodtype` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idgeneratortype` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idpattern` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interestaccrualcalculation` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interestaccruedaccountingmethod` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interestapplicationmethod` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interestbalancecalculationmethod` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interestcalculationmethod` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interestratesettingsId` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interesttype` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastmodifieddate` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `latepaymentsrecalculationmethod` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineofcreditrequirement` to the `loan_products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `loan_products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "lineofcreditrequirement" AS ENUM ('OPTIONAL', 'REQUIRED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "latepaymentsrecalculationmethod" AS ENUM ('INCREASE_OVERDUE_INSTALLMENTS', 'INCREASE_LAST_INSTALLMENT');

-- CreateEnum
CREATE TYPE "InterestType" AS ENUM ('SIMPLE_INTEREST', 'CAPITALIZED_INTEREST');

-- CreateEnum
CREATE TYPE "type" AS ENUM ('INTEREST_RATE', 'TAX_RATE', 'WITHHOLDING_TAX_RATE');

-- CreateEnum
CREATE TYPE "interestcalculationmethod" AS ENUM ('FLAT', 'DECLINING_BALANCE', 'DECLINING_BALANCE_DISCOUNTED');

-- CreateEnum
CREATE TYPE "interestapplicationmethod" AS ENUM ('ON_DISBURSEMENT', 'ON_REPAYMENT');

-- CreateEnum
CREATE TYPE "interestaccruedaccountingmethod" AS ENUM ('NONE', 'DAILY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "interestaccrualcalculation" AS ENUM ('BREAKDOWN_PER_ACCOUNT', 'AGGREGATED_AMOUNT', 'NONE');

-- CreateEnum
CREATE TYPE "idgeneratortype" AS ENUM ('RANDOM_PATTERN', 'INCREMENTAL_NUMBER');

-- CreateEnum
CREATE TYPE "ElementsRecalculationMethod" AS ENUM ('FIXED_PRINCIPAL_EXPECTED', 'FIXED_TOTAL_EXPECTED');

-- CreateEnum
CREATE TYPE "DaysInYear" AS ENUM ('ACTUAL_365_FIXED', 'ACTUAL_364', 'ACTUAL_360', 'E30_360');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('PERSONAL_LENDING', 'PURCHASE_FINANCING', 'RETAIL_MORTGAGES', 'SME_LENDING', 'COMMERCIAL', 'UNCATEGORIZED');

-- CreateEnum
CREATE TYPE "CappingMethod" AS ENUM ('OUTSTANDING_PRINCIPAL_PERCENTAGE', 'ORIGINAL_PRINCIPAL_PERCENTAGE');

-- CreateEnum
CREATE TYPE "CappingConstraintType" AS ENUM ('SOFT_CAP', 'HARD_CAP');

-- CreateEnum
CREATE TYPE "accounting_method" AS ENUM ('none', 'cash', 'accrual');

-- CreateEnum
CREATE TYPE "AccountInitialState" AS ENUM ('pending_approval', 'partial_application');

-- CreateEnum
CREATE TYPE "Amortizationmethod" AS ENUM ('STANDARD_PAYMENTS', 'BALLOON_PAYMENTS');

-- AlterTable
ALTER TABLE "loan_products" DROP COLUMN "account_link_settings",
DROP COLUMN "accounting_settings",
DROP COLUMN "adjust_interest_for_first_installment",
DROP COLUMN "allow_custom_repayment_allocation",
DROP COLUMN "arrears_settings",
DROP COLUMN "availability_settings",
DROP COLUMN "creation_date",
DROP COLUMN "credit_arrangement_settings",
DROP COLUMN "currency",
DROP COLUMN "encoded_key",
DROP COLUMN "fees_settings",
DROP COLUMN "funding_settings",
DROP COLUMN "grace_period_settings",
DROP COLUMN "interest_settings",
DROP COLUMN "internal_controls",
DROP COLUMN "last_modified_date",
DROP COLUMN "loan_amount_settings",
DROP COLUMN "new_account_settings",
DROP COLUMN "notes",
DROP COLUMN "offset_settings",
DROP COLUMN "payment_settings",
DROP COLUMN "penalty_settings",
DROP COLUMN "redraw_settings",
DROP COLUMN "schedule_settings",
DROP COLUMN "security_settings",
DROP COLUMN "state",
DROP COLUMN "tax_settings",
DROP COLUMN "templates",
DROP COLUMN "type",
ADD COLUMN     "accountInitialState" "AccountInitialState" NOT NULL,
ADD COLUMN     "accountingMethod" "accounting_method" NOT NULL,
ADD COLUMN     "accountlinkingenabled" BOOLEAN NOT NULL,
ADD COLUMN     "accruelateinterest" BOOLEAN NOT NULL,
ADD COLUMN     "activated" BOOLEAN NOT NULL,
ADD COLUMN     "allowarbitraryfees" BOOLEAN NOT NULL,
ADD COLUMN     "allowcustomrepaymentallocation" BOOLEAN NOT NULL,
ADD COLUMN     "amortizationmethod" "Amortizationmethod" NOT NULL,
ADD COLUMN     "applyInterestOnPrepaymentMethod" TEXT NOT NULL,
ADD COLUMN     "arrearsSettingsId" INTEGER NOT NULL,
ADD COLUMN     "autocreatelinkedaccounts" BOOLEAN NOT NULL,
ADD COLUMN     "autolinkaccounts" BOOLEAN NOT NULL,
ADD COLUMN     "cappingapplyaccruedchargesbeforelocking" BOOLEAN NOT NULL,
ADD COLUMN     "cappingconstrainttype" "CappingConstraintType" NOT NULL,
ADD COLUMN     "cappingmethod" "CappingMethod" NOT NULL,
ADD COLUMN     "cappingpercentage" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "creationdate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "currencycode" TEXT NOT NULL,
ADD COLUMN     "daysinyear" "DaysInYear" NOT NULL,
ADD COLUMN     "defaultfirstrepaymentduedateoffset" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "defaultgraceperiod" INTEGER NOT NULL,
ADD COLUMN     "defaultloanamount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "defaultnuminstallments" INTEGER NOT NULL,
ADD COLUMN     "defaultpenaltyrate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "defaultprincipalrepaymentinterval" INTEGER NOT NULL,
ADD COLUMN     "defaultrepaymentperiodcount" INTEGER NOT NULL,
ADD COLUMN     "dormancyperioddays" INTEGER NOT NULL,
ADD COLUMN     "elementsrecalculationmethod" "ElementsRecalculationMethod" NOT NULL,
ADD COLUMN     "fixeddaysofmonth" BYTEA NOT NULL,
ADD COLUMN     "forallbranches" BOOLEAN NOT NULL,
ADD COLUMN     "forhybridgroups" BOOLEAN NOT NULL,
ADD COLUMN     "forindividuals" BOOLEAN NOT NULL,
ADD COLUMN     "forpuregroups" BOOLEAN NOT NULL,
ADD COLUMN     "futurepaymentsacceptance" TEXT NOT NULL,
ADD COLUMN     "generatedId" TEXT NOT NULL,
ADD COLUMN     "graceperiodtype" TEXT NOT NULL,
ADD COLUMN     "idgeneratortype" "idgeneratortype" NOT NULL,
ADD COLUMN     "idpattern" TEXT NOT NULL,
ADD COLUMN     "interestaccrualcalculation" "interestaccrualcalculation" NOT NULL,
ADD COLUMN     "interestaccruedaccountingmethod" "interestaccruedaccountingmethod" NOT NULL,
ADD COLUMN     "interestapplicationmethod" "interestapplicationmethod" NOT NULL,
ADD COLUMN     "interestbalancecalculationmethod" TEXT NOT NULL,
ADD COLUMN     "interestcalculationmethod" "interestcalculationmethod" NOT NULL,
ADD COLUMN     "interestratesettingsId" INTEGER NOT NULL,
ADD COLUMN     "interesttype" "InterestType" NOT NULL,
ADD COLUMN     "lastmodifieddate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "latepaymentsrecalculationmethod" "latepaymentsrecalculationmethod" NOT NULL,
ADD COLUMN     "lineofcreditrequirement" "lineofcreditrequirement" NOT NULL,
DROP COLUMN "category",
ADD COLUMN     "category" "Category" NOT NULL;

-- CreateTable
CREATE TABLE "interestProductSettings" (
    "id" SERIAL NOT NULL,
    "allownegativeinterestrate" BOOLEAN NOT NULL,
    "compoundingfrequency" TEXT NOT NULL,
    "defaultinterestrate" DOUBLE PRECISION NOT NULL,
    "indexSourceId" INTEGER NOT NULL,

    CONSTRAINT "interestProductSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indexratesource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "type" "type" NOT NULL,

    CONSTRAINT "indexratesource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrearsSettings" (
    "id" SERIAL NOT NULL,
    "defaultTolerancePercentageOfOutstandingPrincipal" DOUBLE PRECISION NOT NULL,
    "defaultTolerancePeriod" INTEGER NOT NULL,
    "maxTolerancePercentageOfOutstandingPrincipal" DOUBLE PRECISION NOT NULL,
    "maxTolerancePeriod" INTEGER NOT NULL,
    "minTolerancePercentageOfOutstandingPrincipal" DOUBLE PRECISION NOT NULL,
    "minTolerancePeriod" INTEGER NOT NULL,
    "monthlyToleranceDay" INTEGER NOT NULL,

    CONSTRAINT "ArrearsSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_interestratesettingsId_fkey" FOREIGN KEY ("interestratesettingsId") REFERENCES "interestProductSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_arrearsSettingsId_fkey" FOREIGN KEY ("arrearsSettingsId") REFERENCES "ArrearsSettings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interestProductSettings" ADD CONSTRAINT "interestProductSettings_indexSourceId_fkey" FOREIGN KEY ("indexSourceId") REFERENCES "indexratesource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
