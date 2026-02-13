/*
  Warnings:

  - Added the required column `genericNameId` to the `IndentItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "IndentItem" DROP CONSTRAINT "IndentItem_medicineId_fkey";

-- AlterTable
ALTER TABLE "IndentItem" ADD COLUMN     "genericNameId" INTEGER NOT NULL,
ALTER COLUMN "medicineId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "IndentItem" ADD CONSTRAINT "IndentItem_genericNameId_fkey" FOREIGN KEY ("genericNameId") REFERENCES "GenericName"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItem" ADD CONSTRAINT "IndentItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE SET NULL ON UPDATE CASCADE;
