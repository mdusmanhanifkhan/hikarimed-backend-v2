import express from "express";
import {
  bulkUploadMedicalRecords,
  createMedicalRecord,
  exportMedicalRecordsExcel,
  getMedicalRecordByReceiptNo,
  getMedicalRecords,
  getMedicalRecordsByPatient,
  updateMedicalRecordByReceiptNo,
} from "../controller/MedicalRecordController.js";
import { uploadExcel } from "../middleware/uploadExcel.js";

const router = express.Router();

router.post("/medical-records", createMedicalRecord);
router.get("/medical-records/:patientId", getMedicalRecordsByPatient);
router.get("/medical-records", getMedicalRecords);
router.get(
  "/medical-record-receipt/:receiptNo",
  getMedicalRecordByReceiptNo
);
router.get("/medical-records/export/excel", exportMedicalRecordsExcel);
router.post(
  "/medical-records/bulk-upload",
  uploadExcel.single("file"),
  bulkUploadMedicalRecords,
);
router.put(
  "/medical-record-receipt/:receiptNo",
  updateMedicalRecordByReceiptNo
);

export default router;
