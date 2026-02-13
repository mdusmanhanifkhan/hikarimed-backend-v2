/*
  Warnings:

  - You are about to drop the column `requestedBy` on the `Indent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Indent" DROP COLUMN "requestedBy";

-- AddForeignKey
ALTER TABLE "Indent" ADD CONSTRAINT "Indent_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
