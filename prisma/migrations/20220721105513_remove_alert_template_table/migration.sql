/*
  Warnings:

  - You are about to drop the `alert_templates` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone_number]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropTable
DROP TABLE "alert_templates";

-- DropEnum
DROP TYPE "alert_type";

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");
