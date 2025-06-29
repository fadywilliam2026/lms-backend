-- CreateEnum
CREATE TYPE "Holder" AS ENUM ('partner', 'client');

-- CreateEnum
CREATE TYPE "Transfer" AS ENUM ('client', 'partner', 'direct_debit');

-- CreateEnum
CREATE TYPE "due_payment_history" AS ENUM ('NO', 'LATE_FROM_8_TO_30', 'LATE_FROM_31_TO_60', 'OVER_60', 'UNSETTLED');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "due_payment_history" "due_payment_history" DEFAULT 'NO',
ADD COLUMN     "historical_loans_count" INTEGER DEFAULT 0,
ADD COLUMN     "is_cheque_security" BOOLEAN DEFAULT false,
ADD COLUMN     "partner_historical_loans_count" INTEGER DEFAULT 0,
ADD COLUMN     "past_dues" INTEGER DEFAULT 0,
ADD COLUMN     "years_of_operations" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "carrier_of_payment_risk" "Holder" NOT NULL DEFAULT 'partner',
ADD COLUMN     "control_of_cash_flow" "Holder" NOT NULL DEFAULT 'partner',
ADD COLUMN     "method_of_loan_repayment" "Transfer" NOT NULL DEFAULT 'partner';
