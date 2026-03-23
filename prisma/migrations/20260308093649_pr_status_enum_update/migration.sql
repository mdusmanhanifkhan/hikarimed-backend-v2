/*
  Warnings:

  - The values [FOR_APPROVAL,APPROVED] on the enum `PRStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PRStatus_new" AS ENUM ('PO_CREATED', 'CLOSED', 'REJECTED');
ALTER TABLE "public"."PurchaseRequisition" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "PurchaseRequisition" ALTER COLUMN "status" TYPE "PRStatus_new" USING ("status"::text::"PRStatus_new");
ALTER TYPE "PRStatus" RENAME TO "PRStatus_old";
ALTER TYPE "PRStatus_new" RENAME TO "PRStatus";
DROP TYPE "public"."PRStatus_old";
ALTER TABLE "PurchaseRequisition" ALTER COLUMN "status" SET DEFAULT 'PO_CREATED';
COMMIT;

-- AlterTable
ALTER TABLE "PurchaseRequisition" ALTER COLUMN "status" SET DEFAULT 'PO_CREATED';
