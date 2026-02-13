import express from "express";
import {
    checkPatientPrint,
    getPatientCardPrice,
  printPatientCard,
  updatePatientCardPrice,
} from "../../controller/opd/PatientCardPrintController.js";

const router = express.Router();

// 1️⃣ Print patient card (first free, next charged)
router.post("/patients/:patientId/print", printPatientCard);

// 2️⃣ Update patient card print price (Admin only)
router.put("/patients/patient-card-price", updatePatientCardPrice);

router.get("/patients/patient-card-price", getPatientCardPrice);

router.get("/patients/:id/print-check", checkPatientPrint);

export default router;
