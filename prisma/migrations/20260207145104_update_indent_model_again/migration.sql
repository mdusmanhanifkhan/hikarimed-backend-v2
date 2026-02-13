-- AddForeignKey
ALTER TABLE "IndentItem" ADD CONSTRAINT "IndentItem_dosageFormId_fkey" FOREIGN KEY ("dosageFormId") REFERENCES "DosageForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IndentItem" ADD CONSTRAINT "IndentItem_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "MedicineUnit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
