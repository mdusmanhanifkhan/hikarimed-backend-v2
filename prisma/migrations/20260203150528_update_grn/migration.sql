/*
  Warnings:

  - You are about to drop the column `companyId` on the `GRN` table. All the data in the column will be lost.
  - The primary key for the `GRNItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `freeQty` on the `GRNItem` table. All the data in the column will be lost.
  - You are about to drop the column `lineAmount` on the `GRNItem` table. All the data in the column will be lost.
  - You are about to drop the column `netRate` on the `GRNItem` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseRate` on the `GRNItem` table. All the data in the column will be lost.
  - Added the required column `poDate` to the `GRN` table without a default value. This is not possible if the table is not empty.
  - Added the required column `poNo` to the `GRN` table without a default value. This is not possible if the table is not empty.
  - Added the required column `grossAmount` to the `GRNItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netAmount` to the `GRNItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderedQty` to the `GRNItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pendingQty` to the `GRNItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rate` to the `GRNItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GRN" DROP CONSTRAINT "GRN_companyId_fkey";

-- DropForeignKey
ALTER TABLE "GRNItem" DROP CONSTRAINT "GRNItem_grnId_fkey";

-- AlterTable
ALTER TABLE "GRN" DROP COLUMN "companyId",
ADD COLUMN     "departmentId" INTEGER,
ADD COLUMN     "invoiceStatus" TEXT,
ADD COLUMN     "invoiceType" TEXT,
ADD COLUMN     "poDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "poNo" TEXT NOT NULL,
ADD COLUMN     "remarks" TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
CREATE SEQUENCE grnitem_id_seq;
ALTER TABLE "GRNItem" DROP CONSTRAINT "GRNItem_pkey",
DROP COLUMN "freeQty",
DROP COLUMN "lineAmount",
DROP COLUMN "netRate",
DROP COLUMN "purchaseRate",
ADD COLUMN     "bonusQty" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "discountAmount" DOUBLE PRECISION,
ADD COLUMN     "grossAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "netAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "orderedQty" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "pendingQty" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "previouslyReceivedQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "rate" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "taxAmount" DOUBLE PRECISION,
ALTER COLUMN "id" SET DEFAULT nextval('grnitem_id_seq'),
ALTER COLUMN "mrp" DROP NOT NULL,
ADD CONSTRAINT "GRNItem_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE grnitem_id_seq OWNED BY "GRNItem"."id";

-- CreateIndex
CREATE INDEX "GRNItem_grnId_idx" ON "GRNItem"("grnId");

-- CreateIndex
CREATE INDEX "GRNItem_medicineId_idx" ON "GRNItem"("medicineId");

-- AddForeignKey
ALTER TABLE "GRN" ADD CONSTRAINT "GRN_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GRNItem" ADD CONSTRAINT "GRNItem_grnId_fkey" FOREIGN KEY ("grnId") REFERENCES "GRN"("id") ON DELETE CASCADE ON UPDATE CASCADE;
