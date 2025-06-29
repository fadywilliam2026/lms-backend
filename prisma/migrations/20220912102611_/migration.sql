/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `gl_accounts` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "gl_accounts_name_key" ON "gl_accounts"("name");
