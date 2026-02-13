import { Router } from "express";
import { createProcedure, deleteProcedure, getProcedureById, getProcedures, updateProcedure , searchProcedures, getActiveProcedures, bulkUploadProcedures } from "../controller/ProcedureController.js";
import { uploadExcel } from "../middleware/uploadExcel.js";

const router = Router()

router.post("/procedures", createProcedure)
router.get("/procedures", getProcedures)
router.get("/active-procedures", getActiveProcedures)
router.get("/procedures/search", searchProcedures)
router.get("/procedures/:id", getProcedureById)
router.put("/procedures/:id", updateProcedure
)
router.delete("/procedures/:id", deleteProcedure)

router.post(
  "/procedures/bulk-upload",
  uploadExcel.single("file"),
  bulkUploadProcedures
)


export default router