-- CreateTable
CREATE TABLE "PatientCardPrice" (
    "id" SERIAL NOT NULL,
    "price" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientCardPrice_pkey" PRIMARY KEY ("id")
);
