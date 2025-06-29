/*
  Warnings:

  - You are about to drop the column `generated_id` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `id_generator_type` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `id_pattern` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `product_name` on the `loan_products` table. All the data in the column will be lost.
  - Added the required column `name` to the `loan_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "loan_products" DROP COLUMN "generated_id",
DROP COLUMN "id_generator_type",
DROP COLUMN "id_pattern",
DROP COLUMN "product_name",
ADD COLUMN     "name" TEXT NOT NULL;
