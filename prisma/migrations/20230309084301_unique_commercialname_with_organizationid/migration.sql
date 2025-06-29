/*
  Warnings:

  - A unique constraint covering the columns `[commercial_name,organizatation_id]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "clients_commercial_name_organizatation_id_key" ON "clients"("commercial_name", "organizatation_id");
