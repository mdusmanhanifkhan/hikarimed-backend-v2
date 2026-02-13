import { Router } from "express";
import { createCompany, getCompanies } from "../../controller/pharmacy/companyController.js";

const router = Router()

router.post('/company' , createCompany)
router.get('/company' , getCompanies)

export default router
