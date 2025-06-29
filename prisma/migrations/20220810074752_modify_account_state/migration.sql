/*
  Warnings:

  - The values [CLOSED_WRITTEN_OFF,CLOSED_REJECTED] on the enum `account_state` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "account_state_new" AS ENUM ('PARTIAL_APPLICATION', 'PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'ACTIVE_IN_ARREARS', 'CLOSED');
ALTER TABLE "loan_accounts" ALTER COLUMN "account_state" DROP DEFAULT;
ALTER TABLE "loan_accounts" ALTER COLUMN "account_state" TYPE "account_state_new" USING ("account_state"::text::"account_state_new");
ALTER TYPE "account_state" RENAME TO "account_state_old";
ALTER TYPE "account_state_new" RENAME TO "account_state";
DROP TYPE "account_state_old";
ALTER TABLE "loan_accounts" ALTER COLUMN "account_state" SET DEFAULT 'PARTIAL_APPLICATION';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "account_sub_state" ADD VALUE 'REPAID';
ALTER TYPE "account_sub_state" ADD VALUE 'REJECTED';
ALTER TYPE "account_sub_state" ADD VALUE 'WRITTEN_OFF';
ALTER TYPE "account_sub_state" ADD VALUE 'TERMINATED';
