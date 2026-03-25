/*
  Warnings:

  - You are about to drop the column `accountRefId` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `accountType` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `approvedAt` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `credit` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `debit` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `refId` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `refType` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `remarks` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `LedgerEntry` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `approvedAt` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `approvedBy` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `distributorId` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `indentId` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `paymentType` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `pdfGeneratedAt` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `pdfUrl` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `medicineId` on the `PurchaseOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `canManageAccounts` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canManageDepartments` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canManageDoctors` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canManageFees` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canManageFinanceReport` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canManageOrganization` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canManagePatients` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canManagePatientsHistory` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canManagePharma` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canManageProcedures` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canManageSetting` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canManageToken` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canManageWelfare` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `canViewReports` on the `Role` table. All the data in the column will be lost.
  - You are about to drop the column `balanceValue` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the column `customerDiscountAmount` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the column `customerDiscountPercent` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the column `discountAmount` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the column `discountPercent` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the column `medicineId` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the column `valueIn` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the column `valueOut` on the `StockLedger` table. All the data in the column will be lost.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Distributor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DosageForm` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpiryAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpiryReturn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExpiryReturnItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GRN` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GRNItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GenericName` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Indent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `IndentItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Medicine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicineCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MedicineUnit` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseReturn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PurchaseReturnItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Sale` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SaleItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SaleReturn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SaleReturnItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StockAdjustment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_DistributorCompanies` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `amount` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paidById` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `supplierId` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `StockLedger` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ExpiryAlert" DROP CONSTRAINT "ExpiryAlert_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "ExpiryReturn" DROP CONSTRAINT "ExpiryReturn_companyId_fkey";

-- DropForeignKey
ALTER TABLE "ExpiryReturn" DROP CONSTRAINT "ExpiryReturn_distributorId_fkey";

-- DropForeignKey
ALTER TABLE "ExpiryReturnItem" DROP CONSTRAINT "ExpiryReturnItem_expiryReturnId_fkey";

-- DropForeignKey
ALTER TABLE "ExpiryReturnItem" DROP CONSTRAINT "ExpiryReturnItem_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "GRN" DROP CONSTRAINT "GRN_departmentId_fkey";

-- DropForeignKey
ALTER TABLE "GRN" DROP CONSTRAINT "GRN_distributorId_fkey";

-- DropForeignKey
ALTER TABLE "GRN" DROP CONSTRAINT "GRN_poId_fkey";

-- DropForeignKey
ALTER TABLE "GRNItem" DROP CONSTRAINT "GRNItem_grnId_fkey";

-- DropForeignKey
ALTER TABLE "GRNItem" DROP CONSTRAINT "GRNItem_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "Indent" DROP CONSTRAINT "Indent_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "IndentItem" DROP CONSTRAINT "IndentItem_dosageFormId_fkey";

-- DropForeignKey
ALTER TABLE "IndentItem" DROP CONSTRAINT "IndentItem_genericNameId_fkey";

-- DropForeignKey
ALTER TABLE "IndentItem" DROP CONSTRAINT "IndentItem_indentId_fkey";

-- DropForeignKey
ALTER TABLE "IndentItem" DROP CONSTRAINT "IndentItem_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "IndentItem" DROP CONSTRAINT "IndentItem_unitId_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_approvedBy_fkey";

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT "LedgerEntry_userId_fkey";

-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_dosageFormId_fkey";

-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_genericNameId_fkey";

-- DropForeignKey
ALTER TABLE "Medicine" DROP CONSTRAINT "Medicine_unitId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_distributorId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseReturn" DROP CONSTRAINT "PurchaseReturn_distributorId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseReturn" DROP CONSTRAINT "PurchaseReturn_grnId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseReturnItem" DROP CONSTRAINT "PurchaseReturnItem_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseReturnItem" DROP CONSTRAINT "PurchaseReturnItem_purchaseReturnId_fkey";

-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_saleId_fkey";

-- DropForeignKey
ALTER TABLE "SaleReturn" DROP CONSTRAINT "SaleReturn_saleId_fkey";

-- DropForeignKey
ALTER TABLE "SaleReturnItem" DROP CONSTRAINT "SaleReturnItem_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "SaleReturnItem" DROP CONSTRAINT "SaleReturnItem_saleId_fkey";

-- DropForeignKey
ALTER TABLE "SaleReturnItem" DROP CONSTRAINT "SaleReturnItem_saleReturnId_fkey";

-- DropForeignKey
ALTER TABLE "StockAdjustment" DROP CONSTRAINT "StockAdjustment_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "StockLedger" DROP CONSTRAINT "StockLedger_medicineId_fkey";

-- DropForeignKey
ALTER TABLE "_DistributorCompanies" DROP CONSTRAINT "_DistributorCompanies_A_fkey";

-- DropForeignKey
ALTER TABLE "_DistributorCompanies" DROP CONSTRAINT "_DistributorCompanies_B_fkey";

-- AlterTable
ALTER TABLE "LedgerEntry" DROP COLUMN "accountRefId",
DROP COLUMN "accountType",
DROP COLUMN "approvedAt",
DROP COLUMN "approvedBy",
DROP COLUMN "credit",
DROP COLUMN "debit",
DROP COLUMN "paymentStatus",
DROP COLUMN "refId",
DROP COLUMN "refType",
DROP COLUMN "remarks",
DROP COLUMN "userId",
ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "creditUserId" INTEGER,
ADD COLUMN     "debitUserId" INTEGER,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "createdBy",
ADD COLUMN     "paidById" INTEGER NOT NULL,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "approvedAt",
DROP COLUMN "approvedBy",
DROP COLUMN "distributorId",
DROP COLUMN "indentId",
DROP COLUMN "paymentType",
DROP COLUMN "pdfGeneratedAt",
DROP COLUMN "pdfUrl",
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "prId" INTEGER,
ADD COLUMN     "supplierId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "PurchaseOrderItem" DROP COLUMN "medicineId",
ADD COLUMN     "productId" INTEGER NOT NULL,
ADD COLUMN     "variantId" INTEGER;

-- AlterTable
ALTER TABLE "Role" DROP COLUMN "canManageAccounts",
DROP COLUMN "canManageDepartments",
DROP COLUMN "canManageDoctors",
DROP COLUMN "canManageFees",
DROP COLUMN "canManageFinanceReport",
DROP COLUMN "canManageOrganization",
DROP COLUMN "canManagePatients",
DROP COLUMN "canManagePatientsHistory",
DROP COLUMN "canManagePharma",
DROP COLUMN "canManageProcedures",
DROP COLUMN "canManageSetting",
DROP COLUMN "canManageToken",
DROP COLUMN "canManageWelfare",
DROP COLUMN "canViewReports";

-- AlterTable
ALTER TABLE "StockLedger" DROP COLUMN "balanceValue",
DROP COLUMN "customerDiscountAmount",
DROP COLUMN "customerDiscountPercent",
DROP COLUMN "discountAmount",
DROP COLUMN "discountPercent",
DROP COLUMN "medicineId",
DROP COLUMN "valueIn",
DROP COLUMN "valueOut",
ADD COLUMN     "productId" INTEGER NOT NULL,
ADD COLUMN     "variantId" INTEGER,
ALTER COLUMN "batchNo" DROP NOT NULL,
ALTER COLUMN "expiryDate" DROP NOT NULL;

-- DropTable
DROP TABLE "Company";

-- DropTable
DROP TABLE "Distributor";

-- DropTable
DROP TABLE "DosageForm";

-- DropTable
DROP TABLE "ExpiryAlert";

-- DropTable
DROP TABLE "ExpiryReturn";

-- DropTable
DROP TABLE "ExpiryReturnItem";

-- DropTable
DROP TABLE "GRN";

-- DropTable
DROP TABLE "GRNItem";

-- DropTable
DROP TABLE "GenericName";

-- DropTable
DROP TABLE "Indent";

-- DropTable
DROP TABLE "IndentItem";

-- DropTable
DROP TABLE "Medicine";

-- DropTable
DROP TABLE "MedicineCategory";

-- DropTable
DROP TABLE "MedicineUnit";

-- DropTable
DROP TABLE "PurchaseReturn";

-- DropTable
DROP TABLE "PurchaseReturnItem";

-- DropTable
DROP TABLE "Sale";

-- DropTable
DROP TABLE "SaleItem";

-- DropTable
DROP TABLE "SaleReturn";

-- DropTable
DROP TABLE "SaleReturnItem";

-- DropTable
DROP TABLE "StockAdjustment";

-- DropTable
DROP TABLE "_DistributorCompanies";

-- CreateTable
CREATE TABLE "Permission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" SERIAL NOT NULL,
    "roleId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "remarks" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'Pakistan',
    "openingBalance" DOUBLE PRECISION DEFAULT 0,
    "creditLimit" DOUBLE PRECISION,
    "paymentTerms" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supplier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" INTEGER,
    "level" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "sku" TEXT,
    "barcode" TEXT,
    "description" TEXT,
    "categoryId" INTEGER NOT NULL,
    "brandId" INTEGER,
    "isBatchTracked" BOOLEAN NOT NULL DEFAULT false,
    "hasExpiry" BOOLEAN NOT NULL DEFAULT false,
    "isSerialized" BOOLEAN NOT NULL DEFAULT false,
    "requiresColdStorage" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT,
    "sku" TEXT,
    "purchasePrice" DOUBLE PRECISION,
    "salePrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequisition" (
    "id" SERIAL NOT NULL,
    "prNo" TEXT NOT NULL,
    "prDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedById" INTEGER NOT NULL,
    "approvedById" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchaseRequisition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchaseRequisitionItem" (
    "id" SERIAL NOT NULL,
    "prId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "requestedQty" DOUBLE PRECISION NOT NULL,
    "approvedQty" DOUBLE PRECISION,
    "estimatedPrice" DOUBLE PRECISION,
    "remarks" TEXT,
    "isPoCreated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PurchaseRequisitionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceipt" (
    "id" SERIAL NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "receiptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "supplierId" INTEGER NOT NULL,
    "poId" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "totalQty" DOUBLE PRECISION,
    "netAmount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "departmentId" INTEGER,

    CONSTRAINT "GoodsReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodsReceiptItem" (
    "id" SERIAL NOT NULL,
    "receiptId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "orderedQty" DOUBLE PRECISION,
    "receivedQty" DOUBLE PRECISION NOT NULL,
    "bonusQty" DOUBLE PRECISION DEFAULT 0,
    "batchNo" TEXT,
    "expiryDate" TIMESTAMP(3),
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "salePrice" DOUBLE PRECISION,
    "netAmount" DOUBLE PRECISION,

    CONSTRAINT "GoodsReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_parentId_key" ON "Category"("name", "parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseRequisition_prNo_key" ON "PurchaseRequisition"("prNo");

-- CreateIndex
CREATE UNIQUE INDEX "GoodsReceipt_receiptNo_key" ON "GoodsReceipt"("receiptNo");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisition" ADD CONSTRAINT "PurchaseRequisition_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisition" ADD CONSTRAINT "PurchaseRequisition_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisitionItem" ADD CONSTRAINT "PurchaseRequisitionItem_prId_fkey" FOREIGN KEY ("prId") REFERENCES "PurchaseRequisition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisitionItem" ADD CONSTRAINT "PurchaseRequisitionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseRequisitionItem" ADD CONSTRAINT "PurchaseRequisitionItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_prId_fkey" FOREIGN KEY ("prId") REFERENCES "PurchaseRequisition"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrder" ADD CONSTRAINT "PurchaseOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurchaseOrderItem" ADD CONSTRAINT "PurchaseOrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_poId_fkey" FOREIGN KEY ("poId") REFERENCES "PurchaseOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceipt" ADD CONSTRAINT "GoodsReceipt_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptItem" ADD CONSTRAINT "GoodsReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "GoodsReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptItem" ADD CONSTRAINT "GoodsReceiptItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoodsReceiptItem" ADD CONSTRAINT "GoodsReceiptItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLedger" ADD CONSTRAINT "StockLedger_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockLedger" ADD CONSTRAINT "StockLedger_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_debitUserId_fkey" FOREIGN KEY ("debitUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_creditUserId_fkey" FOREIGN KEY ("creditUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
