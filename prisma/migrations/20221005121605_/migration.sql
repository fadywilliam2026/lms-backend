/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `gl_accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "gl_accounts" ADD COLUMN     "code" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "gl_accounts_code_key" ON "gl_accounts"("code");
