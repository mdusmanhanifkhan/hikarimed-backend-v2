/*
  Warnings:

  - The primary key for the `PurchaseOrderItem` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
CREATE SEQUENCE purchaseorderitem_id_seq;
ALTER TABLE "PurchaseOrderItem" DROP CONSTRAINT "PurchaseOrderItem_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('purchaseorderitem_id_seq'),
ADD CONSTRAINT "PurchaseOrderItem_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE purchaseorderitem_id_seq OWNED BY "PurchaseOrderItem"."id";
