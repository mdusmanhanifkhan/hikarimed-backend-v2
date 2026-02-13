/*
  Warnings:

  - You are about to drop the column `unitPacking` on the `Medicine` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "unitPacking",
ADD COLUMN     "unitId" INTEGER;

-- AlterTable
ALTER TABLE "Role" ADD COLUMN     "canManageAccounts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canManagePharma" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "MedicineUnit" (
    "id" SERIAL NOT NULL,
    "value" DECIMAL(10,3) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicineUnit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicineUnit_label_key" ON "MedicineUnit"("label");

-- CreateIndex
CREATE UNIQUE INDEX "MedicineUnit_value_unit_key" ON "MedicineUnit"("value", "unit");

-- AddForeignKey
ALTER TABLE "Medicine" ADD CONSTRAINT "Medicine_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MedicineUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
