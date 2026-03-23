-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "genericNameId" INTEGER;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_genericNameId_fkey" FOREIGN KEY ("genericNameId") REFERENCES "GenericName"("id") ON DELETE SET NULL ON UPDATE CASCADE;
