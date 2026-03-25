/*
  Warnings:

  - Added the required column `status` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "status" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "maximumStock" INTEGER,
ADD COLUMN     "minimumStock" INTEGER,
ADD COLUMN     "packingTypeId" INTEGER,
ADD COLUMN     "reorderLevel" INTEGER,
ADD COLUMN     "status" BOOLEAN NOT NULL,
ADD COLUMN     "strengthUnitId" INTEGER;

-- CreateTable
CREATE TABLE "GenericName" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenericName_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrengthUnit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "StrengthUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackingType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL,

    CONSTRAINT "PackingType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GenericName_name_key" ON "GenericName"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StrengthUnit_name_key" ON "StrengthUnit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PackingType_name_key" ON "PackingType"("name");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_strengthUnitId_fkey" FOREIGN KEY ("strengthUnitId") REFERENCES "StrengthUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_packingTypeId_fkey" FOREIGN KEY ("packingTypeId") REFERENCES "PackingType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
