import { Router } from "express";

import departmentRoutes from "./departmentRoutes.js";
import procedureRoutes from "./procedureRoutes.js";
import doctorRoutes from "./doctorRoutes.js";
import patientRoutes from "./patientRoutes.js";
import welfareRoutes from "./welfareRoutes.js";
import feeRoutes from "./feeRoutes.js";
import authRoutes from "./authRoutes.js";
import roleRoutes from "./roleRoutes.js";
import medicalRecordsRoutes from "./medicalRecordRoutes.js";
import labFeesRoutes from "./labFeeRoutes.js";
import financialRoutes from "./financialStatusRoutes.js";
import companyRoutes from "./pharmacy/companyRoutes.js";
import distributorRoutes from "./pharmacy/distributorRoutes.js";
import dosageFormRoutes from "./pharmacy/dosageFormRoutes.js";
import GenericNameRoutes from "./pharmacy/GenericNameRoutes.js";
import medicineCategoryRoutes from "./pharmacy/medicineCategoryRoutes.js";
import medicineRoutes from "./pharmacy/medicineRoutes.js";
import indentRoutes from "./pharmacy/indentRoutes.js";
import purchaseOrderRoutes from "./pharmacy/purchaseOrderRoutes.js";
import ledgerEntryRoutes from "./pharmacy/ledgerEntryRoutes.js";
import grnRoutes from "./pharmacy/grnRoutes.js";
import saleRoutes from "./pharmacy/saleRoutes.js";
import medicineUnitRoutes from "./pharmacy/medicineUnitRoutes.js";
import organizationRoutes from "./opd/organizationRoutes.js";
import patientCardPrintRoutes from "./opd/patientCardPrintRoutes.js";


// ✅ Import middleware
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// -----------------------------
// 🔐 Public Routes
// -----------------------------
router.use("/api", authRoutes);
router.use("/api", roleRoutes);

// -----------------------------
// 🏥 Protected Routes & OPD SYSTEM
// -----------------------------
router.use("/api", protect, departmentRoutes);
router.use("/api", protect, procedureRoutes);
router.use("/api", protect, doctorRoutes);
router.use("/api", protect, patientRoutes);
router.use("/api", protect, welfareRoutes);
router.use("/api", protect, feeRoutes);
router.use("/api", protect, medicalRecordsRoutes);
router.use("/api", protect, labFeesRoutes);
router.use("/api", protect, financialRoutes);
router.use("/api", protect, organizationRoutes);
router.use("/api", protect, patientCardPrintRoutes);

// -----------------------------
// 🏥 Pharmacy Routes & SYSTEM (require login)
// -----------------------------

router.use("/api", protect, companyRoutes);
router.use("/api", protect, distributorRoutes);
router.use("/api", protect, dosageFormRoutes);
router.use("/api", protect, GenericNameRoutes);
router.use("/api", protect, medicineCategoryRoutes);
router.use("/api", protect, medicineRoutes);
router.use("/api", protect, indentRoutes);
router.use("/api", protect, purchaseOrderRoutes);
router.use("/api", protect, ledgerEntryRoutes);
router.use("/api", protect, grnRoutes);
router.use("/api", protect, saleRoutes);
router.use("/api", protect, medicineUnitRoutes);

export default router;
