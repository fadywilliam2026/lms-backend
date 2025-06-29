/*
  Warnings:

  - You are about to drop the `alert_templates` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "notification_type" AS ENUM ('SMS', 'EMAIL', 'PUSH_NOTIFICATION');

-- DropTable
DROP TABLE "alert_templates";

-- DropEnum
DROP TYPE "alert_type";

-- CreateTable
CREATE TABLE "notifiction_templates" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "event" TEXT NOT NULL,
    "description" TEXT,
    "title" TEXT,
    "body" TEXT NOT NULL,
    "type" "notification_type" NOT NULL,

    CONSTRAINT "notifiction_templates_pkey" PRIMARY KEY ("id")
);
