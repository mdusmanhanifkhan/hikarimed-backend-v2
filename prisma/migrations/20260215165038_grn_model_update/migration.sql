/*
  Warnings:

  - You are about to drop the column `grossAmount` on the `GRNItem` table. All the data in the column will be lost.
  - Added the required column `saleRate` to the `GRNItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GRNItem" DROP COLUMN "grossAmount",
ADD COLUMN     "saleRate" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "StockLedger" ADD COLUMN     "saleRate" DOUBLE PRECISION;
