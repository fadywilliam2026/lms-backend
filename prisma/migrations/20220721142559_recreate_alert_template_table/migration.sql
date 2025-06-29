-- CreateEnum
CREATE TYPE "alert_type" AS ENUM ('SMS', 'EMAIL', 'PUSH_NOTIFICATION');

-- CreateTable
CREATE TABLE "alert_templates" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "event" TEXT NOT NULL,
    "description" TEXT,
    "title" TEXT,
    "body" TEXT,
    "type" "alert_type" NOT NULL,

    CONSTRAINT "alert_templates_pkey" PRIMARY KEY ("id")
);
