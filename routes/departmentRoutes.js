import { Router } from "express";
import { createDepartment, deleteDepartment, getDepartments, getSingleDepartment, updateDepartment ,getDepartmentDoctorProcedureTree, getAllDepartments, bulkUploadDepartments, getOtherDepartmentDoctorProcedureTree} from "../controller/DepartmentController.js";
import { uploadExcel } from "../middleware/uploadExcel.js";

const router = Router()

router.post('/department' , createDepartment)
router.get('/department' , getDepartments)
router.get('/all-departments' , getAllDepartments)
router.delete('/department/:id' , deleteDepartment)
router.put('/department/:id' , updateDepartment)
router.get('/department/:id' , getSingleDepartment)
router.get("/department-doctor-procedure-tree", getDepartmentDoctorProcedureTree)
router.get("/other-department-doctor-procedure-tree", getOtherDepartmentDoctorProcedureTree)
router.post(
  "/departments/bulk-upload",
  uploadExcel.single("file"),
  bulkUploadDepartments
)

export default router;