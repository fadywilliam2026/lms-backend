/*
  Warnings:

  - You are about to drop the column `creation_date` on the `loan_products` table. All the data in the column will be lost.
  - You are about to drop the column `last_modified_date` on the `loan_products` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `loan_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "loan_products" DROP COLUMN "creation_date",
DROP COLUMN "last_modified_date",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;
