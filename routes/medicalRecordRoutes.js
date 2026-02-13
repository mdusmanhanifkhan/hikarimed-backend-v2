import express from "express";
import {
  bulkUploadMedicalRecords,
  createMedicalRecord,
  // createMedicalRecordPatients,
  exportMedicalRecordsExcel,
  getMedicalRecords,
  getMedicalRecordsByPatient,
} from "../controller/MedicalRecordController.js";
import { uploadExcel } from "../middleware/uploadExcel.js";

const router = express.Router();

router.post("/medical-records", createMedicalRecord);
// router.post("/medical-records-patients", createMedicalRecordPatients);
router.get("/medical-records/:patientId", getMedicalRecordsByPatient);
router.get("/medical-records", getMedicalRecords);
router.get("/medical-records/export/excel", exportMedicalRecordsExcel);
router.post(
  "/medical-records/bulk-upload",
  uploadExcel.single("file"),
  bulkUploadMedicalRecords,
);

export default router;
