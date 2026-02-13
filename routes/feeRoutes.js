import { Router } from "express";
import { createDoctorFee , getDoctorFees , deleteDoctorFee, updateDoctorFee , getSingleDoctorFee, bulkUploadFeePolicies} from "../controller/FeeController.js";
import { uploadExcel } from "../middleware/uploadExcel.js";

const router = Router()

router.post('/doctor-fees' , createDoctorFee)
router.get('/all-doctor-fees' , getDoctorFees)
router.put('/doctor-fees/:id' , updateDoctorFee)
router.delete('/doctor-fees/:id' , deleteDoctorFee)
router.get('/doctor-fees/:id', getSingleDoctorFee)

router.post("/fee-policies/bulk-upload", uploadExcel.single("file"), bulkUploadFeePolicies);


export default router
