-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "shortCode" VARCHAR(10),
    "location" VARCHAR(100),
    "description" VARCHAR(500),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "timeFrom" TEXT,
    "timeTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" SERIAL NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "name" VARCHAR(100) NOT NULL,
    "shortCode" VARCHAR(10),
    "description" VARCHAR(500),
    "departmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" SERIAL NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "name" VARCHAR(100) NOT NULL,
    "guardianName" VARCHAR(100),
    "gender" TEXT,
    "dateOfBirth" TEXT,
    "age" INTEGER NOT NULL,
    "idCard" VARCHAR(20) NOT NULL,
    "phoneNumber" VARCHAR(20) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "address" VARCHAR(255),
    "specialization" VARCHAR(100),
    "qualification" VARCHAR(100),
    "subSpecialities" VARCHAR(100),
    "experience" INTEGER NOT NULL,
    "languages" VARCHAR(100),
    "joinDate" TEXT,
    "employmentType" TEXT,
    "shiftType" TEXT,
    "timingFrom" VARCHAR(10),
    "timingTo" VARCHAR(10),
    "availableDays" VARCHAR(100)[],
    "maxPatients" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorDepartment" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorDepartment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeePolicy" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "type" TEXT,
    "fixedAmount" DECIMAL(10,2),
    "doctorPercentage" DECIMAL(5,2),
    "hospitalPercentage" DECIMAL(5,2),
    "validFrom" TIMESTAMP(3),
    "validTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeePolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorProcedureFee" (
    "id" SERIAL NOT NULL,
    "doctorId" INTEGER NOT NULL,
    "procedureId" INTEGER NOT NULL,
    "feePolicyId" INTEGER,
    "departmentId" INTEGER,
    "paymentType" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "procedurePrice" DECIMAL(10,2),
    "overrideFixedAmount" DECIMAL(10,2),
    "overrideDoctorPercentage" DECIMAL(5,2),
    "overrideHospitalPercentage" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorProcedureFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "guardianName" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "maritalStatus" TEXT NOT NULL,
    "bloodGroup" TEXT NOT NULL,
    "cnicNumber" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" INTEGER,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WelfarePatient" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "welfareCategory" VARCHAR(100) NOT NULL,
    "discountType" VARCHAR(50),
    "discountPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "approvedBy" VARCHAR(100),
    "referredBy" VARCHAR(100),
    "remarks" VARCHAR(500),
    "monthlyIncome" VARCHAR(100),
    "sourceOfIncome" VARCHAR(100),
    "houseOwnership" VARCHAR(100),
    "houseType" VARCHAR(100),
    "vehicleOwnership" VARCHAR(100),
    "familyMembers" INTEGER,
    "workingMembers" INTEGER,
    "educationLevel" VARCHAR(100),
    "financialRemarks" VARCHAR(500),
    "verificationStatus" VARCHAR(50),
    "verifiedBy" VARCHAR(100),
    "verificationDate" TIMESTAMP(3),
    "approvalDate" TIMESTAMP(3),
    "nextReviewDate" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WelfarePatient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecord" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "recordDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalFee" DECIMAL(10,2) NOT NULL,
    "notes" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "departmentId" INTEGER,
    "procedureId" INTEGER,
    "doctorId" INTEGER,

    CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalRecordItem" (
    "id" SERIAL NOT NULL,
    "medicalRecordId" INTEGER NOT NULL,
    "departmentId" INTEGER NOT NULL,
    "doctorId" INTEGER,
    "procedureId" INTEGER NOT NULL,
    "fee" DECIMAL(10,2) NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalFee" DECIMAL(10,2) NOT NULL,
    "notes" VARCHAR(500),

    CONSTRAINT "MedicalRecordItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "canManageDepartments" BOOLEAN NOT NULL DEFAULT false,
    "canManageDoctors" BOOLEAN NOT NULL DEFAULT false,
    "canManagePatients" BOOLEAN NOT NULL DEFAULT false,
    "canManageWelfare" BOOLEAN NOT NULL DEFAULT false,
    "canManageProcedures" BOOLEAN NOT NULL DEFAULT false,
    "canManageFees" BOOLEAN NOT NULL DEFAULT false,
    "canViewReports" BOOLEAN NOT NULL DEFAULT false,
    "canManagePatientsHistory" BOOLEAN NOT NULL DEFAULT false,
    "canManageFinanceReport" BOOLEAN NOT NULL DEFAULT false,
    "canManageToken" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "drugRegistrationNo" TEXT,
    "manufacturingLicenseNo" TEXT,
    "ntnNumber" TEXT,
    "gstNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Distributor" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "contactPerson" VARCHAR(100),
    "phone" VARCHAR(20),
    "mobile" VARCHAR(20),
    "email" VARCHAR(100),
    "website" VARCHAR(100),
    "status" BOOLEAN NOT NULL DEFAULT true,
    "addressLine1" VARCHAR(200),
    "addressLine2" VARCHAR(200),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "country" VARCHAR(100) DEFAULT 'Pakistan',
    "postalCode" VARCHAR(20),
    "ntnNumber" VARCHAR(50),
    "gstNumber" VARCHAR(50),
    "drugLicenseNo" VARCHAR(50),
    "registrationNo" VARCHAR(50),
    "openingBalance" DOUBLE PRECISION DEFAULT 0,
    "balanceType" VARCHAR(10),
    "creditLimit" DOUBLE PRECISION,
    "paymentTerms" VARCHAR(50),
    "bankName" VARCHAR(100),
    "bankAccountNo" VARCHAR(50),
    "iban" VARCHAR(50),
    "remarks" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Distributor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_DistributorCompanies" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_DistributorCompanies_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Department_shortCode_key" ON "Department"("shortCode");

-- CreateIndex
CREATE INDEX "Department_name_idx" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Procedure_departmentId_idx" ON "Procedure"("departmentId");

-- CreateIndex
CREATE INDEX "Procedure_name_idx" ON "Procedure"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Procedure_departmentId_name_key" ON "Procedure"("departmentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_idCard_key" ON "Doctor"("idCard");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_phoneNumber_key" ON "Doctor"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Doctor_email_key" ON "Doctor"("email");

-- CreateIndex
CREATE INDEX "Doctor_name_idx" ON "Doctor"("name");

-- CreateIndex
CREATE INDEX "Doctor_specialization_idx" ON "Doctor"("specialization");

-- CreateIndex
CREATE INDEX "DoctorDepartment_departmentId_idx" ON "DoctorDepartment"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorDepartment_doctorId_departmentId_key" ON "DoctorDepartment"("doctorId", "departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "FeePolicy_name_key" ON "FeePolicy"("name");

-- CreateIndex
CREATE INDEX "DoctorProcedureFee_feePolicyId_idx" ON "DoctorProcedureFee"("feePolicyId");

-- CreateIndex
CREATE INDEX "DoctorProcedureFee_departmentId_idx" ON "DoctorProcedureFee"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorProcedureFee_doctorId_procedureId_key" ON "DoctorProcedureFee"("doctorId", "procedureId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_patientId_key" ON "Patient"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "WelfarePatient_patientId_key" ON "WelfarePatient"("patientId");

-- CreateIndex
CREATE INDEX "MedicalRecord_patientId_idx" ON "MedicalRecord"("patientId");

-- CreateIndex
CREATE INDEX "MedicalRecordItem_medicalRecordId_idx" ON "MedicalRecordItem"("medicalRecordId");

-- CreateIndex
CREATE INDEX "MedicalRecordItem_departmentId_idx" ON "MedicalRecordItem"("departmentId");

-- CreateIndex
CREATE INDEX "MedicalRecordItem_doctorId_idx" ON "MedicalRecordItem"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "_DistributorCompanies_B_index" ON "_DistributorCompanies"("B");

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorDepartment" ADD CONSTRAINT "DoctorDepartment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorDepartment" ADD CONSTRAINT "DoctorDepartment_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProcedureFee" ADD CONSTRAINT "DoctorProcedureFee_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProcedureFee" ADD CONSTRAINT "DoctorProcedureFee_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProcedureFee" ADD CONSTRAINT "DoctorProcedureFee_feePolicyId_fkey" FOREIGN KEY ("feePolicyId") REFERENCES "FeePolicy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorProcedureFee" ADD CONSTRAINT "DoctorProcedureFee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelfarePatient" ADD CONSTRAINT "WelfarePatient_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("patientId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WelfarePatient" ADD CONSTRAINT "WelfarePatient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecordItem" ADD CONSTRAINT "MedicalRecordItem_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES "MedicalRecord"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecordItem" ADD CONSTRAINT "MedicalRecordItem_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecordItem" ADD CONSTRAINT "MedicalRecordItem_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalRecordItem" ADD CONSTRAINT "MedicalRecordItem_procedureId_fkey" FOREIGN KEY ("procedureId") REFERENCES "Procedure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DistributorCompanies" ADD CONSTRAINT "_DistributorCompanies_A_fkey" FOREIGN KEY ("A") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DistributorCompanies" ADD CONSTRAINT "_DistributorCompanies_B_fkey" FOREIGN KEY ("B") REFERENCES "Distributor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
