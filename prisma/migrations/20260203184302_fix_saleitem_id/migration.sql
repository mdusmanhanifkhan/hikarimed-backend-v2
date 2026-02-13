/*
  Warnings:

  - The primary key for the `SaleItem` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
CREATE SEQUENCE saleitem_id_seq;
ALTER TABLE "SaleItem" DROP CONSTRAINT "SaleItem_pkey",
ALTER COLUMN "id" SET DEFAULT nextval('saleitem_id_seq'),
ADD CONSTRAINT "SaleItem_pkey" PRIMARY KEY ("id");
ALTER SEQUENCE saleitem_id_seq OWNED BY "SaleItem"."id";
