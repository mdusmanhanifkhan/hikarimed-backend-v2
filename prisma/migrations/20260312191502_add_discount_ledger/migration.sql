-- AlterTable
ALTER TABLE "StockLedger" ADD COLUMN     "discountAmount" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN     "discountPercent" DOUBLE PRECISION DEFAULT 0;
