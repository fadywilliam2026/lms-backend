-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "financial_resource" ADD VALUE 'NET_PROFIT';
ALTER TYPE "financial_resource" ADD VALUE 'RETAINED_EARNINGS';

-- AlterEnum
ALTER TYPE "gl_account_type" ADD VALUE 'INCOME_EXPENSE';
