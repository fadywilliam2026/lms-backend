/*
  Warnings:

  - You are about to drop the `product_arrears_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "loan_products" DROP CONSTRAINT "loan_products_arrears_settings_id_fkey";

-- DropTable
DROP TABLE "product_arrears_settings";

-- CreateTable
CREATE TABLE "arrears_settings" (
    "id" SERIAL NOT NULL,
    "default_tolerance_percentage_of_outstanding_principal" DOUBLE PRECISION NOT NULL,
    "default_tolerance_period" INTEGER NOT NULL,
    "max_tolerance_percentage_of_outstanding_principal" DOUBLE PRECISION NOT NULL,
    "max_tolerance_period" INTEGER NOT NULL,
    "min_tolerance_percentage_of_outstanding_principal" DOUBLE PRECISION NOT NULL,
    "min_tolerance_period" INTEGER NOT NULL,
    "monthly_tolerance_day" INTEGER NOT NULL,

    CONSTRAINT "arrears_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "loan_products" ADD CONSTRAINT "loan_products_arrears_settings_id_fkey" FOREIGN KEY ("arrears_settings_id") REFERENCES "arrears_settings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
