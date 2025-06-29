/*
  Warnings:

  - The values [REPAID] on the enum `account_sub_state` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "account_sub_state_new" AS ENUM ('PARTIALLY_DISBURSED', 'LOCKED', 'LOCKED_CAPPING', 'REFINANCED', 'RESCHEDULED', 'WITHDRAWN', 'PAID', 'PAID_OFF', 'REJECTED', 'WRITTEN_OFF', 'TERMINATED');
ALTER TABLE "loan_accounts" ALTER COLUMN "account_sub_state" TYPE "account_sub_state_new" USING ("account_sub_state"::text::"account_sub_state_new");
ALTER TYPE "account_sub_state" RENAME TO "account_sub_state_old";
ALTER TYPE "account_sub_state_new" RENAME TO "account_sub_state";
DROP TYPE "account_sub_state_old";
COMMIT;
