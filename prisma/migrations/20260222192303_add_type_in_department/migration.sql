/*
  Warnings:

  - Added the required column `type` to the `Department` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Department_name_idx";

-- DropIndex
DROP INDEX "Department_shortCode_key";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "departmentId" INTEGER;

-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "shortCode" SET DATA TYPE TEXT,
ALTER COLUMN "location" SET DATA TYPE TEXT,
ALTER COLUMN "description" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "SupplierBank" (
    "id" SERIAL NOT NULL,
    "supplierId" INTEGER NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountNo" TEXT NOT NULL,
    "iban" TEXT,
    "branch" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupplierBank_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SupplierBank" ADD CONSTRAINT "SupplierBank_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
