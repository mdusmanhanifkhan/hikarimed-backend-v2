import {Router} from "express";
import { createPatient, getPatientById, getPatients , updatePatient ,searchPatients ,deletePatient, createPatientBackDate, bulkUploadPatients, searchPatientsByInput} from "../controller/PatientController.js";
import { uploadExcel } from "../middleware/uploadExcel.js";

const router = Router()

router.post("/patient", createPatient)
router.post("/patient-backdate", createPatientBackDate)
router.get("/patient/search", searchPatients);
router.get("/patients", getPatients)
router.get("/search-patients", searchPatientsByInput)
router.get("/patient/:id", getPatientById)
router.put("/patient/:id", updatePatient)
router.delete("/patient/:id", deletePatient)
router.post(
  "/patients/bulk-upload",
  uploadExcel.single("file"),
  bulkUploadPatients
)


export default router