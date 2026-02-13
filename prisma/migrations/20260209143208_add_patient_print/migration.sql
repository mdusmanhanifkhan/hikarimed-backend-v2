-- CreateTable
CREATE TABLE "PatientPrint" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "printedById" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "printedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientPrint_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PatientPrint" ADD CONSTRAINT "PatientPrint_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPrint" ADD CONSTRAINT "PatientPrint_printedById_fkey" FOREIGN KEY ("printedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
