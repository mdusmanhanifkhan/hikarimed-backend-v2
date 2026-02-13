/*
  Warnings:

  - A unique constraint covering the columns `[receiptNo]` on the table `MedicalRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN     "receiptNo" VARCHAR(20);

-- CreateTable
CREATE TABLE "ReceiptCounter" (
    "id" SERIAL NOT NULL,
    "prefix" VARCHAR(10) NOT NULL,
    "lastValue" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReceiptCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorTokenCounter" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "tokenDate" TIMESTAMP(3) NOT NULL,
    "lastValue" INTEGER NOT NULL,

    CONSTRAINT "DoctorTokenCounter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReceiptCounter_prefix_key" ON "ReceiptCounter"("prefix");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorTokenCounter_doctorId_tokenDate_key" ON "DoctorTokenCounter"("doctorId", "tokenDate");

-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_receiptNo_key" ON "MedicalRecord"("receiptNo");

-- CreateIndex
CREATE INDEX "MedicalRecord_doctorId_tokenDate_idx" ON "MedicalRecord"("doctorId", "tokenDate");

-- AddForeignKey
ALTER TABLE "DoctorTokenCounter" ADD CONSTRAINT "DoctorTokenCounter_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
