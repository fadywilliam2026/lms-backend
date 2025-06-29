-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "organizatation_id" INTEGER;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_organizatation_id_fkey" FOREIGN KEY ("organizatation_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
