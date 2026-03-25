/*
  Warnings:

  - The `status` column on the `GoodsReceipt` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `PurchaseOrder` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `PurchaseRequisition` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PRStatus" AS ENUM ('FOR_APPROVAL', 'APPROVED', 'PO_CREATED', 'CLOSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "POStatus" AS ENUM ('DRAFT', 'FOR_APPROVAL', 'APPROVED', 'SENT_TO_SUPPLIER', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CLOSED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "GRNStatus" AS ENUM ('RECEIVED', 'VERIFIED', 'CLOSED', 'CANCELLED');

-- AlterTable
ALTER TABLE "GoodsReceipt" DROP COLUMN "status",
ADD COLUMN     "status" "GRNStatus" NOT NULL DEFAULT 'RECEIVED';

-- AlterTable
ALTER TABLE "PurchaseOrder" DROP COLUMN "status",
ADD COLUMN     "status" "POStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "PurchaseRequisition" DROP COLUMN "status",
ADD COLUMN     "status" "PRStatus" NOT NULL DEFAULT 'FOR_APPROVAL';
