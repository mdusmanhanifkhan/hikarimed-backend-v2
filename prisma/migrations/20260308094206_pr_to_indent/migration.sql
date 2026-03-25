/*
  Warnings:

  - You are about to drop the `PurchaseRequisition` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseRequisitionItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_prId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseRequisition" DROP CONSTRAINT "PurchaseRequisition_approvedById_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseRequisition" DROP CONSTRAINT "PurchaseRequisition_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseRequisition" DROP CONSTRAINT "PurchaseRequisition_requestedById_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseRequisitionItem" DROP CONSTRAINT "PurchaseRequisitionItem_prId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseRequisitionItem" DROP CONSTRAINT "PurchaseRequisitionItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseRequisitionItem" DROP CONSTRAINT "PurchaseRequisitionItem_variantId_fkey";

-- DropTable
DROP TABLE "PurchaseRequisition";

-- DropTable
DROP TABLE "PurchaseRequisitionItem";

-- CreateTable
CREATE TABLE "Indent" (
    "id" SERIAL NOT NULL,
    "prNo" TEXT NOT NULL,
    "prDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "departmentId" INTEGER NOT NULL,
    "requestedById" INTEGER NOT NULL,
    "approvedById" INTEGER,
    "status" "PRStatus" NOT NULL DEFAULT 'PO_CREATED',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Indent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndenItem" (
    "id" SERIAL NOT NULL,
    "prId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "requestedQty" DOUBLE PRECISION NOT NULL,
    "approvedQty" DOUBLE PRECISION,
    "estimatedPrice" DOUBLE PRECISION,
    "remarks" TEXT,
    "isPoCreated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "IndenItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Indent_prNo_key" ON "Indent"("prNo");

-- AddForeignKey
ALTER TABLE "Indent" ADD CONSTRAINT "Indent_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indent" ADD CONSTRAINT "Indent_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Indent" ADD CONSTRAINT "Indent_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndenItem" ADD CONSTRAINT "IndenItem_prId_fkey" FOREIGN KEY ("prId") REFERENCES "Indent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndenItem" ADD CONSTRAINT "IndenItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndenItem" ADD CONSTRAINT "IndenItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_prId_fkey" FOREIGN KEY ("prId") REFERENCES "Indent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
