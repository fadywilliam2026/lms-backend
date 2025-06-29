-- CreateEnum
CREATE TYPE "DocumentOwnerType" AS ENUM ('CLIENT', 'LOAN_ACCOUNT');

-- CreateTable
CREATE TABLE "documents" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "ownerType" "DocumentOwnerType" NOT NULL,
    "ownerId" INTEGER NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);
