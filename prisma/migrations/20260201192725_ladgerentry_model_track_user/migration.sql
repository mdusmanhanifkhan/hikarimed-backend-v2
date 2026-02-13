/*
  Warnings:

  - Added the required column `approvedBy` to the `LedgerEntry` table without a default value. This is not possible if the table is not empty.
  - Made the column `debit` on table `LedgerEntry` required. This step will fail if there are existing NULL values in that column.
  - Made the column `credit` on table `LedgerEntry` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LedgerEntry" ADD COLUMN     "approvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "approvedBy" INTEGER NOT NULL,
ALTER COLUMN "debit" SET NOT NULL,
ALTER COLUMN "credit" SET NOT NULL;
