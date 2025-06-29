/*
  Warnings:

  - A unique constraint covering the columns `[national_id]` on the table `clients` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "client_refresh_tokens" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "client_id" INTEGER NOT NULL,

    CONSTRAINT "client_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_refresh_tokens_token_key" ON "client_refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "client_refresh_tokens_jti_key" ON "client_refresh_tokens"("jti");

-- CreateIndex
CREATE UNIQUE INDEX "clients_national_id_key" ON "clients"("national_id");

-- AddForeignKey
ALTER TABLE "client_refresh_tokens" ADD CONSTRAINT "client_refresh_tokens_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
