import { Router } from "express";
import { getFinancialReportHandler } from "../controller/FinancialStatusController.js";

const router = Router()

router.get('/financial-report' , getFinancialReportHandler)

export default router
