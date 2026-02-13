import {Router} from "express";
import { createDoctor, getDoctors , getDoctorById , updateDoctor , deleteDoctor, getAllDoctors, bulkUploadDoctors } from "../controller/DoctorController.js";
import { uploadExcel } from "../middleware/uploadExcel.js";

const router = Router()

router.post("/doctor", createDoctor)
router.get("/doctors", getDoctors)
router.get("/all-doctors", getAllDoctors)
router.get("/doctor/:id", getDoctorById)
router.put("/doctor/:id", updateDoctor)
router.delete("/doctor/:id", deleteDoctor)

router.post(
  "/doctors/bulk-upload",
  uploadExcel.single("file"),
  bulkUploadDoctors
)
export default router
