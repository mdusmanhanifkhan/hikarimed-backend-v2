/*
  Warnings:

  - You are about to drop the column `prId` on the `IndenItem` table. All the data in the column will be lost.
  - You are about to drop the column `prDate` on the `Indent` table. All the data in the column will be lost.
  - You are about to drop the column `prNo` on the `Indent` table. All the data in the column will be lost.
  - The `status` column on the `Indent` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[indentNo]` on the table `Indent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `indentId` to the `IndenItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `indentNo` to the `Indent` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "IndentStatus" AS ENUM ('PO_CREATED', 'CLOSED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "IndenItem" DROP CONSTRAINT "IndenItem_prId_fkey";

-- DropIndex
DROP INDEX "Indent_prNo_key";

-- AlterTable
ALTER TABLE "IndenItem" DROP COLUMN "prId",
ADD COLUMN     "indentId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Indent" DROP COLUMN "prDate",
DROP COLUMN "prNo",
ADD COLUMN     "indentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "indentNo" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "IndentStatus" NOT NULL DEFAULT 'PO_CREATED';

-- DropEnum
DROP TYPE "PRStatus";

-- CreateIndex
CREATE UNIQUE INDEX "Indent_indentNo_key" ON "Indent"("indentNo");

-- AddForeignKey
ALTER TABLE "IndenItem" ADD CONSTRAINT "IndenItem_indentId_fkey" FOREIGN KEY ("indentId") REFERENCES "Indent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
