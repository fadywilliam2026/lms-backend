/*
  Warnings:

  - You are about to drop the column `body` on the `notifiction_templates` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `notifiction_templates` table. All the data in the column will be lost.
  - Added the required column `body_ar` to the `notifiction_templates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `body_en` to the `notifiction_templates` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "preferred_language" SET DEFAULT E'ARABIC';

-- AlterTable
ALTER TABLE "notifiction_templates" DROP COLUMN "body",
DROP COLUMN "title",
ADD COLUMN     "body_ar" TEXT NOT NULL,
ADD COLUMN     "body_en" TEXT NOT NULL,
ADD COLUMN     "title_ar" TEXT,
ADD COLUMN     "title_en" TEXT;
