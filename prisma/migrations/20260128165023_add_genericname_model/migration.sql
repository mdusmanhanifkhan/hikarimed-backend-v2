/*
  Warnings:

  - You are about to drop the column `company` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `genericName` on the `Medicine` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "company",
DROP COLUMN "genericName",
ADD COLUMN     "companyId" INTEGER,
ADD COLUMN     "genericNameId" INTEGER;

-- CreateTable
CREATE TABLE "GenericName" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenericName_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GenericName_name_key" ON "GenericName"("name");

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_genericNameId_fkey" FOREIGN KEY ("genericNameId") REFERENCES "GenericName"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
