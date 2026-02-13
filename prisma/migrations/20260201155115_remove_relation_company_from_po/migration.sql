/*
  Warnings:

  - You are about to drop the column `companyId` on the `PurchaseOrder` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PurchaseOrder" DROP CONSTRAINT "PurchaseOrder_companyId_fkey";

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "companyId";
