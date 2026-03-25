/*
  Warnings:

  - The `saleNo` column on the `Sale` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Sale" DROP COLUMN "saleNo",
ADD COLUMN     "saleNo" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Sale_saleNo_key" ON "Sale"("saleNo");
