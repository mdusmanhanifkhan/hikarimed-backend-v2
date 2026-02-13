/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `DosageForm` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "DosageForm" ADD COLUMN     "code" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "DosageForm_code_key" ON "DosageForm"("code");
