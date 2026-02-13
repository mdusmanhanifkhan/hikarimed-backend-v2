/*
  Warnings:

  - Added the required column `tokenDate` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenNumber` to the `MedicalRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MedicalRecord" ADD COLUMN     "tokenDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "tokenNumber" INTEGER NOT NULL;
