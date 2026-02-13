/*
  Warnings:

  - A unique constraint covering the columns `[tokenDate,tokenNumber]` on the table `MedicalRecord` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MedicalRecord_tokenDate_tokenNumber_key" ON "MedicalRecord"("tokenDate", "tokenNumber");
