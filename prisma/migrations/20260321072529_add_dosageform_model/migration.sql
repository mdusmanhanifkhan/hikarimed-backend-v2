-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "dosageFormId" INTEGER;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "dosageFormId" INTEGER;

-- AlterTable
ALTER TABLE "SaleItem" ADD COLUMN     "customerDiscountPercent" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "DosageForm" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DosageForm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DosageForm_name_key" ON "DosageForm"("name");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_dosageFormId_fkey" FOREIGN KEY ("dosageFormId") REFERENCES "DosageForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_dosageFormId_fkey" FOREIGN KEY ("dosageFormId") REFERENCES "DosageForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
