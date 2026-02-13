import { Router } from "express";
import { createCompany, getCompanies } from "../../controller/pharmacy/CompanyController.js";

const router = Router()

router.post('/company' , createCompany)
router.get('/company' , getCompanies)

export default router
